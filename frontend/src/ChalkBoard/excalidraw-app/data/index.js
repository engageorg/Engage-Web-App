import { compressData, decompressData } from "../../data/encode";
import { decryptData, generateEncryptionKey, IV_LENGTH_BYTES, } from "../../data/encryption";
import { serializeAsJSON } from "../../data/json";
import { restore } from "../../data/restore";
import { isInitializedImageElement } from "../../element/typeChecks";
import { t } from "../../i18n";
import { bytesToHexString } from "../../utils";
import { FILE_UPLOAD_MAX_BYTES, ROOM_ID_BYTES } from "../app_constants";
import { encodeFilesForUpload } from "./FileManager";
import { saveFilesToFirebase } from "./firebase";
const BACKEND_V2_GET = process.env.REACT_APP_BACKEND_V2_GET_URL;
const BACKEND_V2_POST = process.env.REACT_APP_BACKEND_V2_POST_URL;
const generateRoomId = async () => {
    const buffer = new Uint8Array(ROOM_ID_BYTES);
    window.crypto.getRandomValues(buffer);
    return bytesToHexString(buffer);
};
export const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER_URL;
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
    const roomId = await generateRoomId();
    const roomKey = await generateEncryptionKey();
    if (!roomKey) {
        throw new Error("Couldn't generate room key");
    }
    return { roomId, roomKey };
};
export const getCollaborationLink = (data) => {
    return `${window.location.origin}${window.location.pathname}#room=${data.roomId},${data.roomKey}`;
};
/**
 * Decodes shareLink data using the legacy buffer format.
 * @deprecated
 */
const legacy_decodeFromBackend = async ({ buffer, decryptionKey, }) => {
    let decrypted;
    try {
        // Buffer should contain both the IV (fixed length) and encrypted data
        const iv = buffer.slice(0, IV_LENGTH_BYTES);
        const encrypted = buffer.slice(IV_LENGTH_BYTES, buffer.byteLength);
        decrypted = await decryptData(new Uint8Array(iv), encrypted, decryptionKey);
    }
    catch (error) {
        // Fixed IV (old format, backward compatibility)
        const fixedIv = new Uint8Array(IV_LENGTH_BYTES);
        decrypted = await decryptData(fixedIv, buffer, decryptionKey);
    }
    // We need to convert the decrypted array buffer to a string
    const string = new window.TextDecoder("utf-8").decode(new Uint8Array(decrypted));
    const data = JSON.parse(string);
    return {
        elements: data.elements || null,
        appState: data.appState || null,
    };
};
const importFromBackend = async (id, decryptionKey) => {
    try {
        const response = await fetch(`${BACKEND_V2_GET}${id}`);
        if (!response.ok) {
            window.alert(t("alerts.importBackendFailed"));
            return {};
        }
        const buffer = await response.arrayBuffer();
        try {
            const { data: decodedBuffer } = await decompressData(new Uint8Array(buffer), {
                decryptionKey,
            });
            const data = JSON.parse(new TextDecoder().decode(decodedBuffer));
            return {
                elements: data.elements || null,
                appState: data.appState || null,
            };
        }
        catch (error) {
            console.warn("error when decoding shareLink data using the new format:", error);
            return legacy_decodeFromBackend({ buffer, decryptionKey });
        }
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
    const encryptionKey = await generateEncryptionKey("string");
    const payload = await compressData(new TextEncoder().encode(serializeAsJSON(elements, appState, files, "database")), { encryptionKey });
    try {
        const filesMap = new Map();
        for (const element of elements) {
            if (isInitializedImageElement(element) && files[element.fileId]) {
                filesMap.set(element.fileId, files[element.fileId]);
            }
        }
        const filesToUpload = await encodeFilesForUpload({
            files: filesMap,
            encryptionKey,
            maxBytes: FILE_UPLOAD_MAX_BYTES,
        });
        const response = await fetch(BACKEND_V2_POST, {
            method: "POST",
            body: payload.buffer,
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
