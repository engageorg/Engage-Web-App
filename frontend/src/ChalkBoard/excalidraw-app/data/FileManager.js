import { compressData } from "../../data/encode";
import { newElementWith } from "../../element/mutateElement";
import { isInitializedImageElement } from "../../element/typeChecks";
import { t } from "../../i18n";
export class FileManager {
    constructor({ getFiles, saveFiles, }) {
        /** files being fetched */
        this.fetchingFiles = new Map();
        /** files being saved */
        this.savingFiles = new Map();
        /* files already saved to persistent storage */
        this.savedFiles = new Map();
        this.erroredFiles = new Map();
        /**
         * returns whether file is already saved or being processed
         */
        this.isFileHandled = (id) => {
            return (this.savedFiles.has(id) ||
                this.fetchingFiles.has(id) ||
                this.savingFiles.has(id) ||
                this.erroredFiles.has(id));
        };
        this.isFileSaved = (id) => {
            return this.savedFiles.has(id);
        };
        this.saveFiles = async ({ elements, files, }) => {
            const addedFiles = new Map();
            for (const element of elements) {
                if (isInitializedImageElement(element) &&
                    files[element.fileId] &&
                    !this.isFileHandled(element.fileId)) {
                    addedFiles.set(element.fileId, files[element.fileId]);
                    this.savingFiles.set(element.fileId, true);
                }
            }
            try {
                const { savedFiles, erroredFiles } = await this._saveFiles({
                    addedFiles,
                });
                for (const [fileId] of savedFiles) {
                    this.savedFiles.set(fileId, true);
                }
                return {
                    savedFiles,
                    erroredFiles,
                };
            }
            finally {
                for (const [fileId] of addedFiles) {
                    this.savingFiles.delete(fileId);
                }
            }
        };
        this.getFiles = async (ids) => {
            if (!ids.length) {
                return {
                    loadedFiles: [],
                    erroredFiles: new Map(),
                };
            }
            for (const id of ids) {
                this.fetchingFiles.set(id, true);
            }
            try {
                const { loadedFiles, erroredFiles } = await this._getFiles(ids);
                for (const file of loadedFiles) {
                    this.savedFiles.set(file.id, true);
                }
                for (const [fileId] of erroredFiles) {
                    this.erroredFiles.set(fileId, true);
                }
                return { loadedFiles, erroredFiles };
            }
            finally {
                for (const id of ids) {
                    this.fetchingFiles.delete(id);
                }
            }
        };
        /** a file element prevents unload only if it's being saved regardless of
         *  its `status`. This ensures that elements who for any reason haven't
         *  beed set to `saved` status don't prevent unload in future sessions.
         *  Technically we should prevent unload when the origin client haven't
         *  yet saved the `status` update to storage, but that should be taken care
         *  of during regular beforeUnload unsaved files check.
         */
        this.shouldPreventUnload = (elements) => {
            return elements.some((element) => {
                return (isInitializedImageElement(element) &&
                    !element.isDeleted &&
                    this.savingFiles.has(element.fileId));
            });
        };
        /**
         * helper to determine if image element status needs updating
         */
        this.shouldUpdateImageElementStatus = (element) => {
            return (isInitializedImageElement(element) &&
                this.isFileSaved(element.fileId) &&
                element.status === "pending");
        };
        this._getFiles = getFiles;
        this._saveFiles = saveFiles;
    }
    reset() {
        this.fetchingFiles.clear();
        this.savingFiles.clear();
        this.savedFiles.clear();
        this.erroredFiles.clear();
    }
}
export const encodeFilesForUpload = async ({ files, maxBytes, encryptionKey, }) => {
    const processedFiles = [];
    for (const [id, fileData] of files) {
        const buffer = new TextEncoder().encode(fileData.dataURL);
        const encodedFile = await compressData(buffer, {
            encryptionKey,
            metadata: {
                id,
                mimeType: fileData.mimeType,
                created: Date.now(),
            },
        });
        if (buffer.byteLength > maxBytes) {
            throw new Error(t("errors.fileTooBig", {
                maxSize: `${Math.trunc(maxBytes / 1024 / 1024)}MB`,
            }));
        }
        processedFiles.push({
            id,
            buffer: encodedFile,
        });
    }
    return processedFiles;
};
export const updateStaleImageStatuses = (params) => {
    if (!params.erroredFiles.size) {
        return;
    }
    params.excalidrawAPI.updateScene({
        elements: params.excalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
            if (isInitializedImageElement(element) &&
                params.erroredFiles.has(element.fileId)) {
                return newElementWith(element, {
                    status: "error",
                });
            }
            return element;
        }),
    });
};
