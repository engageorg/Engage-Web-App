import colors from "./colors";
import { CURSOR_TYPE, DEFAULT_VERSION, FONT_FAMILY, WINDOWS_EMOJI_FALLBACK_FONT, } from "./constants";
import { unstable_batchedUpdates } from "react-dom";
import { isDarwin } from "./keys";
let mockDateTime = null;
export const setDateTimeForTests = (dateTime) => {
    mockDateTime = dateTime;
};
export const getDateTime = () => {
    if (mockDateTime) {
        return mockDateTime;
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hr = `${date.getHours()}`.padStart(2, "0");
    const min = `${date.getMinutes()}`.padStart(2, "0");
    return `${year}-${month}-${day}-${hr}${min}`;
};
export const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export const isToolIcon = (target) => target instanceof HTMLElement && target.className.includes("ToolIcon");
export const isInputLike = (target) => (target instanceof HTMLElement && target.dataset.type === "wysiwyg") ||
    target instanceof HTMLBRElement || // newline in wysiwyg
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement;
export const isWritableElement = (target) => (target instanceof HTMLElement && target.dataset.type === "wysiwyg") ||
    target instanceof HTMLBRElement || // newline in wysiwyg
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement &&
        (target.type === "text" || target.type === "number"));
export const getFontFamilyString = ({ fontFamily, }) => {
    for (const [fontFamilyString, id] of Object.entries(FONT_FAMILY)) {
        if (id === fontFamily) {
            return `${fontFamilyString}, ${WINDOWS_EMOJI_FALLBACK_FONT}`;
        }
    }
    return WINDOWS_EMOJI_FALLBACK_FONT;
};
/** returns fontSize+fontFamily string for assignment to DOM elements */
export const getFontString = ({ fontSize, fontFamily, }) => {
    return `${fontSize}px ${getFontFamilyString({ fontFamily })}`;
};
// https://github.com/grassator/canvas-text-editor/blob/master/lib/FontMetrics.js
export const measureText = (text, font) => {
    const line = document.createElement("div");
    const body = document.body;
    line.style.position = "absolute";
    line.style.whiteSpace = "pre";
    line.style.font = font;
    body.appendChild(line);
    line.innerText = text
        .split("\n")
        // replace empty lines with single space because leading/trailing empty
        // lines would be stripped from computation
        .map((x) => x || " ")
        .join("\n");
    const width = line.offsetWidth;
    const height = line.offsetHeight;
    // Now creating 1px sized item that will be aligned to baseline
    // to calculate baseline shift
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.overflow = "hidden";
    span.style.width = "1px";
    span.style.height = "1px";
    line.appendChild(span);
    // Baseline is important for positioning text on canvas
    const baseline = span.offsetTop + span.offsetHeight;
    document.body.removeChild(line);
    return { width, height, baseline };
};
export const debounce = (fn, timeout) => {
    let handle = 0;
    let lastArgs = null;
    const ret = (...args) => {
        lastArgs = args;
        clearTimeout(handle);
        handle = window.setTimeout(() => {
            lastArgs = null;
            fn(...args);
        }, timeout);
    };
    ret.flush = () => {
        clearTimeout(handle);
        if (lastArgs) {
            const _lastArgs = lastArgs;
            lastArgs = null;
            fn(..._lastArgs);
        }
    };
    ret.cancel = () => {
        lastArgs = null;
        clearTimeout(handle);
    };
    return ret;
};
export const selectNode = (node) => {
    const selection = window.getSelection();
    if (selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};
export const removeSelection = () => {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
    }
};
export const distance = (x, y) => Math.abs(x - y);
export const resetCursor = (canvas) => {
    if (canvas) {
        canvas.style.cursor = "";
    }
};
export const setCursor = (canvas, cursor) => {
    if (canvas) {
        canvas.style.cursor = cursor;
    }
};
export const setCursorForShape = (canvas, shape) => {
    if (!canvas) {
        return;
    }
    if (shape === "selection") {
        resetCursor(canvas);
        // do nothing if image tool is selected which suggests there's
        // a image-preview set as the cursor
    }
    else if (shape !== "image") {
        canvas.style.cursor = CURSOR_TYPE.CROSSHAIR;
    }
};
export const isFullScreen = () => document.fullscreenElement?.nodeName === "HTML";
export const allowFullScreen = () => document.documentElement.requestFullscreen();
export const exitFullScreen = () => document.exitFullscreen();
export const getShortcutKey = (shortcut) => {
    shortcut = shortcut
        .replace(/\bAlt\b/i, "Alt")
        .replace(/\bShift\b/i, "Shift")
        .replace(/\b(Enter|Return)\b/i, "Enter")
        .replace(/\bDel\b/i, "Delete");
    if (isDarwin) {
        return shortcut
            .replace(/\bCtrlOrCmd\b/i, "Cmd")
            .replace(/\bAlt\b/i, "Option");
    }
    return shortcut.replace(/\bCtrlOrCmd\b/i, "Ctrl");
};
export const viewportCoordsToSceneCoords = ({ clientX, clientY }, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }) => {
    const invScale = 1 / zoom.value;
    const x = (clientX - zoom.translation.x - offsetLeft) * invScale - scrollX;
    const y = (clientY - zoom.translation.y - offsetTop) * invScale - scrollY;
    return { x, y };
};
export const sceneCoordsToViewportCoords = ({ sceneX, sceneY }, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }) => {
    const x = (sceneX + scrollX + offsetLeft) * zoom.value + zoom.translation.x;
    const y = (sceneY + scrollY + offsetTop) * zoom.value + zoom.translation.y;
    return { x, y };
};
export const getGlobalCSSVariable = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
const RS_LTR_CHARS = "A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF" +
    "\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF";
const RS_RTL_CHARS = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC";
const RE_RTL_CHECK = new RegExp(`^[^${RS_LTR_CHARS}]*[${RS_RTL_CHARS}]`);
/**
 * Checks whether first directional character is RTL. Meaning whether it starts
 *  with RTL characters, or indeterminate (numbers etc.) characters followed by
 *  RTL.
 * See https://github.com/excalidraw/excalidraw/pull/1722#discussion_r436340171
 */
export const isRTL = (text) => RE_RTL_CHECK.test(text);
export const tupleToCoors = (xyTuple) => {
    const [x, y] = xyTuple;
    return { x, y };
};
/** use as a rejectionHandler to mute filesystem Abort errors */
export const muteFSAbortError = (error) => {
    if (error?.name === "AbortError") {
        return;
    }
    throw error;
};
export const findIndex = (array, cb, fromIndex = 0) => {
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length, Math.max(fromIndex, 0));
    let index = fromIndex - 1;
    while (++index < array.length) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};
export const findLastIndex = (array, cb, fromIndex = array.length - 1) => {
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length - 1, Math.max(fromIndex, 0));
    let index = fromIndex + 1;
    while (--index > -1) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};
export const isTransparent = (color) => {
    const isRGBTransparent = color.length === 5 && color.substr(4, 1) === "0";
    const isRRGGBBTransparent = color.length === 9 && color.substr(7, 2) === "00";
    return (isRGBTransparent ||
        isRRGGBBTransparent ||
        color === colors.elementBackground[0]);
};
export const resolvablePromise = () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
};
/**
 * @param func handler taking at most single parameter (event).
 */
export const withBatchedUpdates = (func) => ((event) => {
    unstable_batchedUpdates(func, event);
});
//https://stackoverflow.com/a/9462382/8418
export const nFormatter = (num, digits) => {
    const si = [
        { value: 1, symbol: "b" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let index;
    for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].value) {
            break;
        }
    }
    return ((num / si[index].value).toFixed(digits).replace(rx, "$1") + si[index].symbol);
};
export const getVersion = () => {
    return (document.querySelector('meta[name="version"]')?.content ||
        DEFAULT_VERSION);
};
// Adapted from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/emoji.js
export const supportsEmoji = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return false;
    }
    const offset = 12;
    ctx.fillStyle = "#f00";
    ctx.textBaseline = "top";
    ctx.font = "32px Arial";
    // Modernizr used 🐨, but it is sort of supported on Windows 7.
    // Luckily 😀 isn't supported.
    ctx.fillText("😀", 0, 0);
    return ctx.getImageData(offset, offset, 1, 1).data[0] !== 0;
};
export const getNearestScrollableContainer = (element) => {
    let parent = element.parentElement;
    while (parent) {
        if (parent === document.body) {
            return document;
        }
        const { overflowY } = window.getComputedStyle(parent);
        const hasScrollableContent = parent.scrollHeight > parent.clientHeight;
        if (hasScrollableContent &&
            (overflowY === "auto" || overflowY === "scroll")) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return document;
};
export const focusNearestParent = (element) => {
    let parent = element.parentElement;
    while (parent) {
        if (parent.tabIndex > -1) {
            parent.focus();
            return;
        }
        parent = parent.parentElement;
    }
};
export const preventUnload = (event) => {
    event.preventDefault();
    // NOTE: modern browsers no longer allow showing a custom message here
    event.returnValue = "";
};