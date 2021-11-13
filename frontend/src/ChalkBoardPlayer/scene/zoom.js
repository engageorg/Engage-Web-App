export const getNewZoom = (newZoomValue, prevZoom, canvasOffset, zoomOnViewportPoint = { x: 0, y: 0 }) => {
    return {
        value: newZoomValue,
        translation: {
            x: zoomOnViewportPoint.x -
                canvasOffset.left -
                (zoomOnViewportPoint.x - canvasOffset.left - prevZoom.translation.x) *
                    (newZoomValue / prevZoom.value),
            y: zoomOnViewportPoint.y -
                canvasOffset.top -
                (zoomOnViewportPoint.y - canvasOffset.top - prevZoom.translation.y) *
                    (newZoomValue / prevZoom.value),
        },
    };
};
export const getNormalizedZoom = (zoom) => {
    const normalizedZoom = parseFloat(zoom.toFixed(2));
    const clampedZoom = Math.max(0.1, Math.min(normalizedZoom, 10));
    return clampedZoom;
};
