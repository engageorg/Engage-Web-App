import { measureText, getFontString } from "../utils";
import { mutateElement } from "./mutateElement";
export const redrawTextBoundingBox = (element) => {
    const metrics = measureText(element.text, getFontString(element));
    mutateElement(element, {
        width: metrics.width,
        height: metrics.height,
        baseline: metrics.baseline,
    });
};
