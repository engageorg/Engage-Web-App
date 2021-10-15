import React from "react";
import { PanelTools } from "./panels/PanelTools";
import { Panel } from "./Panel";
import { PanelSelection } from "./panels/PanelSelection";
import { hasBackground, someElementIsSelected, hasStroke, hasText, exportCanvas } from "../scene";
import { PanelCanvas } from "./panels/PanelCanvas";
import { PanelExport } from "./panels/PanelExport";
export const SidePanel = ({ actionManager, syncActionResult, elements, onToolChange, appState, canvas }) => {
    return (<div className="sidePanel">
      <PanelTools activeTool={appState.elementType} onToolChange={value => {
        onToolChange(value);
    }}/>
      <Panel title="Selection" hide={!someElementIsSelected(elements)}>
        <PanelSelection actionManager={actionManager} syncActionResult={syncActionResult} elements={elements} appState={appState}/>

        {actionManager.renderAction("changeStrokeColor", elements, appState, syncActionResult)}

        {hasBackground(elements) && (<>
            {actionManager.renderAction("changeBackgroundColor", elements, appState, syncActionResult)}

            {actionManager.renderAction("changeFillStyle", elements, appState, syncActionResult)}
          </>)}

        {hasStroke(elements) && (<>
            {actionManager.renderAction("changeStrokeWidth", elements, appState, syncActionResult)}

            {actionManager.renderAction("changeSloppiness", elements, appState, syncActionResult)}
          </>)}

        {hasText(elements) && (<>
            {actionManager.renderAction("changeFontSize", elements, appState, syncActionResult)}

            {actionManager.renderAction("changeFontFamily", elements, appState, syncActionResult)}
          </>)}

        {actionManager.renderAction("changeOpacity", elements, appState, syncActionResult)}

        {actionManager.renderAction("deleteSelectedElements", elements, appState, syncActionResult)}
      </Panel>
      <PanelCanvas actionManager={actionManager} syncActionResult={syncActionResult} elements={elements} appState={appState}/>
      <PanelExport actionManager={actionManager} syncActionResult={syncActionResult} elements={elements} appState={appState} onExportCanvas={(type) => exportCanvas(type, elements, canvas, appState)}/>
    </div>);
};
