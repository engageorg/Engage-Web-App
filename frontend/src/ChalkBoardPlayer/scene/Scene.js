import { getNonDeletedElements, isNonDeletedElement } from "../element";
const isIdKey = (elementKey) => {
    if (typeof elementKey === "string") {
        return true;
    }
    return false;
};
class Scene {
    constructor() {
        // ---------------------------------------------------------------------------
        // static methods/props
        // ---------------------------------------------------------------------------
        // ---------------------------------------------------------------------------
        // instance methods/props
        // ---------------------------------------------------------------------------
        this.callbacks = new Set();
        this.nonDeletedElements = [];
        this.elements = [];
        this.elementsMap = new Map();
    }
    static mapElementToScene(elementKey, scene) {
        if (isIdKey(elementKey)) {
            this.sceneMapById.set(elementKey, scene);
        }
        else {
            this.sceneMapByElement.set(elementKey, scene);
        }
    }
    static getScene(elementKey) {
        if (isIdKey(elementKey)) {
            return this.sceneMapById.get(elementKey) || null;
        }
        return this.sceneMapByElement.get(elementKey) || null;
    }
    // TODO: getAllElementsIncludingDeleted
    getElementsIncludingDeleted() {
        return this.elements;
    }
    // TODO: getAllNonDeletedElements
    getElements() {
        return this.nonDeletedElements;
    }
    getElement(id) {
        return this.elementsMap.get(id) || null;
    }
    getNonDeletedElement(id) {
        const element = this.getElement(id);
        if (element && isNonDeletedElement(element)) {
            return element;
        }
        return null;
    }
    // TODO: Rename methods here, this is confusing
    getNonDeletedElements(ids) {
        const result = [];
        ids.forEach((id) => {
            const element = this.getNonDeletedElement(id);
            if (element != null) {
                result.push(element);
            }
        });
        return result;
    }
    replaceAllElements(nextElements) {
        this.elements = nextElements;
        this.elementsMap.clear();
        nextElements.forEach((element) => {
            this.elementsMap.set(element.id, element);
            Scene.mapElementToScene(element, this);
        });
        this.nonDeletedElements = getNonDeletedElements(this.elements);
        this.informMutation();
    }
    informMutation() {
        for (const callback of Array.from(this.callbacks)) {
            callback();
        }
    }
    addCallback(cb) {
        if (this.callbacks.has(cb)) {
            throw new Error();
        }
        this.callbacks.add(cb);
        return () => {
            if (!this.callbacks.has(cb)) {
                throw new Error();
            }
            this.callbacks.delete(cb);
        };
    }
    destroy() {
        Scene.sceneMapById.forEach((scene, elementKey) => {
            if (scene === this) {
                Scene.sceneMapById.delete(elementKey);
            }
        });
        // done not for memory leaks, but to guard against possible late fires
        // (I guess?)
        this.callbacks.clear();
    }
}
Scene.sceneMapByElement = new WeakMap();
Scene.sceneMapById = new Map();
export default Scene;
