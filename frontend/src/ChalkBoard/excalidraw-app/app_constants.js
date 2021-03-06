// time constants (ms)
export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export const FILE_UPLOAD_TIMEOUT = 300;
export const LOAD_IMAGES_TIMEOUT = 500;
export const SYNC_FULL_SCENE_INTERVAL_MS = 20000;
export const FILE_UPLOAD_MAX_BYTES = 3 * 1024 * 1024; // 3 MiB
// 1 year (https://stackoverflow.com/a/25201898/927631)
export const FILE_CACHE_MAX_AGE_SEC = 31536000;
export const BROADCAST = {
    SERVER_VOLATILE: "server-volatile-broadcast",
    SERVER: "server-broadcast",
};
export var SCENE;
(function (SCENE) {
    SCENE["INIT"] = "SCENE_INIT";
    SCENE["UPDATE"] = "SCENE_UPDATE";
})(SCENE || (SCENE = {}));
export const FIREBASE_STORAGE_PREFIXES = {
    shareLinkFiles: `/files/shareLinks`,
    collabFiles: `/files/rooms`,
};
