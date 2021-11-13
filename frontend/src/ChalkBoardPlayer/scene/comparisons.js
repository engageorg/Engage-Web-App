import { getElementAbsoluteCoords } from "../element";
export const hasBackground = (type) => type === "rectangle" ||
    type === "ellipse" ||
    type === "diamond" ||
    type === "line";
export const hasStrokeColor = (type) => type !== "image";
export const hasStrokeWidth = (type) => type === "rectangle" ||
    type === "ellipse" ||
    type === "diamond" ||
    type === "freedraw" ||
    type === "arrow" ||
    type === "line";
export const hasStrokeStyle = (type) => type === "rectangle" ||
    type === "ellipse" ||
    type === "diamond" ||
    type === "arrow" ||
    type === "line";
export const canChangeSharpness = (type) => type === "rectangle" || type === "arrow" || type === "line";
export const hasText = (type) => type === "text";
export const canHaveArrowheads = (type) => type === "arrow";
export const getElementAtPosition = (elements, isAtPositionFn) => {
    let hitElement = null;
    // We need to to hit testing from front (end of the array) to back (beginning of the array)
    // because array is ordered from lower z-index to highest and we want element z-index
    // with higher z-index
    for (let index = elements.length - 1; index >= 0; --index) {
        const element = elements[index];
        if (element.isDeleted) {
            continue;
        }
        if (isAtPositionFn(element)) {
            hitElement = element;
            break;
        }
    }
    return hitElement;
};
export const getElementsAtPosition = (elements, isAtPositionFn) => {
    // The parameter elements comes ordered from lower z-index to higher.
    // We want to preserve that order on the returned array.
    return elements.filter((element) => !element.isDeleted && isAtPositionFn(element));
};
export const getElementContainingPosition = (elements, x, y) => {
    let hitElement = null;
    // We need to to hit testing from front (end of the array) to back (beginning of the array)
    for (let index = elements.length - 1; index >= 0; --index) {
        if (elements[index].isDeleted) {
            continue;
        }
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(elements[index]);
        if (x1 < x && x < x2 && y1 < y && y < y2) {
            hitElement = elements[index];
            break;
        }
    }
    return hitElement;
};
