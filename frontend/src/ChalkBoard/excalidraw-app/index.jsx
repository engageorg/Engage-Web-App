import LanguageDetector from "i18next-browser-languagedetector";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { getDefaultAppState } from "../appState";
import { ErrorDialog } from "../components/ErrorDialog";
import { TopErrorBoundary } from "../components/TopErrorBoundary";
import { APP_NAME, EVENT, STORAGE_KEYS, TITLE_TIMEOUT, URL_HASH_KEYS, VERSION_TIMEOUT, } from "../constants";
import { loadFromBlob } from "../data/blob";
import { useCallbackRefState } from "../hooks/useCallbackRefState";
import { t } from "../i18n";
import Excalidraw, { defaultLang, languages, } from "../packages/excalidraw/index";
import { debounce, getVersion, preventUnload, resolvablePromise, } from "../utils";
import { FIREBASE_STORAGE_PREFIXES, SAVE_TO_LOCAL_STORAGE_TIMEOUT, } from "./app_constants";
import CollabWrapper, { CollabContext, CollabContextConsumer, } from "./collab/CollabWrapper";
import { exportToBackend, getCollaborationLinkData, loadScene } from "./data";
import { importFromLocalStorage, saveToLocalStorage, } from "./data/localStorage";
import CustomStats from "./CustomStats";
import { restoreAppState } from "../data/restore";
import { Tooltip } from "../components/Tooltip";
import { shield } from "../components/icons";
import "./index.scss";
import { ExportToExcalidrawPlus } from "./components/ExportToExcalidrawPlus";
import { getMany, set, del, keys, createStore } from "idb-keyval";
import { FileManager, updateStaleImageStatuses } from "./data/FileManager";
import { newElementWith } from "../element/mutateElement";
import { isInitializedImageElement } from "../element/typeChecks";
import { loadFilesFromFirebase } from "./data/firebase";
const filesStore = createStore("files-db", "files-store");
const clearObsoleteFilesFromIndexedDB = async (opts) => {
    const allIds = await keys(filesStore);
    for (const id of allIds) {
        if (!opts.currentFileIds.includes(id)) {
            del(id, filesStore);
        }
    }
};
const localFileStorage = new FileManager({
    getFiles(ids) {
        return getMany(ids, filesStore).then((filesData) => {
            const loadedFiles = [];
            const erroredFiles = new Map();
            filesData.forEach((data, index) => {
                const id = ids[index];
                if (data) {
                    loadedFiles.push(data);
                }
                else {
                    erroredFiles.set(id, true);
                }
            });
            return { loadedFiles, erroredFiles };
        });
    },
    async saveFiles({ addedFiles }) {
        const savedFiles = new Map();
        const erroredFiles = new Map();
        await Promise.all([...addedFiles].map(async ([id, fileData]) => {
            try {
                await set(id, fileData, filesStore);
                savedFiles.set(id, true);
            }
            catch (error) {
                console.error(error);
                erroredFiles.set(id, true);
            }
        }));
        return { savedFiles, erroredFiles };
    },
});
const languageDetector = new LanguageDetector();
languageDetector.init({
    languageUtils: {
        formatLanguageCode: (langCode) => langCode,
        isWhitelisted: () => true,
    },
    checkWhitelist: false,
});
const saveDebounced = debounce(async (elements, appState, files, onFilesSaved) => {
    saveToLocalStorage(elements, appState);
    await localFileStorage.saveFiles({
        elements,
        files,
    });
    onFilesSaved();
}, SAVE_TO_LOCAL_STORAGE_TIMEOUT);
const onBlur = () => {
    saveDebounced.flush();
};
const initializeScene = async (opts) => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    const jsonBackendMatch = window.location.hash.match(/^#json=([0-9]+),([a-zA-Z0-9_-]+)$/);
    const externalUrlMatch = window.location.hash.match(/^#url=(.*)$/);
    const localDataState = importFromLocalStorage();
    let scene = await loadScene(null, null, localDataState);
    let roomLinkData = getCollaborationLinkData(window.location.href);
    const isExternalScene = !!(id || jsonBackendMatch || roomLinkData);
    if (isExternalScene) {
        if (
        // don't prompt if scene is empty
        !scene.elements.length ||
            // don't prompt for collab scenes because we don't override local storage
            roomLinkData ||
            // otherwise, prompt whether user wants to override current scene
            window.confirm(t("alerts.loadSceneOverridePrompt"))) {
            if (jsonBackendMatch) {
                scene = await loadScene(jsonBackendMatch[1], jsonBackendMatch[2], localDataState);
            }
            scene.scrollToContent = true;
            if (!roomLinkData) {
                window.history.replaceState({}, APP_NAME, window.location.origin);
            }
        }
        else {
            // https://github.com/excalidraw/excalidraw/issues/1919
            if (document.hidden) {
                return new Promise((resolve, reject) => {
                    window.addEventListener("focus", () => initializeScene(opts).then(resolve).catch(reject), {
                        once: true,
                    });
                });
            }
            roomLinkData = null;
            window.history.replaceState({}, APP_NAME, window.location.origin);
        }
    }
    else if (externalUrlMatch) {
        window.history.replaceState({}, APP_NAME, window.location.origin);
        const url = externalUrlMatch[1];
        try {
            const request = await fetch(window.decodeURIComponent(url));
            const data = await loadFromBlob(await request.blob(), null, null);
            if (!scene.elements.length ||
                window.confirm(t("alerts.loadSceneOverridePrompt"))) {
                return { scene: data, isExternalScene };
            }
        }
        catch (error) {
            return {
                scene: {
                    appState: {
                        errorMessage: t("alerts.invalidSceneUrl"),
                    },
                },
                isExternalScene,
            };
        }
    }
    if (roomLinkData) {
        return {
            scene: await opts.collabAPI.initializeSocketClient(roomLinkData),
            isExternalScene: true,
            id: roomLinkData.roomId,
            key: roomLinkData.roomKey,
        };
    }
    else if (scene) {
        return isExternalScene && jsonBackendMatch
            ? {
                scene,
                isExternalScene,
                id: jsonBackendMatch[1],
                key: jsonBackendMatch[2],
            }
            : { scene, isExternalScene: false };
    }
    return { scene: null, isExternalScene: false };
};

const ExcalidrawWrapper = () => {
    const [errorMessage, setErrorMessage] = useState("");
    let currentLangCode = languageDetector.detect() || defaultLang.code;
    if (Array.isArray(currentLangCode)) {
        currentLangCode = currentLangCode[0];
    }
    const [langCode, setLangCode] = useState(currentLangCode);
    // initial state
    // ---------------------------------------------------------------------------
    const initialStatePromiseRef = useRef({ promise: null });
    if (!initialStatePromiseRef.current.promise) {
        initialStatePromiseRef.current.promise =
            resolvablePromise();
    }
    useEffect(() => {
        // Delayed so that the app has a time to load the latest SW
        setTimeout(() => {
            trackEvent("load", "version", getVersion());
        }, VERSION_TIMEOUT);
    }, []);
    const [excalidrawAPI, excalidrawRefCallback] = useCallbackRefState();
    const collabAPI = useContext(CollabContext)?.api;
    useEffect(() => {
        if (!collabAPI || !excalidrawAPI) {
            return;
        }
        const loadImages = (data, isInitialLoad = false) => {
            if (!data.scene) {
                return;
            }
            if (collabAPI.isCollaborating()) {
                if (data.scene.elements) {
                    collabAPI
                        .fetchImageFilesFromFirebase({
                        elements: data.scene.elements,
                    })
                        .then(({ loadedFiles, erroredFiles }) => {
                        excalidrawAPI.addFiles(loadedFiles);
                        updateStaleImageStatuses({
                            excalidrawAPI,
                            erroredFiles,
                            elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                        });
                    });
                }
            }
            else {
                const fileIds = data.scene.elements?.reduce((acc, element) => {
                    if (isInitializedImageElement(element)) {
                        return acc.concat(element.fileId);
                    }
                    return acc;
                }, []) || [];
                if (data.isExternalScene) {
                    loadFilesFromFirebase(`${FIREBASE_STORAGE_PREFIXES.shareLinkFiles}/${data.id}`, data.key, fileIds).then(({ loadedFiles, erroredFiles }) => {
                        excalidrawAPI.addFiles(loadedFiles);
                        updateStaleImageStatuses({
                            excalidrawAPI,
                            erroredFiles,
                            elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                        });
                    });
                }
                else if (isInitialLoad) {
                    if (fileIds.length) {
                        localFileStorage
                            .getFiles(fileIds)
                            .then(({ loadedFiles, erroredFiles }) => {
                            if (loadedFiles.length) {
                                excalidrawAPI.addFiles(loadedFiles);
                            }
                            updateStaleImageStatuses({
                                excalidrawAPI,
                                erroredFiles,
                                elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                            });
                        });
                    }
                    // on fresh load, clear unused files from IDB (from previous
                    // session)
                    clearObsoleteFilesFromIndexedDB({ currentFileIds: fileIds });
                }
            }
            try {
                data.scene.libraryItems =
                    JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_LIBRARY)) || [];
            }
            catch (error) {
                console.error(error);
            }
        };
        initializeScene({ collabAPI }).then((data) => {
            loadImages(data, /* isInitialLoad */ true);
            initialStatePromiseRef.current.promise.resolve(data.scene);
        });
        const onHashChange = (event) => {
            event.preventDefault();
            const hash = new URLSearchParams(window.location.hash.slice(1));
            const libraryUrl = hash.get(URL_HASH_KEYS.addLibrary);
            if (libraryUrl) {
                // If hash changed and it contains library url, import it and replace
                // the url to its previous state (important in case of collaboration
                // and similar).
                // Using history API won't trigger another hashchange.
                window.history.replaceState({}, "", event.oldURL);
                excalidrawAPI.importLibrary(libraryUrl, hash.get("token"));
            }
            else {
                initializeScene({ collabAPI }).then((data) => {
                    loadImages(data);
                    if (data.scene) {
                        excalidrawAPI.updateScene({
                            ...data.scene,
                            appState: restoreAppState(data.scene.appState, null),
                        });
                    }
                });
            }
        };
        const titleTimeout = setTimeout(() => (document.title = APP_NAME), TITLE_TIMEOUT);
        window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
        window.addEventListener(EVENT.UNLOAD, onBlur, false);
        window.addEventListener(EVENT.BLUR, onBlur, false);
        return () => {
            window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
            window.removeEventListener(EVENT.UNLOAD, onBlur, false);
            window.removeEventListener(EVENT.BLUR, onBlur, false);
            clearTimeout(titleTimeout);
        };
    }, [collabAPI, excalidrawAPI]);
    useEffect(() => {
        const unloadHandler = (event) => {
            saveDebounced.flush();
            if (excalidrawAPI &&
                localFileStorage.shouldPreventUnload(excalidrawAPI.getSceneElements())) {
                preventUnload(event);
            }
        };
        window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
        return () => {
            window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
        };
    }, [excalidrawAPI]);
    useEffect(() => {
        languageDetector.cacheUserLanguage(langCode);
    }, [langCode]);
    const onChange = (elements, appState, files) => {
        if (collabAPI?.isCollaborating()) {
            collabAPI.broadcastElements(elements);
        }
        else {
            saveDebounced(elements, appState, files, () => {
                if (excalidrawAPI) {
                    let didChange = false;
                    let pendingImageElement = appState.pendingImageElement;
                    const elements = excalidrawAPI
                        .getSceneElementsIncludingDeleted()
                        .map((element) => {
                        if (localFileStorage.shouldUpdateImageElementStatus(element)) {
                            didChange = true;
                            const newEl = newElementWith(element, { status: "saved" });
                            if (pendingImageElement === element) {
                                pendingImageElement = newEl;
                            }
                            return newEl;
                        }
                        return element;
                    });
                    if (didChange) {
                        excalidrawAPI.updateScene({
                            elements,
                            appState: {
                                pendingImageElement,
                            },
                        });
                    }
                }
            });
        }
    };
    const onExportToBackend = async (exportedElements, appState, files, canvas) => {
        if (exportedElements.length === 0) {
            return window.alert(t("alerts.cannotExportEmptyCanvas"));
        }
        if (canvas) {
            try {
                await exportToBackend(exportedElements, {
                    ...appState,
                    viewBackgroundColor: appState.exportBackground
                        ? appState.viewBackgroundColor
                        : getDefaultAppState().viewBackgroundColor,
                }, files);
            }
            catch (error) {
                if (error.name !== "AbortError") {
                    const { width, height } = canvas;
                    console.error(error, { width, height });
                    setErrorMessage(error.message);
                }
            }
        }
    };
    const renderTopRightUI = useCallback((isMobile, appState) => {
        if (isMobile) {
            return null;
        }
        return (<div style={{
                width: "24ch",
                fontSize: "0.7em",
                textAlign: "center",
            }}>
          {/* <GitHubCorner theme={appState.theme} dir={document.dir} /> */}
          {/* FIXME remove after 2021-05-20 */}
        </div>);
    }, []);
    const renderFooter = useCallback((isMobile) => {
        const renderEncryptedIcon = () => (<a className="encrypted-icon tooltip" href="https://blog.excalidraw.com/end-to-end-encryption/" target="_blank" rel="noopener noreferrer" aria-label={t("encrypted.link")}>
          <Tooltip label={t("encrypted.tooltip")} long={true}>
            {shield}
          </Tooltip>
        </a>);
        if (isMobile) {
            const isTinyDevice = window.innerWidth < 362;
            return (<div style={{
                    display: "flex",
                    flexDirection: isTinyDevice ? "column" : "row",
                }}>
            <fieldset>
              <legend>{t("labels.language")}</legend>
            </fieldset>
            {/* FIXME remove after 2021-05-20 */}
            <div style={{
                    width: "24ch",
                    fontSize: "0.7em",
                    textAlign: "center",
                    marginTop: isTinyDevice ? 16 : undefined,
                    marginLeft: "auto",
                    marginRight: isTinyDevice ? "auto" : undefined,
                    padding: "4px 2px",
                    border: "1px dashed #aaa",
                    borderRadius: 12,
                }}>
              
            </div>
          </div>);
        }
        return (<>
          {renderEncryptedIcon()}
        </>);
    }, [langCode]);
    const renderCustomStats = () => {
        return (<CustomStats setToastMessage={(message) => excalidrawAPI.setToastMessage(message)}/>);
    };
    const onLibraryChange = async (items) => {
        if (!items.length) {
            localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_LIBRARY);
            return;
        }
        const serializedItems = JSON.stringify(items);
        localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_LIBRARY, serializedItems);
    };
    const onRoomClose = useCallback(() => {
        localFileStorage.reset();
    }, []);
    return (<>
      <Excalidraw ref={excalidrawRefCallback} onChange={onChange} initialData={initialStatePromiseRef.current.promise} onCollabButtonClick={collabAPI?.onCollabButtonClick} isCollaborating={collabAPI?.isCollaborating()} onPointerUpdate={collabAPI?.onPointerUpdate} UIOptions={{
            canvasActions: {
                export: {
                    onExportToBackend,
                    renderCustomUI: (elements, appState, files) => {
                        return (<ExportToExcalidrawPlus elements={elements} appState={appState} files={files} onError={(error) => {
                                excalidrawAPI?.updateScene({
                                    appState: {
                                        errorMessage: error.message,
                                    },
                                });
                            }}/>);
                    },
                },
            },
        }} renderTopRightUI={renderTopRightUI} renderFooter={renderFooter} langCode={langCode} renderCustomStats={renderCustomStats} detectScroll={false} handleKeyboardGlobally={true} onLibraryChange={onLibraryChange} autoFocus={true}/>
      {excalidrawAPI && (<CollabWrapper excalidrawAPI={excalidrawAPI} onRoomClose={onRoomClose}/>)}
      {errorMessage && (<ErrorDialog message={errorMessage} onClose={() => setErrorMessage("")}/>)}
    </>);
};
const ExcalidrawApp = () => {
    return (<TopErrorBoundary>
      <CollabContextConsumer>
        <ExcalidrawWrapper />
      </CollabContextConsumer>
    </TopErrorBoundary>);
};
export default ExcalidrawApp;
