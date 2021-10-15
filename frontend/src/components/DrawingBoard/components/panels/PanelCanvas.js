import React from "react";
import { Panel } from "../Panel";
export const PanelCanvas = ({ actionManager, elements, appState, syncActionResult }) => {
    return (<Panel title="Canvas">
      {actionManager.renderAction("changeViewBackgroundColor", elements, appState, syncActionResult)}

      {actionManager.renderAction("clearCanvas", elements, appState, syncActionResult)}
    </Panel>);
};
