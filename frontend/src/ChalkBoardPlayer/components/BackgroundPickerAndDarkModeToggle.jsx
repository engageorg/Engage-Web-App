import React from "react";
export const BackgroundPickerAndDarkModeToggle = ({ appState, setAppState, actionManager, showThemeBtn, }) => (<div style={{ display: "flex" }}>
    {actionManager.renderAction("changeViewBackgroundColor")}
    {showThemeBtn && actionManager.renderAction("toggleTheme")}
  </div>);
