import rough from "roughjs/bundled/rough.esm";
import { getElementAbsoluteCoords } from "../element";
import { renderScene } from "../renderer";
import nextId from "react-id-generator";
const LOCAL_STORAGE_KEY = "chalkboard";
const LOCAL_STORAGE_KEY_STATE = "chalkboard-state";
function saveFile(name, data) {
    // create a temporary <a> elem which we'll use to download the image
    const link = document.createElement("a");
    link.setAttribute("download", name);
    link.setAttribute("href", data);
    link.click();
    // clean up
    link.remove();
}
export function saveAsJSON(elements, name) {
    const serialized = JSON.stringify({
        version: 1,
        source: window.location.origin,
        elements
    });
    saveFile(`${name}.json`, "data:text/plain;charset=utf-8," + encodeURIComponent(serialized));
}
export function loadFromJSON() {
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
    return new Promise(resolve => {
        reader.onloadend = () => {
            if (reader.readyState === FileReader.DONE) {
                let elements = [];
                try {
                    const data = JSON.parse(reader.result);
                    elements = data.elements || [];
                }
                catch (e) {
                    // Do nothing because elements array is already empty
                }
                resolve(restore(elements, null));
            }
        };
    });
}
export function exportCanvas(type, elements, canvas, { exportBackground, exportPadding = 10, viewBackgroundColor, name }) {
    if (!elements.length)
        return window.alert("Cannot export empty canvas.");
    // calculate smallest area to fit the contents in
    let subCanvasX1 = Infinity;
    let subCanvasX2 = 0;
    let subCanvasY1 = Infinity;
    let subCanvasY2 = 0;
    elements.forEach(element => {
        const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
        subCanvasX1 = Math.min(subCanvasX1, x1);
        subCanvasY1 = Math.min(subCanvasY1, y1);
        subCanvasX2 = Math.max(subCanvasX2, x2);
        subCanvasY2 = Math.max(subCanvasY2, y2);
    });
    function distance(x, y) {
        return Math.abs(x > y ? x - y : y - x);
    }
    const tempCanvas = document.createElement("canvas");
    tempCanvas.style.display = "none";
    document.body.appendChild(tempCanvas);
    tempCanvas.width = distance(subCanvasX1, subCanvasX2) + exportPadding * 2;
    tempCanvas.height = distance(subCanvasY1, subCanvasY2) + exportPadding * 2;
    renderScene(elements, rough.canvas(tempCanvas), tempCanvas, {
        viewBackgroundColor: exportBackground ? viewBackgroundColor : null,
        scrollX: 0,
        scrollY: 0
    }, {
        offsetX: -subCanvasX1 + exportPadding,
        offsetY: -subCanvasY1 + exportPadding,
        renderScrollbars: false,
        renderSelection: false
    });
    if (type === "png") {
        saveFile(`${name}.png`, tempCanvas.toDataURL("image/png"));
    }
    else if (type === "clipboard") {
        try {
            tempCanvas.toBlob(async function (blob) {
                try {
                    await navigator.clipboard.write([
                        new window.ClipboardItem({ "image/png": blob })
                    ]);
                }
                catch (err) {
                    window.alert("Couldn't copy to clipboard. Try using Chrome browser.");
                }
            });
        }
        catch (err) {
            window.alert("Couldn't copy to clipboard. Try using Chrome browser.");
        }
    }
    // clean up the DOM
    if (tempCanvas !== canvas)
        tempCanvas.remove();
}
function restore(savedElements, savedState) {
    return {
        elements: savedElements.map(element => ({
            ...element,
            id: element.id || nextId(),
            fillStyle: element.fillStyle || "hachure",
            strokeWidth: element.strokeWidth || 1,
            roughness: element.roughness || 1,
            opacity: element.opacity === null || element.opacity === undefined
                ? 100
                : element.opacity
        })),
        appState: savedState
    };
}
export function restoreFromLocalStorage() {
    const savedElements = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_STATE);
    let elements = [];
    if (savedElements) {
        try {
            elements = JSON.parse(savedElements);
        }
        catch (e) {
            // Do nothing because elements array is already empty
        }
    }
    let appState = null;
    if (savedState) {
        try {
            appState = JSON.parse(savedState);
        }
        catch (e) {
            // Do nothing because appState is already null
        }
    }
    return restore(elements, appState);
}
export function saveToLocalStorage(elements, state) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(elements));
    localStorage.setItem(LOCAL_STORAGE_KEY_STATE, JSON.stringify(state));
}
