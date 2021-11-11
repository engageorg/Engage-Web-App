import "./FixedSideContainer.scss";
import React from "react";
import clsx from "clsx";
export const FixedSideContainer = ({ children, side, className, }) => (<div className={clsx("FixedSideContainer", `FixedSideContainer_side_${side}`, className)}>
    {children}
  </div>);
