import { copyBlobToClipboardAsPng, copyTextToSystemClipboard, } from "../clipboard";
import { DEFAULT_EXPORT_PADDING, MIME_TYPES } from "../constants";
import { t } from "../i18n";
import { exportToCanvas, exportToSvg } from "../scene/export";
import { canvasToBlob } from "./blob";
import { fileSave } from "./filesystem";
import { serializeAsJSON } from "./json";
export { loadFromBlob } from "./blob";
export { loadFromJSON, saveAsJSON } from "./json";
export const exportCanvas = async (type, elements, appState, files, { exportBackground, exportPadding = DEFAULT_EXPORT_PADDING, viewBackgroundColor, name, fileHandle = null, }) => {
    if (elements.length === 0) {
        throw new Error(t("alerts.cannotExportEmptyCanvas"));
    }
    if (type === "svg" || type === "clipboard-svg") {
        const tempSvg = await exportToSvg(elements, {
            exportBackground,
            exportWithDarkMode: appState.exportWithDarkMode,
            viewBackgroundColor,
            exportPadding,
            exportScale: appState.exportScale,
            exportEmbedScene: appState.exportEmbedScene && type === "svg",
        }, files);
        if (type === "svg") {
            return await fileSave(new Blob([tempSvg.outerHTML], { type: MIME_TYPES.svg }), {
                name,
                extension: "svg",
                fileHandle,
            });
        }
        else if (type === "clipboard-svg") {
            await copyTextToSystemClipboard(tempSvg.outerHTML);
            return;
        }
    }
    const tempCanvas = await exportToCanvas(elements, appState, files, {
        exportBackground,
        viewBackgroundColor,
        exportPadding,
    });
    tempCanvas.style.display = "none";
    document.body.appendChild(tempCanvas);
    let blob = await canvasToBlob(tempCanvas);
    tempCanvas.remove();
    if (type === "png") {
        if (appState.exportEmbedScene) {
            blob = await (await import(/* webpackChunkName: "image" */ "./image")).encodePngMetadata({
                blob,
                metadata: serializeAsJSON(elements, appState, files, "local"),
            });
        }
        return await fileSave(blob, {
            name,
            extension: "png",
            fileHandle,
        });
    }
    else if (type === "clipboard") {
        try {
            await copyBlobToClipboardAsPng(blob);
        }
        catch (error) {
            if (error.name === "CANVAS_POSSIBLY_TOO_BIG") {
                throw error;
            }
            throw new Error(t("alerts.couldNotCopyToClipboard"));
        }
    }
};
