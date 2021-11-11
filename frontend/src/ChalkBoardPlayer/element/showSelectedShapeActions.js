import { getSelectedElements } from "../scene";
export const showSelectedShapeActions = (appState, elements) => Boolean(!appState.viewModeEnabled &&
    (appState.editingElement ||
        getSelectedElements(elements, appState).length ||
        appState.elementType !== "selection"));
