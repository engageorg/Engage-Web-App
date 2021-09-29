import React, {useEffect, useLayoutEffect, useState} from 'react';
import rough from 'roughjs/bundled/rough.esm'
import { getStroke } from "perfect-freehand";

//A generator is a readonly property that lets you create a drawable object for a shape that can be later used with the draw method.
const generator = rough.generator()

// options for path and pencil of free draw
const options = {
  size: 5,
  thinning: 0.5,
  smoothing: 0.8,
  streamline: 0.8,
  easing: (t) => t,
  start: {
    taper: 1,
    easing: (t) => t,
    cap: true
  },
  end: {
    taper: 100,
    easing: (t) => t,
    cap: true
  }
};


// turns mouse x and y co-ordinates to svg path for drawing 
function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ""

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ["M", ...stroke[0], "Q"]
  )

  d.push("Z")
  return d.join(" ")
}

function ExcaliClone() {

  const [elements, setElementState] = useState([])
  const [fill, setFill] = useState('transparent')
  const [fillStyle, setFillStyle] = useState('hachure')
  const [strokeColor, setStrokeColor] = useState('black')
  const [strokeWidth ,setStrokeWidth] = useState('1')
  const [elementType ,setTool] = useState('')
  const [action, setAction] = useState('none')
  const [selectedElement, setSelectedElement] =useState('none')
  const [points, setPoints] = useState([]);


  function createElement(id, x1,y1,x2,y2,type, fill="transparent", fillStyle="solid", stroke="black", strokeWidth=2) {
    let roughElement
    if(type === "line"){
      roughElement = generator.line(x1,y1,x2,y2, {strokeWidth:strokeWidth, stroke:stroke})
    }
    else if(type==="rectangle"){
      roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1, {fill: fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth })
    }
    else if(type === "circle"){
      const a = {x:x1, y:y1}
      const b = {x:x2, y:y2}
      const diameter = distance(a,b)
      roughElement = generator.circle((x1+x2)/2,(y1+y2)/2,diameter, {fill:fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth})
    }
    return {id, x1, y1, x2, y2, type,roughElement}
  }

  const updateElement = (id,x1,y1, x2, y2, type, fill, fillStyle, stroke,strokeWidth) => {
    const updatedElement = createElement(id,x1,y1,x2,y2,type, fill, fillStyle, stroke,strokeWidth)
    
    const elementsCopy = [...elements]
    elementsCopy[id] = updatedElement
    setElementState(elementsCopy)
  }

  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const nearPoint = (x,y,x1,y1,name) => {
    return Math.abs(x-x1) < 5 && Math.abs(y-y1) < 5 ? name : null 
  }

  const positionWithinElement = (x,y,element) => {
    const {type,x1,x2,y1,y2} = element
    if(type === "line"){
      const a = {x:x1, y:y1}
      const b = {x:x2, y:y2}
      const c = {x, y}
      const offset = distance(a,b) - (distance(a,c) + distance(b,c))
      const start = nearPoint(x,y,x1,y1,"start")
      const end = nearPoint(x,y,x2,y2, "end")
      const inside = Math.abs(offset) < 1 ? 'inside':null
      return start || end || inside
    }else if(type === "rectangle"){
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }
    else if(type==="circle"){
      const a = {x:x1, y:y1}
      const b = {x:x2, y:y2}
      const radius = distance(a,b)/2
      const c = {x:(x1+x2)/2, y:(y1+y2)/2}
      const d = {x, y}
      const offset = distance(c,d)
      if(offset<radius){
        return "inside"
      }else if(offset>radius && offset-radius<3){
        console.log(offset, radius)
        return "circumference"
      }else{
        return null
      }
    }
  }

  //return the element on which mousedown event was performed and map position of the cursor within the element like inside on near the corner
  function getElementAtPosition(x,y,elements){
    return elements
    .map(element => ({...element, position:positionWithinElement(x,y,element)}))
    .find(element => element.position !== null)
  }

  const adjustElementCorrdinates = element => {
    const {type, x1,y1,x2,y2} = element
    if(type === "rectangle"){
      const minX = Math.min(x1,x2)
      const maxX = Math.max(x1,x2)
      const minY = Math.min(y1,y2) 
      const maxY = Math.max(y1,y2)
      return {x1:minX, y1:minY, x2:maxX ,y2:maxY }
    }else {
      if(x1<x2 || x1 === x2 && y1<y2){
        return {x1,y1,x2,y2}
      }else{
        return {x1:x2,y1:y2,x2:x1,y2:y1}
      }
    }
  }

  const stroke = getStroke(points, options);
  const pathData = getSvgPathFromStroke(stroke);
  
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    //The clearRect() method clears the specified pixels within a given rectangle.
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const roughCanvas = rough.canvas(canvas)
    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))
  }, [elements])
  
  useEffect(() => {
    const fill = document.getElementById("fill")
    const stroke = document.getElementById("stroke")
    const strokeWidth = document.getElementById("strokeWidth")
    const fillStyle = document.getElementById("fillStyle")
    //const fillStyle = document.getElementById("fillStyle")
     fill.addEventListener("change", () => {
       setFill(fill.value)
     })

     fillStyle.addEventListener("change", () => {
       setFillStyle(fillStyle.value)
     })

     stroke.addEventListener("change", () => {
       setStrokeColor(stroke.value)
     })

     strokeWidth.addEventListener("change", () => {
       setStrokeWidth(strokeWidth.value)
     })
  },[])

  const handleMouseDown = (event) => {
    //starting coordinates of the line 
    const {clientX, clientY} = event

    if(elementType === "selection"){

      //return the element at the position we we clicked
      const element = getElementAtPosition(clientX, clientY, elements)
      console.log(element)
      //if there is a element as the clicked position
      if(element){
        const offsetX = clientX - element.x1
        const offsetY = clientY - element.y1
        setSelectedElement({...element, offsetX, offsetY})

        if(element.position === 'inside') {
          setAction("moving")
          const data = {
            element:element,
            fill:fill,
            fillStyle:fillStyle,
            strokeColor:strokeColor,
            strokeWidth:strokeWidth
          };
          const event = new CustomEvent("movingStart", { detail: data });
          document.documentElement.dispatchEvent(event);
        }
        else{
          setAction('resize')
          const data = {
            element:element,
            fill:fill,
            fillStyle:fillStyle,
            strokeColor:strokeColor,
            strokeWidth:strokeWidth
          }
          const event = new CustomEvent("resizeStart", { detail: data });
          document.documentElement.dispatchEvent(event);
        }
      }
    }else{
      const id = elements.length
      console.log(elementType)
      const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
      
      //add new element in the elements state
      setElementState(prevState => [...prevState, element])
      const data = {
        id:id,
        clientX:clientX,
        clientY:clientY,
        type:elementType,
        fill:fill,
        fillStyle:fillStyle,
        strokeColor:strokeColor,
        strokeWidth:strokeWidth
      };
      //creating a custom like predefined events like click or mousemove and more
      const event = new CustomEvent("drawStart", { detail: data });
      //dispatching the event in document.documentElement where we listen for it in while recording
      document.documentElement.dispatchEvent(event);
      setSelectedElement(element)
      setAction('drawing')
    }
  }

  const resizedCoordinates = (clientX, clientY, position, coordiantes) => {
    const {x1,y1,x2,y2} = coordiantes
    switch (position) {
      case "tl":
      case "start":
        return { x1: clientX, y1: clientY, x2, y2 };
      case "tr":
        return { x1, y1: clientY, x2: clientX, y2 };
      case "bl":
        return { x1: clientX, y1, x2, y2: clientY };
      case "br":
      case "end":
        return { x1, y1, x2: clientX, y2: clientY };
      case "circumference":
        return {x1:clientX,y1:clientY,x2, y2}
      default:
        return null; //should not really get here...
    }
  }

  //this function return the cursor type based on where it is
  const cursorForPosition = position => {
    switch (position) {
      case "tl":
      case "br":
      case "start":
      case "end":
        return "nwse-resize";
      case "tr":
      case "bl":
        return "nesw-resize";
      case "circumference":
        return "nesw-resize"
      default:
        return "move";
    }
  }


  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  }

  const handlePointerMove = (e) => {
    if (e.buttons !== 1) return;
    setPoints([...points, [e.pageX, e.pageY, e.pressure]]);
  }

  const handleMouseMove = (event) => {
    //coordinates while the mouse is moving
    const {clientX, clientY} = event

    //if the action is 
    if(elementType === "selection"){
      const element = getElementAtPosition(clientX, clientY, elements)
      event.target.style.cursor = element ? cursorForPosition(element.position) : "default"
    }
 
    if(action === "drawing"){
    const index = elements.length-1
    const {x1,y1} = elements[index]
    updateElement(index,x1,y1, clientX, clientY, elementType, fill, fillStyle, strokeColor,strokeWidth)
    const data = {
        id:index,
        x1:x1,
        y1:y1,
        clientX:clientX,
        clientY:clientY,
        type:elementType,
        fill:fill,
        fillStyle:fillStyle,
        strokeColor:strokeColor,
        strokeWidth:strokeWidth
      };
      //creating a custom like predefined events like click or mousemove and more
      const event = new CustomEvent("drawing", { detail: data });
      //dispatching the event in document.documentElement where we listen for it in while recording
      document.documentElement.dispatchEvent(event);
    }else if(action==="moving"){
      const  {id ,x1, x2, y1, y2, type, offsetX, offsetY} = selectedElement
      const width = x2-x1
      const height = y2-y1

      //this is done to make sure x1 and y1 don't get changed to where mousedown event was performed
      const newX1 = clientX - offsetX
      const newY1 = clientY - offsetY
      updateElement(id ,newX1, newY1,newX1 + width, newY1+height, type, fill, fillStyle, strokeColor,strokeWidth)
      const data = {
        id:id,
        newX1:newX1,
        newY1:newY1,
        newX2:newX1+width,
        newY2:newY1+height,
        type:type,
        fill:fill,
        fillStyle:fillStyle,
        strokeColor:strokeColor,
        strokeWidth:strokeWidth
      };
      //creating a custom like predefined events like click or mousemove and more
      const event = new CustomEvent("moving", { detail: data });
      //dispatching the event in document.documentElement where we listen for it in while recording
      document.documentElement.dispatchEvent(event);

    }else if(action === "resize"){
      const  {id ,type,position, ...coordiantes} = selectedElement
      const {x1,y1,x2,y2} = resizedCoordinates(clientX, clientY, position, coordiantes)
      const data = {
        id:id,
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        type:type,
        fill:fill,
        fillStyle:fillStyle,
        strokeColor:strokeColor,
        strokeWidth:strokeWidth
      }

      const event = new CustomEvent("resizing", {detail:data})
      document.documentElement.dispatchEvent(event)
      updateElement(id,x1,y1,x2,y2,type, fill, fillStyle, stroke,strokeWidth)
    }
  }

  const handleMouseUp = () => {
    if(selectedElement){
      const index = selectedElement.id
      const {id, type} = elements[index]
      if(action === "drawing"){
        const {x1,y1,x2,y2} = adjustElementCorrdinates(elements[index])
        updateElement(id, x1,y1,x2,y2,type, fill, fillStyle, strokeColor,strokeWidth)
        const data = {
            id:index,
            x1:x1,
            y1:y1,
            x2:x2,
            y2:y2,
            type:type,
            fill:fill,
            fillStyle:fillStyle,
            strokeColor:strokeColor,
            strokeWidth:strokeWidth
          };
          //creating a custom like predefined events like click or mousemove and more
          const event = new CustomEvent("drawEnd", { detail: data });
          //dispatching the event in document.documentElement where we listen for it in while recording
          document.documentElement.dispatchEvent(event);
      }
    }
    setAction('none')
    setSelectedElement(null)
  }
  
  return (
    <div>
      <div style={{position:"fixed"}}>
        <input type="radio" id="selection" checked = {elementType==="selection"} onChange={() => setTool("selection")}/>
        <label htmlFor="selection">Selection</label>
        <input type="radio" id="line" checked = {elementType==="line"} onChange={() => setTool("line")}/>
        <label htmlFor="line">line</label>
        <input type="radio" id="rectangle" checked = {elementType==="rectangle"} onChange={() => setTool("rectangle")}/>
        <label htmlFor="rectangle">Rectangle</label>
        <input type="radio" id="circle" checked={elementType==="circle"} onChange={() => setTool("circle")}/>
        <label htmlFor="circle">Circle </label>
        Fill
        <select id="fill">
          <option>Red</option>
          <option>Green</option>
          <option>Yellow</option>
          <option>Coral</option>
        </select>
        FillStyle
        <select id="fillStyle">
          <option>solid</option>
          <option>hachure</option>
          <option>dashed</option>
          <option>ZigZag</option>
        </select>

        Stroke 
        <select id="stroke">
          <option>Black</option>
          <option>Red</option>
          <option>Green</option>
          <option>Blue</option>
          <option>Yello</option>
        </select>
        strokeWidth
        <select id="strokeWidth">
          <option>2</option>
          <option>6</option>
          <option>10</option>
        </select>
      </div>
      <canvas id="canvas" 
      width={window.innerWidth} 
      height={window.innerHeight}
      onMouseDown = {handleMouseDown}
      onMouseMove = {handleMouseMove}
      onMouseUp = {handleMouseUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      ></canvas>  
    </div>  
  );
}

export default ExcaliClone;