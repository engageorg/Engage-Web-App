export const getSizeFromPoints = (points) => {
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    return {
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
    };
};
export const rescalePoints = (dimension, nextDimensionSize, prevPoints) => {
    const prevDimValues = prevPoints.map((point) => point[dimension]);
    const prevMaxDimension = Math.max(...prevDimValues);
    const prevMinDimension = Math.min(...prevDimValues);
    const prevDimensionSize = prevMaxDimension - prevMinDimension;
    const dimensionScaleFactor = prevDimensionSize === 0 ? 1 : nextDimensionSize / prevDimensionSize;
    let nextMinDimension = Infinity;
    const scaledPoints = prevPoints.map((prevPoint) => prevPoint.map((value, currentDimension) => {
        if (currentDimension !== dimension) {
            return value;
        }
        const scaledValue = value * dimensionScaleFactor;
        nextMinDimension = Math.min(scaledValue, nextMinDimension);
        return scaledValue;
    }));
    if (scaledPoints.length === 2) {
        // we don't tranlate two-point lines
        return scaledPoints;
    }
    const translation = prevMinDimension - nextMinDimension;
    const nextPoints = scaledPoints.map((scaledPoint) => scaledPoint.map((value, currentDimension) => {
        return currentDimension === dimension ? value + translation : value;
    }));
    return nextPoints;
};
