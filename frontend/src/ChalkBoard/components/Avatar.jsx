import "./Avatar.scss";
import React from "react";
export const Avatar = ({ children, color, border, onClick }) => (<div className="Avatar" style={{ background: color, border: `1px solid ${border}` }} onClick={onClick}>
    {children}
  </div>);
