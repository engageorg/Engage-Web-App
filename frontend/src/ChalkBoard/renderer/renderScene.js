import oc from "open-color";
import {
  getElementAbsoluteCoords,
  OMIT_SIDES_FOR_MULTIPLE_ELEMENTS,
  getTransformHandlesFromCoords,
  getTransformHandles,
  getElementBounds,
  getCommonBounds,
} from "../element";
import { roundRect } from "./roundRect";
import {
  getScrollBars,
  SCROLLBAR_COLOR,
  SCROLLBAR_WIDTH,
} from "../scene/scrollbars";
import { getSelectedElements } from "../scene/selection";
import { renderElement, renderElementToSvg } from "./renderElement";
import { getClientColors } from "../clients";
import { LinearElementEditor } from "../element/linearElementEditor";
import {
  isSelectedViaGroup,
  getSelectedGroupIds,
  getElementsInGroup,
} from "../groups";
import { maxBindingGap } from "../element/collision";
import { isBindingEnabled } from "../element/binding";
import { viewportCoordsToSceneCoords, supportsEmoji } from "../utils";
import { UserIdleState } from "../types";
import { THEME_FILTER } from "../constants";
const hasEmojiSupport = supportsEmoji();
const strokeRectWithRotation = (
  context,
  x,
  y,
  width,
  height,
  cx,
  cy,
  angle,
  fill = false
) => {
  context.save();
  context.translate(cx, cy);
  context.rotate(angle);
  if (fill) {
    context.fillRect(x - cx, y - cy, width, height);
  }
  context.strokeRect(x - cx, y - cy, width, height);
  context.restore();
};
const strokeDiamondWithRotation = (context, width, height, cx, cy, angle) => {
  context.save();
  context.translate(cx, cy);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width / 2, 0);
  context.lineTo(0, -height / 2);
  context.lineTo(-width / 2, 0);
  context.closePath();
  context.stroke();
  context.restore();
};
const strokeEllipseWithRotation = (context, width, height, cx, cy, angle) => {
  context.beginPath();
  context.ellipse(cx, cy, width / 2, height / 2, angle, 0, Math.PI * 2);
  context.stroke();
};
const fillCircle = (context, cx, cy, radius) => {
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
};
const strokeGrid = (context, gridSize, offsetX, offsetY, width, height) => {
  context.save();
  context.strokeStyle = "rgba(0,0,0,0.1)";
  context.beginPath();
  for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
    context.moveTo(x, offsetY - gridSize);
    context.lineTo(x, offsetY + height + gridSize * 2);
  }
  for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
    context.moveTo(offsetX - gridSize, y);
    context.lineTo(offsetX + width + gridSize * 2, y);
  }
  context.stroke();
  context.restore();
};
const renderLinearPointHandles = (context, appState, sceneState, element) => {
  context.save();
  context.translate(sceneState.scrollX, sceneState.scrollY);
  context.lineWidth = 1 / sceneState.zoom.value;
  LinearElementEditor.getPointsGlobalCoordinates(element).forEach(
    (point, idx) => {
      context.strokeStyle = "red";
      context.setLineDash([]);
      context.fillStyle =
        appState.editingLinearElement?.activePointIndex === idx
          ? "rgba(255, 127, 127, 0.9)"
          : "rgba(255, 255, 255, 0.9)";
      const { POINT_HANDLE_SIZE } = LinearElementEditor;
      fillCircle(
        context,
        point[0],
        point[1],
        POINT_HANDLE_SIZE / 2 / sceneState.zoom.value
      );
    }
  );
  context.restore();
};
export const renderScene = (
  elements,
  appState,
  selectionElement,
  scale,
  rc,
  canvas,
  sceneState,
  // extra options passed to the renderer
  {
    renderScrollbars = true,
    renderSelection = true,
    // Whether to employ render optimizations to improve performance.
    // Should not be turned on for export operations and similar, because it
    // doesn't guarantee pixel-perfect output.
    renderOptimizations = false,
    renderGrid = true,
    /** when exporting the behavior is slightly different (e.g. we can't use
    CSS filters) */
    isExport = false,
  } = {}
) => {
  if (canvas === null) {
    return { atLeastOneVisibleElement: false };
  }
  const context = canvas.getContext("2d");
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.save();
  context.scale(scale, scale);
  // When doing calculations based on canvas width we should used normalized one
  const normalizedCanvasWidth = canvas.width / scale;
  const normalizedCanvasHeight = canvas.height / scale;
//   if (isExport && sceneState.theme === "dark") {
//     context.filter = THEME_FILTER;
//   }
  sceneState.viewBackgroundColor = "transparent"
  // Paint background
  if (typeof sceneState.viewBackgroundColor === "string") {
    const hasTransparence =
      sceneState.viewBackgroundColor === "transparent" ||
      sceneState.viewBackgroundColor.length === 5 || // #RGBA
      sceneState.viewBackgroundColor.length === 9 || // #RRGGBBA
      /(hsla|rgba)\(/.test(sceneState.viewBackgroundColor);
    if (hasTransparence) {
      context.clearRect(0, 0, normalizedCanvasWidth, normalizedCanvasHeight);
    }
    context.save();
    context.fillStyle = sceneState.viewBackgroundColor;
    context.fillRect(0, 0, normalizedCanvasWidth, normalizedCanvasHeight);
    context.restore();
  } else {
    context.clearRect(0, 0, normalizedCanvasWidth, normalizedCanvasHeight);
  }
  // Apply zoom
  const zoomTranslationX = sceneState.zoom.translation.x;
  const zoomTranslationY = sceneState.zoom.translation.y;
  context.save();
  context.translate(zoomTranslationX, zoomTranslationY);
  context.scale(sceneState.zoom.value, sceneState.zoom.value);
  // Grid
  if (renderGrid && appState.gridSize) {
    strokeGrid(
      context,
      appState.gridSize,
      -Math.ceil(zoomTranslationX / sceneState.zoom.value / appState.gridSize) *
        appState.gridSize +
        (sceneState.scrollX % appState.gridSize),
      -Math.ceil(zoomTranslationY / sceneState.zoom.value / appState.gridSize) *
        appState.gridSize +
        (sceneState.scrollY % appState.gridSize),
      normalizedCanvasWidth / sceneState.zoom.value,
      normalizedCanvasHeight / sceneState.zoom.value
    );
  }
  // Paint visible elements
  const visibleElements = elements.filter((element) =>
    isVisibleElement(element, normalizedCanvasWidth, normalizedCanvasHeight, {
      zoom: sceneState.zoom,
      offsetLeft: appState.offsetLeft,
      offsetTop: appState.offsetTop,
      scrollX: sceneState.scrollX,
      scrollY: sceneState.scrollY,
    })
  );
  visibleElements.forEach((element) => {
    try {
      renderElement(element, rc, context, renderOptimizations, sceneState);
    } catch (error) {
      console.error(error);
    }
  });
  if (appState.editingLinearElement) {
    const element = LinearElementEditor.getElement(
      appState.editingLinearElement.elementId
    );
    if (element) {
      renderLinearPointHandles(context, appState, sceneState, element);
    }
  }
  // Paint selection element
  if (selectionElement) {
    try {
      renderElement(
        selectionElement,
        rc,
        context,
        renderOptimizations,
        sceneState
      );
    } catch (error) {
      console.error(error);
    }
  }
  if (isBindingEnabled(appState)) {
    appState.suggestedBindings
      .filter((binding) => binding != null)
      .forEach((suggestedBinding) => {
        renderBindingHighlight(context, sceneState, suggestedBinding);
      });
  }
  // Paint selected elements
  if (
    renderSelection &&
    !appState.multiElement &&
    !appState.editingLinearElement
  ) {
    const selections = elements.reduce((acc, element) => {
      const selectionColors = [];
      // local user
      if (
        appState.selectedElementIds[element.id] &&
        !isSelectedViaGroup(appState, element)
      ) {
        selectionColors.push(oc.black);
      }
      // remote users
      if (sceneState.remoteSelectedElementIds[element.id]) {
        selectionColors.push(
          ...sceneState.remoteSelectedElementIds[element.id].map((socketId) => {
            const { background } = getClientColors(socketId, appState);
            return background;
          })
        );
      }
      if (selectionColors.length) {
        const [elementX1, elementY1, elementX2, elementY2] =
          getElementAbsoluteCoords(element);
        acc.push({
          angle: element.angle,
          elementX1,
          elementY1,
          elementX2,
          elementY2,
          selectionColors,
        });
      }
      return acc;
    }, []);
    const addSelectionForGroupId = (groupId) => {
      const groupElements = getElementsInGroup(elements, groupId);
      const [elementX1, elementY1, elementX2, elementY2] =
        getCommonBounds(groupElements);
      selections.push({
        angle: 0,
        elementX1,
        elementX2,
        elementY1,
        elementY2,
        selectionColors: [oc.black],
      });
    };
    for (const groupId of getSelectedGroupIds(appState)) {
      // TODO: support multiplayer selected group IDs
      addSelectionForGroupId(groupId);
    }
    if (appState.editingGroupId) {
      addSelectionForGroupId(appState.editingGroupId);
    }
    selections.forEach((selection) =>
      renderSelectionBorder(context, sceneState, selection)
    );
    const locallySelectedElements = getSelectedElements(elements, appState);
    // Paint resize transformHandles
    context.save();
    context.translate(sceneState.scrollX, sceneState.scrollY);
    if (locallySelectedElements.length === 1) {
      context.fillStyle = oc.white;
      const transformHandles = getTransformHandles(
        locallySelectedElements[0],
        sceneState.zoom,
        "mouse"
      );
      if (!appState.viewModeEnabled) {
        renderTransformHandles(
          context,
          sceneState,
          transformHandles,
          locallySelectedElements[0].angle
        );
      }
    } else if (locallySelectedElements.length > 1 && !appState.isRotating) {
      const dashedLinePadding = 4 / sceneState.zoom.value;
      context.fillStyle = oc.white;
      const [x1, y1, x2, y2] = getCommonBounds(locallySelectedElements);
      const initialLineDash = context.getLineDash();
      context.setLineDash([2 / sceneState.zoom.value]);
      const lineWidth = context.lineWidth;
      context.lineWidth = 1 / sceneState.zoom.value;
      strokeRectWithRotation(
        context,
        x1 - dashedLinePadding,
        y1 - dashedLinePadding,
        x2 - x1 + dashedLinePadding * 2,
        y2 - y1 + dashedLinePadding * 2,
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        0
      );
      context.lineWidth = lineWidth;
      context.setLineDash(initialLineDash);
      const transformHandles = getTransformHandlesFromCoords(
        [x1, y1, x2, y2],
        0,
        sceneState.zoom,
        "mouse",
        OMIT_SIDES_FOR_MULTIPLE_ELEMENTS
      );
      renderTransformHandles(context, sceneState, transformHandles, 0);
    }
    context.restore();
  }
  // Reset zoom
  context.restore();
  // Paint remote pointers
  for (const clientId in sceneState.remotePointerViewportCoords) {
    let { x, y } = sceneState.remotePointerViewportCoords[clientId];
    x -= appState.offsetLeft;
    y -= appState.offsetTop;
    const width = 9;
    const height = 14;
    const isOutOfBounds =
      x < 0 ||
      x > normalizedCanvasWidth - width ||
      y < 0 ||
      y > normalizedCanvasHeight - height;
    x = Math.max(x, 0);
    x = Math.min(x, normalizedCanvasWidth - width);
    y = Math.max(y, 0);
    y = Math.min(y, normalizedCanvasHeight - height);
    const { background, stroke } = getClientColors(clientId, appState);
    context.save();
    context.strokeStyle = stroke;
    context.fillStyle = background;
    const userState = sceneState.remotePointerUserStates[clientId];
    if (isOutOfBounds || userState === UserIdleState.AWAY) {
      context.globalAlpha = 0.48;
    }
    if (
      sceneState.remotePointerButton &&
      sceneState.remotePointerButton[clientId] === "down"
    ) {
      context.beginPath();
      context.arc(x, y, 15, 0, 2 * Math.PI, false);
      context.lineWidth = 3;
      context.strokeStyle = "#ffffff88";
      context.stroke();
      context.closePath();
      context.beginPath();
      context.arc(x, y, 15, 0, 2 * Math.PI, false);
      context.lineWidth = 1;
      context.strokeStyle = stroke;
      context.stroke();
      context.closePath();
    }
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 1, y + 14);
    context.lineTo(x + 4, y + 9);
    context.lineTo(x + 9, y + 10);
    context.lineTo(x, y);
    context.fill();
    context.stroke();
    const username = sceneState.remotePointerUsernames[clientId];
    let idleState = "";
    if (userState === UserIdleState.AWAY) {
      idleState = hasEmojiSupport ? "??????" : ` (${UserIdleState.AWAY})`;
    } else if (userState === UserIdleState.IDLE) {
      idleState = hasEmojiSupport ? "????" : ` (${UserIdleState.IDLE})`;
    } else if (userState === UserIdleState.ACTIVE) {
      idleState = hasEmojiSupport ? "????" : "";
    }
    const usernameAndIdleState = `${
      username ? `${username} ` : ""
    }${idleState}`;
    if (!isOutOfBounds && usernameAndIdleState) {
      const offsetX = x + width;
      const offsetY = y + height;
      const paddingHorizontal = 4;
      const paddingVertical = 4;
      const measure = context.measureText(usernameAndIdleState);
      const measureHeight =
        measure.actualBoundingBoxDescent + measure.actualBoundingBoxAscent;
      // Border
      context.fillStyle = stroke;
      context.fillRect(
        offsetX - 1,
        offsetY - 1,
        measure.width + 2 * paddingHorizontal + 2,
        measureHeight + 2 * paddingVertical + 2
      );
      // Background
      context.fillStyle = background;
      context.fillRect(
        offsetX,
        offsetY,
        measure.width + 2 * paddingHorizontal,
        measureHeight + 2 * paddingVertical
      );
      context.fillStyle = oc.white;
      context.fillText(
        usernameAndIdleState,
        offsetX + paddingHorizontal,
        offsetY + paddingVertical + measure.actualBoundingBoxAscent
      );
    }
    context.restore();
    context.closePath();
  }
  // Paint scrollbars
  let scrollBars;
  if (renderScrollbars) {
    scrollBars = getScrollBars(
      elements,
      normalizedCanvasWidth,
      normalizedCanvasHeight,
      sceneState
    );
    context.save();
    context.fillStyle = SCROLLBAR_COLOR;
    context.strokeStyle = "rgba(255,255,255,0.8)";
    [scrollBars.horizontal, scrollBars.vertical].forEach((scrollBar) => {
      if (scrollBar) {
        roundRect(
          context,
          scrollBar.x,
          scrollBar.y,
          scrollBar.width,
          scrollBar.height,
          SCROLLBAR_WIDTH / 2
        );
      }
    });
    context.restore();
  }
  context.restore();
  return { atLeastOneVisibleElement: visibleElements.length > 0, scrollBars };
};
const renderTransformHandles = (
  context,
  sceneState,
  transformHandles,
  angle
) => {
  Object.keys(transformHandles).forEach((key) => {
    const transformHandle = transformHandles[key];
    if (transformHandle !== undefined) {
      context.save();
      context.lineWidth = 1 / sceneState.zoom.value;
      if (key === "rotation") {
        fillCircle(
          context,
          transformHandle[0] + transformHandle[2] / 2,
          transformHandle[1] + transformHandle[3] / 2,
          transformHandle[2] / 2
        );
      } else {
        strokeRectWithRotation(
          context,
          transformHandle[0],
          transformHandle[1],
          transformHandle[2],
          transformHandle[3],
          transformHandle[0] + transformHandle[2] / 2,
          transformHandle[1] + transformHandle[3] / 2,
          angle,
          true
        );
      }
      context.restore();
    }
  });
};
const renderSelectionBorder = (context, sceneState, elementProperties) => {
  const { angle, elementX1, elementY1, elementX2, elementY2, selectionColors } =
    elementProperties;
  const elementWidth = elementX2 - elementX1;
  const elementHeight = elementY2 - elementY1;
  const dashedLinePadding = 4 / sceneState.zoom.value;
  const dashWidth = 8 / sceneState.zoom.value;
  const spaceWidth = 4 / sceneState.zoom.value;
  context.save();
  context.translate(sceneState.scrollX, sceneState.scrollY);
  context.lineWidth = 1 / sceneState.zoom.value;
  const count = selectionColors.length;
  for (let index = 0; index < count; ++index) {
    context.strokeStyle = selectionColors[index];
    context.setLineDash([
      dashWidth,
      spaceWidth + (dashWidth + spaceWidth) * (count - 1),
    ]);
    context.lineDashOffset = (dashWidth + spaceWidth) * index;
    strokeRectWithRotation(
      context,
      elementX1 - dashedLinePadding,
      elementY1 - dashedLinePadding,
      elementWidth + dashedLinePadding * 2,
      elementHeight + dashedLinePadding * 2,
      elementX1 + elementWidth / 2,
      elementY1 + elementHeight / 2,
      angle
    );
  }
  context.restore();
};
const renderBindingHighlight = (context, sceneState, suggestedBinding) => {
  const renderHighlight = Array.isArray(suggestedBinding)
    ? renderBindingHighlightForSuggestedPointBinding
    : renderBindingHighlightForBindableElement;
  context.save();
  context.translate(sceneState.scrollX, sceneState.scrollY);
  renderHighlight(context, suggestedBinding);
  context.restore();
};
const renderBindingHighlightForBindableElement = (context, element) => {
  const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
  const width = x2 - x1;
  const height = y2 - y1;
  const threshold = maxBindingGap(element, width, height);
  // So that we don't overlap the element itself
  const strokeOffset = 4;
  context.strokeStyle = "rgba(0,0,0,.05)";
  context.lineWidth = threshold - strokeOffset;
  const padding = strokeOffset / 2 + threshold / 2;
  switch (element.type) {
    case "rectangle":
    case "text":
      strokeRectWithRotation(
        context,
        x1 - padding,
        y1 - padding,
        width + padding * 2,
        height + padding * 2,
        x1 + width / 2,
        y1 + height / 2,
        element.angle
      );
      break;
    case "diamond":
      const side = Math.hypot(width, height);
      const wPadding = (padding * side) / height;
      const hPadding = (padding * side) / width;
      strokeDiamondWithRotation(
        context,
        width + wPadding * 2,
        height + hPadding * 2,
        x1 + width / 2,
        y1 + height / 2,
        element.angle
      );
      break;
    case "ellipse":
      strokeEllipseWithRotation(
        context,
        width + padding * 2,
        height + padding * 2,
        x1 + width / 2,
        y1 + height / 2,
        element.angle
      );
      break;
  }
};
const renderBindingHighlightForSuggestedPointBinding = (
  context,
  suggestedBinding
) => {
  const [element, startOrEnd, bindableElement] = suggestedBinding;
  const threshold = maxBindingGap(
    bindableElement,
    bindableElement.width,
    bindableElement.height
  );
  context.strokeStyle = "rgba(0,0,0,0)";
  context.fillStyle = "rgba(0,0,0,.05)";
  const pointIndices =
    startOrEnd === "both" ? [0, -1] : startOrEnd === "start" ? [0] : [-1];
  pointIndices.forEach((index) => {
    const [x, y] = LinearElementEditor.getPointAtIndexGlobalCoordinates(
      element,
      index
    );
    fillCircle(context, x, y, threshold);
  });
};
const isVisibleElement = (
  element,
  canvasWidth,
  canvasHeight,
  viewTransformations
) => {
  const [x1, y1, x2, y2] = getElementBounds(element); // scene coordinates
  const topLeftSceneCoords = viewportCoordsToSceneCoords(
    {
      clientX: viewTransformations.offsetLeft,
      clientY: viewTransformations.offsetTop,
    },
    viewTransformations
  );
  const bottomRightSceneCoords = viewportCoordsToSceneCoords(
    {
      clientX: viewTransformations.offsetLeft + canvasWidth,
      clientY: viewTransformations.offsetTop + canvasHeight,
    },
    viewTransformations
  );
  return (
    topLeftSceneCoords.x <= x2 &&
    topLeftSceneCoords.y <= y2 &&
    bottomRightSceneCoords.x >= x1 &&
    bottomRightSceneCoords.y >= y1
  );
};
// This should be only called for exporting purposes
export const renderSceneToSvg = (
  elements,
  rsvg,
  svgRoot,
  files,
  { offsetX = 0, offsetY = 0 } = {}
) => {
  if (!svgRoot) {
    return;
  }
  // render elements
  elements.forEach((element) => {
    if (!element.isDeleted) {
      try {
        renderElementToSvg(
          element,
          rsvg,
          svgRoot,
          files,
          element.x + offsetX,
          element.y + offsetY
        );
      } catch (error) {
        console.error(error);
      }
    }
  });
};
