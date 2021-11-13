import "pepjs";
import { render, queries, waitFor, } from "@testing-library/react";
import * as toolQueries from "./queries/toolQueries";
import { STORAGE_KEYS } from "../excalidraw-app/data/localStorage";
import { getSelectedElements } from "../scene/selection";
require("fake-indexeddb/auto");
const customQueries = {
    ...queries,
    ...toolQueries,
};
const renderApp = async (ui, options) => {
    if (options?.localStorageData) {
        initLocalStorage(options.localStorageData);
        delete options.localStorageData;
    }
    const renderResult = render(ui, {
        queries: customQueries,
        ...options,
    });
    GlobalTestState.renderResult = renderResult;
    Object.defineProperty(GlobalTestState, "canvas", {
        // must be a getter because at the time of ExcalidrawApp render the
        // child App component isn't likely mounted yet (and thus canvas not
        // present in DOM)
        get() {
            return renderResult.container.querySelector("canvas");
        },
    });
    await waitFor(() => {
        const canvas = renderResult.container.querySelector("canvas");
        if (!canvas) {
            throw new Error("not initialized yet");
        }
    });
    return renderResult;
};
// re-export everything
export * from "@testing-library/react";
// override render method
export { renderApp as render };
/**
 * For state-sharing across test helpers.
 * NOTE: there shouldn't be concurrency issues as each test is running in its
 *  own process and thus gets its own instance of this module when running
 *  tests in parallel.
 */
export class GlobalTestState {
    /**
     * retrieves canvas for currently rendered app instance
     */
    static get canvas() {
        return null;
    }
}
/**
 * automatically updated on each call to render()
 */
GlobalTestState.renderResult = null;
const initLocalStorage = (data) => {
    if (data.elements) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS, JSON.stringify(data.elements));
    }
    if (data.appState) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE, JSON.stringify(data.appState));
    }
};
export const updateSceneData = (data) => {
    window.collab.excalidrawAPI.updateScene(data);
};
const originalGetBoundingClientRect = global.window.HTMLDivElement.prototype.getBoundingClientRect;
export const mockBoundingClientRect = () => {
    // override getBoundingClientRect as by default it will always return all values as 0 even if customized in html
    global.window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: 10,
        left: 20,
        bottom: 10,
        right: 10,
        width: 200,
        x: 10,
        y: 20,
        height: 100,
        toJSON: () => { },
    });
};
export const restoreOriginalGetBoundingClientRect = () => {
    global.window.HTMLDivElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
};
export const assertSelectedElements = (...elements) => {
    const { h } = window;
    const selectedElementIds = getSelectedElements(h.app.getSceneElements(), h.state).map((el) => el.id);
    const ids = elements
        .flat()
        .map((item) => (typeof item === "string" ? item : item.id));
    expect(selectedElementIds.length).toBe(ids.length);
    expect(selectedElementIds).toEqual(expect.arrayContaining(ids));
};
