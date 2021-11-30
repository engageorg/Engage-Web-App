import throttle from "lodash.throttle";
import { PureComponent } from "react";
import { ErrorDialog } from "../../components/ErrorDialog";
import { APP_NAME, ENV, EVENT } from "../../constants";
import { getSceneVersion } from "../../packages/excalidraw/index";
import {
  preventUnload,
  resolvablePromise,
  withBatchedUpdates,
} from "../../utils";
import {
  FILE_UPLOAD_MAX_BYTES,
  FIREBASE_STORAGE_PREFIXES,
  INITIAL_SCENE_UPDATE_TIMEOUT,
  LOAD_IMAGES_TIMEOUT,
  SCENE,
  SYNC_FULL_SCENE_INTERVAL_MS,
} from "../app_constants";
import {
  decryptAESGEM,
  generateCollaborationLinkData,
  getCollaborationLink,
  SOCKET_SERVER,
} from "../data";
import {
  isSavedToFirebase,
  loadFilesFromFirebase,
  loadFromFirebase,
  saveFilesToFirebase,
  saveToFirebase,
} from "../data/firebase";
import {
  importUsernameFromLocalStorage,
  saveUsernameToLocalStorage,
  STORAGE_KEYS,
} from "../data/localStorage";
import Portal from "./Portal";
import RoomDialog from "./RoomDialog";
import { createInverseContext } from "../../createInverseContext";
import { t } from "../../i18n";
import { UserIdleState } from "../../types";
import { IDLE_THRESHOLD, ACTIVE_THRESHOLD } from "../../constants";
import { trackEvent } from "../../analytics";
import { isInvisiblySmallElement } from "../../element";
import {
  encodeFilesForUpload,
  FileManager,
  updateStaleImageStatuses,
} from "../data/FileManager";
import { AbortError } from "../../errors";
import {
  isImageElement,
  isInitializedImageElement,
} from "../../element/typeChecks";
import { newElementWith } from "../../element/mutateElement";
import { reconcileElements as _reconcileElements } from "./reconciliation";
const {
  Context: CollabContext,
  Consumer: CollabContextConsumer,
  Provider: CollabContextProvider,
} = createInverseContext({ api: null });
export { CollabContext, CollabContextConsumer };
class CollabWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.isCollaborating = false;
    this.lastBroadcastedOrReceivedSceneVersion = -1;
    this.collaborators = new Map();
    this.onUnload = () => {
      this.destroySocketClient({ isUnload: true });
    };
    this.beforeUnload = withBatchedUpdates((event) => {
      const syncableElements = this.getSyncableElements(
        this.getSceneElementsIncludingDeleted()
      );
      if (
        this.isCollaborating &&
        (this.fileManager.shouldPreventUnload(syncableElements) ||
          !isSavedToFirebase(this.portal, syncableElements))
      ) {
        // this won't run in time if user decides to leave the site, but
        //  the purpose is to run in immediately after user decides to stay
        this.saveCollabRoomToFirebase(syncableElements);
        preventUnload(event);
      }
      if (this.isCollaborating || this.portal.roomId) {
        try {
          localStorage?.setItem(
            STORAGE_KEYS.LOCAL_STORAGE_KEY_COLLAB_FORCE_FLAG,
            JSON.stringify({
              timestamp: Date.now(),
              room: this.portal.roomId,
            })
          );
        } catch {}
      }
    });
    this.saveCollabRoomToFirebase = async (
      syncableElements = this.getSyncableElements(
        this.excalidrawAPI.getSceneElementsIncludingDeleted()
      )
    ) => {
      try {
        await saveToFirebase(this.portal, syncableElements);
      } catch (error) {
        console.error(error);
      }
    };
    this.openPortal = async () => {
      trackEvent("share", "room creation");
      return this.initializeSocketClient(null);
    };
    this.closePortal = () => {
      this.queueBroadcastAllElements.cancel();
      this.loadImageFiles.cancel();
      this.saveCollabRoomToFirebase();
      if (window.confirm(t("alerts.collabStopOverridePrompt"))) {
        window.history.pushState({}, APP_NAME, window.location.origin);
        this.destroySocketClient();
        trackEvent("share", "room closed");
        this.props.onRoomClose?.();
        const elements = this.excalidrawAPI
          .getSceneElementsIncludingDeleted()
          .map((element) => {
            if (isImageElement(element) && element.status === "saved") {
              return newElementWith(element, { status: "pending" });
            }
            return element;
          });
        this.excalidrawAPI.updateScene({
          elements,
          commitToHistory: false,
        });
      }
    };
    this.destroySocketClient = (opts) => {
      if (!opts?.isUnload) {
        this.collaborators = new Map();
        this.excalidrawAPI.updateScene({
          collaborators: this.collaborators,
        });
        this.setState({
          activeRoomLink: "",
        });
        this.isCollaborating = false;
      }
      this.lastBroadcastedOrReceivedSceneVersion = -1;
      this.portal.close();
      this.fileManager.reset();
    };
    this.fetchImageFilesFromFirebase = async (scene) => {
      const unfetchedImages = scene.elements
        .filter((element) => {
          return (
            isInitializedImageElement(element) &&
            !this.fileManager.isFileHandled(element.fileId) &&
            !element.isDeleted &&
            element.status === "saved"
          );
        })
        .map((element) => element.fileId);
      return await this.fileManager.getFiles(unfetchedImages);
    };
    this.initializeSocketClient = async (existingRoomLinkData) => {
      if (this.portal.socket) {
        return null;
      }
      let roomId;
      let roomKey;
      if (existingRoomLinkData) {
        ({ roomId, roomKey } = existingRoomLinkData);
      } else {
        ({ roomId, roomKey } = await generateCollaborationLinkData());
        window.history.pushState(
          {},
          APP_NAME,
          getCollaborationLink({ roomId, roomKey })
        );
      }
      const scenePromise = resolvablePromise();
      this.isCollaborating = true;
      const { default: socketIOClient } = await import(
        /* webpackChunkName: "socketIoClient" */ "socket.io-client"
      );
      this.portal.open(socketIOClient(SOCKET_SERVER), roomId, roomKey);
      if (existingRoomLinkData) {
        this.excalidrawAPI.resetScene();
        try {
          const elements = await loadFromFirebase(
            roomId,
            roomKey,
            this.portal.socket
          );
          if (elements) {
            scenePromise.resolve({
              elements,
              scrollToContent: true,
            });
          }
        } catch (error) {
          // log the error and move on. other peers will sync us the scene.
          console.error(error);
        }
      } else {
        const elements = this.excalidrawAPI
          .getSceneElements()
          .map((element) => {
            if (isImageElement(element) && element.status === "saved") {
              return newElementWith(element, { status: "pending" });
            }
            return element;
          });
        // remove deleted elements from elements array & history to ensure we don't
        // expose potentially sensitive user data in case user manually deletes
        // existing elements (or clears scene), which would otherwise be persisted
        // to database even if deleted before creating the room.
        this.excalidrawAPI.history.clear();
        this.excalidrawAPI.updateScene({
          elements,
          commitToHistory: true,
        });
        this.broadcastElements(elements);
        const syncableElements = this.getSyncableElements(elements);
        this.saveCollabRoomToFirebase(syncableElements);
      }
      // fallback in case you're not alone in the room but still don't receive
      // initial SCENE_UPDATE message
      this.socketInitializationTimer = window.setTimeout(() => {
        this.initializeSocket();
        scenePromise.resolve(null);
      }, INITIAL_SCENE_UPDATE_TIMEOUT);
      // All socket listeners are moving to Portal
      this.portal.socket.on("client-broadcast", async (encryptedData, iv) => {
        if (!this.portal.roomKey) {
          return;
        }
        const decryptedData = await decryptAESGEM(
          encryptedData,
          this.portal.roomKey,
          iv
        );
        switch (decryptedData.type) {
          case "INVALID_RESPONSE":
            return;
          case SCENE.INIT: {
            if (!this.portal.socketInitialized) {
              this.initializeSocket();
              const remoteElements = decryptedData.payload.elements;
              const reconciledElements = this.reconcileElements(remoteElements);
              this.handleRemoteSceneUpdate(reconciledElements, {
                init: true,
              });
              // noop if already resolved via init from firebase
              scenePromise.resolve({
                elements: reconciledElements,
                scrollToContent: true,
              });
            }
            break;
          }
          case SCENE.UPDATE:
            this.handleRemoteSceneUpdate(
              this.reconcileElements(decryptedData.payload.elements)
            );
            break;
          case "MOUSE_LOCATION": {
            const { pointer, button, username, selectedElementIds } =
              decryptedData.payload;
            const socketId =
              decryptedData.payload.socketId ||
              // @ts-ignore legacy, see #2094 (#2097)
              decryptedData.payload.socketID;
            const collaborators = new Map(this.collaborators);
            const user = collaborators.get(socketId) || {};
            user.pointer = pointer;
            user.button = button;
            user.selectedElementIds = selectedElementIds;
            user.username = username;
            collaborators.set(socketId, user);
            this.excalidrawAPI.updateScene({
              collaborators,
            });
            break;
          }
          case "IDLE_STATUS": {
            const { userState, socketId, username } = decryptedData.payload;
            const collaborators = new Map(this.collaborators);
            const user = collaborators.get(socketId) || {};
            user.userState = userState;
            user.username = username;
            this.excalidrawAPI.updateScene({
              collaborators,
            });
            break;
          }
        }
      });
      this.portal.socket.on("first-in-room", () => {
        if (this.portal.socket) {
          this.portal.socket.off("first-in-room");
        }
        this.initializeSocket();
        scenePromise.resolve(null);
      });
      this.initializeIdleDetector();
      this.setState({
        activeRoomLink: window.location.href,
      });
      return scenePromise;
    };
    this.initializeSocket = () => {
      this.portal.socketInitialized = true;
      clearTimeout(this.socketInitializationTimer);
    };
    this.reconcileElements = (remoteElements) => {
      const localElements = this.getSceneElementsIncludingDeleted();
      const appState = this.excalidrawAPI.getAppState();
      const reconciledElements = _reconcileElements(
        localElements,
        remoteElements,
        appState
      );
      // Avoid broadcasting to the rest of the collaborators the scene
      // we just received!
      // Note: this needs to be set before updating the scene as it
      // synchronously calls render.
      this.setLastBroadcastedOrReceivedSceneVersion(
        getSceneVersion(reconciledElements)
      );
      return reconciledElements;
    };
    this.loadImageFiles = throttle(async () => {
      const { loadedFiles, erroredFiles } =
        await this.fetchImageFilesFromFirebase({
          elements: this.excalidrawAPI.getSceneElementsIncludingDeleted(),
        });
      this.excalidrawAPI.addFiles(loadedFiles);
      updateStaleImageStatuses({
        excalidrawAPI: this.excalidrawAPI,
        erroredFiles,
        elements: this.excalidrawAPI.getSceneElementsIncludingDeleted(),
      });
    }, LOAD_IMAGES_TIMEOUT);
    this.handleRemoteSceneUpdate = (elements, { init = false } = {}) => {
      this.excalidrawAPI.updateScene({
        elements,
        commitToHistory: !!init,
      });
      // We haven't yet implemented multiplayer undo functionality, so we clear the undo stack
      // when we receive any messages from another peer. This UX can be pretty rough -- if you
      // undo, a user makes a change, and then try to redo, your element(s) will be lost. However,
      // right now we think this is the right tradeoff.
      this.excalidrawAPI.history.clear();
      this.loadImageFiles();
    };
    this.onPointerMove = () => {
      if (this.idleTimeoutId) {
        window.clearTimeout(this.idleTimeoutId);
        this.idleTimeoutId = null;
      }
      this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);
      if (!this.activeIntervalId) {
        this.activeIntervalId = window.setInterval(
          this.reportActive,
          ACTIVE_THRESHOLD
        );
      }
    };
    this.onVisibilityChange = () => {
      if (document.hidden) {
        if (this.idleTimeoutId) {
          window.clearTimeout(this.idleTimeoutId);
          this.idleTimeoutId = null;
        }
        if (this.activeIntervalId) {
          window.clearInterval(this.activeIntervalId);
          this.activeIntervalId = null;
        }
        this.onIdleStateChange(UserIdleState.AWAY);
      } else {
        this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);
        this.activeIntervalId = window.setInterval(
          this.reportActive,
          ACTIVE_THRESHOLD
        );
        this.onIdleStateChange(UserIdleState.ACTIVE);
      }
    };
    this.reportIdle = () => {
      this.onIdleStateChange(UserIdleState.IDLE);
      if (this.activeIntervalId) {
        window.clearInterval(this.activeIntervalId);
        this.activeIntervalId = null;
      }
    };
    this.reportActive = () => {
      this.onIdleStateChange(UserIdleState.ACTIVE);
    };
    this.initializeIdleDetector = () => {
      document.addEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
      document.addEventListener(
        EVENT.VISIBILITY_CHANGE,
        this.onVisibilityChange
      );
    };
    this.setLastBroadcastedOrReceivedSceneVersion = (version) => {
      this.lastBroadcastedOrReceivedSceneVersion = version;
    };
    this.getLastBroadcastedOrReceivedSceneVersion = () => {
      return this.lastBroadcastedOrReceivedSceneVersion;
    };
    this.getSceneElementsIncludingDeleted = () => {
      return this.excalidrawAPI.getSceneElementsIncludingDeleted();
    };
    this.onPointerUpdate = (payload) => {
      payload.pointersMap.size < 2 &&
        this.portal.socket &&
        this.portal.broadcastMouseLocation(payload);
    };
    this.onIdleStateChange = (userState) => {
      this.setState({ userState });
      this.portal.broadcastIdleChange(userState);
    };
    this.broadcastElements = (elements) => {
      if (
        getSceneVersion(elements) >
        this.getLastBroadcastedOrReceivedSceneVersion()
      ) {
        this.portal.broadcastScene(SCENE.UPDATE, elements, false);
        this.lastBroadcastedOrReceivedSceneVersion = getSceneVersion(elements);
        this.queueBroadcastAllElements();
      }
    };
    this.queueBroadcastAllElements = throttle(() => {
      this.portal.broadcastScene(
        SCENE.UPDATE,
        this.excalidrawAPI.getSceneElementsIncludingDeleted(),
        true
      );
      const currentVersion = this.getLastBroadcastedOrReceivedSceneVersion();
      const newVersion = Math.max(
        currentVersion,
        getSceneVersion(this.getSceneElementsIncludingDeleted())
      );
      this.setLastBroadcastedOrReceivedSceneVersion(newVersion);
    }, SYNC_FULL_SCENE_INTERVAL_MS);
    this.handleClose = () => {
      this.setState({ modalIsShown: false });
    };
    this.onUsernameChange = (username) => {
      this.setState({ username });
      saveUsernameToLocalStorage(username);
    };
    this.onCollabButtonClick = () => {
      this.setState({
        modalIsShown: true,
      });
    };
    this.isSyncableElement = (element) => {
      return element.isDeleted || !isInvisiblySmallElement(element);
    };
    this.getSyncableElements = (elements) =>
      elements.filter((element) => this.isSyncableElement(element));
    /** PRIVATE. Use `this.getContextValue()` instead. */
    this.contextValue = null;
    /** Getter of context value. Returned object is stable. */
    this.getContextValue = () => {
      if (!this.contextValue) {
        this.contextValue = {};
      }
      this.contextValue.isCollaborating = () => this.isCollaborating;
      this.contextValue.username = this.state.username;
      this.contextValue.onPointerUpdate = this.onPointerUpdate;
      this.contextValue.initializeSocketClient = this.initializeSocketClient;
      this.contextValue.onCollabButtonClick = this.onCollabButtonClick;
      this.contextValue.broadcastElements = this.broadcastElements;
      this.contextValue.fetchImageFilesFromFirebase =
        this.fetchImageFilesFromFirebase;
      return this.contextValue;
    };
    this.state = {
      modalIsShown: false,
      errorMessage: "",
      username: importUsernameFromLocalStorage() || "",
      userState: UserIdleState.ACTIVE,
      activeRoomLink: "",
    };
    this.portal = new Portal(this);
    this.fileManager = new FileManager({
      getFiles: async (fileIds) => {
        const { roomId, roomKey } = this.portal;
        if (!roomId || !roomKey) {
          throw new AbortError();
        }
        return loadFilesFromFirebase(`files/rooms/${roomId}`, roomKey, fileIds);
      },
      saveFiles: async ({ addedFiles }) => {
        const { roomId, roomKey } = this.portal;
        if (!roomId || !roomKey) {
          throw new AbortError();
        }
        return saveFilesToFirebase({
          prefix: `${FIREBASE_STORAGE_PREFIXES.collabFiles}/${roomId}`,
          files: await encodeFilesForUpload({
            files: addedFiles,
            encryptionKey: roomKey,
            maxBytes: FILE_UPLOAD_MAX_BYTES,
          }),
        });
      },
    });
    this.excalidrawAPI = props.excalidrawAPI;
    this.activeIntervalId = null;
    this.idleTimeoutId = null;
  }
  componentDidMount() {
    window.addEventListener(EVENT.BEFORE_UNLOAD, this.beforeUnload);
    window.addEventListener(EVENT.UNLOAD, this.onUnload);
    if (
      process.env.NODE_ENV === ENV.TEST ||
      process.env.NODE_ENV === ENV.DEVELOPMENT
    ) {
      window.collab = window.collab || {};
      Object.defineProperties(window, {
        collab: {
          configurable: true,
          value: this,
        },
      });
    }
  }
  componentWillUnmount() {
    window.removeEventListener(EVENT.BEFORE_UNLOAD, this.beforeUnload);
    window.removeEventListener(EVENT.UNLOAD, this.onUnload);
    window.removeEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
    window.removeEventListener(
      EVENT.VISIBILITY_CHANGE,
      this.onVisibilityChange
    );
    if (this.activeIntervalId) {
      window.clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }
    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }
  setCollaborators(sockets) {
    this.setState((state) => {
      const collaborators = new Map();
      for (const socketId of sockets) {
        if (this.collaborators.has(socketId)) {
          collaborators.set(socketId, this.collaborators.get(socketId));
        } else {
          collaborators.set(socketId, {});
        }
      }
      this.collaborators = collaborators;
      this.excalidrawAPI.updateScene({ collaborators });
    });
  }
  render() {
    const { modalIsShown, username, errorMessage, activeRoomLink } = this.state;
    return (
      <>
        {modalIsShown && (
          <RoomDialog
            handleClose={this.handleClose}
            activeRoomLink={activeRoomLink}
            username={username}
            onUsernameChange={this.onUsernameChange}
            onRoomCreate={this.openPortal}
            onRoomDestroy={this.closePortal}
            setErrorMessage={(errorMessage) => {
              this.setState({ errorMessage });
            }}
            theme={this.excalidrawAPI.getAppState().theme}
          />
        )}
        {errorMessage && (
          <ErrorDialog
            message={errorMessage}
            onClose={() => this.setState({ errorMessage: "" })}
          />
        )}
        <CollabContextProvider
          value={{
            api: this.getContextValue(),
          }}
        />
      </>
    );
  }
}
if (
  process.env.NODE_ENV === ENV.TEST ||
  process.env.NODE_ENV === ENV.DEVELOPMENT
) {
  window.collab = window.collab || {};
}
export default CollabWrapper;
