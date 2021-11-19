import { randomSeed } from "../random";
import nextId from "react-id-generator";
export function newElement(type, x, y, strokeColor, backgroundColor, fillStyle, strokeWidth, roughness, opacity, width = 0, height = 0) {
    const element = {
        id: nextId(),
        type,
        x,
        y,
        width,
        height,
        strokeColor,
        backgroundColor,
        fillStyle,
        strokeWidth,
        roughness,
        opacity,
        isSelected: false,
        seed: randomSeed()
    };
    return element;
}
export function duplicateElement(element) {
    const copy = { ...element };
    copy.id = nextId();
    copy.seed = randomSeed();
    return copy;
}
