import { render, unmountComponentAtNode } from "react-dom";
import clsx from "clsx";
import { Popover } from "./Popover";
import { t } from "../i18n";
import "./ContextMenu.scss";
import { getShortcutFromShortcutName, } from "../actions/shortcuts";
const ContextMenu = ({ options, onCloseRequest, top, left, actionManager, appState, }) => {
    return (<Popover onCloseRequest={onCloseRequest} top={top} left={left} fitInViewport={true}>
      <ul className="context-menu" onContextMenu={(event) => event.preventDefault()}>
        {options.map((option, idx) => {
            if (option === "separator") {
                return <hr key={idx} className="context-menu-option-separator"/>;
            }
            const actionName = option.name;
            const label = option.contextItemLabel
                ? t(option.contextItemLabel)
                : "";
            return (<li key={idx} data-testid={actionName} onClick={onCloseRequest}>
              <button className={clsx("context-menu-option", {
                    dangerous: actionName === "deleteSelectedElements",
                    checkmark: option.checked?.(appState),
                })} onClick={() => actionManager.executeAction(option)}>
                <div className="context-menu-option__label">{label}</div>
                <kbd className="context-menu-option__shortcut">
                  {actionName
                    ? getShortcutFromShortcutName(actionName)
                    : ""}
                </kbd>
              </button>
            </li>);
        })}
      </ul>
    </Popover>);
};
const contextMenuNodeByContainer = new WeakMap();
const getContextMenuNode = (container) => {
    let contextMenuNode = contextMenuNodeByContainer.get(container);
    if (contextMenuNode) {
        return contextMenuNode;
    }
    contextMenuNode = document.createElement("div");
    container
        .querySelector(".excalidraw-contextMenuContainer")
        .appendChild(contextMenuNode);
    contextMenuNodeByContainer.set(container, contextMenuNode);
    return contextMenuNode;
};
const handleClose = (container) => {
    const contextMenuNode = contextMenuNodeByContainer.get(container);
    if (contextMenuNode) {
        unmountComponentAtNode(contextMenuNode);
        contextMenuNode.remove();
        contextMenuNodeByContainer.delete(container);
    }
};
export default {
    push(params) {
        const options = Array.of();
        params.options.forEach((option) => {
            if (option) {
                options.push(option);
            }
        });
        if (options.length) {
            render(<ContextMenu top={params.top} left={params.left} options={options} onCloseRequest={() => handleClose(params.container)} actionManager={params.actionManager} appState={params.appState}/>, getContextMenuNode(params.container));
        }
    },
};
