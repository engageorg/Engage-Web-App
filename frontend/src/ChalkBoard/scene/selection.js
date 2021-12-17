import { getElementAbsoluteCoords, getElementBounds } from "../element";
import { isBoundToContainer } from "../element/typeChecks";
export const getElementsWithinSelection = (elements, selection) => {
    const [selectionX1, selectionY1, selectionX2, selectionY2] = getElementAbsoluteCoords(selection);
    return elements.filter((element) => {
        const [elementX1, elementY1, elementX2, elementY2] = getElementBounds(element);
        return (element.type !== "selection" &&
            !isBoundToContainer(element) &&
            selectionX1 <= elementX1 &&
            selectionY1 <= elementY1 &&
            selectionX2 >= elementX2 &&
            selectionY2 >= elementY2);
    });
};
export const isSomeElementSelected = (elements, appState) => elements.some((element) => appState.selectedElementIds[element.id]);
/**
 * Returns common attribute (picked by `getAttribute` callback) of selected
 *  elements. If elements don't share the same value, returns `null`.
 */
export const getCommonAttributeOfSelectedElements = (elements, appState, getAttribute) => {
    const attributes = Array.from(new Set(getSelectedElements(elements, appState).map((element) => getAttribute(element))));
    return attributes.length === 1 ? attributes[0] : null;
};
export const getSelectedElements = (elements, appState, includeBoundTextElement = false) => elements.filter((element) => {
    if (appState.selectedElementIds[element.id]) {
        return element;
    }
    if (includeBoundTextElement &&
        isBoundToContainer(element) &&
        appState.selectedElementIds[element?.containerId]) {
        return element;
    }
    return null;
});
export const getTargetElements = (elements, appState) => appState.editingElement
    ? [appState.editingElement]
    : getSelectedElements(elements, appState);
