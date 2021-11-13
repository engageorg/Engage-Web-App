import { isInvisiblySmallElement } from "./sizeHelpers";
import { isLinearElementType } from "./typeChecks";
export { newElement, newTextElement, updateTextElement, newLinearElement, newImageElement, duplicateElement, } from "./newElement";
export { getElementAbsoluteCoords, getElementBounds, getCommonBounds, getDiamondPoints, getArrowheadPoints, getClosestElementBounds, } from "./bounds";
export { OMIT_SIDES_FOR_MULTIPLE_ELEMENTS, getTransformHandlesFromCoords, getTransformHandles, } from "./transformHandles";
export { hitTest, isHittingElementBoundingBoxWithoutHittingElement, } from "./collision";
export { resizeTest, getCursorForResizingElement, getElementWithTransformHandleType, getTransformHandleTypeFromCoords, } from "./resizeTest";
export { transformElements, getResizeOffsetXY, getResizeArrowDirection, } from "./resizeElements";
export { dragSelectedElements, getDragOffsetXY, dragNewElement, } from "./dragElements";
export { isTextElement, isExcalidrawElement } from "./typeChecks";
export { textWysiwyg } from "./textWysiwyg";
export { redrawTextBoundingBox } from "./textElement";
export { getPerfectElementSize, isInvisiblySmallElement, resizePerfectLineForNWHandler, getNormalizedDimensions, } from "./sizeHelpers";
export { showSelectedShapeActions } from "./showSelectedShapeActions";
export const getElementMap = (elements) => elements.reduce((acc, element) => {
    acc[element.id] = element;
    return acc;
}, {});
export const getSceneVersion = (elements) => elements.reduce((acc, el) => acc + el.version, 0);
export const getVisibleElements = (elements) => elements.filter((el) => !el.isDeleted && !isInvisiblySmallElement(el));
export const getNonDeletedElements = (elements) => elements.filter((element) => !element.isDeleted);
export const isNonDeletedElement = (element) => !element.isDeleted;
const _clearElements = (elements) => getNonDeletedElements(elements).map((element) => isLinearElementType(element.type)
    ? { ...element, lastCommittedPoint: null }
    : element);
export const clearElementsForDatabase = (elements) => _clearElements(elements);
export const clearElementsForExport = (elements) => _clearElements(elements);
export const clearElementsForLocalStorage = (elements) => _clearElements(elements);
