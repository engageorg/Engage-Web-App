import { loadLibraryFromBlob } from "./blob";
import { restoreElements, restoreLibraryItems } from "./restore";
import { getNonDeletedElements } from "../element";
class Library {
    constructor(app) {
        this.libraryCache = null;
        this.resetLibrary = async () => {
            await this.app.props.onLibraryChange?.([]);
            this.libraryCache = [];
        };
        this.restoreLibraryItem = (libraryItem) => {
            const elements = getNonDeletedElements(restoreElements(libraryItem.elements, null));
            return elements.length ? { ...libraryItem, elements } : null;
        };
        this.loadLibrary = () => {
            return new Promise(async (resolve) => {
                if (this.libraryCache) {
                    return resolve(JSON.parse(JSON.stringify(this.libraryCache)));
                }
                try {
                    const libraryItems = this.app.libraryItemsFromStorage;
                    if (!libraryItems) {
                        return resolve([]);
                    }
                    const items = libraryItems.reduce((acc, item) => {
                        const restoredItem = this.restoreLibraryItem(item);
                        if (restoredItem) {
                            acc.push(item);
                        }
                        return acc;
                    }, []);
                    // clone to ensure we don't mutate the cached library elements in the app
                    this.libraryCache = JSON.parse(JSON.stringify(items));
                    resolve(items);
                }
                catch (error) {
                    console.error(error);
                    resolve([]);
                }
            });
        };
        this.saveLibrary = async (items) => {
            const prevLibraryItems = this.libraryCache;
            try {
                const serializedItems = JSON.stringify(items);
                // cache optimistically so that the app has access to the latest
                // immediately
                this.libraryCache = JSON.parse(serializedItems);
                await this.app.props.onLibraryChange?.(items);
            }
            catch (error) {
                this.libraryCache = prevLibraryItems;
                throw error;
            }
        };
        this.app = app;
    }
    /** imports library (currently merges, removing duplicates) */
    async importLibrary(blob, defaultStatus = "unpublished") {
        const libraryFile = await loadLibraryFromBlob(blob);
        if (!libraryFile || !(libraryFile.libraryItems || libraryFile.library)) {
            return;
        }
        /**
         * checks if library item does not exist already in current library
         */
        const isUniqueitem = (existingLibraryItems, targetLibraryItem) => {
            return !existingLibraryItems.find((libraryItem) => {
                if (libraryItem.elements.length !== targetLibraryItem.elements.length) {
                    return false;
                }
                // detect z-index difference by checking the excalidraw elements
                // are in order
                return libraryItem.elements.every((libItemExcalidrawItem, idx) => {
                    return (libItemExcalidrawItem.id === targetLibraryItem.elements[idx].id &&
                        libItemExcalidrawItem.versionNonce ===
                            targetLibraryItem.elements[idx].versionNonce);
                });
            });
        };
        const existingLibraryItems = await this.loadLibrary();
        const library = libraryFile.libraryItems || libraryFile.library || [];
        const restoredLibItems = restoreLibraryItems(library, defaultStatus);
        const filteredItems = [];
        for (const item of restoredLibItems) {
            const restoredItem = this.restoreLibraryItem(item);
            if (restoredItem && isUniqueitem(existingLibraryItems, restoredItem)) {
                filteredItems.push(restoredItem);
            }
        }
        await this.saveLibrary([...filteredItems, ...existingLibraryItems]);
    }
}
export default Library;
