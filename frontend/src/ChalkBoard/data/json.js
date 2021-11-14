import { fileOpen, fileSave } from "./filesystem";
import { cleanAppStateForExport, clearAppStateForDatabase } from "../appState";
import { EXPORT_DATA_TYPES, EXPORT_SOURCE, MIME_TYPES } from "../constants";
import { clearElementsForDatabase, clearElementsForExport } from "../element";
import { isImageFileHandle, loadFromBlob } from "./blob";
/**
 * Strips out files which are only referenced by deleted elements
 */
const filterOutDeletedFiles = (elements, files) => {
    const nextFiles = {};
    for (const element of elements) {
        if (!element.isDeleted &&
            "fileId" in element &&
            element.fileId &&
            files[element.fileId]) {
            nextFiles[element.fileId] = files[element.fileId];
        }
    }
    return nextFiles;
};
export const serializeAsJSON = (elements, appState, files, type) => {
    const data = {
        type: EXPORT_DATA_TYPES.excalidraw,
        version: 2,
        source: EXPORT_SOURCE,
        elements: type === "local"
            ? clearElementsForExport(elements)
            : clearElementsForDatabase(elements),
        appState: type === "local"
            ? cleanAppStateForExport(appState)
            : clearAppStateForDatabase(appState),
        files: type === "local"
            ? filterOutDeletedFiles(elements, files)
            : // will be stripped from JSON
                undefined,
    };
    return JSON.stringify(data, null, 2);
};
export const saveAsJSON = async (elements, appState, files) => {
    const serialized = serializeAsJSON(elements, appState, files, "local");
    const blob = new Blob([serialized], {
        type: MIME_TYPES.excalidraw,
    });
    const fileHandle = await fileSave(blob, {
        name: appState.name,
        extension: "excalidraw",
        description: "Excalidraw file",
        fileHandle: isImageFileHandle(appState.fileHandle)
            ? null
            : appState.fileHandle,
    });
    return { fileHandle };
};
export const loadFromJSON = async (localAppState, localElements) => {
    const blob = await fileOpen({
        description: "Excalidraw files",
        // ToDo: Be over-permissive until https://bugs.webkit.org/show_bug.cgi?id=34442
        // gets resolved. Else, iOS users cannot open `.excalidraw` files.
        // extensions: ["json", "excalidraw", "png", "svg"],
    });
    return loadFromBlob(blob, localAppState, localElements);
};
export const isValidExcalidrawData = (data) => {
    return (data?.type === EXPORT_DATA_TYPES.excalidraw &&
        (!data.elements ||
            (Array.isArray(data.elements) &&
                (!data.appState || typeof data.appState === "object"))));
};
export const isValidLibrary = (json) => {
    return (typeof json === "object" &&
        json &&
        json.type === EXPORT_DATA_TYPES.excalidrawLibrary &&
        json.version === 1);
};
export const saveLibraryAsJSON = async (library) => {
    const libraryItems = await library.loadLibrary();
    const data = {
        type: EXPORT_DATA_TYPES.excalidrawLibrary,
        version: 1,
        source: EXPORT_SOURCE,
        library: libraryItems,
    };
    const serialized = JSON.stringify(data, null, 2);
    await fileSave(new Blob([serialized], {
        type: MIME_TYPES.excalidrawlib,
    }), {
        name: "library",
        extension: "excalidrawlib",
        description: "Excalidraw library file",
    });
};
export const importLibraryFromJSON = async (library) => {
    const blob = await fileOpen({
        description: "Excalidraw library files",
        // ToDo: Be over-permissive until https://bugs.webkit.org/show_bug.cgi?id=34442
        // gets resolved. Else, iOS users cannot open `.excalidraw` files.
        /*
        extensions: [".json", ".excalidrawlib"],
        */
    });
    await library.importLibrary(blob);
};