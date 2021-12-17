import "./TextInput.scss";
import React, { useState } from "react";
import { focusNearestParent } from "../utils";
import "./ProjectName.scss";
import { useExcalidrawContainer } from "./App";
export const ProjectName = (props) => {
    const { id } = useExcalidrawContainer();
    const [fileName, setFileName] = useState(props.value);
    const handleBlur = (event) => {
        focusNearestParent(event.target);
        const value = event.target.value;
        if (value !== props.value) {
            props.onChange(value);
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
            }
            event.currentTarget.blur();
        }
    };
    return (<div className="ProjectName">
      <label className="ProjectName-label" htmlFor="filename">
        {`${props.label}${props.isNameEditable ? "" : ":"}`}
      </label>
      {props.isNameEditable ? (<input type="text" className="TextInput" onBlur={handleBlur} onKeyDown={handleKeyDown} id={`${id}-filename`} value={fileName} onChange={(event) => setFileName(event.target.value)}/>) : (<span className="TextInput TextInput--readonly" id={`${id}-filename`}>
          {props.value}
        </span>)}
    </div>);
};
