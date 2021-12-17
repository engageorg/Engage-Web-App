import { exportToCanvas as _exportToCanvas, exportToSvg as _exportToSvg, } from "../scene/export";
import { getDefaultAppState } from "../appState";
import { getNonDeletedElements } from "../element";
import { restore } from "../data/restore";
import { MIME_TYPES } from "../constants";
export const exportToCanvas = ({ elements, appState, files, maxWidthOrHeight, getDimensions, }) => {
    const { elements: restoredElements, appState: restoredAppState } = restore({ elements, appState }, null, null);
    const { exportBackground, viewBackgroundColor } = restoredAppState;
    return _exportToCanvas(getNonDeletedElements(restoredElements), { ...restoredAppState, offsetTop: 0, offsetLeft: 0, width: 0, height: 0 }, files || {}, { exportBackground, viewBackgroundColor }, (width, height) => {
        const canvas = document.createElement("canvas");
        if (maxWidthOrHeight) {
            if (typeof getDimensions === "function") {
                console.warn("`getDimensions()` is ignored when `maxWidthOrHeight` is supplied.");
            }
            const max = Math.max(width, height);
            const scale = maxWidthOrHeight / max;
            canvas.width = width * scale;
            canvas.height = height * scale;
            return {
                canvas,
                scale,
            };
        }
        const ret = getDimensions?.(width, height) || { width, height };
        canvas.width = ret.width;
        canvas.height = ret.height;
        return {
            canvas,
            scale: ret.scale ?? 1,
        };
    });
};
export const exportToBlob = async (opts) => {
    let { mimeType = MIME_TYPES.png, quality } = opts;
    if (mimeType === MIME_TYPES.png && typeof quality === "number") {
        console.warn(`"quality" will be ignored for "${MIME_TYPES.png}" mimeType`);
    }
    // typo in MIME type (should be "jpeg")
    if (mimeType === "image/jpg") {
        mimeType = MIME_TYPES.jpg;
    }
    if (mimeType === MIME_TYPES.jpg && !opts.appState?.exportBackground) {
        console.warn(`Defaulting "exportBackground" to "true" for "${MIME_TYPES.jpg}" mimeType`);
        opts = {
            ...opts,
            appState: { ...opts.appState, exportBackground: true },
        };
    }
    const canvas = await exportToCanvas(opts);
    quality = quality ? quality : /image\/jpe?g/.test(mimeType) ? 0.92 : 0.8;
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, mimeType, quality);
    });
};
export const exportToSvg = async ({ elements, appState = getDefaultAppState(), files = {}, exportPadding, }) => {
    const { elements: restoredElements, appState: restoredAppState } = restore({ elements, appState }, null, null);
    return _exportToSvg(getNonDeletedElements(restoredElements), {
        ...restoredAppState,
        exportPadding,
    }, files);
};
export { serializeAsJSON } from "../data/json";
export { loadFromBlob, loadLibraryFromBlob } from "../data/blob";
export { getFreeDrawSvgPath } from "../renderer/renderElement";
