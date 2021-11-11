var _a;
import { newElement, newTextElement, newLinearElement } from "../../element";
import { DEFAULT_VERTICAL_ALIGN } from "../../constants";
import { getDefaultAppState } from "../../appState";
import { GlobalTestState, createEvent, fireEvent } from "../test-utils";
import fs from "fs";
import util from "util";
import path from "path";
import { getMimeType } from "../../data/blob";
import { newFreeDrawElement } from "../../element/newElement";
const readFile = util.promisify(fs.readFile);
const { h } = window;
export class API {
}
_a = API;
API.setSelectedElements = (elements) => {
    h.setState({
        selectedElementIds: elements.reduce((acc, element) => {
            acc[element.id] = true;
            return acc;
        }, {}),
    });
};
API.getSelectedElements = () => {
    return h.elements.filter((element) => h.state.selectedElementIds[element.id]);
};
API.getSelectedElement = () => {
    const selectedElements = API.getSelectedElements();
    if (selectedElements.length !== 1) {
        throw new Error(`expected 1 selected element; got ${selectedElements.length}`);
    }
    return selectedElements[0];
};
API.getStateHistory = () => {
    // @ts-ignore
    return h.history.stateHistory;
};
API.clearSelection = () => {
    // @ts-ignore
    h.app.clearSelection(null);
    expect(API.getSelectedElements().length).toBe(0);
};
API.createElement = ({ type, id, x = 0, y = x, width = 100, height = width, isDeleted = false, groupIds = [], ...rest }) => {
    let element = null;
    const appState = h?.state || getDefaultAppState();
    const base = {
        x,
        y,
        strokeColor: rest.strokeColor ?? appState.currentItemStrokeColor,
        backgroundColor: rest.backgroundColor ?? appState.currentItemBackgroundColor,
        fillStyle: rest.fillStyle ?? appState.currentItemFillStyle,
        strokeWidth: rest.strokeWidth ?? appState.currentItemStrokeWidth,
        strokeStyle: rest.strokeStyle ?? appState.currentItemStrokeStyle,
        strokeSharpness: rest.strokeSharpness ?? appState.currentItemStrokeSharpness,
        roughness: rest.roughness ?? appState.currentItemRoughness,
        opacity: rest.opacity ?? appState.currentItemOpacity,
    };
    switch (type) {
        case "rectangle":
        case "diamond":
        case "ellipse":
            element = newElement({
                type: type,
                width,
                height,
                ...base,
            });
            break;
        case "text":
            element = newTextElement({
                ...base,
                text: rest.text || "test",
                fontSize: rest.fontSize ?? appState.currentItemFontSize,
                fontFamily: rest.fontFamily ?? appState.currentItemFontFamily,
                textAlign: rest.textAlign ?? appState.currentItemTextAlign,
                verticalAlign: rest.verticalAlign ?? DEFAULT_VERTICAL_ALIGN,
            });
            element.width = width;
            element.height = height;
            break;
        case "freedraw":
            element = newFreeDrawElement({
                type: type,
                simulatePressure: true,
                ...base,
            });
            break;
        case "arrow":
        case "line":
            element = newLinearElement({
                type: type,
                startArrowhead: null,
                endArrowhead: null,
                ...base,
            });
            break;
    }
    if (id) {
        element.id = id;
    }
    if (isDeleted) {
        element.isDeleted = isDeleted;
    }
    if (groupIds) {
        element.groupIds = groupIds;
    }
    return element;
};
API.readFile = async (filepath, encoding) => {
    filepath = path.isAbsolute(filepath)
        ? filepath
        : path.resolve(path.join(__dirname, "../", filepath));
    return readFile(filepath, { encoding });
};
API.loadFile = async (filepath) => {
    const { base, ext } = path.parse(filepath);
    return new File([await API.readFile(filepath, null)], base, {
        type: getMimeType(ext),
    });
};
API.drop = async (blob) => {
    const fileDropEvent = createEvent.drop(GlobalTestState.canvas);
    const text = await new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsText(blob);
        }
        catch (error) {
            reject(error);
        }
    });
    Object.defineProperty(fileDropEvent, "dataTransfer", {
        value: {
            files: [blob],
            getData: (type) => {
                if (type === blob.type) {
                    return text;
                }
                return "";
            },
        },
    });
    fireEvent(GlobalTestState.canvas, fileDropEvent);
};
