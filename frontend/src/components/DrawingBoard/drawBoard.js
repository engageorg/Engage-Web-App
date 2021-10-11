import React, { useEffect, useState, useRef } from "react";
import rough from "roughjs/bundled/rough.esm";
import useForceUpdate from "use-force-update";
import { moveOneLeft, moveAllLeft, moveOneRight, moveAllRight } from "./zindex";
import "./style.css";

const LOCAL_STORAGE_KEY = "chalkboard";
const LOCAL_STORAGE_KEY_STATE = "chalkboard-state";
const elements = Array.of();
let skipHistory = false;
const stateHistory = [];

function generateHistoryCurrentEntry() {
  return JSON.stringify(
    elements.map((element) => ({ ...element, isSelected: false }))
  );
}

function pushHistoryEntry(newEntry) {
  if (
    stateHistory.length > 0 &&
    stateHistory[stateHistory.length - 1] === newEntry
  ) {
    // If the last entry is the same as this one, ignore it
    return;
  }
  stateHistory.push(newEntry);
}

function restoreHistoryEntry(entry) {
  const newElements = JSON.parse(entry);
  elements.splice(0, elements.length);
  newElements.forEach((newElement) => {
    generateDraw(newElement);
    elements.push(newElement);
  });
  // When restoring, we shouldn't add an history entry otherwise we'll be stuck with it and can't go back
  skipHistory = true;
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
const LCG = (seed) => () =>
  ((2 ** 31 - 1) & (seed = Math.imul(48271, seed))) / 2 ** 31;
function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}
// Unfortunately, roughjs doesn't support a seed attribute (https://github.com/pshihn/rough/issues/27).
// We can achieve the same result by overriding the Math.random function with a
// pseudo random generator that supports a random seed and swapping it back after.
function withCustomMathRandom(seed, cb) {
  const random = Math.random;
  Math.random = LCG(seed);
  const result = cb();
  Math.random = random;
  return result;
}
// https://stackoverflow.com/a/6853926/232122
function distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSquare = C * C + D * D;
  let param = -1;
  if (lenSquare !== 0) {
    // in case of 0 length line
    param = dot / lenSquare;
  }
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = x - xx;
  const dy = y - yy;
  return Math.hypot(dx, dy);
}

function hitTest(element, x, y) {
  // For shapes that are composed of lines, we only enable point-selection when the distance
  // of the click is less than x pixels of any of the lines that the shape is composed of
  const lineThreshold = 10;
  if (element.type === "ellipse") {
    // https://stackoverflow.com/a/46007540/232122
    const px = Math.abs(x - element.x - element.width / 2);
    const py = Math.abs(y - element.y - element.height / 2);
    let tx = 0.707;
    let ty = 0.707;
    const a = element.width / 2;
    const b = element.height / 2;
    [0, 1, 2, 3].forEach((x) => {
      const xx = a * tx;
      const yy = b * ty;
      const ex = ((a * a - b * b) * tx ** 3) / a;
      const ey = ((b * b - a * a) * ty ** 3) / b;
      const rx = xx - ex;
      const ry = yy - ey;
      const qx = px - ex;
      const qy = py - ey;
      const r = Math.hypot(ry, rx);
      const q = Math.hypot(qy, qx);
      tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
      ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
      const t = Math.hypot(ty, tx);
      tx /= t;
      ty /= t;
    });
    return Math.hypot(a * tx - px, b * ty - py) < lineThreshold;
  } else if (element.type === "rectangle") {
    const x1 = getElementAbsoluteX1(element);
    const x2 = getElementAbsoluteX2(element);
    const y1 = getElementAbsoluteY1(element);
    const y2 = getElementAbsoluteY2(element);
    // (x1, y1) --A-- (x2, y1)
    //    |D             |B
    // (x1, y2) --C-- (x2, y2)
    return (
      distanceBetweenPointAndSegment(x, y, x1, y1, x2, y1) < lineThreshold || // A
      distanceBetweenPointAndSegment(x, y, x2, y1, x2, y2) < lineThreshold || // B
      distanceBetweenPointAndSegment(x, y, x2, y2, x1, y2) < lineThreshold || // C
      distanceBetweenPointAndSegment(x, y, x1, y2, x1, y1) < lineThreshold // D
    );
  } else if (element.type === "arrow") {
    let [x1, y1, x2, y2, x3, y3, x4, y4] = getArrowPoints(element);
    // The computation is done at the origin, we need to add a translation
    x -= element.x;
    y -= element.y;
    return (
      //    \
      distanceBetweenPointAndSegment(x, y, x3, y3, x2, y2) < lineThreshold ||
      // -----
      distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) < lineThreshold ||
      //    /
      distanceBetweenPointAndSegment(x, y, x4, y4, x2, y2) < lineThreshold
    );
  } else if (element.type === "text") {
    const x1 = getElementAbsoluteX1(element);
    const x2 = getElementAbsoluteX2(element);
    const y1 = getElementAbsoluteY1(element);
    const y2 = getElementAbsoluteY2(element);
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  } else if (element.type === "selection") {
    console.warn("This should not happen, we need to investigate why it does.");
    return false;
  } else {
    throw new Error("Unimplemented type " + element.type);
  }
}

function resizeTest(element, x, y, sceneState) {
  if (element.type === "text" || element.type === "arrow") return false;
  const handlers = handlerRectangles(element, sceneState);
  const filter = Object.keys(handlers).filter((key) => {
    const handler = handlers[key];
    return (
      x + sceneState.scrollX >= handler[0] &&
      x + sceneState.scrollX <= handler[0] + handler[2] &&
      y + sceneState.scrollY >= handler[1] &&
      y + sceneState.scrollY <= handler[1] + handler[3]
    );
  });
  if (filter.length > 0) {
    return filter[0];
  }
  return false;
}

function newElement(
  type,
  x,
  y,
  strokeColor,
  backgroundColor,
  width = 0,
  height = 0
) {
  
  const element = {
    type: type,
    x: x,
    y: y,
    width: width,
    height: height,
    isSelected: false,
    strokeColor: strokeColor,
    backgroundColor: backgroundColor,
    seed: randomSeed(),
    draw(rc, context, sceneState) {},
  };

  return element;
}

const SCROLLBAR_WIDTH = 6;
const SCROLLBAR_MARGIN = 4;
const SCROLLBAR_COLOR = "rgba(0,0,0,0.3)";
const CANVAS_WINDOW_OFFSET_LEFT = 250;
const CANVAS_WINDOW_OFFSET_TOP = 0;

function getScrollbars(canvasWidth, canvasHeight, scrollX, scrollY) {
  // horizontal scrollbar
  const sceneWidth = canvasWidth + Math.abs(scrollX);
  const scrollBarWidth = (canvasWidth * canvasWidth) / sceneWidth;
  const scrollBarX = scrollX > 0 ? 0 : canvasWidth - scrollBarWidth;
  const horizontalScrollBar = {
    x: scrollBarX + SCROLLBAR_MARGIN,
    y: canvasHeight - SCROLLBAR_WIDTH - SCROLLBAR_MARGIN,
    width: scrollBarWidth - SCROLLBAR_MARGIN * 2,
    height: SCROLLBAR_WIDTH,
  };
  // vertical scrollbar
  const sceneHeight = canvasHeight + Math.abs(scrollY);
  const scrollBarHeight = (canvasHeight * canvasHeight) / sceneHeight;
  const scrollBarY = scrollY > 0 ? 0 : canvasHeight - scrollBarHeight;
  const verticalScrollBar = {
    x: canvasWidth - SCROLLBAR_WIDTH - SCROLLBAR_MARGIN,
    y: scrollBarY + SCROLLBAR_MARGIN,
    width: SCROLLBAR_WIDTH,
    height: scrollBarHeight - SCROLLBAR_WIDTH * 2,
  };
  return {
    horizontal: horizontalScrollBar,
    vertical: verticalScrollBar,
  };
}

function isOverScrollBars(x, y, canvasWidth, canvasHeight, scrollX, scrollY) {
  const scrollBars = getScrollbars(canvasWidth, canvasHeight, scrollX, scrollY);
  const [isOverHorizontalScrollBar, isOverVerticalScrollBar] = [
    scrollBars.horizontal,
    scrollBars.vertical,
  ].map(
    (scrollBar) =>
      scrollBar.x <= x &&
      x <= scrollBar.x + scrollBar.width &&
      scrollBar.y <= y &&
      y <= scrollBar.y + scrollBar.height
  );
  return {
    isOverHorizontalScrollBar,
    isOverVerticalScrollBar,
  };
}

function handlerRectangles(element, sceneState) {
  const elementX1 = element.x;
  const elementX2 = element.x + element.width;
  const elementY1 = element.y;
  const elementY2 = element.y + element.height;
  const margin = 4;
  const minimumSize = 40;
  const handlers = {};
  const marginX = element.width < 0 ? 8 : -8;
  const marginY = element.height < 0 ? 8 : -8;
  if (Math.abs(elementX2 - elementX1) > minimumSize) {
    handlers["n"] = [
      elementX1 + (elementX2 - elementX1) / 2 + sceneState.scrollX - 4,
      elementY1 - margin + sceneState.scrollY + marginY,
      8,
      8,
    ];
    handlers["s"] = [
      elementX1 + (elementX2 - elementX1) / 2 + sceneState.scrollX - 4,
      elementY2 - margin + sceneState.scrollY - marginY,
      8,
      8,
    ];
  }
  if (Math.abs(elementY2 - elementY1) > minimumSize) {
    handlers["w"] = [
      elementX1 - margin + sceneState.scrollX + marginX,
      elementY1 + (elementY2 - elementY1) / 2 + sceneState.scrollY - 4,
      8,
      8,
    ];
    handlers["e"] = [
      elementX2 - margin + sceneState.scrollX - marginX,
      elementY1 + (elementY2 - elementY1) / 2 + sceneState.scrollY - 4,
      8,
      8,
    ];
  }
  handlers["nw"] = [
    elementX1 - margin + sceneState.scrollX + marginX,
    elementY1 - margin + sceneState.scrollY + marginY,
    8,
    8,
  ]; // nw
  handlers["ne"] = [
    elementX2 - margin + sceneState.scrollX - marginX,
    elementY1 - margin + sceneState.scrollY + marginY,
    8,
    8,
  ]; // ne
  handlers["sw"] = [
    elementX1 - margin + sceneState.scrollX + marginX,
    elementY2 - margin + sceneState.scrollY - marginY,
    8,
    8,
  ]; // sw
  handlers["se"] = [
    elementX2 - margin + sceneState.scrollX - marginX,
    elementY2 - margin + sceneState.scrollY - marginY,
    8,
    8,
  ]; // se
  return handlers;
}

function renderScene(
  rc,
  canvas,
  sceneState,
  // extra options, currently passed by export helper
  { offsetX, offsetY, renderScrollbars = true, renderSelection = true } = {}
) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const fillStyle = context.fillStyle;
  if (typeof sceneState.viewBackgroundColor === "string") {
    context.fillStyle = sceneState.viewBackgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  context.fillStyle = fillStyle;
  const selectedIndices = getSelectedIndices();
  sceneState = {
    ...sceneState,
    scrollX: typeof offsetX === "number" ? offsetX : sceneState.scrollX,
    scrollY: typeof offsetY === "number" ? offsetY : sceneState.scrollY,
  };
  elements.forEach((element) => {
    element.draw(rc, context, sceneState);
    if (renderSelection && element.isSelected) {
      const margin = 4;
      const elementX1 = getElementAbsoluteX1(element);
      const elementX2 = getElementAbsoluteX2(element);
      const elementY1 = getElementAbsoluteY1(element);
      const elementY2 = getElementAbsoluteY2(element);
      const lineDash = context.getLineDash();
      context.setLineDash([8, 4]);
      context.strokeRect(
        elementX1 - margin + sceneState.scrollX,
        elementY1 - margin + sceneState.scrollY,
        elementX2 - elementX1 + margin * 2,
        elementY2 - elementY1 + margin * 2
      );
      context.setLineDash(lineDash);
      if (
        element.type !== "text" &&
        element.type !== "arrow" &&
        selectedIndices.length === 1
      ) {
        const handlers = handlerRectangles(element, sceneState);
        Object.values(handlers).forEach((handler) => {
          context.strokeRect(handler[0], handler[1], handler[2], handler[3]);
        });
      }
    }
  });
  if (renderScrollbars) {
    const scrollBars = getScrollbars(
      context.canvas.width / window.devicePixelRatio,
      context.canvas.height / window.devicePixelRatio,
      sceneState.scrollX,
      sceneState.scrollY
    );
    context.fillStyle = SCROLLBAR_COLOR;
    context.fillRect(
      scrollBars.horizontal.x,
      scrollBars.horizontal.y,
      scrollBars.horizontal.width,
      scrollBars.horizontal.height
    );
    context.fillRect(
      scrollBars.vertical.x,
      scrollBars.vertical.y,
      scrollBars.vertical.width,
      scrollBars.vertical.height
    );
    context.fillStyle = fillStyle;
  }
}

function saveAsJSON() {
  const serialized = JSON.stringify({
    version: 1,
    source: window.location.origin,
    elements,
  });
  saveFile(
    "chalkboard.json",
    "data:text/plain;charset=utf-8," + encodeURIComponent(serialized)
  );
}

function loadFromJSON() {
  const input = document.createElement("input");
  const reader = new FileReader();
  input.type = "file";
  input.accept = ".json";
  input.onchange = () => {
    if (!input.files.length) {
      alert("A file was not selected.");
      return;
    }
    reader.readAsText(input.files[0], "utf8");
  };
  input.click();
  return new Promise((resolve) => {
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        const data = JSON.parse(reader.result);
        restore(data.elements, null);
        resolve();
      }
    };
  });
}

function exportAsPNG({
  exportBackground,
  exportPadding = 10,
  viewBackgroundColor,
}) {
  const canvas = document.getElementById("canvas");
  const rc = rough.canvas(canvas);
  const context = canvas.getContext("2d");
  if (!elements.length) return window.alert("Cannot export empty canvas.");
  // calculate smallest area to fit the contents in
  let subCanvasX1 = Infinity;
  let subCanvasX2 = 0;
  let subCanvasY1 = Infinity;
  let subCanvasY2 = 0;
  elements.forEach((element) => {
    subCanvasX1 = Math.min(subCanvasX1, getElementAbsoluteX1(element));
    subCanvasX2 = Math.max(subCanvasX2, getElementAbsoluteX2(element));
    subCanvasY1 = Math.min(subCanvasY1, getElementAbsoluteY1(element));
    subCanvasY2 = Math.max(subCanvasY2, getElementAbsoluteY2(element));
  });
  function distance(x, y) {
    return Math.abs(x > y ? x - y : y - x);
  }
  const tempCanvas = document.createElement("canvas");
  tempCanvas.style.display = "none";
  document.body.appendChild(tempCanvas);
  tempCanvas.width = distance(subCanvasX1, subCanvasX2) + exportPadding * 2;
  tempCanvas.height = distance(subCanvasY1, subCanvasY2) + exportPadding * 2;
  renderScene(
    rough.canvas(tempCanvas),
    tempCanvas,
    {
      viewBackgroundColor: exportBackground ? viewBackgroundColor : null,
      scrollX: 0,
      scrollY: 0,
    },
    {
      offsetX: -subCanvasX1 + exportPadding,
      offsetY: -subCanvasY1 + exportPadding,
      renderScrollbars: false,
      renderSelection: false,
    }
  );
  saveFile("chalkboard.png", tempCanvas.toDataURL("image/png"));

  // clean up the DOM
  if (tempCanvas !== canvas) tempCanvas.remove();
}

function saveFile(name, data) {
  // create a temporary <a> elem which we'll use to download the image
  const link = document.createElement("a");
  link.setAttribute("download", name);
  link.setAttribute("href", data);
  link.click();
  // clean up
  link.remove();
}

function rotate(x1, y1, x2, y2, angle) {
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  return [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
  ];
}

// Casting second argument (DrawingSurface) to any,
// because it is requred by TS definitions and not required at runtime
const generator = rough.generator(null, null);
function isTextElement(element) {
  return element.type === "text";
}

function isInputLike(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function getArrowPoints(element) {
  const x1 = 0;
  const y1 = 0;
  const x2 = element.width;
  const y2 = element.height;
  const size = 30; // pixels
  const distance = Math.hypot(x2 - x1, y2 - y1);
  // Scale down the arrow until we hit a certain size so that it doesn't look weird
  const minSize = Math.min(size, distance / 2);
  const xs = x2 - ((x2 - x1) / distance) * minSize;
  const ys = y2 - ((y2 - y1) / distance) * minSize;
  const angle = 20; // degrees
  const [x3, y3] = rotate(xs, ys, x2, y2, (-angle * Math.PI) / 180);
  const [x4, y4] = rotate(xs, ys, x2, y2, (angle * Math.PI) / 180);
  return [x1, y1, x2, y2, x3, y3, x4, y4];
}

function generateDraw(element) {
  if (element.type === "selection") {
    element.draw = (rc, context, { scrollX, scrollY }) => {
      const fillStyle = context.fillStyle;
      context.fillStyle = "rgba(0, 0, 255, 0.10)";
      context.fillRect(
        element.x + scrollX,
        element.y + scrollY,
        element.width,
        element.height
      );
      context.fillStyle = fillStyle;
    };
  } else if (element.type === "rectangle") {
    const shape = withCustomMathRandom(element.seed, () => {
      return generator.rectangle(0, 0, element.width, element.height, {
        stroke: element.strokeColor,
        fill: element.backgroundColor,
      });
    });
    element.draw = (rc, context, { scrollX, scrollY }) => {
      context.translate(element.x + scrollX, element.y + scrollY);
      rc.draw(shape);
      context.translate(-element.x - scrollX, -element.y - scrollY);
    };
  } else if (element.type === "ellipse") {
    const shape = withCustomMathRandom(element.seed, () =>
      generator.ellipse(
        element.width / 2,
        element.height / 2,
        element.width,
        element.height,
        { stroke: element.strokeColor, fill: element.backgroundColor }
      )
    );
    element.draw = (rc, context, { scrollX, scrollY }) => {
      context.translate(element.x + scrollX, element.y + scrollY);
      rc.draw(shape);
      context.translate(-element.x - scrollX, -element.y - scrollY);
    };
  } else if (element.type === "arrow") {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = getArrowPoints(element);
    const shapes = withCustomMathRandom(element.seed, () => [
      //    \
      generator.line(x3, y3, x2, y2, { stroke: element.strokeColor }),
      // -----
      generator.line(x1, y1, x2, y2, { stroke: element.strokeColor }),
      //    /
      generator.line(x4, y4, x2, y2, { stroke: element.strokeColor }),
    ]);
    element.draw = (rc, context, { scrollX, scrollY }) => {
      context.translate(element.x + scrollX, element.y + scrollY);
      shapes.forEach((shape) => rc.draw(shape));
      context.translate(-element.x - scrollX, -element.y - scrollY);
    };
    return;
  } else if (isTextElement(element)) {
    element.draw = (rc, context, { scrollX, scrollY }) => {
      const font = context.font;
      context.font = element.font;
      const fillStyle = context.fillStyle;
      context.fillStyle = element.strokeColor;
      context.fillText(
        element.text,
        element.x + scrollX,
        element.y + element.actualBoundingBoxAscent + scrollY
      );
      context.fillStyle = fillStyle;
      context.font = font;
    };
  } else {
    throw new Error("Unimplemented type " + element.type);
  }
}

// If the element is created from right to left, the width is going to be negative
// This set of functions retrieves the absolute position of the 4 points.
// We can't just always normalize it since we need to remember the fact that an arrow
// is pointing left or right.

function getElementAbsoluteX1(element) {
  return element.width >= 0 ? element.x : element.x + element.width;
}
function getElementAbsoluteX2(element) {
  return element.width >= 0 ? element.x + element.width : element.x;
}
function getElementAbsoluteY1(element) {
  return element.height >= 0 ? element.y : element.y + element.height;
}
function getElementAbsoluteY2(element) {
  return element.height >= 0 ? element.y + element.height : element.y;
}

function setSelection(selection) {
  const selectionX1 = getElementAbsoluteX1(selection);
  const selectionX2 = getElementAbsoluteX2(selection);
  const selectionY1 = getElementAbsoluteY1(selection);
  const selectionY2 = getElementAbsoluteY2(selection);
  elements.forEach((element) => {
    const elementX1 = getElementAbsoluteX1(element);
    const elementX2 = getElementAbsoluteX2(element);
    const elementY1 = getElementAbsoluteY1(element);
    const elementY2 = getElementAbsoluteY2(element);
    element.isSelected =
      element.type !== "selection" &&
      selectionX1 <= elementX1 &&
      selectionY1 <= elementY1 &&
      selectionX2 >= elementX2 &&
      selectionY2 >= elementY2;
  });
}

function clearSelection() {
  elements.forEach((element) => {
    element.isSelected = false;
  });
}

function resetCursor() {
  document.documentElement.style.cursor = "";
}

function deleteSelectedElements() {
  for (let i = elements.length - 1; i >= 0; --i) {
    if (elements[i].isSelected) {
      elements.splice(i, 1);
    }
  }
}

function save(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(elements));
  localStorage.setItem(LOCAL_STORAGE_KEY_STATE, JSON.stringify(state));
}

function restoreFromLocalStorage() {
  const savedElements = localStorage.getItem(LOCAL_STORAGE_KEY);
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_STATE);
  return restore(savedElements, savedState);
}

function restore(savedElements, savedState) {
  try {
    if (savedElements) {
      elements.splice(
        0,
        elements.length,
        ...(typeof savedElements === "string"
          ? JSON.parse(savedElements)
          : savedElements)
      );
      elements.forEach((element) => generateDraw(element));
    }
    return savedState ? JSON.parse(savedState) : null;
  } catch (e) {
    elements.splice(0, elements.length);
    return null;
  }
}

const KEYS = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_DOWN: "ArrowDown",
  ARROW_UP: "ArrowUp",
  ESCAPE: "Escape",
  DELETE: "Delete",
  BACKSPACE: "Backspace",
};

// Inline font-awesome icons in order to save on js size rather than including the font awesome react library
const SHAPES = [
  {
    icon: (
      // fa-mouse-pointer
      <svg viewBox="0 0 320 512">
        <path d="M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z" />
      </svg>
    ),
    value: "selection",
  },
  {
    icon: (
      // fa-square
      <svg viewBox="0 0 448 512">
        <path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z" />
      </svg>
    ),
    value: "rectangle",
  },
  {
    icon: (
      // fa-circle
      <svg viewBox="0 0 512 512">
        <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" />
      </svg>
    ),
    value: "ellipse",
  },
  {
    icon: (
      // fa-long-arrow-alt-right
      <svg viewBox="0 0 448 512">
        <path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z" />
      </svg>
    ),
    value: "arrow",
  },
  {
    icon: (
      // fa-font
      <svg viewBox="0 0 448 512">
        <path d="M432 416h-23.41L277.88 53.69A32 32 0 0 0 247.58 32h-47.16a32 32 0 0 0-30.3 21.69L39.41 416H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16h-19.58l23.3-64h152.56l23.3 64H304a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM176.85 272L224 142.51 271.15 272z" />
      </svg>
    ),
    value: "text",
  },
];

const shapesShortcutKeys = SHAPES.map((shape) => shape.value[0]);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function findElementByKey(key) {
  const defaultElement = "selection";
  return SHAPES.reduce((element, shape) => {
    if (shape.value[0] !== key) return element;
    return shape.value;
  }, defaultElement);
}

function isArrowKey(keyCode) {
  return (
    keyCode === KEYS.ARROW_LEFT ||
    keyCode === KEYS.ARROW_RIGHT ||
    keyCode === KEYS.ARROW_DOWN ||
    keyCode === KEYS.ARROW_UP
  );
}

function getSelectedIndices() {
  const selectedIndices = [];
  elements.forEach((element, index) => {
    if (element.isSelected) {
      selectedIndices.push(index);
    }
  });
  return selectedIndices;
}

const someElementIsSelected = () =>
  elements.some((element) => element.isSelected);
const ELEMENT_SHIFT_TRANSLATE_AMOUNT = 5;
const ELEMENT_TRANSLATE_AMOUNT = 1;
let lastCanvasWidth = -1;
let lastCanvasHeight = -1;
let lastMouseUp = null;


const Chalkboard = (props) => {
  
  const [draggingElement, setdraggingElements] = useState(null);
  const [resizingElement, setresizingElements] = useState(null);
  const [elementType, setelementType] = useState("selection");
  const [exportBackground, setexportBackground] = useState(true);
  const [currentItemStrokeColor, setcurrentItemStrokeColor] = useState("#000000");
  const [currentItemBackgroundColor, setcurrentItemBackgroundColor] = useState("#ffffff");
  const [viewBackgroundColor, setviewBackgroundColor] = useState("#ffffff");
  const [scrollX, setscrollX] = useState(0);
  const [scrollY, setscrollY] = useState(0);
  const forceUpdate = useForceUpdate();
  const canvasWidth = window.innerWidth - CANVAS_WINDOW_OFFSET_LEFT;
  const canvasHeight = window.innerHeight - CANVAS_WINDOW_OFFSET_TOP;

  const onResize = () => {
    forceUpdate();
  };

  const onKeyDown = (event) => {
    if (isInputLike(event.target)) return;
    if (event.key === KEYS.ESCAPE) {
      clearSelection();
      forceUpdate();
      event.preventDefault();
    } else if (event.key === KEYS.BACKSPACE || event.key === KEYS.DELETE) {
      deleteSelectedElements();
      forceUpdate();
      event.preventDefault();
    } else if (isArrowKey(event.key)) {
      const step = event.shiftKey
        ? ELEMENT_SHIFT_TRANSLATE_AMOUNT
        : ELEMENT_TRANSLATE_AMOUNT;
      elements.forEach((element) => {
        if (element.isSelected) {
          if (event.key === KEYS.ARROW_LEFT) element.x -= step;
          else if (event.key === KEYS.ARROW_RIGHT) element.x += step;
          else if (event.key === KEYS.ARROW_UP) element.y -= step;
          else if (event.key === KEYS.ARROW_DOWN) element.y += step;
        }
      });
      forceUpdate();
      event.preventDefault();
      // Send backward: Cmd-Shift-Alt-B
    } else if (
      event.metaKey &&
      event.shiftKey &&
      event.altKey &&
      event.code === "KeyB"
    ) {
      moveOneLeft();
      event.preventDefault();
      // Send to back: Cmd-Shift-B
    } else if (event.metaKey && event.shiftKey && event.code === "KeyB") {
      moveAllLeft();
      event.preventDefault();
      // Bring forward: Cmd-Shift-Alt-F
    } else if (
      event.metaKey &&
      event.shiftKey &&
      event.altKey &&
      event.code === "KeyF"
    ) {
      moveOneRight();
      event.preventDefault();
      // Bring to front: Cmd-Shift-F
    } else if (event.metaKey && event.shiftKey && event.code === "KeyF") {
      moveAllRight();
      event.preventDefault();
      // Select all: Cmd-A
    } else if (event.metaKey && event.code === "KeyA") {
      elements.forEach((element) => {
        element.isSelected = true;
      });
      forceUpdate();
      event.preventDefault();
    } else if (shapesShortcutKeys.includes(event.key.toLowerCase())) {
      setelementType(findElementByKey(event.key));
    } else if (event.metaKey && event.code === "KeyZ") {
      let lastEntry = stateHistory.pop();
      // If nothing was changed since last, take the previous one
      if (generateHistoryCurrentEntry() === lastEntry) {
        lastEntry = stateHistory.pop();
      }
      if (lastEntry !== undefined) {
        restoreHistoryEntry(lastEntry);
      }
      forceUpdate();
      event.preventDefault();
    }
  };

  const deleteSelectedElements = () => {
    deleteSelectedElements();
    forceUpdate();
  };

  const clearCanvas = () => {
    if (window.confirm("This will clear the whole canvas. Are you sure?")) {
      elements.splice(0, elements.length);
      setviewBackgroundColor("#ffffff");
      setscrollX(0);
      setscrollY(0);
      forceUpdate();
    }
  };

  const localmoveAllLeft = () => {
    moveAllLeft(elements, getSelectedIndices());
    forceUpdate();
  };

  const localmoveOneLeft = () => {
    moveOneLeft(elements, getSelectedIndices());
    forceUpdate();
  };

  const localmoveAllRight = () => {
    moveAllRight(elements, getSelectedIndices());
    forceUpdate();
  };

  const localmoveOneRight = () => {
    moveOneRight(elements, getSelectedIndices());
    forceUpdate();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const { deltaX, deltaY } = e;
   
    setscrollX(scrollX - deltaX);
    setscrollY(scrollY - deltaY);
   
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("resize", onResize, false);
    const savedState = restoreFromLocalStorage();
    if (savedState) {
      //state
    }
  
    // returned function will be called on component unmount 
    return () => {
      document.removeEventListener("keydown", onKeyDown, false);
      window.removeEventListener("resize", onResize, false);
    }
  }, []);

  const mounted = useRef();
  useEffect(() => {
  if (!mounted.current) {
    // do componentDidMount logic
    mounted.current = true;
  } else {
    const canvas = document.getElementById("canvas");
    const rc = rough.canvas(canvas);
    const context = canvas.getContext("2d");
    renderScene(rc, canvas, {
      
      scrollX: scrollX,
      scrollY: scrollY,
      viewBackgroundColor: viewBackgroundColor,
    });
    save({
      draggingElement: draggingElement,
      resizingElement: resizingElement,
      elementType: elementType,
      exportBackground: exportBackground,
      currentItemStrokeColor: currentItemStrokeColor,
      currentItemBackgroundColor: currentItemBackgroundColor,
      scrollX: scrollX,
      scrollY: scrollY,
      viewBackgroundColor: viewBackgroundColor,
    });
    if (!skipHistory) {
      pushHistoryEntry(generateHistoryCurrentEntry());
    }
    skipHistory = false;
  }
  });
  
  const removeWheelEventListener = undefined;

  return (
    <div
      className="container"

      onCut = {(e) => {
        e.clipboardData.setData(
          "text/plain",
          JSON.stringify(elements.filter((element) => element.isSelected))
        );
        deleteSelectedElements();
        forceUpdate();
        e.preventDefault();
      }}

      onCopy = {(e) => {
        e.clipboardData.setData(
          "text/plain",
          JSON.stringify(elements.filter((element) => element.isSelected))
        );
        e.preventDefault();
      }}

      onPaste = {(e) => {
        const paste = e.clipboardData.getData("text");
        let parsedElements;
        try {
          parsedElements = JSON.parse(paste);
        } catch (e) {}
        if (
          Array.isArray(parsedElements) &&
          parsedElements.length > 0 &&
          parsedElements[0].type // need to implement a better check here...
        ) {
          clearSelection();
          parsedElements.forEach((parsedElement) => {
            parsedElement.x += 10;
            parsedElement.y += 10;
            parsedElement.seed = randomSeed();
            generateDraw(parsedElement);
            elements.push(parsedElement);
          });
          forceUpdate();
        }
        e.preventDefault();
      }}
    >
      <div className="sidePanel">
        <h4>Shapes</h4>
        <div className="panelTools">
          {SHAPES.map(({ value, icon }) => (
            <label
              key={value}
              className="tool"
              title={`${capitalize(value)} - ${capitalize(value)[0]}`}
            >
              <input
                type="radio"
                checked={elementType === value}
                onChange={() => {
                  setelementType(value);
                  clearSelection();
                  document.documentElement.style.cursor =
                    value === "text" ? "text" : "crosshair";
                    forceUpdate();
                }}
              />
              <div className="toolIcon">{icon}</div>
            </label>
          ))}
        </div>
        <h4>Colors</h4>
        <div className="panelColumn">
          <label>
            <input
              type="color"
              value={viewBackgroundColor}
              onChange={(e) => {
                setviewBackgroundColor(e.target.value);
              }}
            />
            Background
          </label>
          <label>
            <input
              type="color"
              value={currentItemStrokeColor}
              onChange={(e) => {
                setcurrentItemStrokeColor(e.target.value);
              }}
            />
            Shape Stroke
          </label>
          <label>
            <input
              type="color"
              value={currentItemBackgroundColor}
              onChange={(e) => {
                setcurrentItemBackgroundColor(e.target.value);
              }}
            />
            Shape Background
          </label>
        </div>
        <h4>Canvas</h4>
        <div className="panelColumn">
          <button
            onClick={clearCanvas}
            title="Clear the canvas & reset background color"
          >
            Clear canvas
          </button>
        </div>
        <h4>Export</h4>
        <div className="panelColumn">
          <button
            onClick={() => {
              exportAsPNG({
                draggingElement: draggingElement,
                resizingElement: resizingElement,
                elementType: elementType,
                exportBackground: exportBackground,
                currentItemStrokeColor: currentItemStrokeColor,
                currentItemBackgroundColor: currentItemBackgroundColor,
                scrollX: scrollX,
                scrollY: scrollY,
                viewBackgroundColor: viewBackgroundColor,
              });
            }}
          >
            Export to png
          </button>
          <label>
            <input
              type="checkbox"
              checked={exportBackground}
              onChange={(e) => {
                setexportBackground(e.target.checked);
              }}
            />
            background
          </label>
        </div>
        <h4>Save/Load</h4>
        <div className="panelColumn">
          <button
            onClick={() => {
              saveAsJSON();
            }}
          >
            Save as...
          </button>
          <button
            onClick={() => {
              loadFromJSON().then(() => forceUpdate());
            }}
          >
            Load file...
          </button>
        </div>
        {someElementIsSelected() && (
          <>
            <h4>Shape options</h4>
            <div className="panelColumn">
              <button onClick={deleteSelectedElements}>Delete</button>
              <button onClick={localmoveOneRight}>Bring forward</button>
              <button onClick={localmoveAllRight}>Bring to front</button>
              <button onClick={localmoveOneLeft}>Send backward</button>
              <button onClick={localmoveAllLeft}>Send to back</button>
            </div>
          </>
        )}
      </div>

      <canvas
        id = "canvas"
        style = {{
          width: canvasWidth,
          height: canvasHeight,
        }}
        width = {canvasWidth * window.devicePixelRatio}
        height = {canvasHeight * window.devicePixelRatio}
        ref = {(canvas) => {
          if (removeWheelEventListener) {
            removeWheelEventListener();
            removeWheelEventListener = undefined;
          }
          if (canvas) {
            canvas.addEventListener("wheel", handleWheel, {
              passive: false,
            });
              const removeWheelEventListener = () =>
              canvas.removeEventListener("wheel", handleWheel);
            // Whenever React sets the width/height of the canvas element,
            // the context loses the scale transform. We need to re-apply it
            if (
              canvasWidth !== lastCanvasWidth ||
              canvasHeight !== lastCanvasHeight
            ) {
              lastCanvasWidth = canvasWidth;
              lastCanvasHeight = canvasHeight;
              canvas
                .getContext("2d")
                .scale(window.devicePixelRatio, window.devicePixelRatio);
            }
          }
        }}

        onMouseDown={(e) => {

          const canvas = document.getElementById("canvas");
          const rc = rough.canvas(canvas);
          const context = canvas.getContext("2d");

          if (lastMouseUp !== null) {
            // Unfortunately, sometimes we don't get a mouseup after a mousedown,
            // this can happen when a contextual menu or alert is triggered. In order to avoid
            // being in a weird state, we clean up on the next mousedown
            lastMouseUp(e);
          }

          // only handle left mouse button
          if (e.button !== 0) return;
          // fixes mousemove causing selection of UI texts #32

          e.preventDefault();

          // Preventing the event above disables default behavior
          //  of defocusing potentially focused input, which is what we want
          //  when clicking inside the canvas.
          if (isInputLike(document.activeElement)) {
            document.activeElement.blur();
          }
          // Handle scrollbars dragging
          const { isOverHorizontalScrollBar, isOverVerticalScrollBar } =
            isOverScrollBars(
              e.clientX - CANVAS_WINDOW_OFFSET_LEFT,
              e.clientY - CANVAS_WINDOW_OFFSET_TOP,
              canvasWidth,
              canvasHeight,
              scrollX,
              scrollY
            );

          const x = e.clientX - CANVAS_WINDOW_OFFSET_LEFT - scrollX;
          const y = e.clientY - CANVAS_WINDOW_OFFSET_TOP - scrollY;

          const element = newElement(
            elementType,
            x,
            y,
            currentItemStrokeColor,
            currentItemBackgroundColor
          );

          let resizeHandle = false;
          let isDraggingElements = false;
          let isResizingElements = false;

          if (elementType === "selection") {
            const resizeElement = elements.find((element) => {
              return resizeTest(element, x, y, {
                scrollX: scrollX,
                scrollY: scrollY,
                viewBackgroundColor: viewBackgroundColor,
              });
            });

            setresizingElements(resizeElement ? resizeElement : null)
       
            if (resizeElement) {
              resizeHandle = resizeTest(resizeElement, x, y, {
                scrollX: scrollX,
                scrollY: scrollY,
                viewBackgroundColor: viewBackgroundColor,
              });
              document.documentElement.style.cursor = `${resizeHandle}-resize`;
              isResizingElements = true;
            } else {
              let hitElement = null;
              // We need to to hit testing from front (end of the array) to back (beginning of the array)
              for (let i = elements.length - 1; i >= 0; --i) {
                if (hitTest(elements[i], x, y)) {
                  hitElement = elements[i];
                  break;
                }
              }
              // If we click on something
              if (hitElement) {
                if (hitElement.isSelected) {
                  // If that element is not already selected, do nothing,
                  // we're likely going to drag it
                } else {
                  // We unselect every other elements unless shift is pressed
                  if (!e.shiftKey) {
                    clearSelection();
                  }
                  // No matter what, we select it
                  hitElement.isSelected = true;
                }
              } else {
                // If we don't click on anything, let's remove all the selected elements
                clearSelection();
              }
              isDraggingElements = someElementIsSelected();
              if (isDraggingElements) {
                document.documentElement.style.cursor = "move";
              }
            }
          }
          if (isTextElement(element)) {
            resetCursor();
            const text = prompt("What text do you want?");
            if (text === null) {
              return;
            }
            const fontSize = 20;
            element.text = text;
            element.font = `${fontSize}px Virgil`;
            const font = context.font;
            context.font = element.font;
            const textMeasure = context.measureText(element.text);
            const width = textMeasure.width;
            const actualBoundingBoxAscent =
              textMeasure.actualBoundingBoxAscent || fontSize;
            const actualBoundingBoxDescent =
              textMeasure.actualBoundingBoxDescent || 0;
            element.actualBoundingBoxAscent = actualBoundingBoxAscent;
            context.font = font;
            const height = actualBoundingBoxAscent + actualBoundingBoxDescent;
            // Center the text
            element.x -= width / 2;
            element.y -= actualBoundingBoxAscent;
            element.width = width;
            element.height = height;
          }
          generateDraw(element);
          elements.push(element);
          if (elementType === "text") {
            setdraggingElements(null);
            setelementType("selection");
            element.isSelected = true;
          } else {
            setdraggingElements(element);
          }
          let lastX = x;
          let lastY = y;
          if (isOverHorizontalScrollBar || isOverVerticalScrollBar) {
            lastX = e.clientX - CANVAS_WINDOW_OFFSET_LEFT;
            lastY = e.clientY - CANVAS_WINDOW_OFFSET_TOP;
          }

          const onMouseMove = (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
              return;
            }
            if (isOverHorizontalScrollBar) {
              const x = e.clientX - CANVAS_WINDOW_OFFSET_LEFT;
              const dx = x - lastX;
              setscrollX(scrollX - dx);
              lastX = x;
              return;
            }
            if (isOverVerticalScrollBar) {
              const y = e.clientY - CANVAS_WINDOW_OFFSET_TOP;
              const dy = y - lastY;
              setscrollY(scrollY - dy);
              lastY = y;
              return;
            }
            if (isResizingElements && resizingElement) {
              const el = resizingElement;
              const selectedElements = elements.filter((el) => el.isSelected);
              if (selectedElements.length === 1) {
                const x =
                  e.clientX - CANVAS_WINDOW_OFFSET_LEFT - scrollX;
                const y =
                  e.clientY - CANVAS_WINDOW_OFFSET_TOP - scrollY;
                selectedElements.forEach((element) => {
                  switch (resizeHandle) {
                    case "nw":
                      element.width += element.x - lastX;
                      element.height += element.y - lastY;
                      element.x = lastX;
                      element.y = lastY;
                      break;
                    case "ne":
                      element.width = lastX - element.x;
                      element.height += element.y - lastY;
                      element.y = lastY;
                      break;
                    case "sw":
                      element.width += element.x - lastX;
                      element.x = lastX;
                      element.height = lastY - element.y;
                      break;
                    case "se":
                      element.width += x - lastX;
                      if (e.shiftKey) {
                        element.height = element.width;
                      } else {
                        element.height += y - lastY;
                      }
                      break;
                    case "n":
                      element.height += element.y - lastY;
                      element.y = lastY;
                      break;
                    case "w":
                      element.width += element.x - lastX;
                      element.x = lastX;
                      break;
                    case "s":
                      element.height = lastY - element.y;
                      break;
                    case "e":
                      element.width = lastX - element.x;
                      break;
                  }
                  el.x = element.x;
                  el.y = element.y;
                  generateDraw(el);
                });
                lastX = x;
                lastY = y;
                // We don't want to save history when resizing an element
                skipHistory = true;
                forceUpdate();
                return;
              }
            }
            if (isDraggingElements) {
              const selectedElements = elements.filter((el) => el.isSelected);
              if (selectedElements.length) {
                const x =
                  e.clientX - CANVAS_WINDOW_OFFSET_LEFT - scrollX;
                const y =
                  e.clientY - CANVAS_WINDOW_OFFSET_TOP - scrollY;
                selectedElements.forEach((element) => {
                  element.x += x - lastX;
                  element.y += y - lastY;
                });
                lastX = x;
                lastY = y;
                // We don't want to save history when dragging an element to initially size it
                skipHistory = true;
                forceUpdate();
                return;
              }
            }
            
            // It is very important to read state within each move event,
            // otherwise we would read a stale one!
            if (draggingElement === null) return;
            let width = e.clientX - CANVAS_WINDOW_OFFSET_LEFT - draggingElement.x - scrollX;
            let height =
              e.clientY -
              CANVAS_WINDOW_OFFSET_TOP -
              draggingElement.y - scrollY;
            draggingElement.width = width;
            // Make a perfect square or circle when shift is enabled
            draggingElement.height = e.shiftKey
              ? Math.abs(width) * Math.sign(height)
              : height;
            generateDraw(draggingElement);
            if (elementType === "selection") {
              setSelection(draggingElement);
            }
            // We don't want to save history when moving an element
            skipHistory = true;
            forceUpdate();
          };

          const onMouseUp = (e) => {
            lastMouseUp = null;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            resetCursor();
            // if no element is clicked, clear the selection and redraw
            if (draggingElement === null) {
              clearSelection();
              forceUpdate();
              return;
            }
            if (elementType === "selection") {
              if (isDraggingElements) {
                isDraggingElements = false;
              }
              elements.pop();
            } else {
              draggingElement.isSelected = true;
            }
            setdraggingElements(null)
            setelementType("selection")
            forceUpdate();
          };

          lastMouseUp = onMouseUp;
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
          // We don't want to save history on mouseDown, only on mouseUp when it's fully configured
          skipHistory = true;
          forceUpdate();
        }}
      />
    </div>
  );
}

export default Chalkboard;



