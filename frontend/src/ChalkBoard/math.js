import { LINE_CONFIRM_THRESHOLD } from "./constants";
export const rotate = (x1, y1, x2, y2, angle) => 
// πβ²π₯=(ππ₯βππ₯)cosπβ(ππ¦βππ¦)sinπ+ππ₯
// πβ²π¦=(ππ₯βππ₯)sinπ+(ππ¦βππ¦)cosπ+ππ¦.
// https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
[
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2,
];
export const rotatePoint = (point, center, angle) => rotate(point[0], point[1], center[0], center[1], angle);
export const adjustXYWithRotation = (sides, x, y, angle, deltaX1, deltaY1, deltaX2, deltaY2) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    if (sides.e && sides.w) {
        x += deltaX1 + deltaX2;
    }
    else if (sides.e) {
        x += deltaX1 * (1 + cos);
        y += deltaX1 * sin;
        x += deltaX2 * (1 - cos);
        y += deltaX2 * -sin;
    }
    else if (sides.w) {
        x += deltaX1 * (1 - cos);
        y += deltaX1 * -sin;
        x += deltaX2 * (1 + cos);
        y += deltaX2 * sin;
    }
    if (sides.n && sides.s) {
        y += deltaY1 + deltaY2;
    }
    else if (sides.n) {
        x += deltaY1 * sin;
        y += deltaY1 * (1 - cos);
        x += deltaY2 * -sin;
        y += deltaY2 * (1 + cos);
    }
    else if (sides.s) {
        x += deltaY1 * -sin;
        y += deltaY1 * (1 + cos);
        x += deltaY2 * sin;
        y += deltaY2 * (1 - cos);
    }
    return [x, y];
};
export const getPointOnAPath = (point, path) => {
    const [px, py] = point;
    const [start, ...other] = path;
    let [lastX, lastY] = start;
    let kLine = 0;
    let idx = 0;
    // if any item in the array is true, it means that a point is
    // on some segment of a line based path
    const retVal = other.some(([x2, y2], i) => {
        // we always take a line when dealing with line segments
        const x1 = lastX;
        const y1 = lastY;
        lastX = x2;
        lastY = y2;
        // if a point is not within the domain of the line segment
        // it is not on the line segment
        if (px < x1 || px > x2) {
            return false;
        }
        // check if all points lie on the same line
        // y1 = kx1 + b, y2 = kx2 + b
        // y2 - y1 = k(x2 - x2) -> k = (y2 - y1) / (x2 - x1)
        // coefficient for the line (p0, p1)
        const kL = (y2 - y1) / (x2 - x1);
        // coefficient for the line segment (p0, point)
        const kP1 = (py - y1) / (px - x1);
        // coefficient for the line segment (point, p1)
        const kP2 = (py - y2) / (px - x2);
        // because we are basing both lines from the same starting point
        // the only option for collinearity is having same coefficients
        // using it for floating point comparisons
        const epsilon = 0.3;
        // if coefficient is more than an arbitrary epsilon,
        // these lines are nor collinear
        if (Math.abs(kP1 - kL) > epsilon && Math.abs(kP2 - kL) > epsilon) {
            return false;
        }
        // store the coefficient because we are goint to need it
        kLine = kL;
        idx = i;
        return true;
    });
    // Return a coordinate that is always on the line segment
    if (retVal === true) {
        return { x: point[0], y: kLine * point[0], segment: idx };
    }
    return null;
};
export const distance2d = (x1, y1, x2, y2) => {
    const xd = x2 - x1;
    const yd = y2 - y1;
    return Math.hypot(xd, yd);
};
export const centerPoint = (a, b) => {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
};
// Checks if the first and last point are close enough
// to be considered a loop
export const isPathALoop = (points, 
/** supply if you want the loop detection to account for current zoom */
zoomValue = 1) => {
    if (points.length >= 3) {
        const [first, last] = [points[0], points[points.length - 1]];
        const distance = distance2d(first[0], first[1], last[0], last[1]);
        // Adjusting LINE_CONFIRM_THRESHOLD to current zoom so that when zoomed in
        // really close we make the threshold smaller, and vice versa.
        return distance <= LINE_CONFIRM_THRESHOLD / zoomValue;
    }
    return false;
};
// Draw a line from the point to the right till infiinty
// Check how many lines of the polygon does this infinite line intersects with
// If the number of intersections is odd, point is in the polygon
export const isPointInPolygon = (points, x, y) => {
    const vertices = points.length;
    // There must be at least 3 vertices in polygon
    if (vertices < 3) {
        return false;
    }
    const extreme = [Number.MAX_SAFE_INTEGER, y];
    const p = [x, y];
    let count = 0;
    for (let i = 0; i < vertices; i++) {
        const current = points[i];
        const next = points[(i + 1) % vertices];
        if (doSegmentsIntersect(current, next, p, extreme)) {
            if (orderedColinearOrientation(current, p, next) === 0) {
                return isPointWithinBounds(current, p, next);
            }
            count++;
        }
    }
    // true if count is off
    return count % 2 === 1;
};
// Returns whether `q` lies inside the segment/rectangle defined by `p` and `r`.
// This is an approximation to "does `q` lie on a segment `pr`" check.
const isPointWithinBounds = (p, q, r) => {
    return (q[0] <= Math.max(p[0], r[0]) &&
        q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) &&
        q[1] >= Math.min(p[1], r[1]));
};
// For the ordered points p, q, r, return
// 0 if p, q, r are colinear
// 1 if Clockwise
// 2 if counterclickwise
const orderedColinearOrientation = (p, q, r) => {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) {
        return 0;
    }
    return val > 0 ? 1 : 2;
};
// Check is p1q1 intersects with p2q2
const doSegmentsIntersect = (p1, q1, p2, q2) => {
    const o1 = orderedColinearOrientation(p1, q1, p2);
    const o2 = orderedColinearOrientation(p1, q1, q2);
    const o3 = orderedColinearOrientation(p2, q2, p1);
    const o4 = orderedColinearOrientation(p2, q2, q1);
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && isPointWithinBounds(p1, p2, q1)) {
        return true;
    }
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && isPointWithinBounds(p1, q2, q1)) {
        return true;
    }
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && isPointWithinBounds(p2, p1, q2)) {
        return true;
    }
    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && isPointWithinBounds(p2, q1, q2)) {
        return true;
    }
    return false;
};
// TODO: Rounding this point causes some shake when free drawing
export const getGridPoint = (x, y, gridSize) => {
    if (gridSize) {
        return [
            Math.round(x / gridSize) * gridSize,
            Math.round(y / gridSize) * gridSize,
        ];
    }
    return [x, y];
};
