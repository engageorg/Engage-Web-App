import "./Modal.scss";
import React, { useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { KEYS } from "../keys";
import { useExcalidrawContainer, useIsMobile } from "./App";
import { THEME } from "../constants";
export const Modal = (props) => {
    const { theme = THEME.LIGHT } = props;
    const modalRoot = useBodyRoot(theme);
    if (!modalRoot) {
        return null;
    }
    const handleKeydown = (event) => {
        if (event.key === KEYS.ESCAPE) {
            event.nativeEvent.stopImmediatePropagation();
            event.stopPropagation();
            props.onCloseRequest();
        }
    };
    return createPortal(<div className={clsx("Modal", props.className)} role="dialog" aria-modal="true" onKeyDown={handleKeydown} aria-labelledby={props.labelledBy}>
      <div className="Modal__background" onClick={props.onCloseRequest}></div>
      <div className="Modal__content" style={{ "--max-width": `${props.maxWidth}px` }} tabIndex={0}>
        {props.children}
      </div>
    </div>, modalRoot);
};
const useBodyRoot = (theme) => {
    const [div, setDiv] = useState(null);
    const isMobile = useIsMobile();
    const isMobileRef = useRef(isMobile);
    isMobileRef.current = isMobile;
    const { container: excalidrawContainer } = useExcalidrawContainer();
    useLayoutEffect(() => {
        if (div) {
            div.classList.toggle("excalidraw--mobile", isMobile);
        }
    }, [div, isMobile]);
    useLayoutEffect(() => {
        const isDarkTheme = !!excalidrawContainer?.classList.contains("theme--dark") ||
            theme === "dark";
        const div = document.createElement("div");
        div.classList.add("excalidraw", "excalidraw-modal-container");
        div.classList.toggle("excalidraw--mobile", isMobileRef.current);
        if (isDarkTheme) {
            div.classList.add("theme--dark");
            div.classList.add("theme--dark-background-none");
        }
        document.body.appendChild(div);
        setDiv(div);
        return () => {
            document.body.removeChild(div);
        };
    }, [excalidrawContainer, theme]);
    return div;
};
