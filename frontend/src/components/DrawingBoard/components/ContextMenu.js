import React from "react";
import { Popover } from "./Popover";
import { render, unmountComponentAtNode } from "react-dom";
import "./ContextMenu.css";
function ContextMenu({ options, onCloseRequest, top, left }) {
    return (<Popover onCloseRequest={onCloseRequest} top={top} left={left}>
      <ul className="context-menu" onContextMenu={e => e.preventDefault()}>
        {options.map((option, idx) => (<li key={idx} className="context-menu__option" onClick={onCloseRequest}>
            <ContextMenuOption {...option}/>
          </li>))}
      </ul>
    </Popover>);
}
function ContextMenuOption({ label, action }) {
    return (<button className="context-menu-option" onClick={action}>
      {label}
    </button>);
}
let contextMenuNode;
function getContextMenuNode() {
    if (contextMenuNode) {
        return contextMenuNode;
    }
    const div = document.createElement("div");
    document.body.appendChild(div);
    return (contextMenuNode = div);
}
function handleClose() {
    unmountComponentAtNode(getContextMenuNode());
}
export default {
    push(params) {
        const options = Array.of();
        params.options.forEach(option => {
            if (option) {
                options.push(option);
            }
        });
        if (options.length) {
            render(<ContextMenu top={params.top} left={params.left} options={options} onCloseRequest={handleClose}/>, getContextMenuNode());
        }
    }
};
