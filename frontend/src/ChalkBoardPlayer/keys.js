export const isDarwin = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
export const isWindows = /^Win/.test(window.navigator.platform);
export const CODES = {
    EQUAL: "Equal",
    MINUS: "Minus",
    NUM_ADD: "NumpadAdd",
    NUM_SUBTRACT: "NumpadSubtract",
    NUM_ZERO: "Numpad0",
    BRACKET_RIGHT: "BracketRight",
    BRACKET_LEFT: "BracketLeft",
    ONE: "Digit1",
    TWO: "Digit2",
    NINE: "Digit9",
    QUOTE: "Quote",
    ZERO: "Digit0",
    SLASH: "Slash",
    C: "KeyC",
    D: "KeyD",
    G: "KeyG",
    F: "KeyF",
    H: "KeyH",
    V: "KeyV",
    X: "KeyX",
    Z: "KeyZ",
    R: "KeyR",
};
export const KEYS = {
    ARROW_DOWN: "ArrowDown",
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
    BACKSPACE: "Backspace",
    ALT: "Alt",
    CTRL_OR_CMD: isDarwin ? "metaKey" : "ctrlKey",
    DELETE: "Delete",
    ENTER: "Enter",
    ESCAPE: "Escape",
    QUESTION_MARK: "?",
    SPACE: " ",
    TAB: "Tab",
    A: "a",
    D: "d",
    E: "e",
    G: "g",
    I: "i",
    L: "l",
    O: "o",
    P: "p",
    Q: "q",
    R: "r",
    S: "s",
    T: "t",
    V: "v",
    X: "x",
    Y: "y",
    Z: "z",
};
export const isArrowKey = (key) => key === KEYS.ARROW_LEFT ||
    key === KEYS.ARROW_RIGHT ||
    key === KEYS.ARROW_DOWN ||
    key === KEYS.ARROW_UP;
export const shouldResizeFromCenter = (event) => event.altKey;
export const shouldMaintainAspectRatio = (event) => event.shiftKey;
export const shouldRotateWithDiscreteAngle = (event) => event.shiftKey;
