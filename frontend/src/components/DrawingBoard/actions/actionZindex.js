import React from "react";
import { moveOneLeft, moveOneRight, moveAllLeft, moveAllRight } from "../zindex";
import { getSelectedIndices } from "../scene";
import { META_KEY } from "../keys";
export const actionSendBackward = {
    name: "sendBackward",
    perform: (elements, appState) => {
        return {
            elements: moveOneLeft([...elements], getSelectedIndices(elements)),
            appState
        };
    },
    contextItemLabel: "Send Backward",
    keyPriority: 40,
    keyTest: event => event[META_KEY] && event.shiftKey && event.altKey && event.code === "KeyB",
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" type="button" onClick={e => updateData(null)}>
      Send backward
    </button>)
};
export const actionBringForward = {
    name: "bringForward",
    perform: (elements, appState) => {
        return {
            elements: moveOneRight([...elements], getSelectedIndices(elements)),
            appState
        };
    },
    contextItemLabel: "Bring Forward",
    keyPriority: 40,
    keyTest: event => event[META_KEY] && event.shiftKey && event.altKey && event.code === "KeyF",
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" type="button" onClick={e => updateData(null)}>
      Bring Forward
    </button>)
};
export const actionSendToBack = {
    name: "sendToBack",
    perform: (elements, appState) => {
        return {
            elements: moveAllLeft([...elements], getSelectedIndices(elements)),
            appState
        };
    },
    contextItemLabel: "Send to Back",
    keyTest: event => event[META_KEY] && event.shiftKey && event.code === "KeyB",
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" type="button" onClick={e => updateData(null)}>
      Send to Back
    </button>)
};
export const actionBringToFront = {
    name: "bringToFront",
    perform: (elements, appState) => {
        return {
            elements: moveAllRight([...elements], getSelectedIndices(elements)),
            appState
        };
    },
    contextItemLabel: "Bring to Front",
    keyTest: event => event[META_KEY] && event.shiftKey && event.code === "KeyF",
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" type="button" onClick={e => updateData(null)}>
      Bring to Front
    </button>)
};
