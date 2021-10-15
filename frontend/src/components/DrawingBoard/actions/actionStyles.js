import { isTextElement, redrawTextBoundingBox } from "../element";
import { META_KEY } from "../keys";
let copiedStyles = "{}";
export const actionCopyStyles = {
    name: "copyStyles",
    perform: elements => {
        const element = elements.find(el => el.isSelected);
        if (element) {
            copiedStyles = JSON.stringify(element);
        }
        return {};
    },
    contextItemLabel: "Copy Styles",
    keyTest: event => event[META_KEY] && event.shiftKey && event.code === "KeyC",
    contextMenuOrder: 0
};
export const actionPasteStyles = {
    name: "pasteStyles",
    perform: elements => {
        const pastedElement = JSON.parse(copiedStyles);
        return {
            elements: elements.map(element => {
                var _a, _b, _c, _d, _e, _f, _g;
                if (element.isSelected) {
                    const newElement = {
                        ...element,
                        backgroundColor: (_a = pastedElement) === null || _a === void 0 ? void 0 : _a.backgroundColor,
                        strokeWidth: (_b = pastedElement) === null || _b === void 0 ? void 0 : _b.strokeWidth,
                        strokeColor: (_c = pastedElement) === null || _c === void 0 ? void 0 : _c.strokeColor,
                        fillStyle: (_d = pastedElement) === null || _d === void 0 ? void 0 : _d.fillStyle,
                        opacity: (_e = pastedElement) === null || _e === void 0 ? void 0 : _e.opacity,
                        roughness: (_f = pastedElement) === null || _f === void 0 ? void 0 : _f.roughness
                    };
                    if (isTextElement(newElement)) {
                        newElement.font = (_g = pastedElement) === null || _g === void 0 ? void 0 : _g.font;
                        redrawTextBoundingBox(newElement);
                    }
                    return newElement;
                }
                return element;
            })
        };
    },
    contextItemLabel: "Paste Styles",
    keyTest: event => event[META_KEY] && event.shiftKey && event.code === "KeyV",
    contextMenuOrder: 1
};
