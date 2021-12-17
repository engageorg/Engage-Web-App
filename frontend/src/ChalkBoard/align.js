import { newElementWith } from "./element/mutateElement";
import { getCommonBoundingBox } from "./element/bounds";
export const alignElements = (selectedElements, alignment) => {
    const groups = getMaximumGroups(selectedElements);
    const selectionBoundingBox = getCommonBoundingBox(selectedElements);
    return groups.flatMap((group) => {
        const translation = calculateTranslation(group, selectionBoundingBox, alignment);
        return group.map((element) => newElementWith(element, {
            x: element.x + translation.x,
            y: element.y + translation.y,
        }));
    });
};
export const getMaximumGroups = (elements) => {
    const groups = new Map();
    elements.forEach((element) => {
        const groupId = element.groupIds.length === 0
            ? element.id
            : element.groupIds[element.groupIds.length - 1];
        const currentGroupMembers = groups.get(groupId) || [];
        groups.set(groupId, [...currentGroupMembers, element]);
    });
    return Array.from(groups.values());
};
const calculateTranslation = (group, selectionBoundingBox, { axis, position }) => {
    const groupBoundingBox = getCommonBoundingBox(group);
    const [min, max] = axis === "x" ? ["minX", "maxX"] : ["minY", "maxY"];
    const noTranslation = { x: 0, y: 0 };
    if (position === "start") {
        return {
            ...noTranslation,
            [axis]: selectionBoundingBox[min] - groupBoundingBox[min],
        };
    }
    else if (position === "end") {
        return {
            ...noTranslation,
            [axis]: selectionBoundingBox[max] - groupBoundingBox[max],
        };
    } // else if (position === "center") {
    return {
        ...noTranslation,
        [axis]: (selectionBoundingBox[min] + selectionBoundingBox[max]) / 2 -
            (groupBoundingBox[min] + groupBoundingBox[max]) / 2,
    };
};
