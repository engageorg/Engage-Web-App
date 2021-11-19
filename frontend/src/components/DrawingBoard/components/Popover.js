import React from "react";
export function Popover({ children, left, onCloseRequest, top }) {
    return (<div className="popover" style={{ top: top, left: left }}>
      <div className="cover" onClick={onCloseRequest} onContextMenu={e => {
        e.preventDefault();
        if (onCloseRequest)
            onCloseRequest();
    }}/>
      {children}
    </div>);
}
