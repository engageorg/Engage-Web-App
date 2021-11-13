import React from "react";
import clsx from "clsx";
import { checkIcon } from "./icons";
import "./CheckboxItem.scss";
export const CheckboxItem = ({ children, checked, onChange }) => {
    return (<div className={clsx("Checkbox", { "is-checked": checked })} onClick={(event) => {
            onChange(!checked);
            event.currentTarget.querySelector(".Checkbox-box").focus();
        }}>
      <button className="Checkbox-box" role="checkbox" aria-checked={checked}>
        {checkIcon}
      </button>
      <div className="Checkbox-label">{children}</div>
    </div>);
};
