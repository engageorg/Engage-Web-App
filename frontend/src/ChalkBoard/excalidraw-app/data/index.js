import { createIV, generateEncryptionKey, getImportedKey, IV_LENGTH_BYTES, } from "../../data/encryption";
import { serializeAsJSON } from "../../data/json";
import { restore } from "../../data/restore";
import { isInitializedImageElement } from "../../element/typeChecks";
import { t } from "../../i18n";
import { FILE_UPLOAD_MAX_BYTES } from "../app_constants";
import { encodeFilesForUpload } from "./FileManager";
import { saveFilesToFirebase } from "./firebase";
const byteToHex = (byte) => `0${byte.toString(16)}`.slice(-2);
const BACKEND_V2_GET = process.env.REACT_APP_BACKEND_V2_GET_URL;
const BACKEND_V2_POST = process.env.REACT_APP_BACKEND_V2_POST_URL;
const generateRandomID = async () => {
    const arr = new Uint8Array(10);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, byteToHex).join("");
};
export const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER_URL;
export const encryptAESGEM = async (data, key) => {
    const importedKey = await getImportedKey(key, "encrypt");
    const iv = createIV();
    return {
        data: await window.crypto.subtle.encrypt({
            name: "AES-GCM",
            iv,
        }, importedKey, data),
        iv,
    };
};
export const decryptAESGEM = async (data, key, iv) => {
    try {
        const importedKey = await getImportedKey(key, "decrypt");
        const decrypted = await window.crypto.subtle.decrypt({
            name: "AES-GCM",
            iv,
        }, importedKey, data);
        const decodedData = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));
        return JSON.parse(decodedData);
    }
    catch (error) {
        window.alert(t("alerts.decryptFailed"));
        console.error(error);
    }
    return {
        type: "INVALID_RESPONSE",
    };
};
export const getCollaborationLinkData = (link) => {
    const hash = new URL(link).hash;
    const match = hash.match(/^#room=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/);
    if (match && match[2].length !== 22) {
        window.alert(t("alerts.invalidEncryptionKey"));
        return null;
    }
    return match ? { roomId: match[1], roomKey: match[2] } : null;
};
export const generateCollaborationLinkData = async () => {
    const roomId = await generateRandomID();
    const roomKey = await generateEncryptionKey();
    if (!roomKey) {
        throw new Error("Couldn't generate room key");
    }
    return { roomId, roomKey };
};
export const getCollaborationLink = (data) => {
    return `${window.location.origin}${window.location.pathname}#room=${data.roomId},${data.roomKey}`;
};
export const decryptImported = async (iv, encrypted, privateKey) => {
    const key = await getImportedKey(privateKey, "decrypt");
    return window.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv,
    }, key, encrypted);
};
const importFromBackend = async (id, privateKey) => {
    try {
        const response = await fetch(`${BACKEND_V2_GET}${id}`);
        if (!response.ok) {
            window.alert(t("alerts.importBackendFailed"));
            return {};
        }
        const buffer = await response.arrayBuffer();
        let decrypted;
        try {
            // Buffer should contain both the IV (fixed length) and encrypted data
            const iv = buffer.slice(0, IV_LENGTH_BYTES);
            const encrypted = buffer.slice(IV_LENGTH_BYTES, buffer.byteLength);
            decrypted = await decryptImported(iv, encrypted, privateKey);
        }
        catch (error) {
            // Fixed IV (old format, backward compatibility)
            const fixedIv = new Uint8Array(IV_LENGTH_BYTES);
            decrypted = await decryptImported(fixedIv, buffer, privateKey);
        }
        // We need to convert the decrypted array buffer to a string
        const string = new window.TextDecoder("utf-8").decode(new Uint8Array(decrypted));
        const data = JSON.parse(string);
        return {
            elements: data.elements || null,
            appState: data.appState || null,
        };
    }
    catch (error) {
        window.alert(t("alerts.importBackendFailed"));
        console.error(error);
        return {};
    }
};
export const loadScene = async (id, privateKey, 
// Supply local state even if importing from backend to ensure we restore
// localStorage user settings which we do not persist on server.
// Non-optional so we don't forget to pass it even if `undefined`.
localDataState) => {
    let data;
    if (id != null && privateKey != null) {
        // the private key is used to decrypt the content from the server, take
        // extra care not to leak it
        data = restore(await importFromBackend(id, privateKey), localDataState?.appState, localDataState?.elements);
    }
    else {
        data = restore(localDataState || null, null, null);
    }
    return {
        elements: data.elements,
        appState: data.appState,
        // note: this will always be empty because we're not storing files
        // in the scene database/localStorage, and instead fetch them async
        // from a different database
        files: data.files,
        commitToHistory: false,
    };
};
export const exportToBackend = async (elements, appState, files) => {
    const json = serializeAsJSON(elements, appState, files, "database");
    const encoded = new TextEncoder().encode(json);
    const cryptoKey = await window.crypto.subtle.generateKey({
        name: "AES-GCM",
        length: 128,
    }, true, // extractable
    ["encrypt", "decrypt"]);
    const iv = createIV();
    // We use symmetric encryption. AES-GCM is the recommended algorithm and
    // includes checks that the ciphertext has not been modified by an attacker.
    const encrypted = await window.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv,
    }, cryptoKey, encoded);
    // Concatenate IV with encrypted data (IV does not have to be secret).
    const payloadBlob = new Blob([iv.buffer, encrypted]);
    const payload = await new Response(payloadBlob).arrayBuffer();
    // We use jwk encoding to be able to extract just the base64 encoded key.
    // We will hardcode the rest of the attributes when importing back the key.
    const exportedKey = await window.crypto.subtle.exportKey("jwk", cryptoKey);
    try {
        const filesMap = new Map();
        for (const element of elements) {
            if (isInitializedImageElement(element) && files[element.fileId]) {
                filesMap.set(element.fileId, files[element.fileId]);
            }
        }
        const encryptionKey = exportedKey.k;
        const filesToUpload = await encodeFilesForUpload({
            files: filesMap,
            encryptionKey,
            maxBytes: FILE_UPLOAD_MAX_BYTES,
        });
        const response = await fetch(BACKEND_V2_POST, {
            method: "POST",
            body: payload,
        });
        const json = await response.json();
        if (json.id) {
            const url = new URL(window.location.href);
            // We need to store the key (and less importantly the id) as hash instead
            // of queryParam in order to never send it to the server
            url.hash = `json=${json.id},${encryptionKey}`;
            const urlString = url.toString();
            await saveFilesToFirebase({
                prefix: `/files/shareLinks/${json.id}`,
                files: filesToUpload,
            });
            window.prompt(`🔒${t("alerts.uploadedSecurly")}`, urlString);
        }
        else if (json.error_class === "RequestTooLargeError") {
            window.alert(t("alerts.couldNotCreateShareableLinkTooBig"));
        }
        else {
            window.alert(t("alerts.couldNotCreateShareableLink"));
        }
    }
    catch (error) {
        console.error(error);
        window.alert(t("alerts.couldNotCreateShareableLink"));
    }
};
