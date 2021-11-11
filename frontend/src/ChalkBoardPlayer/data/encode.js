import { deflate, inflate } from "pako";
import { encryptData, decryptData } from "./encryption";
// -----------------------------------------------------------------------------
// byte (binary) strings
// -----------------------------------------------------------------------------
// fast, Buffer-compatible implem
export const toByteString = (data) => {
    return new Promise((resolve, reject) => {
        const blob = typeof data === "string"
            ? new Blob([new TextEncoder().encode(data)])
            : new Blob([data instanceof Uint8Array ? data : new Uint8Array(data)]);
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target || typeof event.target.result !== "string") {
                return reject(new Error("couldn't convert to byte string"));
            }
            resolve(event.target.result);
        };
        reader.readAsBinaryString(blob);
    });
};
const byteStringToArrayBuffer = (byteString) => {
    const buffer = new ArrayBuffer(byteString.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0, len = byteString.length; i < len; i++) {
        bufferView[i] = byteString.charCodeAt(i);
    }
    return buffer;
};
const byteStringToString = (byteString) => {
    return new TextDecoder("utf-8").decode(byteStringToArrayBuffer(byteString));
};
// -----------------------------------------------------------------------------
// base64
// -----------------------------------------------------------------------------
/**
 * @param isByteString set to true if already byte string to prevent bloat
 *  due to reencoding
 */
export const stringToBase64 = async (str, isByteString = false) => {
    return isByteString ? window.btoa(str) : window.btoa(await toByteString(str));
};
// async to align with stringToBase64
export const base64ToString = async (base64, isByteString = false) => {
    return isByteString
        ? window.atob(base64)
        : byteStringToString(window.atob(base64));
};
/**
 * Encodes (and potentially compresses via zlib) text to byte string
 */
export const encode = async ({ text, compress, }) => {
    let deflated;
    if (compress !== false) {
        try {
            deflated = await toByteString(deflate(text));
        }
        catch (error) {
            console.error("encode: cannot deflate", error);
        }
    }
    return {
        version: "1",
        encoding: "bstring",
        compressed: !!deflated,
        encoded: deflated || (await toByteString(text)),
    };
};
export const decode = async (data) => {
    let decoded;
    switch (data.encoding) {
        case "bstring":
            // if compressed, do not double decode the bstring
            decoded = data.compressed
                ? data.encoded
                : await byteStringToString(data.encoded);
            break;
        default:
            throw new Error(`decode: unknown encoding "${data.encoding}"`);
    }
    if (data.compressed) {
        return inflate(new Uint8Array(byteStringToArrayBuffer(decoded)), {
            to: "string",
        });
    }
    return decoded;
};
// -----------------------------------------------------------------------------
const CONCAT_BUFFERS_VERSION = 1;
/** how many bytes we use to encode how many bytes the next chunk has.
 * Corresponds to DataView setter methods (setUint32, setUint16, etc).
 *
 * NOTE ! values must not be changed, which would be backwards incompatible !
 */
const VERSION_DATAVIEW_BYTES = 4;
const NEXT_CHUNK_SIZE_DATAVIEW_BYTES = 4;
// -----------------------------------------------------------------------------
const DATA_VIEW_BITS_MAP = { 1: 8, 2: 16, 4: 32 };
/**
 * abstraction over DataView that serves as a typed getter/setter in case
 * you're using constants for the byte size and want to ensure there's no
 * discrepenancy in the encoding across refactors.
 *
 * DataView serves for an endian-agnostic handling of numbers in ArrayBuffers.
 */
function dataView(buffer, bytes, offset, value) {
    if (value != null) {
        if (value > Math.pow(2, DATA_VIEW_BITS_MAP[bytes]) - 1) {
            throw new Error(`attempting to set value higher than the allocated bytes (value: ${value}, bytes: ${bytes})`);
        }
        const method = `setUint${DATA_VIEW_BITS_MAP[bytes]}`;
        new DataView(buffer.buffer)[method](offset, value);
        return buffer;
    }
    const method = `getUint${DATA_VIEW_BITS_MAP[bytes]}`;
    return new DataView(buffer.buffer)[method](offset);
}
// -----------------------------------------------------------------------------
/**
 * Resulting concatenated buffer has this format:
 *
 * [
 *   VERSION chunk (4 bytes)
 *   LENGTH chunk 1 (4 bytes)
 *   DATA chunk 1 (up to 2^32 bits)
 *   LENGTH chunk 2 (4 bytes)
 *   DATA chunk 2 (up to 2^32 bits)
 *   ...
 * ]
 *
 * @param buffers each buffer (chunk) must be at most 2^32 bits large (~4GB)
 */
const concatBuffers = (...buffers) => {
    const bufferView = new Uint8Array(VERSION_DATAVIEW_BYTES +
        NEXT_CHUNK_SIZE_DATAVIEW_BYTES * buffers.length +
        buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0));
    let cursor = 0;
    // as the first chunk we'll encode the version for backwards compatibility
    dataView(bufferView, VERSION_DATAVIEW_BYTES, cursor, CONCAT_BUFFERS_VERSION);
    cursor += VERSION_DATAVIEW_BYTES;
    for (const buffer of buffers) {
        dataView(bufferView, NEXT_CHUNK_SIZE_DATAVIEW_BYTES, cursor, buffer.byteLength);
        cursor += NEXT_CHUNK_SIZE_DATAVIEW_BYTES;
        bufferView.set(buffer, cursor);
        cursor += buffer.byteLength;
    }
    return bufferView;
};
/** can only be used on buffers created via `concatBuffers()` */
const splitBuffers = (concatenatedBuffer) => {
    const buffers = [];
    let cursor = 0;
    // first chunk is the version (ignored for now)
    cursor += VERSION_DATAVIEW_BYTES;
    while (true) {
        const chunkSize = dataView(concatenatedBuffer, NEXT_CHUNK_SIZE_DATAVIEW_BYTES, cursor);
        cursor += NEXT_CHUNK_SIZE_DATAVIEW_BYTES;
        buffers.push(concatenatedBuffer.slice(cursor, cursor + chunkSize));
        cursor += chunkSize;
        if (cursor >= concatenatedBuffer.byteLength) {
            break;
        }
    }
    return buffers;
};
// helpers for (de)compressing data with JSON metadata including encryption
// -----------------------------------------------------------------------------
/** @private */
const _encryptAndCompress = async (data, encryptionKey) => {
    const { encryptedBuffer, iv } = await encryptData(encryptionKey, deflate(data));
    return { iv, buffer: new Uint8Array(encryptedBuffer) };
};
/**
 * The returned buffer has following format:
 * `[]` refers to a buffers wrapper (see `concatBuffers`)
 *
 * [
 *   encodingMetadataBuffer,
 *   iv,
 *   [
 *      contentsMetadataBuffer
 *      contentsBuffer
 *   ]
 * ]
 */
export const compressData = async (dataBuffer, options) => {
    const fileInfo = {
        version: 2,
        compression: "pako@1",
        encryption: "AES-GCM",
    };
    const encodingMetadataBuffer = new TextEncoder().encode(JSON.stringify(fileInfo));
    const contentsMetadataBuffer = new TextEncoder().encode(JSON.stringify(options.metadata || null));
    const { iv, buffer } = await _encryptAndCompress(concatBuffers(contentsMetadataBuffer, dataBuffer), options.encryptionKey);
    return concatBuffers(encodingMetadataBuffer, iv, buffer);
};
/** @private */
const _decryptAndDecompress = async (iv, decryptedBuffer, decryptionKey, isCompressed) => {
    decryptedBuffer = new Uint8Array(await decryptData(iv, decryptedBuffer, decryptionKey));
    if (isCompressed) {
        return inflate(decryptedBuffer);
    }
    return decryptedBuffer;
};
export const decompressData = async (bufferView, options) => {
    // first chunk is encoding metadata (ignored for now)
    const [encodingMetadataBuffer, iv, buffer] = splitBuffers(bufferView);
    const encodingMetadata = JSON.parse(new TextDecoder().decode(encodingMetadataBuffer));
    try {
        const [contentsMetadataBuffer, contentsBuffer] = splitBuffers(await _decryptAndDecompress(iv, buffer, options.decryptionKey, !!encodingMetadata.compression));
        const metadata = JSON.parse(new TextDecoder().decode(contentsMetadataBuffer));
        return {
            /** metadata source is always JSON so we can decode it here */
            metadata,
            /** data can be anything so the caller must decode it */
            data: contentsBuffer,
        };
    }
    catch (error) {
        console.error(`Error during decompressing and decrypting the file.`, encodingMetadata);
        throw error;
    }
};
// -----------------------------------------------------------------------------
