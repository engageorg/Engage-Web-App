import { measureText } from "../utils";
export const redrawTextBoundingBox = (element) => {
    const metrics = measureText(element.text, element.font);
    element.width = metrics.width;
    element.height = metrics.height;
    element.baseline = metrics.baseline;
};
