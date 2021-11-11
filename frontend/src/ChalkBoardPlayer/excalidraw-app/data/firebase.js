import { getSceneVersion } from "../../element";
import { restoreElements } from "../../data/restore";
import { FILE_CACHE_MAX_AGE_SEC } from "../app_constants";
import { decompressData } from "../../data/encode";
import { getImportedKey, createIV } from "../../data/encryption";
import { MIME_TYPES } from "../../constants";
// private
// -----------------------------------------------------------------------------
const FIREBASE_CONFIG = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
let firebasePromise = null;
let firestorePromise = null;
let firebaseStoragePromise = null;
let isFirebaseInitialized = false;
const _loadFirebase = async () => {
    const firebase = (await import(/* webpackChunkName: "firebase" */ "firebase/app")).default;
    if (!isFirebaseInitialized) {
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        catch (error) {
            // trying initialize again throws. Usually this is harmless, and happens
            // mainly in dev (HMR)
            if (error.code === "app/duplicate-app") {
                console.warn(error.name, error.code);
            }
            else {
                throw error;
            }
        }
        isFirebaseInitialized = true;
    }
    return firebase;
};
const _getFirebase = async () => {
    if (!firebasePromise) {
        firebasePromise = _loadFirebase();
    }
    return firebasePromise;
};
// -----------------------------------------------------------------------------
const loadFirestore = async () => {
    const firebase = await _getFirebase();
    if (!firestorePromise) {
        firestorePromise = import(
        /* webpackChunkName: "firestore" */ "firebase/firestore");
    }
    if (firestorePromise !== true) {
        await firestorePromise;
        firestorePromise = true;
    }
    return firebase;
};
export const loadFirebaseStorage = async () => {
    const firebase = await _getFirebase();
    if (!firebaseStoragePromise) {
        firebaseStoragePromise = import(
        /* webpackChunkName: "storage" */ "firebase/storage");
    }
    if (firebaseStoragePromise !== true) {
        await firebaseStoragePromise;
        firebaseStoragePromise = true;
    }
    return firebase;
};
const encryptElements = async (key, elements) => {
    const importedKey = await getImportedKey(key, "encrypt");
    const iv = createIV();
    const json = JSON.stringify(elements);
    const encoded = new TextEncoder().encode(json);
    const ciphertext = await window.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv,
    }, importedKey, encoded);
    return { ciphertext, iv };
};
const decryptElements = async (key, iv, ciphertext) => {
    const importedKey = await getImportedKey(key, "decrypt");
    const decrypted = await window.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv,
    }, importedKey, ciphertext);
    const decodedData = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));
    return JSON.parse(decodedData);
};
const firebaseSceneVersionCache = new WeakMap();
export const isSavedToFirebase = (portal, elements) => {
    if (portal.socket && portal.roomId && portal.roomKey) {
        const sceneVersion = getSceneVersion(elements);
        return firebaseSceneVersionCache.get(portal.socket) === sceneVersion;
    }
    // if no room exists, consider the room saved so that we don't unnecessarily
    // prevent unload (there's nothing we could do at that point anyway)
    return true;
};
export const saveFilesToFirebase = async ({ prefix, files, }) => {
    const firebase = await loadFirebaseStorage();
    const erroredFiles = new Map();
    const savedFiles = new Map();
    await Promise.all(files.map(async ({ id, buffer }) => {
        try {
            await firebase
                .storage()
                .ref(`${prefix}/${id}`)
                .put(new Blob([buffer], {
                type: MIME_TYPES.binary,
            }), {
                cacheControl: `public, max-age=${FILE_CACHE_MAX_AGE_SEC}`,
            });
            savedFiles.set(id, true);
        }
        catch (error) {
            erroredFiles.set(id, true);
        }
    }));
    return { savedFiles, erroredFiles };
};
export const saveToFirebase = async (portal, elements) => {
    const { roomId, roomKey, socket } = portal;
    if (
    // if no room exists, consider the room saved because there's nothing we can
    // do at this point
    !roomId ||
        !roomKey ||
        !socket ||
        isSavedToFirebase(portal, elements)) {
        return true;
    }
    const firebase = await loadFirestore();
    const sceneVersion = getSceneVersion(elements);
    const { ciphertext, iv } = await encryptElements(roomKey, elements);
    const nextDocData = {
        sceneVersion,
        ciphertext: firebase.firestore.Blob.fromUint8Array(new Uint8Array(ciphertext)),
        iv: firebase.firestore.Blob.fromUint8Array(iv),
    };
    const db = firebase.firestore();
    const docRef = db.collection("scenes").doc(roomId);
    const didUpdate = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) {
            transaction.set(docRef, nextDocData);
            return true;
        }
        const prevDocData = doc.data();
        if (prevDocData.sceneVersion >= nextDocData.sceneVersion) {
            return false;
        }
        transaction.update(docRef, nextDocData);
        return true;
    });
    if (didUpdate) {
        firebaseSceneVersionCache.set(socket, sceneVersion);
    }
    return didUpdate;
};
export const loadFromFirebase = async (roomId, roomKey, socket) => {
    const firebase = await loadFirestore();
    const db = firebase.firestore();
    const docRef = db.collection("scenes").doc(roomId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const storedScene = doc.data();
    const ciphertext = storedScene.ciphertext.toUint8Array();
    const iv = storedScene.iv.toUint8Array();
    const elements = await decryptElements(roomKey, iv, ciphertext);
    if (socket) {
        firebaseSceneVersionCache.set(socket, getSceneVersion(elements));
    }
    return restoreElements(elements, null);
};
export const loadFilesFromFirebase = async (prefix, decryptionKey, filesIds) => {
    const loadedFiles = [];
    const erroredFiles = new Map();
    await Promise.all([...new Set(filesIds)].map(async (id) => {
        try {
            const url = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o/${encodeURIComponent(prefix.replace(/^\//, ""))}%2F${id}`;
            const response = await fetch(`${url}?alt=media`);
            if (response.status < 400) {
                const arrayBuffer = await response.arrayBuffer();
                const { data, metadata } = await decompressData(new Uint8Array(arrayBuffer), {
                    decryptionKey,
                });
                const dataURL = new TextDecoder().decode(data);
                loadedFiles.push({
                    mimeType: metadata.mimeType || MIME_TYPES.binary,
                    id,
                    dataURL,
                    created: metadata?.created || Date.now(),
                });
            }
            else {
                erroredFiles.set(id, true);
            }
        }
        catch (error) {
            erroredFiles.set(id, true);
            console.error(error);
        }
    }));
    return { loadedFiles, erroredFiles };
};
