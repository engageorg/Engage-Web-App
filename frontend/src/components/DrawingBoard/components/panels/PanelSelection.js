import React from "react";
export const PanelSelection = ({ actionManager, elements, appState, syncActionResult }) => {
    return (<div>
      <div className="buttonList">
        {actionManager.renderAction("bringForward", elements, appState, syncActionResult)}
        {actionManager.renderAction("bringToFront", elements, appState, syncActionResult)}
        {actionManager.renderAction("sendBackward", elements, appState, syncActionResult)}
        {actionManager.renderAction("sendToBack", elements, appState, syncActionResult)}
      </div>
    </div>);
};
