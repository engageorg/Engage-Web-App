import { CODES } from "../../keys";
import { fireEvent, GlobalTestState } from "../test-utils";
import { mutateElement } from "../../element/mutateElement";
import { API } from "./api";
const { h } = window;
let altKey = false;
let shiftKey = false;
let ctrlKey = false;
export class Keyboard {
}
Keyboard.withModifierKeys = (modifiers, cb) => {
    const prevAltKey = altKey;
    const prevShiftKey = shiftKey;
    const prevCtrlKey = ctrlKey;
    altKey = !!modifiers.alt;
    shiftKey = !!modifiers.shift;
    ctrlKey = !!modifiers.ctrl;
    try {
        cb();
    }
    finally {
        altKey = prevAltKey;
        shiftKey = prevShiftKey;
        ctrlKey = prevCtrlKey;
    }
};
Keyboard.keyDown = (key) => {
    fireEvent.keyDown(document, {
        key,
        ctrlKey,
        shiftKey,
        altKey,
    });
};
Keyboard.keyUp = (key) => {
    fireEvent.keyUp(document, {
        key,
        ctrlKey,
        shiftKey,
        altKey,
    });
};
Keyboard.keyPress = (key) => {
    Keyboard.keyDown(key);
    Keyboard.keyUp(key);
};
Keyboard.codeDown = (code) => {
    fireEvent.keyDown(document, {
        code,
        ctrlKey,
        shiftKey,
        altKey,
    });
};
Keyboard.codeUp = (code) => {
    fireEvent.keyUp(document, {
        code,
        ctrlKey,
        shiftKey,
        altKey,
    });
};
Keyboard.codePress = (code) => {
    Keyboard.codeDown(code);
    Keyboard.codeUp(code);
};
export class Pointer {
    constructor(pointerType, pointerId = 1) {
        this.pointerType = pointerType;
        this.pointerId = pointerId;
        this.clientX = 0;
        this.clientY = 0;
    }
    reset() {
        this.clientX = 0;
        this.clientY = 0;
    }
    getPosition() {
        return [this.clientX, this.clientY];
    }
    restorePosition(x = 0, y = 0) {
        this.clientX = x;
        this.clientY = y;
        fireEvent.pointerMove(GlobalTestState.canvas, this.getEvent());
    }
    getEvent() {
        return {
            clientX: this.clientX,
            clientY: this.clientY,
            pointerType: this.pointerType,
            pointerId: this.pointerId,
            altKey,
            shiftKey,
            ctrlKey,
        };
    }
    // incremental (moving by deltas)
    // ---------------------------------------------------------------------------
    move(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            this.clientX += dx;
            this.clientY += dy;
            fireEvent.pointerMove(GlobalTestState.canvas, this.getEvent());
        }
    }
    down(dx = 0, dy = 0) {
        this.move(dx, dy);
        fireEvent.pointerDown(GlobalTestState.canvas, this.getEvent());
    }
    up(dx = 0, dy = 0) {
        this.move(dx, dy);
        fireEvent.pointerUp(GlobalTestState.canvas, this.getEvent());
    }
    click(dx = 0, dy = 0) {
        this.down(dx, dy);
        this.up();
    }
    doubleClick(dx = 0, dy = 0) {
        this.move(dx, dy);
        fireEvent.doubleClick(GlobalTestState.canvas, this.getEvent());
    }
    // absolute coords
    // ---------------------------------------------------------------------------
    moveTo(x, y) {
        this.clientX = x;
        this.clientY = y;
        fireEvent.pointerMove(GlobalTestState.canvas, this.getEvent());
    }
    downAt(x = this.clientX, y = this.clientY) {
        this.clientX = x;
        this.clientY = y;
        fireEvent.pointerDown(GlobalTestState.canvas, this.getEvent());
    }
    upAt(x = this.clientX, y = this.clientY) {
        this.clientX = x;
        this.clientY = y;
        fireEvent.pointerUp(GlobalTestState.canvas, this.getEvent());
    }
    clickAt(x, y) {
        this.downAt(x, y);
        this.upAt();
    }
    doubleClickAt(x, y) {
        this.moveTo(x, y);
        fireEvent.doubleClick(GlobalTestState.canvas, this.getEvent());
    }
    // ---------------------------------------------------------------------------
    select(
    /** if multiple elements supplied, they're shift-selected */
    elements) {
        API.clearSelection();
        Keyboard.withModifierKeys({ shift: true }, () => {
            elements = Array.isArray(elements) ? elements : [elements];
            elements.forEach((element) => {
                this.reset();
                this.click(element.x, element.y);
            });
        });
        this.reset();
    }
    clickOn(element) {
        this.reset();
        this.click(element.x, element.y);
        this.reset();
    }
    doubleClickOn(element) {
        this.reset();
        this.doubleClick(element.x, element.y);
        this.reset();
    }
}
const mouse = new Pointer("mouse");
export class UI {
    /**
     * Creates an Excalidraw element, and returns a proxy that wraps it so that
     * accessing props will return the latest ones from the object existing in
     * the app's elements array. This is because across the app lifecycle we tend
     * to recreate element objects and the returned reference will become stale.
     *
     * If you need to get the actual element, not the proxy, call `get()` method
     * on the proxy object.
     */
    static createElement(type, { position = 0, x = position, y = position, size = 10, width = size, height = width, angle = 0, } = {}) {
        UI.clickTool(type);
        mouse.reset();
        mouse.down(x, y);
        mouse.reset();
        mouse.up(x + (width ?? height ?? size), y + (height ?? size));
        const origElement = h.elements[h.elements.length - 1];
        if (angle !== 0) {
            mutateElement(origElement, { angle });
        }
        return new Proxy({}, {
            get(target, prop) {
                const currentElement = h.elements.find((element) => element.id === origElement.id);
                if (prop === "get") {
                    if (currentElement.hasOwnProperty("get")) {
                        throw new Error("trying to get `get` test property, but ExcalidrawElement seems to define its own");
                    }
                    return () => currentElement;
                }
                return currentElement[prop];
            },
        });
    }
    static group(elements) {
        mouse.select(elements);
        Keyboard.withModifierKeys({ ctrl: true }, () => {
            Keyboard.codePress(CODES.G);
        });
    }
}
UI.clickTool = (toolName) => {
    fireEvent.click(GlobalTestState.renderResult.getByToolName(toolName));
};
