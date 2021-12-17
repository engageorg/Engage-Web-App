import { nanoid } from "nanoid";
import { cleanAppStateForExport } from "../appState";
import { ALLOWED_IMAGE_MIME_TYPES, EXPORT_DATA_TYPES, MIME_TYPES, } from "../constants";
import { clearElementsForExport } from "../element";
import { CanvasError } from "../errors";
import { t } from "../i18n";
import { calculateScrollCenter } from "../scene";
import { bytesToHexString } from "../utils";
import { isValidExcalidrawData } from "./json";
import { restore } from "./restore";
const parseFileContents = async (blob) => {
    let contents;
    if (blob.type === MIME_TYPES.png) {
        try {
            return await (await import(/* webpackChunkName: "image" */ "./image")).decodePngMetadata(blob);
        }
        catch (error) {
            if (error.message === "INVALID") {
                throw new DOMException(t("alerts.imageDoesNotContainScene"), "EncodingError");
            }
            else {
                throw new DOMException(t("alerts.cannotRestoreFromImage"), "EncodingError");
            }
        }
    }
    else {
        if ("text" in Blob) {
            contents = await blob.text();
        }
        else {
            contents = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsText(blob, "utf8");
                reader.onloadend = () => {
                    if (reader.readyState === FileReader.DONE) {
                        resolve(reader.result);
                    }
                };
            });
        }
        if (blob.type === MIME_TYPES.svg) {
            try {
                return await (await import(/* webpackChunkName: "image" */ "./image")).decodeSvgMetadata({
                    svg: contents,
                });
            }
            catch (error) {
                if (error.message === "INVALID") {
                    throw new DOMException(t("alerts.imageDoesNotContainScene"), "EncodingError");
                }
                else {
                    throw new DOMException(t("alerts.cannotRestoreFromImage"), "EncodingError");
                }
            }
        }
    }
    return contents;
};
export const getMimeType = (blob) => {
    let name;
    if (typeof blob === "string") {
        name = blob;
    }
    else {
        if (blob.type) {
            return blob.type;
        }
        name = blob.name || "";
    }
    if (/\.(excalidraw|json)$/.test(name)) {
        return MIME_TYPES.json;
    }
    else if (/\.png$/.test(name)) {
        return MIME_TYPES.png;
    }
    else if (/\.jpe?g$/.test(name)) {
        return MIME_TYPES.jpg;
    }
    else if (/\.svg$/.test(name)) {
        return MIME_TYPES.svg;
    }
    return "";
};
export const getFileHandleType = (handle) => {
    if (!handle) {
        return null;
    }
    return handle.name.match(/\.(json|excalidraw|png|svg)$/)?.[1] || null;
};
export const isImageFileHandleType = (type) => {
    return type === "png" || type === "svg";
};
export const isImageFileHandle = (handle) => {
    const type = getFileHandleType(handle);
    return type === "png" || type === "svg";
};
export const isSupportedImageFile = (blob) => {
    const { type } = blob || {};
    return (!!type && ALLOWED_IMAGE_MIME_TYPES.includes(type));
};
export const loadFromBlob = async (blob, 
/** @see restore.localAppState */
localAppState, localElements) => {
    const contents = await parseFileContents(blob);
    try {
        const data = JSON.parse(contents);
        if (!isValidExcalidrawData(data)) {
            throw new Error(t("alerts.couldNotLoadInvalidFile"));
        }
        const result = restore({
            elements: clearElementsForExport(data.elements || []),
            appState: {
                theme: localAppState?.theme,
                fileHandle: blob.handle || null,
                ...cleanAppStateForExport(data.appState || {}),
                ...(localAppState
                    ? calculateScrollCenter(data.elements || [], localAppState, null)
                    : {}),
            },
            files: data.files,
        }, localAppState, localElements);
        return result;
    }
    catch (error) {
        console.error(error.message);
        throw new Error(t("alerts.couldNotLoadInvalidFile"));
    }
};
export const loadLibraryFromBlob = async (blob) => {
    const contents = await parseFileContents(blob);
    const data = JSON.parse(contents);
    if (data.type !== EXPORT_DATA_TYPES.excalidrawLibrary) {
        throw new Error(t("alerts.couldNotLoadInvalidFile"));
    }
    return data;
};
export const canvasToBlob = async (canvas) => {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new CanvasError(t("canvasError.canvasTooBig"), "CANVAS_POSSIBLY_TOO_BIG"));
                }
                resolve(blob);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
/** generates SHA-1 digest from supplied file (if not supported, falls back
    to a 40-char base64 random id) */
export const generateIdFromFile = async (file) => {
    try {
        const hashBuffer = await window.crypto.subtle.digest("SHA-1", await file.arrayBuffer());
        return bytesToHexString(new Uint8Array(hashBuffer));
    }
    catch (error) {
        console.error(error);
        // length 40 to align with the HEX length of SHA-1 (which is 160 bit)
        return nanoid(40);
    }
};
export const getDataURL = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataURL = reader.result;
            resolve(dataURL);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};
export const dataURLToFile = (dataURL, filename = "") => {
    const dataIndexStart = dataURL.indexOf(",");
    const byteString = atob(dataURL.slice(dataIndexStart + 1));
    const mimeType = dataURL.slice(0, dataIndexStart).split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeType });
};
export const resizeImageFile = async (file, opts) => {
    // SVG files shouldn't a can't be resized
    if (file.type === MIME_TYPES.svg) {
        return file;
    }
    const [pica, imageBlobReduce] = await Promise.all([
        import("pica").then((res) => res.default),
        // a wrapper for pica for better API
        import("image-blob-reduce").then((res) => res.default),
    ]);
    // CRA's minification settings break pica in WebWorkers, so let's disable
    // them for now
    // https://github.com/nodeca/image-blob-reduce/issues/21#issuecomment-757365513
    const reduce = imageBlobReduce({
        pica: pica({ features: ["js", "wasm"] }),
    });
    if (opts.outputType) {
        const { outputType } = opts;
        reduce._create_blob = function (env) {
            return this.pica.toBlob(env.out_canvas, outputType, 0.8).then((blob) => {
                env.out_blob = blob;
                return env;
            });
        };
    }
    if (!isSupportedImageFile(file)) {
        throw new Error(t("errors.unsupportedFileType"));
    }
    return new File([await reduce.toBlob(file, { max: opts.maxWidthOrHeight })], file.name, {
        type: opts.outputType || file.type,
    });
};
export const SVGStringToFile = (SVGString, filename = "") => {
    return new File([new TextEncoder().encode(SVGString)], filename, {
        type: MIME_TYPES.svg,
    });
};
