import React from "react";
export class ActionManager {
    constructor() {
        this.actions = {};
        this.updater = null;
    }
    setUpdater(updater) {
        this.updater = updater;
    }
    registerAction(action) {
        this.actions[action.name] = action;
    }
    handleKeyDown(event, elements, appState) {
        const data = Object.values(this.actions)
            .sort((a, b) => (b.keyPriority || 0) - (a.keyPriority || 0))
            .filter(action => action.keyTest && action.keyTest(event, elements, appState));
        if (data.length === 0)
            return {};
        event.preventDefault();
        return data[0].perform(elements, appState, null);
    }
    getContextMenuItems(elements, appState, updater) {
        console.log(Object.values(this.actions)
            .filter(action => "contextItemLabel" in action)
            .map(a => ({ name: a.name, label: a.contextItemLabel })));
        return Object.values(this.actions)
            .filter(action => "contextItemLabel" in action)
            .sort((a, b) => (a.contextMenuOrder !== undefined ? a.contextMenuOrder : 999) -
            (b.contextMenuOrder !== undefined ? b.contextMenuOrder : 999))
            .map(action => ({
            label: action.contextItemLabel,
            action: () => {
                updater(action.perform(elements, appState, null));
            }
        }));
    }
    renderAction(name, elements, appState, updater) {
        if (this.actions[name] && "PanelComponent" in this.actions[name]) {
            const action = this.actions[name];
            const PanelComponent = action.PanelComponent;
            const updateData = (formState) => {
                updater(action.perform(elements, appState, formState));
            };
            return (<PanelComponent elements={elements} appState={appState} updateData={updateData}/>);
        }
        return null;
    }
}
