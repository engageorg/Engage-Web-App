import "./Island.scss";
import React from "react";
import clsx from "clsx";
export const Island = React.forwardRef(({ children, padding, className, style }, ref) => (<div className={clsx("Island", className)} style={{ "--padding": padding, ...style }} ref={ref}>
      {children}
    </div>));
