import React, { useEffect, lazy } from "react";
import { Popover } from "./Popover";
const TwitterPicker = lazy(() => import(
/* webpackPrefetch: true */ "react-color/lib/components/twitter/Twitter"));
export function ColorPicker({ color, onChange }) {

    useEffect(() => {
       let allSpans = document.getElementsByTagName("span");
       var c = 6;
       for(let i = 0; i < allSpans.length; i++){
           
           let divs = allSpans[i].getElementsByTagName("div");
      
           if(divs[0] !== undefined){
              divs[0].className = c;
              c++;
           }

       }

    });
    const [isActive, setActive] = React.useState(false);
    return (<div>
      <button className="swatch" id = "chalkboard_button" style={color ? { backgroundColor: color } : undefined} onClick={() => setActive(!isActive)}/>
      <React.Suspense fallback="">
        {isActive ? (<Popover onCloseRequest={() => setActive(false)}>
            <TwitterPicker className = "colors" colors={[
        "#000000",
        "#ABB8C3",
        "#FFFFFF",
        "#FF6900",
        "#FCB900",
        "#00D084",
        "#8ED1FC",
        "#0693E3",
        "#EB144C",
        "#F78DA7",
        "#9900EF"
    ]} width="205px" color={color || undefined} onChange={changedColor => {
        onChange(changedColor.hex);
    }}/>
          </Popover>) : null}
      </React.Suspense>
      <input type="text" className="swatch-input" value={color || ""} onPaste={e => onChange(e.clipboardData.getData("text"))} onChange={e => onChange(e.target.value)}/>
    </div>);
}
