import React, { useState } from "react";
export const Panel = ({ title, children, defaultCollapsed = false, hide = false }) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    if (hide)
        return null;
    return (<div className="panel">
      <h4>{title}</h4>
      <button className="btn-panel-collapse" id = "chalkboard_button" type="button" onClick={e => {
        e.preventDefault();
        setCollapsed(collapsed => !collapsed);
    }}>
        {<span className={`btn-panel-collapse-icon ${collapsed ? "btn-panel-collapse-icon-closed" : ""}`}>
            ▼
          </span>}
      </button>
      {!collapsed && <div className="panelColumn">{children}</div>}
    </div>);
};
