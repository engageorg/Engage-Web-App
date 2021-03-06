export const IV_LENGTH_BYTES = 12;
export const createIV = () => {
    const arr = new Uint8Array(IV_LENGTH_BYTES);
    return window.crypto.getRandomValues(arr);
};
export const generateEncryptionKey = async () => {
    const key = await window.crypto.subtle.generateKey({
        name: "AES-GCM",
        length: 128,
    }, true, // extractable
    ["encrypt", "decrypt"]);
    return (await window.crypto.subtle.exportKey("jwk", key)).k;
};
export const getImportedKey = (key, usage) => window.crypto.subtle.importKey("jwk", {
    alg: "A128GCM",
    ext: true,
    k: key,
    key_ops: ["encrypt", "decrypt"],
    kty: "oct",
}, {
    name: "AES-GCM",
    length: 128,
}, false, // extractable
[usage]);
export const encryptData = async (key, data) => {
    const importedKey = await getImportedKey(key, "encrypt");
    const iv = createIV();
    const buffer = typeof data === "string"
        ? new TextEncoder().encode(data)
        : data instanceof Uint8Array
            ? data
            : data instanceof Blob
                ? await data.arrayBuffer()
                : data;
    const encryptedBuffer = await window.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv,
    }, importedKey, buffer);
    return { encryptedBuffer, iv };
};
export const decryptData = async (iv, encrypted, privateKey) => {
    const key = await getImportedKey(privateKey, "decrypt");
    return window.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv,
    }, key, encrypted);
};
