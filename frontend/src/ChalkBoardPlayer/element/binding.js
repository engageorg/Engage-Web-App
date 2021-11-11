import { getElementAtPosition } from "../scene";
import { isBindableElement, isBindingElement } from "./typeChecks";
import { bindingBorderTest, distanceToBindableElement, maxBindingGap, determineFocusDistance, intersectElementWithLine, determineFocusPoint, } from "./collision";
import { mutateElement } from "./mutateElement";
import Scene from "../scene/Scene";
import { LinearElementEditor } from "./linearElementEditor";
import { tupleToCoors } from "../utils";
import { KEYS } from "../keys";
export const shouldEnableBindingForPointerEvent = (event) => {
    return !event[KEYS.CTRL_OR_CMD];
};
export const isBindingEnabled = (appState) => {
    return appState.isBindingEnabled;
};
export const bindOrUnbindLinearElement = (linearElement, startBindingElement, endBindingElement) => {
    const boundToElementIds = new Set();
    const unboundFromElementIds = new Set();
    bindOrUnbindLinearElementEdge(linearElement, startBindingElement, endBindingElement, "start", boundToElementIds, unboundFromElementIds);
    bindOrUnbindLinearElementEdge(linearElement, endBindingElement, startBindingElement, "end", boundToElementIds, unboundFromElementIds);
    const onlyUnbound = Array.from(unboundFromElementIds).filter((id) => !boundToElementIds.has(id));
    Scene.getScene(linearElement)
        .getNonDeletedElements(onlyUnbound)
        .forEach((element) => {
        mutateElement(element, {
            boundElementIds: element.boundElementIds?.filter((id) => id !== linearElement.id),
        });
    });
};
const bindOrUnbindLinearElementEdge = (linearElement, bindableElement, otherEdgeBindableElement, startOrEnd, 
// Is mutated
boundToElementIds, 
// Is mutated
unboundFromElementIds) => {
    if (bindableElement !== "keep") {
        if (bindableElement != null) {
            // Don't bind if we're trying to bind or are already bound to the same
            // element on the other edge already ("start" edge takes precedence).
            if (otherEdgeBindableElement == null ||
                (otherEdgeBindableElement === "keep"
                    ? !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, bindableElement, startOrEnd)
                    : startOrEnd === "start" ||
                        otherEdgeBindableElement.id !== bindableElement.id)) {
                bindLinearElement(linearElement, bindableElement, startOrEnd);
                boundToElementIds.add(bindableElement.id);
            }
        }
        else {
            const unbound = unbindLinearElement(linearElement, startOrEnd);
            if (unbound != null) {
                unboundFromElementIds.add(unbound);
            }
        }
    }
};
export const bindOrUnbindSelectedElements = (elements) => {
    elements.forEach((element) => {
        if (isBindingElement(element)) {
            bindOrUnbindLinearElement(element, getElligibleElementForBindingElement(element, "start"), getElligibleElementForBindingElement(element, "end"));
        }
        else if (isBindableElement(element)) {
            maybeBindBindableElement(element);
        }
    });
};
const maybeBindBindableElement = (bindableElement) => {
    getElligibleElementsForBindableElementAndWhere(bindableElement).forEach(([linearElement, where]) => bindOrUnbindLinearElement(linearElement, where === "end" ? "keep" : bindableElement, where === "start" ? "keep" : bindableElement));
};
export const maybeBindLinearElement = (linearElement, appState, scene, pointerCoords) => {
    if (appState.startBoundElement != null) {
        bindLinearElement(linearElement, appState.startBoundElement, "start");
    }
    const hoveredElement = getHoveredElementForBinding(pointerCoords, scene);
    if (hoveredElement != null &&
        !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, hoveredElement, "end")) {
        bindLinearElement(linearElement, hoveredElement, "end");
    }
};
const bindLinearElement = (linearElement, hoveredElement, startOrEnd) => {
    mutateElement(linearElement, {
        [startOrEnd === "start" ? "startBinding" : "endBinding"]: {
            elementId: hoveredElement.id,
            ...calculateFocusAndGap(linearElement, hoveredElement, startOrEnd),
        },
    });
    mutateElement(hoveredElement, {
        boundElementIds: Array.from(new Set([...(hoveredElement.boundElementIds ?? []), linearElement.id])),
    });
};
// Don't bind both ends of a simple segment
const isLinearElementSimpleAndAlreadyBoundOnOppositeEdge = (linearElement, bindableElement, startOrEnd) => {
    const otherBinding = linearElement[startOrEnd === "start" ? "endBinding" : "startBinding"];
    return isLinearElementSimpleAndAlreadyBound(linearElement, otherBinding?.elementId, bindableElement);
};
export const isLinearElementSimpleAndAlreadyBound = (linearElement, alreadyBoundToId, bindableElement) => {
    return (alreadyBoundToId === bindableElement.id && linearElement.points.length < 3);
};
export const unbindLinearElements = (elements) => {
    elements.forEach((element) => {
        if (isBindingElement(element)) {
            bindOrUnbindLinearElement(element, null, null);
        }
    });
};
const unbindLinearElement = (linearElement, startOrEnd) => {
    const field = startOrEnd === "start" ? "startBinding" : "endBinding";
    const binding = linearElement[field];
    if (binding == null) {
        return null;
    }
    mutateElement(linearElement, { [field]: null });
    return binding.elementId;
};
export const getHoveredElementForBinding = (pointerCoords, scene) => {
    const hoveredElement = getElementAtPosition(scene.getElements(), (element) => isBindableElement(element) && bindingBorderTest(element, pointerCoords));
    return hoveredElement;
};
const calculateFocusAndGap = (linearElement, hoveredElement, startOrEnd) => {
    const direction = startOrEnd === "start" ? -1 : 1;
    const edgePointIndex = direction === -1 ? 0 : linearElement.points.length - 1;
    const adjacentPointIndex = edgePointIndex - direction;
    const edgePoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, edgePointIndex);
    const adjacentPoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, adjacentPointIndex);
    return {
        focus: determineFocusDistance(hoveredElement, adjacentPoint, edgePoint),
        gap: Math.max(1, distanceToBindableElement(hoveredElement, edgePoint)),
    };
};
// Supports translating, rotating and scaling `changedElement` with bound
// linear elements.
// Because scaling involves moving the focus points as well, it is
// done before the `changedElement` is updated, and the `newSize` is passed
// in explicitly.
export const updateBoundElements = (changedElement, options) => {
    const boundElementIds = changedElement.boundElementIds ?? [];
    if (boundElementIds.length === 0) {
        return;
    }
    const { newSize, simultaneouslyUpdated } = options ?? {};
    const simultaneouslyUpdatedElementIds = getSimultaneouslyUpdatedElementIds(simultaneouslyUpdated);
    Scene.getScene(changedElement).getNonDeletedElements(boundElementIds).forEach((linearElement) => {
        const bindableElement = changedElement;
        // In case the boundElementIds are stale
        if (!doesNeedUpdate(linearElement, bindableElement)) {
            return;
        }
        const startBinding = maybeCalculateNewGapWhenScaling(bindableElement, linearElement.startBinding, newSize);
        const endBinding = maybeCalculateNewGapWhenScaling(bindableElement, linearElement.endBinding, newSize);
        // `linearElement` is being moved/scaled already, just update the binding
        if (simultaneouslyUpdatedElementIds.has(linearElement.id)) {
            mutateElement(linearElement, { startBinding, endBinding });
            return;
        }
        updateBoundPoint(linearElement, "start", startBinding, changedElement);
        updateBoundPoint(linearElement, "end", endBinding, changedElement);
    });
};
const doesNeedUpdate = (boundElement, changedElement) => {
    return (boundElement.startBinding?.elementId === changedElement.id ||
        boundElement.endBinding?.elementId === changedElement.id);
};
const getSimultaneouslyUpdatedElementIds = (simultaneouslyUpdated) => {
    return new Set((simultaneouslyUpdated || []).map((element) => element.id));
};
const updateBoundPoint = (linearElement, startOrEnd, binding, changedElement) => {
    if (binding == null ||
        // We only need to update the other end if this is a 2 point line element
        (binding.elementId !== changedElement.id && linearElement.points.length > 2)) {
        return;
    }
    const bindingElement = Scene.getScene(linearElement).getElement(binding.elementId);
    if (bindingElement == null) {
        // We're not cleaning up after deleted elements atm., so handle this case
        return;
    }
    const direction = startOrEnd === "start" ? -1 : 1;
    const edgePointIndex = direction === -1 ? 0 : linearElement.points.length - 1;
    const adjacentPointIndex = edgePointIndex - direction;
    const adjacentPoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, adjacentPointIndex);
    const focusPointAbsolute = determineFocusPoint(bindingElement, binding.focus, adjacentPoint);
    let newEdgePoint;
    // The linear element was not originally pointing inside the bound shape,
    // we can point directly at the focus point
    if (binding.gap === 0) {
        newEdgePoint = focusPointAbsolute;
    }
    else {
        const intersections = intersectElementWithLine(bindingElement, adjacentPoint, focusPointAbsolute, binding.gap);
        if (intersections.length === 0) {
            // This should never happen, since focusPoint should always be
            // inside the element, but just in case, bail out
            newEdgePoint = focusPointAbsolute;
        }
        else {
            // Guaranteed to intersect because focusPoint is always inside the shape
            newEdgePoint = intersections[0];
        }
    }
    LinearElementEditor.movePoint(linearElement, edgePointIndex, LinearElementEditor.pointFromAbsoluteCoords(linearElement, newEdgePoint), { [startOrEnd === "start" ? "startBinding" : "endBinding"]: binding });
};
const maybeCalculateNewGapWhenScaling = (changedElement, currentBinding, newSize) => {
    if (currentBinding == null || newSize == null) {
        return currentBinding;
    }
    const { gap, focus, elementId } = currentBinding;
    const { width: newWidth, height: newHeight } = newSize;
    const { width, height } = changedElement;
    const newGap = Math.max(1, Math.min(maxBindingGap(changedElement, newWidth, newHeight), gap * (newWidth < newHeight ? newWidth / width : newHeight / height)));
    return { elementId, gap: newGap, focus };
};
export const getEligibleElementsForBinding = (elements) => {
    const includedElementIds = new Set(elements.map(({ id }) => id));
    return elements.flatMap((element) => isBindingElement(element)
        ? getElligibleElementsForBindingElement(element).filter((element) => !includedElementIds.has(element.id))
        : isBindableElement(element)
            ? getElligibleElementsForBindableElementAndWhere(element).filter((binding) => !includedElementIds.has(binding[0].id))
            : []);
};
const getElligibleElementsForBindingElement = (linearElement) => {
    return [
        getElligibleElementForBindingElement(linearElement, "start"),
        getElligibleElementForBindingElement(linearElement, "end"),
    ].filter((element) => element != null);
};
const getElligibleElementForBindingElement = (linearElement, startOrEnd) => {
    return getHoveredElementForBinding(getLinearElementEdgeCoors(linearElement, startOrEnd), Scene.getScene(linearElement));
};
const getLinearElementEdgeCoors = (linearElement, startOrEnd) => {
    const index = startOrEnd === "start" ? 0 : -1;
    return tupleToCoors(LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, index));
};
const getElligibleElementsForBindableElementAndWhere = (bindableElement) => {
    return Scene.getScene(bindableElement)
        .getElements()
        .map((element) => {
        if (!isBindingElement(element)) {
            return null;
        }
        const canBindStart = isLinearElementEligibleForNewBindingByBindable(element, "start", bindableElement);
        const canBindEnd = isLinearElementEligibleForNewBindingByBindable(element, "end", bindableElement);
        if (!canBindStart && !canBindEnd) {
            return null;
        }
        return [
            element,
            canBindStart && canBindEnd ? "both" : canBindStart ? "start" : "end",
            bindableElement,
        ];
    })
        .filter((maybeElement) => maybeElement != null);
};
const isLinearElementEligibleForNewBindingByBindable = (linearElement, startOrEnd, bindableElement) => {
    const existingBinding = linearElement[startOrEnd === "start" ? "startBinding" : "endBinding"];
    return (existingBinding == null &&
        !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, bindableElement, startOrEnd) &&
        bindingBorderTest(bindableElement, getLinearElementEdgeCoors(linearElement, startOrEnd)));
};
// We need to:
// 1: Update elements not selected to point to duplicated elements
// 2: Update duplicated elements to point to other duplicated elements
export const fixBindingsAfterDuplication = (sceneElements, oldElements, oldIdToDuplicatedId, 
// There are three copying mechanisms: Copy-paste, duplication and alt-drag.
// Only when alt-dragging the new "duplicates" act as the "old", while
// the "old" elements act as the "new copy" - essentially working reverse
// to the other two.
duplicatesServeAsOld) => {
    // First collect all the binding/bindable elements, so we only update
    // each once, regardless of whether they were duplicated or not.
    const allBoundElementIds = new Set();
    const allBindableElementIds = new Set();
    const shouldReverseRoles = duplicatesServeAsOld === "duplicatesServeAsOld";
    oldElements.forEach((oldElement) => {
        const { boundElementIds } = oldElement;
        if (boundElementIds != null && boundElementIds.length > 0) {
            boundElementIds.forEach((boundElementId) => {
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(boundElementId)) {
                    allBoundElementIds.add(boundElementId);
                }
            });
            allBindableElementIds.add(oldIdToDuplicatedId.get(oldElement.id));
        }
        if (isBindingElement(oldElement)) {
            if (oldElement.startBinding != null) {
                const { elementId } = oldElement.startBinding;
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(elementId)) {
                    allBindableElementIds.add(elementId);
                }
            }
            if (oldElement.endBinding != null) {
                const { elementId } = oldElement.endBinding;
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(elementId)) {
                    allBindableElementIds.add(elementId);
                }
            }
            if (oldElement.startBinding != null || oldElement.endBinding != null) {
                allBoundElementIds.add(oldIdToDuplicatedId.get(oldElement.id));
            }
        }
    });
    // Update the linear elements
    sceneElements.filter(({ id }) => allBoundElementIds.has(id)).forEach((element) => {
        const { startBinding, endBinding } = element;
        mutateElement(element, {
            startBinding: newBindingAfterDuplication(startBinding, oldIdToDuplicatedId),
            endBinding: newBindingAfterDuplication(endBinding, oldIdToDuplicatedId),
        });
    });
    // Update the bindable shapes
    sceneElements
        .filter(({ id }) => allBindableElementIds.has(id))
        .forEach((bindableElement) => {
        const { boundElementIds } = bindableElement;
        if (boundElementIds != null && boundElementIds.length > 0) {
            mutateElement(bindableElement, {
                boundElementIds: boundElementIds.map((boundElementId) => oldIdToDuplicatedId.get(boundElementId) ?? boundElementId),
            });
        }
    });
};
const newBindingAfterDuplication = (binding, oldIdToDuplicatedId) => {
    if (binding == null) {
        return null;
    }
    const { elementId, focus, gap } = binding;
    return {
        focus,
        gap,
        elementId: oldIdToDuplicatedId.get(elementId) ?? elementId,
    };
};
export const fixBindingsAfterDeletion = (sceneElements, deletedElements) => {
    const deletedElementIds = new Set(deletedElements.map((element) => element.id));
    // Non deleted and need an update
    const boundElementIds = new Set();
    deletedElements.forEach((deletedElement) => {
        if (isBindableElement(deletedElement)) {
            deletedElement.boundElementIds?.forEach((id) => {
                if (!deletedElementIds.has(id)) {
                    boundElementIds.add(id);
                }
            });
        }
    });
    sceneElements.filter(({ id }) => boundElementIds.has(id)).forEach((element) => {
        const { startBinding, endBinding } = element;
        mutateElement(element, {
            startBinding: newBindingAfterDeletion(startBinding, deletedElementIds),
            endBinding: newBindingAfterDeletion(endBinding, deletedElementIds),
        });
    });
};
const newBindingAfterDeletion = (binding, deletedElementIds) => {
    if (binding == null || deletedElementIds.has(binding.elementId)) {
        return null;
    }
    return binding;
};
