import { distance2d, rotate, isPathALoop, getGridPoint } from "../math";
import { getElementAbsoluteCoords } from ".";
import { getElementPointsCoords } from "./bounds";
import { mutateElement } from "./mutateElement";
import Scene from "../scene/Scene";
import { bindOrUnbindLinearElement, getHoveredElementForBinding, isBindingEnabled, } from "./binding";
import { tupleToCoors } from "../utils";
import { isBindingElement } from "./typeChecks";
export class LinearElementEditor {
    constructor(element, scene) {
        this.elementId = element.id;
        Scene.mapElementToScene(this.elementId, scene);
        LinearElementEditor.normalizePoints(element);
        this.activePointIndex = null;
        this.lastUncommittedPoint = null;
        this.isDragging = false;
        this.pointerOffset = { x: 0, y: 0 };
        this.startBindingElement = "keep";
        this.endBindingElement = "keep";
    }
    /**
     * @param id the `elementId` from the instance of this class (so that we can
     *  statically guarantee this method returns an ExcalidrawLinearElement)
     */
    static getElement(id) {
        const element = Scene.getScene(id)?.getNonDeletedElement(id);
        if (element) {
            return element;
        }
        return null;
    }
    /** @returns whether point was dragged */
    static handlePointDragging(appState, setState, scenePointerX, scenePointerY, maybeSuggestBinding) {
        if (!appState.editingLinearElement) {
            return false;
        }
        const { editingLinearElement } = appState;
        const { activePointIndex, elementId, isDragging } = editingLinearElement;
        const element = LinearElementEditor.getElement(elementId);
        if (!element) {
            return false;
        }
        if (activePointIndex != null && activePointIndex > -1) {
            if (isDragging === false) {
                setState({
                    editingLinearElement: {
                        ...editingLinearElement,
                        isDragging: true,
                    },
                });
            }
            const newPoint = LinearElementEditor.createPointAt(element, scenePointerX - editingLinearElement.pointerOffset.x, scenePointerY - editingLinearElement.pointerOffset.y, appState.gridSize);
            LinearElementEditor.movePoint(element, activePointIndex, newPoint);
            if (isBindingElement(element)) {
                maybeSuggestBinding(element, activePointIndex === 0 ? "start" : "end");
            }
            return true;
        }
        return false;
    }
    static handlePointerUp(event, editingLinearElement, appState) {
        const { elementId, activePointIndex, isDragging } = editingLinearElement;
        const element = LinearElementEditor.getElement(elementId);
        if (!element) {
            return editingLinearElement;
        }
        let binding = {};
        if (isDragging &&
            (activePointIndex === 0 || activePointIndex === element.points.length - 1)) {
            if (isPathALoop(element.points, appState.zoom.value)) {
                LinearElementEditor.movePoint(element, activePointIndex, activePointIndex === 0
                    ? element.points[element.points.length - 1]
                    : element.points[0]);
            }
            const bindingElement = isBindingEnabled(appState)
                ? getHoveredElementForBinding(tupleToCoors(LinearElementEditor.getPointAtIndexGlobalCoordinates(element, activePointIndex)), Scene.getScene(element))
                : null;
            binding = {
                [activePointIndex === 0 ? "startBindingElement" : "endBindingElement"]: bindingElement,
            };
        }
        return {
            ...editingLinearElement,
            ...binding,
            isDragging: false,
            pointerOffset: { x: 0, y: 0 },
        };
    }
    static handlePointerDown(event, appState, setState, history, scenePointer) {
        const ret = {
            didAddPoint: false,
            hitElement: null,
        };
        if (!appState.editingLinearElement) {
            return ret;
        }
        const { elementId } = appState.editingLinearElement;
        const element = LinearElementEditor.getElement(elementId);
        if (!element) {
            return ret;
        }
        if (event.altKey) {
            if (appState.editingLinearElement.lastUncommittedPoint == null) {
                mutateElement(element, {
                    points: [
                        ...element.points,
                        LinearElementEditor.createPointAt(element, scenePointer.x, scenePointer.y, appState.gridSize),
                    ],
                });
            }
            history.resumeRecording();
            setState({
                editingLinearElement: {
                    ...appState.editingLinearElement,
                    activePointIndex: element.points.length - 1,
                    lastUncommittedPoint: null,
                    endBindingElement: getHoveredElementForBinding(scenePointer, Scene.getScene(element)),
                },
            });
            ret.didAddPoint = true;
            return ret;
        }
        const clickedPointIndex = LinearElementEditor.getPointIndexUnderCursor(element, appState.zoom, scenePointer.x, scenePointer.y);
        // if we clicked on a point, set the element as hitElement otherwise
        // it would get deselected if the point is outside the hitbox area
        if (clickedPointIndex > -1) {
            ret.hitElement = element;
        }
        else {
            // You might be wandering why we are storing the binding elements on
            // LinearElementEditor and passing them in, insted of calculating them
            // from the end points of the `linearElement` - this is to allow disabling
            // binding (which needs to happen at the point the user finishes moving
            // the point).
            const { startBindingElement, endBindingElement } = appState.editingLinearElement;
            if (isBindingEnabled(appState) && isBindingElement(element)) {
                bindOrUnbindLinearElement(element, startBindingElement, endBindingElement);
            }
        }
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const targetPoint = clickedPointIndex > -1 &&
            rotate(element.x + element.points[clickedPointIndex][0], element.y + element.points[clickedPointIndex][1], cx, cy, element.angle);
        setState({
            editingLinearElement: {
                ...appState.editingLinearElement,
                activePointIndex: clickedPointIndex > -1 ? clickedPointIndex : null,
                pointerOffset: targetPoint
                    ? {
                        x: scenePointer.x - targetPoint[0],
                        y: scenePointer.y - targetPoint[1],
                    }
                    : { x: 0, y: 0 },
            },
        });
        return ret;
    }
    static handlePointerMove(event, scenePointerX, scenePointerY, editingLinearElement, gridSize) {
        const { elementId, lastUncommittedPoint } = editingLinearElement;
        const element = LinearElementEditor.getElement(elementId);
        if (!element) {
            return editingLinearElement;
        }
        const { points } = element;
        const lastPoint = points[points.length - 1];
        if (!event.altKey) {
            if (lastPoint === lastUncommittedPoint) {
                LinearElementEditor.movePoint(element, points.length - 1, "delete");
            }
            return { ...editingLinearElement, lastUncommittedPoint: null };
        }
        const newPoint = LinearElementEditor.createPointAt(element, scenePointerX - editingLinearElement.pointerOffset.x, scenePointerY - editingLinearElement.pointerOffset.y, gridSize);
        if (lastPoint === lastUncommittedPoint) {
            LinearElementEditor.movePoint(element, element.points.length - 1, newPoint);
        }
        else {
            LinearElementEditor.movePoint(element, "new", newPoint);
        }
        return {
            ...editingLinearElement,
            lastUncommittedPoint: element.points[element.points.length - 1],
        };
    }
    static getPointsGlobalCoordinates(element) {
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        return element.points.map((point) => {
            let { x, y } = element;
            [x, y] = rotate(x + point[0], y + point[1], cx, cy, element.angle);
            return [x, y];
        });
    }
    static getPointAtIndexGlobalCoordinates(element, indexMaybeFromEnd) {
        const index = indexMaybeFromEnd < 0
            ? element.points.length + indexMaybeFromEnd
            : indexMaybeFromEnd;
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const point = element.points[index];
        const { x, y } = element;
        return rotate(x + point[0], y + point[1], cx, cy, element.angle);
    }
    static pointFromAbsoluteCoords(element, absoluteCoords) {
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const [x, y] = rotate(absoluteCoords[0], absoluteCoords[1], cx, cy, -element.angle);
        return [x - element.x, y - element.y];
    }
    static getPointIndexUnderCursor(element, zoom, x, y) {
        const pointHandles = this.getPointsGlobalCoordinates(element);
        let idx = pointHandles.length;
        // loop from right to left because points on the right are rendered over
        // points on the left, thus should take precedence when clicking, if they
        // overlap
        while (--idx > -1) {
            const point = pointHandles[idx];
            if (distance2d(x, y, point[0], point[1]) * zoom.value <
                // +1px to account for outline stroke
                this.POINT_HANDLE_SIZE / 2 + 1) {
                return idx;
            }
        }
        return -1;
    }
    static createPointAt(element, scenePointerX, scenePointerY, gridSize) {
        const pointerOnGrid = getGridPoint(scenePointerX, scenePointerY, gridSize);
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const [rotatedX, rotatedY] = rotate(pointerOnGrid[0], pointerOnGrid[1], cx, cy, -element.angle);
        return [rotatedX - element.x, rotatedY - element.y];
    }
    /**
     * Normalizes line points so that the start point is at [0,0]. This is
     * expected in various parts of the codebase. Also returns new x/y to account
     * for the potential normalization.
     */
    static getNormalizedPoints(element) {
        const { points } = element;
        const offsetX = points[0][0];
        const offsetY = points[0][1];
        return {
            points: points.map((point, _idx) => {
                return [point[0] - offsetX, point[1] - offsetY];
            }),
            x: element.x + offsetX,
            y: element.y + offsetY,
        };
    }
    // element-mutating methods
    // ---------------------------------------------------------------------------
    static normalizePoints(element) {
        mutateElement(element, LinearElementEditor.getNormalizedPoints(element));
    }
    static movePointByOffset(element, pointIndex, offset) {
        const [x, y] = element.points[pointIndex];
        LinearElementEditor.movePoint(element, pointIndex, [
            x + offset.x,
            y + offset.y,
        ]);
    }
    static movePoint(element, pointIndex, targetPosition, otherUpdates) {
        const { points } = element;
        // in case we're moving start point, instead of modifying its position
        // which would break the invariant of it being at [0,0], we move
        // all the other points in the opposite direction by delta to
        // offset it. We do the same with actual element.x/y position, so
        // this hacks are completely transparent to the user.
        let offsetX = 0;
        let offsetY = 0;
        let nextPoints;
        if (targetPosition === "delete") {
            // remove point
            if (pointIndex === "new") {
                throw new Error("invalid args in movePoint");
            }
            nextPoints = points.slice();
            nextPoints.splice(pointIndex, 1);
            if (pointIndex === 0) {
                // if deleting first point, make the next to be [0,0] and recalculate
                // positions of the rest with respect to it
                offsetX = nextPoints[0][0];
                offsetY = nextPoints[0][1];
                nextPoints = nextPoints.map((point, idx) => {
                    if (idx === 0) {
                        return [0, 0];
                    }
                    return [point[0] - offsetX, point[1] - offsetY];
                });
            }
        }
        else if (pointIndex === "new") {
            nextPoints = [...points, targetPosition];
        }
        else {
            const deltaX = targetPosition[0] - points[pointIndex][0];
            const deltaY = targetPosition[1] - points[pointIndex][1];
            nextPoints = points.map((point, idx) => {
                if (idx === pointIndex) {
                    if (idx === 0) {
                        offsetX = deltaX;
                        offsetY = deltaY;
                        return point;
                    }
                    offsetX = 0;
                    offsetY = 0;
                    return [point[0] + deltaX, point[1] + deltaY];
                }
                return offsetX || offsetY
                    ? [point[0] - offsetX, point[1] - offsetY]
                    : point;
            });
        }
        const nextCoords = getElementPointsCoords(element, nextPoints, element.strokeSharpness || "round");
        const prevCoords = getElementPointsCoords(element, points, element.strokeSharpness || "round");
        const nextCenterX = (nextCoords[0] + nextCoords[2]) / 2;
        const nextCenterY = (nextCoords[1] + nextCoords[3]) / 2;
        const prevCenterX = (prevCoords[0] + prevCoords[2]) / 2;
        const prevCenterY = (prevCoords[1] + prevCoords[3]) / 2;
        const dX = prevCenterX - nextCenterX;
        const dY = prevCenterY - nextCenterY;
        const rotated = rotate(offsetX, offsetY, dX, dY, element.angle);
        mutateElement(element, {
            ...otherUpdates,
            points: nextPoints,
            x: element.x + rotated[0],
            y: element.y + rotated[1],
        });
    }
}
// ---------------------------------------------------------------------------
// static methods
// ---------------------------------------------------------------------------
LinearElementEditor.POINT_HANDLE_SIZE = 20;
