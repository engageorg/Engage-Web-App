class SceneHistory {
    constructor() {
        this.recording = true;
        this.stateHistory = [];
        this.redoStack = [];
    }
    generateCurrentEntry(elements) {
        return JSON.stringify(elements.map(element => ({ ...element, isSelected: false })));
    }
    pushEntry(newEntry) {
        if (this.stateHistory.length > 0 &&
            this.stateHistory[this.stateHistory.length - 1] === newEntry) {
            // If the last entry is the same as this one, ignore it
            return;
        }
        this.stateHistory.push(newEntry);
    }
    restoreEntry(entry) {
        // When restoring, we shouldn't add an history entry otherwise we'll be stuck with it and can't go back
        this.skipRecording();
        try {
            return JSON.parse(entry);
        }
        catch {
            return null;
        }
    }
    clearRedoStack() {
        this.redoStack.splice(0, this.redoStack.length);
    }
    redoOnce(elements) {
        const currentEntry = this.generateCurrentEntry(elements);
        const entryToRestore = this.redoStack.pop();
        if (entryToRestore !== undefined) {
            this.stateHistory.push(currentEntry);
            return this.restoreEntry(entryToRestore);
        }
        return null;
    }
    undoOnce(elements) {
        const currentEntry = this.generateCurrentEntry(elements);
        let entryToRestore = this.stateHistory.pop();
        // If nothing was changed since last, take the previous one
        if (currentEntry === entryToRestore) {
            entryToRestore = this.stateHistory.pop();
        }
        if (entryToRestore !== undefined) {
            this.redoStack.push(currentEntry);
            return this.restoreEntry(entryToRestore);
        }
        return null;
    }
    isRecording() {
        return this.recording;
    }
    skipRecording() {
        this.recording = false;
    }
    resumeRecording() {
        this.recording = true;
    }
}
export const createHistory = () => {
    const history = new SceneHistory();
    return { history };
};
