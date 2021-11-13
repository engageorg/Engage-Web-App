import { getSelectedElements } from "./scene";
export const selectGroup = (groupId, appState, elements) => {
    const elementsInGroup = elements.filter((element) => element.groupIds.includes(groupId));
    if (elementsInGroup.length < 2) {
        if (appState.selectedGroupIds[groupId] ||
            appState.editingGroupId === groupId) {
            return {
                ...appState,
                selectedGroupIds: { ...appState.selectedGroupIds, [groupId]: false },
                editingGroupId: null,
            };
        }
        return appState;
    }
    return {
        ...appState,
        selectedGroupIds: { ...appState.selectedGroupIds, [groupId]: true },
        selectedElementIds: {
            ...appState.selectedElementIds,
            ...Object.fromEntries(elementsInGroup.map((element) => [element.id, true])),
        },
    };
};
/**
 * If the element's group is selected, don't render an individual
 * selection border around it.
 */
export const isSelectedViaGroup = (appState, element) => getSelectedGroupForElement(appState, element) != null;
export const getSelectedGroupForElement = (appState, element) => element.groupIds
    .filter((groupId) => groupId !== appState.editingGroupId)
    .find((groupId) => appState.selectedGroupIds[groupId]);
export const getSelectedGroupIds = (appState) => Object.entries(appState.selectedGroupIds)
    .filter(([groupId, isSelected]) => isSelected)
    .map(([groupId, isSelected]) => groupId);
/**
 * When you select an element, you often want to actually select the whole group it's in, unless
 * you're currently editing that group.
 */
export const selectGroupsForSelectedElements = (appState, elements) => {
    let nextAppState = { ...appState, selectedGroupIds: {} };
    const selectedElements = getSelectedElements(elements, appState);
    if (!selectedElements.length) {
        return { ...nextAppState, editingGroupId: null };
    }
    for (const selectedElement of selectedElements) {
        let groupIds = selectedElement.groupIds;
        if (appState.editingGroupId) {
            // handle the case where a group is nested within a group
            const indexOfEditingGroup = groupIds.indexOf(appState.editingGroupId);
            if (indexOfEditingGroup > -1) {
                groupIds = groupIds.slice(0, indexOfEditingGroup);
            }
        }
        if (groupIds.length > 0) {
            const groupId = groupIds[groupIds.length - 1];
            nextAppState = selectGroup(groupId, nextAppState, elements);
        }
    }
    return nextAppState;
};
export const editGroupForSelectedElement = (appState, element) => {
    return {
        ...appState,
        editingGroupId: element.groupIds.length ? element.groupIds[0] : null,
        selectedGroupIds: {},
        selectedElementIds: {
            [element.id]: true,
        },
    };
};
export const isElementInGroup = (element, groupId) => element.groupIds.includes(groupId);
export const getElementsInGroup = (elements, groupId) => elements.filter((element) => isElementInGroup(element, groupId));
export const getSelectedGroupIdForElement = (element, selectedGroupIds) => element.groupIds.find((groupId) => selectedGroupIds[groupId]);
export const getNewGroupIdsForDuplication = (groupIds, editingGroupId, mapper) => {
    const copy = [...groupIds];
    const positionOfEditingGroupId = editingGroupId
        ? groupIds.indexOf(editingGroupId)
        : -1;
    const endIndex = positionOfEditingGroupId > -1 ? positionOfEditingGroupId : groupIds.length;
    for (let index = 0; index < endIndex; index++) {
        copy[index] = mapper(copy[index]);
    }
    return copy;
};
export const addToGroup = (prevGroupIds, newGroupId, editingGroupId) => {
    // insert before the editingGroupId, or push to the end.
    const groupIds = [...prevGroupIds];
    const positionOfEditingGroupId = editingGroupId
        ? groupIds.indexOf(editingGroupId)
        : -1;
    const positionToInsert = positionOfEditingGroupId > -1 ? positionOfEditingGroupId : groupIds.length;
    groupIds.splice(positionToInsert, 0, newGroupId);
    return groupIds;
};
export const removeFromSelectedGroups = (groupIds, selectedGroupIds) => groupIds.filter((groupId) => !selectedGroupIds[groupId]);
