import { updateBoundElements } from "./binding";
import { getCommonBounds } from "./bounds";
import { mutateElement } from "./mutateElement";
import { getPerfectElementSize } from "./sizeHelpers";
import Scene from "../scene/Scene";
import { getBoundTextElementId } from "./textElement";
export const dragSelectedElements = (pointerDownState, selectedElements, pointerX, pointerY, lockDirection = false, distanceX = 0, distanceY = 0) => {
    const [x1, y1] = getCommonBounds(selectedElements);
    const offset = { x: pointerX - x1, y: pointerY - y1 };
    selectedElements.forEach((element) => {
        updateElementCoords(lockDirection, distanceX, distanceY, pointerDownState, element, offset);
        if (!element.groupIds.length) {
            const boundTextElementId = getBoundTextElementId(element);
            if (boundTextElementId) {
                const textElement = Scene.getScene(element).getElement(boundTextElementId);
                updateElementCoords(lockDirection, distanceX, distanceY, pointerDownState, textElement, offset);
            }
        }
        updateBoundElements(element, {
            simultaneouslyUpdated: selectedElements,
        });
    });
};
const updateElementCoords = (lockDirection, distanceX, distanceY, pointerDownState, element, offset) => {
    let x;
    let y;
    if (lockDirection) {
        const lockX = lockDirection && distanceX < distanceY;
        const lockY = lockDirection && distanceX > distanceY;
        const original = pointerDownState.originalElements.get(element.id);
        x = lockX && original ? original.x : element.x + offset.x;
        y = lockY && original ? original.y : element.y + offset.y;
    }
    else {
        x = element.x + offset.x;
        y = element.y + offset.y;
    }
    mutateElement(element, {
        x,
        y,
    });
};
export const getDragOffsetXY = (selectedElements, x, y) => {
    const [x1, y1] = getCommonBounds(selectedElements);
    return [x - x1, y - y1];
};
export const dragNewElement = (draggingElement, elementType, originX, originY, x, y, width, height, shouldMaintainAspectRatio, shouldResizeFromCenter, 
/** whether to keep given aspect ratio when `isResizeWithSidesSameLength` is
    true */
widthAspectRatio) => {
    if (shouldMaintainAspectRatio) {
        if (widthAspectRatio) {
            height = width / widthAspectRatio;
        }
        else {
            ({ width, height } = getPerfectElementSize(elementType, width, y < originY ? -height : height));
            if (height < 0) {
                height = -height;
            }
        }
    }
    let newX = x < originX ? originX - width : originX;
    let newY = y < originY ? originY - height : originY;
    if (shouldResizeFromCenter) {
        width += width;
        height += height;
        newX = originX - width / 2;
        newY = originY - height / 2;
    }
    if (width !== 0 && height !== 0) {
        mutateElement(draggingElement, {
            x: newX,
            y: newY,
            width,
            height,
        });
    }
};
