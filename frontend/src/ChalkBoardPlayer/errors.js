export class CanvasError extends Error {
    constructor(message = "Couldn't export canvas.", name = "CANVAS_ERROR") {
        super();
        this.name = name;
        this.message = message;
    }
}
export class AbortError extends DOMException {
    constructor(message = "Request Aborted") {
        super(message, "AbortError");
    }
}
