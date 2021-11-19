import { getElementAbsoluteCoords } from "../element";
export function setSelection(elements, selection) {
    const [selectionX1, selectionY1, selectionX2, selectionY2] = getElementAbsoluteCoords(selection);
    elements.forEach(element => {
        const [elementX1, elementY1, elementX2, elementY2] = getElementAbsoluteCoords(element);
        element.isSelected =
            element.type !== "selection" &&
                selectionX1 <= elementX1 &&
                selectionY1 <= elementY1 &&
                selectionX2 >= elementX2 &&
                selectionY2 >= elementY2;
    });
    return elements;
}
export function clearSelection(elements) {
    const newElements = [...elements];
    newElements.forEach(element => {
        element.isSelected = false;
    });
    return newElements;
}
export function deleteSelectedElements(elements) {
    return elements.filter(el => !el.isSelected);
}
export function getSelectedIndices(elements) {
    const selectedIndices = [];
    elements.forEach((element, index) => {
        if (element.isSelected) {
            selectedIndices.push(index);
        }
    });
    return selectedIndices;
}
export const someElementIsSelected = (elements) => elements.some(element => element.isSelected);
export function getSelectedAttribute(elements, getAttribute) {
    const attributes = Array.from(new Set(elements
        .filter(element => element.isSelected)
        .map(element => getAttribute(element))));
    return attributes.length === 1 ? attributes[0] : null;
}
