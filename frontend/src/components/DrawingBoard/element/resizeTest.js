import { handlerRectangles } from "./handlerRectangles";
export function resizeTest(element, x, y, { scrollX, scrollY }) {
    if (!element.isSelected || element.type === "text")
        return false;
    const handlers = handlerRectangles(element, { scrollX, scrollY });
    const filter = Object.keys(handlers).filter(key => {
        const handler = handlers[key];
        return (x + scrollX >= handler[0] &&
            x + scrollX <= handler[0] + handler[2] &&
            y + scrollY >= handler[1] &&
            y + scrollY <= handler[1] + handler[3]);
    });
    if (filter.length > 0) {
        return filter[0];
    }
    return false;
}
export function getElementWithResizeHandler(elements, { x, y }, { scrollX, scrollY }) {
    return elements.reduce((result, element) => {
        if (result) {
            return result;
        }
        const resizeHandle = resizeTest(element, x, y, {
            scrollX,
            scrollY
        });
        return resizeHandle ? { element, resizeHandle } : null;
    }, null);
}
