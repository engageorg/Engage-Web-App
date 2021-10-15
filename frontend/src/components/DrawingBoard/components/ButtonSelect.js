import React from "react";
export function ButtonSelect({ options, value, onChange }) {
    return (<div className="buttonList">
      {options.map(option => (<button id = "chalkboard_button" key={option.text} onClick={() => onChange(option.value)} className={value === option.value ? "active" : ""}>
          {option.text}
        </button>))}
    </div>);
}
