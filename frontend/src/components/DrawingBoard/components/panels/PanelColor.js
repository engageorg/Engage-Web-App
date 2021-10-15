import React from "react";
import { ColorPicker } from "../ColorPicker";
export const PanelColor = ({ title, onColorChange, colorValue }) => {
    return (<>
      <h5>{title}</h5>
      <ColorPicker color={colorValue} onChange={color => onColorChange(color)}/>
    </>);
};
