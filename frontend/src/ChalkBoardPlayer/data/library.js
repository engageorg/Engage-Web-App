import { loadLibraryFromBlob } from "./blob";
import { restoreElements } from "./restore";
import { getNonDeletedElements } from "../element";
class Library {
    constructor(app) {
        this.libraryCache = null;
        this.resetLibrary = async () => {
            await this.app.props.onLibraryChange?.([]);
            this.libraryCache = [];
        };
        this.restoreLibraryItem = (libraryItem) => {
            const elements = getNonDeletedElements(restoreElements(libraryItem, null));
            return elements.length ? elements : null;
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
    async importLibrary(blob) {
        const libraryFile = await loadLibraryFromBlob(blob);
        if (!libraryFile || !libraryFile.library) {
            return;
        }
        /**
         * checks if library item does not exist already in current library
         */
        const isUniqueitem = (existingLibraryItems, targetLibraryItem) => {
            return !existingLibraryItems.find((libraryItem) => {
                if (libraryItem.length !== targetLibraryItem.length) {
                    return false;
                }
                // detect z-index difference by checking the excalidraw elements
                // are in order
                return libraryItem.every((libItemExcalidrawItem, idx) => {
                    return (libItemExcalidrawItem.id === targetLibraryItem[idx].id &&
                        libItemExcalidrawItem.versionNonce ===
                            targetLibraryItem[idx].versionNonce);
                });
            });
        };
        const existingLibraryItems = await this.loadLibrary();
        const filtered = libraryFile.library.reduce((acc, libraryItem) => {
            const restoredItem = this.restoreLibraryItem(libraryItem);
            if (restoredItem && isUniqueitem(existingLibraryItems, restoredItem)) {
                acc.push(restoredItem);
            }
            return acc;
        }, []);
        await this.saveLibrary([...existingLibraryItems, ...filtered]);
    }
}
export default Library;
