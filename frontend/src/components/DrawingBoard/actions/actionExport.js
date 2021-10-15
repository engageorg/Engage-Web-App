import React from "react";
import { EditableText } from "../components/EditableText";
import { saveAsJSON, loadFromJSON } from "../scene";
export const actionChangeProjectName = {
    name: "changeProjectName",
    perform: (elements, appState, value) => {
        return { appState: { ...appState, name: value } };
    },
    PanelComponent: ({ appState, updateData }) => (<>
      <h5>Name</h5>
      {appState.name && (<EditableText value={appState.name} onChange={(name) => updateData(name)}/>)}
    </>)
};
export const actionChangeExportBackground = {
    name: "changeExportBackground",
    perform: (elements, appState, value) => {
        return { appState: { ...appState, exportBackground: value } };
    },
    PanelComponent: ({ appState, updateData }) => (<label>
      <input type="checkbox" checked={appState.exportBackground} onChange={e => {
        updateData(e.target.checked);
    }}/>
      background
    </label>)
};
export const actionSaveScene = {
    name: "saveScene",
    perform: (elements, appState, value) => {
        saveAsJSON(elements, appState.name);
        return {};
    },
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" onClick={() => updateData(null)}>Save as...</button>)
};
export const actionLoadScene = {
    name: "loadScene",
    perform: (elements, appState, loadedElements) => {
        return { elements: loadedElements };
    },
    PanelComponent: ({ updateData }) => (<button id = "chalkboard_button" onClick={() => {
        loadFromJSON().then(({ elements }) => {
            updateData(elements);
        });
    }}>
      Load file...
    </button>)
};
