import "./UserList.scss";
import React from "react";
import clsx from "clsx";
export const UserList = ({ children, className, mobile }) => {
    return (<div className={clsx("UserList", className, { UserList_mobile: mobile })}>
      {children}
    </div>);
};
