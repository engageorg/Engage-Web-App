import { encryptAESGEM, } from "../data";
import { BROADCAST, FILE_UPLOAD_TIMEOUT, SCENE } from "../app_constants";
import { trackEvent } from "../../analytics";
import { throttle } from "lodash";
import { newElementWith } from "../../element/mutateElement";
class Portal {
    constructor(collab) {
        this.socket = null;
        this.socketInitialized = false; // we don't want the socket to emit any updates until it is fully initialized
        this.roomId = null;
        this.roomKey = null;
        this.broadcastedElementVersions = new Map();
        this.queueFileUpload = throttle(async () => {
            try {
                await this.collab.fileManager.saveFiles({
                    elements: this.collab.excalidrawAPI.getSceneElementsIncludingDeleted(),
                    files: this.collab.excalidrawAPI.getFiles(),
                });
            }
            catch (error) {
                if (error.name !== "AbortError") {
                    this.collab.excalidrawAPI.updateScene({
                        appState: {
                            errorMessage: error.message,
                        },
                    });
                }
            }
            this.collab.excalidrawAPI.updateScene({
                elements: this.collab.excalidrawAPI
                    .getSceneElementsIncludingDeleted()
                    .map((element) => {
                    if (this.collab.fileManager.shouldUpdateImageElementStatus(element)) {
                        // this will signal collaborators to pull image data from server
                        // (using mutation instead of newElementWith otherwise it'd break
                        // in-progress dragging)
                        return newElementWith(element, { status: "saved" });
                    }
                    return element;
                }),
            });
        }, FILE_UPLOAD_TIMEOUT);
        this.broadcastScene = async (sceneType, allElements, syncAll) => {
            if (sceneType === SCENE.INIT && !syncAll) {
                throw new Error("syncAll must be true when sending SCENE.INIT");
            }
            // sync out only the elements we think we need to to save bandwidth.
            // periodically we'll resync the whole thing to make sure no one diverges
            // due to a dropped message (server goes down etc).
            const syncableElements = allElements.reduce((acc, element, idx, elements) => {
                if ((syncAll ||
                    !this.broadcastedElementVersions.has(element.id) ||
                    element.version >
                        this.broadcastedElementVersions.get(element.id)) &&
                    this.collab.isSyncableElement(element)) {
                    acc.push({
                        ...element,
                        // z-index info for the reconciler
                        parent: idx === 0 ? "^" : elements[idx - 1]?.id,
                    });
                }
                return acc;
            }, []);
            const data = {
                type: sceneType,
                payload: {
                    elements: syncableElements,
                },
            };
            for (const syncableElement of syncableElements) {
                this.broadcastedElementVersions.set(syncableElement.id, syncableElement.version);
            }
            const broadcastPromise = this._broadcastSocketData(data);
            this.queueFileUpload();
            if (syncAll && this.collab.isCollaborating) {
                await Promise.all([
                    broadcastPromise,
                    this.collab.saveCollabRoomToFirebase(syncableElements),
                ]);
            }
            else {
                await broadcastPromise;
            }
        };
        this.broadcastIdleChange = (userState) => {
            if (this.socket?.id) {
                const data = {
                    type: "IDLE_STATUS",
                    payload: {
                        socketId: this.socket.id,
                        userState,
                        username: this.collab.state.username,
                    },
                };
                return this._broadcastSocketData(data, true);
            }
        };
        this.broadcastMouseLocation = (payload) => {
            if (this.socket?.id) {
                const data = {
                    type: "MOUSE_LOCATION",
                    payload: {
                        socketId: this.socket.id,
                        pointer: payload.pointer,
                        button: payload.button || "up",
                        selectedElementIds: this.collab.excalidrawAPI.getAppState().selectedElementIds,
                        username: this.collab.state.username,
                    },
                };
                return this._broadcastSocketData(data, true);
            }
        };
        this.collab = collab;
    }
    open(socket, id, key) {
        this.socket = socket;
        this.roomId = id;
        this.roomKey = key;
        // Initialize socket listeners
        this.socket.on("init-room", () => {
            if (this.socket) {
                this.socket.emit("join-room", this.roomId);
                trackEvent("share", "room joined");
            }
        });
        this.socket.on("new-user", async (_socketId) => {
            this.broadcastScene(SCENE.INIT, this.collab.getSceneElementsIncludingDeleted(), 
            /* syncAll */ true);
        });
        this.socket.on("room-user-change", (clients) => {
            this.collab.setCollaborators(clients);
        });
    }
    close() {
        if (!this.socket) {
            return;
        }
        this.queueFileUpload.flush();
        this.socket.close();
        this.socket = null;
        this.roomId = null;
        this.roomKey = null;
        this.socketInitialized = false;
        this.broadcastedElementVersions = new Map();
    }
    isOpen() {
        return !!(this.socketInitialized &&
            this.socket &&
            this.roomId &&
            this.roomKey);
    }
    async _broadcastSocketData(data, volatile = false) {
        if (this.isOpen()) {
            const json = JSON.stringify(data);
            const encoded = new TextEncoder().encode(json);
            const encrypted = await encryptAESGEM(encoded, this.roomKey);
            this.socket?.emit(volatile ? BROADCAST.SERVER_VOLATILE : BROADCAST.SERVER, this.roomId, encrypted.data, encrypted.iv);
        }
    }
}
export default Portal;
