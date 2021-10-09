import React, { useEffect, useLayoutEffect, useState} from 'react';
import rough from 'roughjs/bundled/rough.esm'
import getStroke from 'perfect-freehand';
import "./style.css";

//A generator is a readonly property that lets you create a drawable object for a shape that can be later used with the draw method.
const generator = rough.generator()

function DrawingBoard() {

  const [elements, setElementState] = useState([])
  const [fill, setFill] = useState('transparent')
  const [fillStyle, setFillStyle] = useState('solid')
  const [strokeColor, setStrokeColor] = useState('black')
  const [strokeWidth ,setStrokeWidth] = useState('1')
  const [elementType ,setTool] = useState('selection')
  const [action, setAction] = useState('none')
  const [selectedElement, setSelectedElement] =useState('none')
  const [points, setPoints] = useState([]);


  function createElement(id, x1,y1,x2,y2,type, fill="transparent", fillStyle="solid", stroke="black", strokeWidth=2) {
    let roughElement
    switch (type) {
      case "line":
        roughElement = generator.line(x1,y1,x2,y2, {strokeWidth:strokeWidth, stroke:stroke})
        return {id, x1, y1, x2, y2, type,roughElement}
        case "arrow":
          roughElement = generator.line(x1,y1,x2,y2, {strokeWidth:strokeWidth, stroke:stroke})
          return {id, x1, y1, x2, y2, type,roughElement}  
        case "rectangle":
        roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1, {fill: fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth })
        return {id, x1, y1, x2, y2, type,roughElement}
        case "circle":
        const a = {x:x1, y:y1}
        const b = {x:x2, y:y2}
        const diameter = Math.round(distance(a,b))
        roughElement = generator.circle(Math.round((x1+x2)/2),Math.round((y1+y2)/2),diameter, {fill:fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth})
        return {id, x1, y1, x2, y2, type,roughElement}
        case "pencil":
        return {id,type, points:[{x:x1,y:y1}]}
      default:
        throw new Error(`Type not recognised`)
      }
  }

  const updateElement = (id,x1,y1, x2, y2, type, fill, fillStyle, stroke,strokeWidth) => {
    // const updatedElement = createElement(id,x1,y1,x2,y2,type, fill, fillStyle, stroke,strokeWidth)
    //console.log(type)
    const elementsCopy = [...elements]
    switch(type){
      case "line":
      case "rectangle":
      case "circle":
      case "arrow":
        const updatedElement = createElement(id,x1,y1,x2,y2,type, fill, fillStyle, stroke,strokeWidth)
        elementsCopy[id] = updatedElement
        break;
      case "pencil":
        //when updating for pencil copy the previous points and add new ones to assign them to points object
        elementsCopy[id].points  = [...elementsCopy[id].points, {x:x2,y:y2}]
        break;
      default:
        throw new Error('Type not recognised') 
    }
    setElementState(elementsCopy)
  }

  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const nearPoint = (x,y,x1,y1,name) => {
    return Math.abs(x-x1) < 5 && Math.abs(y-y1) < 5 ? name : null 
  }

  const onLine = (x1,y1,x2,y2,x,y, maxDistance=1) => {
    const a = {x:x1, y:y1}
    const b = {x:x2, y:y2}
    const c = {x, y}
    const offset = distance(a,b) - (distance(a,c) + distance(b,c))
    return Math.abs(offset) < maxDistance ? "inside" : null
  }

  const positionWithinElement = (x,y,element) => {
    const {type,x1,x2,y1,y2} = element
    if(type === "line"){
      const on = onLine(x1,y1,x2,y2,x,y)
      const start = nearPoint(x,y,x1,y1,"start")
      const end = nearPoint(x,y,x2,y2, "end")
      return start || end || on
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
        //console.log(offset, radius)
        return "circumference"
      }else{
        return null
      }
    }else if(type==="pencil"){
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index+1]
        if(!nextPoint) return false // if only one point
        //think of the two points forming a line then check how far is the user click
        return onLine(point.x, point.y,nextPoint.x,nextPoint.y, x,y) !== null
      })
      return betweenAnyPoint ?"inside": null
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
      if((x1<x2 || x1 === x2 )&& y1<y2){
        return {x1,y1,x2,y2}
      }else{
        return {x1:x2,y1:y2,x2:x1,y2:y1}
      }
    }
  }

    //The function below will turn the points returned by getStroke into SVG path data.
    const getSvgPathFromStroke = (stroke) => {
      if (!stroke.length) return ''
    
      const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
          const [x1, y1] = arr[(i + 1) % arr.length]
          acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
          return acc
        },
        ['M', ...stroke[0], 'Q']
      )
    
      d.push('Z')
      return d.join(' ')
    }

  function drawElement(roughCanvas, context, element) {
    switch (element.type) {
      case "line":
      case "rectangle":
      case "circle":
        roughCanvas.draw(element.roughElement)
      break
      case "pencil":
        //getStroke returns an array of points representing the outline of a stroke
        const stroke = getSvgPathFromStroke(getStroke(element.points, {
          size:5
        }))
        //The Path2D interface of the Canvas 2D API is used to declare a path that can then be used on a CanvasRenderingContext2D object
        context.fill(new Path2D(stroke))
        break;
      case "arrow":
        roughCanvas.draw(element.roughElement)
        //console.log(element)
        // if(element.x1 !== element.x2 || element.y1 !== element.y2)
        if(element.y2>element.y1+10){
          roughCanvas.line(element.x2,element.y2, element.x2-20, element.y2-30, {strokeWidth:strokeWidth})
          roughCanvas.line(element.x2,element.y2, element.x2+20, element.y2-30, {strokeWidth:strokeWidth})
        }
        else if(element.y2<element.y1){
          roughCanvas.line(element.x2,element.y2, element.x2-20, element.y2+30, {strokeWidth:strokeWidth})
          roughCanvas.line(element.x2,element.y2, element.x2+20, element.y2+30, {strokeWidth:strokeWidth})
        }
        else if(element.x2>=element.x1){
          console.log("THUIS CASE")
          roughCanvas.line(element.x2,element.y2, element.x2-30, element.y2-20, {strokeWidth:strokeWidth})
          roughCanvas.line(element.x2,element.y2, element.x2-30, element.y2+20, {strokeWidth:strokeWidth})
        }
        else if(element.x1>element.x2){
          //console.log("THUIS CASE")
          roughCanvas.line(element.x2,element.y2, element.x2+30, element.y2-20, {strokeWidth:strokeWidth})
          roughCanvas.line(element.x2,element.y2, element.x2+30, element.y2+20, {strokeWidth:strokeWidth})
        }
        break;
        default:
          throw new Error (`Type not recognised ${element.type}`)
    }
  }
  
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas)
    elements.forEach(element => drawElement(roughCanvas, context, element))
  }, [elements])//run if elements state changes
  
  useEffect(() => {
    const fill = document.getElementById("fill")
    const stroke = document.getElementById("stroke")
    const strokeWidth = document.getElementById("strokeWidth")
    const fillStyle = document.getElementById("fillStyle")

    if(elementType !== "selection"){
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
    }
   
  },[])

  const handleMouseDown = (event) => {
    //starting coordinates of the line 
    const {clientX, clientY} = event

    if(elementType === "selection"){
      if(elements.length !== 0){
      //return the element at the position we we clicked
      const element = getElementAtPosition(clientX, clientY, elements)
      //if there is a element as the clicked position
      if(element){
        if(element.type === "pencil"){
          const xOffsets = element.points.map(point => clientX - point.x);
          const yOffsets = element.points.map(point => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        }else{
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }

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
    }
    }else{
      const id = elements.length
      const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
      //add new element in the elements state
      setElementState(prevState => [...prevState, element])
      let data
      if(element.type === "pencil"){
        data = {
          id:id,
          clientX:clientX,
          clientY:clientY,
          type:elementType,
        }
      }else{
        data = {
          id:id,
          clientX:clientX,
          clientY:clientY,
          type:elementType,
          fill:fill,
          fillStyle:fillStyle,
          strokeColor:strokeColor,
          strokeWidth:strokeWidth
        };
      }
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
    if(elementType === "selection"){
      if(elements.length !== 0){
        const element = getElementAtPosition(clientX, clientY, elements)
        event.target.style.cursor = element ? cursorForPosition(element.position) : "default"
      }
    }
 
    if(action === "drawing"){
    const index = elements.length-1
    const {x1,y1} = elements[index]
    //console.log(x1,y1) undefined in case of pencil element
    updateElement(index,x1,y1, clientX, clientY, elementType, fill, fillStyle, strokeColor,strokeWidth)
    let data
    if(elements[index].type === "pencil"){
     // console.log(elements[index])
      data={
        id:index,
        clientX:clientX,
        clientY:clientY,
        type:elementType
      }
    }else{
      data = {
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
      }
    }
    //if(elements[index].type !== "pencil"){
      //creating a custom like predefined events like click or mousemove and more
      const event = new CustomEvent("drawing", { detail: data });
      //dispatching the event in document.documentElement where we listen for it in while recording
      document.documentElement.dispatchEvent(event);
    //}
    }else if(action==="moving"){
      if(selectedElement.type === "pencil"){
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id].points = newPoints
        setElementState(elementsCopy, true);
      }else{
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
      }
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
      updateElement(id,x1,y1,x2,y2,type, fill, fillStyle, strokeColor,strokeWidth)
    }
  }

  const adjustmentRequired = type => ["line", "rectangle","circle"].includes(type);

  const handleMouseUp = () => {
    if(elements.length !== 0){
    if(selectedElement){
      const index = selectedElement.id
      const {id, type} = elements[index]
      if ((action === "drawing" || action === "resizing") && adjustmentRequired(type)) {
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
  }
    setAction('none')
    setSelectedElement(null)
  }
  
  return (
    <div>
        <div className="drawOptions">
          <div className="allOptions">
              <div className="shapesOptions">
                <div>
                 <input type="radio" id="selection" checked = {elementType==="selection"} onChange={() => setTool("selection")}/>
                 <label htmlFor="selection"><svg viewBox="0 0 320 512" class=""><path d="M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z"></path></svg></label>
                </div>

                <div>
                 <input type="radio" id="line" checked = {elementType==="line"} onChange={() => setTool("line")}/>
                 <label htmlFor="line"><svg viewBox="0 0 6 6"><line x1="0" y1="3" x2="6" y2="3" stroke="currentColor" stroke-linecap="round"></line></svg></label>
                </div>

                <div>
                 <input type="radio" id="rectangle" checked = {elementType==="rectangle"} onChange={() => setTool("rectangle")}/>
                 <label htmlFor="rectangle"><svg viewBox="0 0 448 512"><path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z"></path></svg></label>
                </div>

                <div>
                 <input type="radio" id="circle" checked={elementType==="circle"} onChange={() => setTool("circle")}/>
                 <label htmlFor="circle"><svg viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></label>
                </div>
 
                <div>
                 <input type="radio" id="pencil" checked={elementType==="pencil"} onChange={() => setTool("pencil")}/>
                 <label htmlFor="pencil"><svg viewBox="0 0 512 512"><path fill="currentColor" d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z"></path></svg></label>
                </div>

                <div>
                 <input type="radio" id="arrow" checked={elementType==="arrow"} onChange={() => setTool("arrow")}/>
                 <label htmlFor="arrow"><svg viewBox="0 0 448 512" class="rtl-mirror"><path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z"></path></svg></label>
                </div>
              </div>
        
             {elementType !== "selection" ? <div className="styleCard">
                  <div>
                    Fill
                    <select id="fill">
                      <option>transparent</option>
                      <option>red</option>
                      <option>green</option>
                      <option>yellow</option>
                      items<option>coral</option>
                    </select>
                  </div>
                  <div>
                    FillStyle
                  <select id="fillStyle">
                    <option>solid</option>
                    <option>hachure</option>
                    <option>dashed</option>
                    <option>ZigZag</option>
                  </select>
                  </div>
                  <div>
                    Stroke 
                  <select id="stroke">
                    <option>black</option>
                    <option>red</option>
                    <option>green</option>
                    <option>blue</option>
                    <option>yellow</option>
                  </select>
                  </div>
                  <div>
                   strokeWidth
                   <select id="strokeWidth">
                     <option>2</option>
                     <option>6</option>
                     <option>8</option>
                     <option>10</option>
                   </select>
                   </div>
              </div> : ""} 
                
        </div>
      </div>
     
     <main>
      <canvas id="canvas" 
      width={window.innerWidth} 
      height={window.innerHeight}
      onMouseDown = {handleMouseDown}
      onMouseMove = {handleMouseMove}
      onMouseUp = {handleMouseUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      ></canvas> 
      </main> 
    
    </div>  
  );
}

export default DrawingBoard;