import "./ToolIcon.scss";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useExcalidrawContainer } from "./App";
import { AbortError } from "../errors";
import Spinner from "./Spinner";
export const ToolButton = React.forwardRef((props, ref) => {
    const { id: excalId } = useExcalidrawContainer();
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const sizeCn = `ToolIcon_size_${props.size}`;
    const [isLoading, setIsLoading] = useState(false);
    const isMountedRef = useRef(true);
    const onClick = async (event) => {
        const ret = "onClick" in props && props.onClick?.(event);
        if (ret && "then" in ret) {
            try {
                setIsLoading(true);
                await ret;
            }
            catch (error) {
                if (!(error instanceof AbortError)) {
                    throw error;
                }
            }
            finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        }
    };
    useEffect(() => () => {
        isMountedRef.current = false;
    }, []);
    const lastPointerTypeRef = useRef(null);
    if (props.type === "button" || props.type === "icon") {
        return (<button className={clsx("ToolIcon_type_button", sizeCn, props.className, props.visible && !props.hidden
                ? "ToolIcon_type_button--show"
                : "ToolIcon_type_button--hide", {
                ToolIcon: !props.hidden,
                "ToolIcon--selected": props.selected,
                "ToolIcon--plain": props.type === "icon",
            })} data-testid={props["data-testid"]} hidden={props.hidden} title={props.title} aria-label={props["aria-label"]} type="button" onClick={onClick} ref={innerRef} disabled={isLoading}>
        {(props.icon || props.label) && (<div className="ToolIcon__icon" aria-hidden="true">
            {props.icon || props.label}
            {props.keyBindingLabel && (<span className="ToolIcon__keybinding">
                {props.keyBindingLabel}
              </span>)}
          </div>)}
        {props.showAriaLabel && (<div className="ToolIcon__label">
            {props["aria-label"]} {isLoading && <Spinner />}
          </div>)}
        {props.children}
      </button>);
    }
    return (<label className={clsx(`ToolIcon ${props.title}`, props.className)} title={props.title} onPointerDown={(event) => {
            lastPointerTypeRef.current = event.pointerType || null;
        }} onPointerUp={() => {
            requestAnimationFrame(() => {
                lastPointerTypeRef.current = null;
            });
        }}>
      <input className={`ToolIcon_type_radio ${sizeCn} ${props["aria-label"]}`} type="radio" name={props.name} aria-label={props["aria-label"]} aria-keyshortcuts={props["aria-keyshortcuts"]} data-testid={props["data-testid"]} id={`${excalId}-${props.id}`} onChange={() => {
            props.onChange?.({ pointerType: lastPointerTypeRef.current });
        }} checked={props.checked} ref={innerRef}/>
      <div className = {`ToolIcon__icon ${props["aria-label"]}`}>
        {props.icon}
        {props.keyBindingLabel && (<span className="ToolIcon__keybinding">{props.keyBindingLabel}</span>)}
      </div>
    </label>);
});
ToolButton.defaultProps = {
    visible: true,
    className: "",
    size: "medium",
};
