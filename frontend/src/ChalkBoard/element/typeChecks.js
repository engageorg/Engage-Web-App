export const isGenericElement = (element) => {
    return (element != null &&
        (element.type === "selection" ||
            element.type === "rectangle" ||
            element.type === "diamond" ||
            element.type === "ellipse"));
};
export const isInitializedImageElement = (element) => {
    return !!element && element.type === "image" && !!element.fileId;
};
export const isImageElement = (element) => {
    return !!element && element.type === "image";
};
export const isTextElement = (element) => {
    return element != null && element.type === "text";
};
export const isFreeDrawElement = (element) => {
    return element != null && isFreeDrawElementType(element.type);
};
export const isFreeDrawElementType = (elementType) => {
    return elementType === "freedraw";
};
export const isLinearElement = (element) => {
    return element != null && isLinearElementType(element.type);
};
export const isLinearElementType = (elementType) => {
    return (elementType === "arrow" || elementType === "line" // || elementType === "freedraw"
    );
};
export const isBindingElement = (element) => {
    return element != null && isBindingElementType(element.type);
};
export const isBindingElementType = (elementType) => {
    return elementType === "arrow";
};
export const isBindableElement = (element) => {
    return (element != null &&
        (element.type === "rectangle" ||
            element.type === "diamond" ||
            element.type === "ellipse" ||
            element.type === "text"));
};
export const isExcalidrawElement = (element) => {
    return (element?.type === "text" ||
        element?.type === "diamond" ||
        element?.type === "rectangle" ||
        element?.type === "ellipse" ||
        element?.type === "arrow" ||
        element?.type === "freedraw" ||
        element?.type === "line");
};
