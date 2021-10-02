import React, {useLayoutEffect, useEffect, useState} from 'react';
import rough from 'roughjs/bundled/rough.esm'
import getStroke from 'perfect-freehand';

//A generator is a readonly property that lets you create a drawable object for a shape that can be later used with the draw method.
const generator = rough.generator()

function DrawingBoardPlayer(props) {
  const [elements, setElementState] = useState([])
  const [elementType ,setTool] = useState('')
  const [fill, setFill] = useState('transparent')
  const [fillStyle, setFillStyle] = useState('solid')
  const [strokeColor, setStrokeColor] = useState('black')
  const [strokeWidth ,setStrokeWidth] = useState('1')
  const [action, setAction] = useState('none')
  const [selectedElement, setSelectedElement] =useState('none')
  const [points, setPoints] = useState([]);

  function callFunctions(){
    if(props.event.type==="drawStart"){
        console.log(props.event)
        if(props.event.value.type==="rectangle"){console.log("rectangle draw")}
    }
  }

  function createElement(id, x1,y1,x2,y2,type, fill="transparent", fillStyle="solid", stroke="black", strokeWidth=2) {
    let roughElement
    switch (type) {
      case "line":
        roughElement = generator.line(x1,y1,x2,y2, {strokeWidth:strokeWidth, stroke:stroke})
        return {id, x1, y1, x2, y2, type,roughElement}
        case "rectangle":
        roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1, {fill: fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth })
        return {id, x1, y1, x2, y2, type,roughElement}
        case "circle":
        const a = {x:x1, y:y1}
        const b = {x:x2, y:y2}
        const diameter = distance(a,b)
        roughElement = generator.circle((x1+x2)/2,(y1+y2)/2,diameter, {fill:fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth})
        return {id, x1, y1, x2, y2, type,roughElement}
        case "pencil":
        return {id,type, points:[{x:x1,y:y1}]}
      default:
        throw new Error(`Type not recognised`)
      }
    // if(type === "line"){
    //   roughElement = generator.line(x1,y1,x2,y2, {strokeWidth:strokeWidth, stroke:stroke})
    // }
    // else if(type==="rectangle"){
    //   roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1, {fill: fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth })
    // }
    // else if(type === "circle"){
    //   const a = {x:x1, y:y1}
    //   const b = {x:x2, y:y2}
    //   const diameter = distance(a,b)
    //   roughElement = generator.circle((x1+x2)/2,(y1+y2)/2,diameter, {fill:fill, fillStyle:fillStyle, stroke:stroke, strokeWidth:strokeWidth})
    // }
    // return {id, x1, y1, x2, y2, type,roughElement}
  }

  const updateElement = (id,x1,y1, x2, y2, type, fill, fillStyle, stroke,strokeWidth) => {
    // const updatedElement = createElement(id,x1,y1,x2,y2,type, fill, fillStyle, stroke,strokeWidth)
    console.log(type)
    const elementsCopy = [...elements]
    switch(type){
      case "line":
      case "rectangle":
      case "circle":
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

  const positionWithinElement = (x,y,element) => {
    const {type,x1,x2,y1,y2} = element
    if(type === "line") {
      const a = {x:x1, y:y1}
      const b = {x:x2, y:y2}
      const c = {x, y}
      const offset = distance(a,b) - (distance(a,c) + distance(b,c))
      const start = nearPoint(x,y,x1,y1,"start")
      const end = nearPoint(x,y,x2,y2, "end")
      const inside = Math.abs(offset) < 1 ? 'inside':null
      return start || end || inside
    }else if(type === "rectangle") {
      const topLeft = nearPoint(x, y, x1, y1, "tl");
      const topRight = nearPoint(x, y, x2, y1, "tr");
      const bottomLeft = nearPoint(x, y, x1, y2, "bl");
      const bottomRight = nearPoint(x, y, x2, y2, "br");
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }

  }

  //return the element on which mousedown event was performed and map position of the  cursor within the element like inside on near the corner
  function getElementAtPosition(x,y,elements){
    return elements
    .map(element => ({...element, position:positionWithinElement(x,y,element)}))
    .find(element => element.position !== null)
  }

  const adjustElementCorrdinates = element => {
    const {type, x1,y1,x2,y2} = element
    if(type === "rectangle") {
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
      const line = document.getElementById("line")
      const rectangle = document.getElementById("rectangle")
      const circle = document.getElementById("circle")
      const selection = document.getElementById("selection")
      const pencil = document.getElementById("pencil")
      if(props.event.type === "drawStart") {
        if(props.event.value.type === "line"){
            line.click()
            const id = props.event.value.id
            const clientX = props.event.value.clientX
            const clientY = props.event.value.clientY
            const elementType = props.event.value.type
            const fill = props.event.value.fill
            const fillStyle = props.event.value.fillStyle
            const strokeColor = props.event.value.strokeColor
            const strokeWidth = props.event.value.strokeWidth
            console.log(id,clientX,clientY,clientX, clientY, elementType)
            const element = createElement(id,clientX,clientY,clientX,clientY, elementType, fill, fillStyle, strokeColor, strokeWidth);
            //add new element in the elements state
            setElementState(prevState => [...prevState, element])
        }
        if(props.event.value.type === "rectangle"){
            rectangle.click()
            const id = props.event.value.id
            const clientX = props.event.value.clientX
            const clientY = props.event.value.clientY
            const elementType = props.event.value.type
            const fill = props.event.value.fill
            const fillStyle = props.event.value.fillStyle
            const strokeColor = props.event.value.strokeColor
            const strokeWidth = props.event.value.strokeWidth
            console.log(id,clientX,clientY,clientX, clientY, elementType)
            const element = createElement(id,clientX,clientY,clientX,clientY, elementType,fill, fillStyle, strokeColor, strokeWidth);
            //add new element in the elements state
            setElementState(prevState => [...prevState, element])
        }
        if(props.event.value.type === "circle"){
          circle.click()
          const id = props.event.value.id
          const clientX = props.event.value.clientX
          const clientY = props.event.value.clientY
          const elementType = props.event.value.type
          const fill = props.event.value.fill
          const fillStyle = props.event.value.fillStyle
          const strokeColor = props.event.value.strokeColor
          const strokeWidth = props.event.value.strokeWidth
          console.log(id,clientX,clientY,clientX, clientY, elementType)
          const element = createElement(id,clientX,clientY,clientX,clientY, elementType,fill, fillStyle, strokeColor, strokeWidth);
          //add new element in the elements state
          setElementState(prevState => [...prevState, element])
        }
        if(props.event.value.type === "pencil"){
          pencil.click()
          const id = props.event.value.id
          const clientX = props.event.value.clientX
          const clientY = props.event.value.clientY
          const elementType = props.event.value.type
          //console.log(id,clientX,clientY,clientX, clientY, elementType)
          const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
          //add new element in the elements state
          setElementState(prevState => [...prevState, element])
        }
      }
      if(props.event.type === "drawing"){
        const index = elements.length-1
        const x1 = props.event.value.x1
        const y1 = props.event.value.y1
        const clientX = props.event.value.clientX
        const clientY = props.event.value.clientY
        const elementType = props.event.value.type
        updateElement(index,x1,y1, clientX, clientY, elementType)
        // //add new element in the elements state
        //setElementState(prevState => [...prevState, element])
      }

      if(props.event.type === "movingStart"){
        selection.click()
      }

      if(props.event.type === "moving"){
        const id = props.event.value.id
        const newX1= props.event.value.newX1
        const newY1 = props.event.value.newY1
        const newX2 = props.event.value.newX2
        const newY2 = props.event.value.newY2
        const type = props.event.value.type
        updateElement(id ,newX1, newY1,newX2, newY2, type)
      }
      if(props.event.type === "resizeStart") {
        selection.click()
      }

      if(props.event.type==="resizing"){
        const id = props.event.value.id
        const x1 = props.event.value.x1
        const y1 = props.event.value.y1
        const x2 = props.event.value.x2
        const y2 = props.event.value.y2
        const type = props.event.value.type
        const fill = props.event.value.fill
        const fillStyle = props.event.value.fillStyle
        const strokeColor = props.event.value.strokeColor
        const strokeWidth = props.event.value.strokeColor
        updateElement(id,x1,y1,x2,y2,type)
      }

      if(props.event.type === "drawEnd"){
        setAction('none')
        setSelectedElement(null)
      }
    
  }, [props.event])

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  }

  const handlePointerMove = (e) => {
    if (e.buttons !== 1) return;
    setPoints([...points, [e.pageX, e.pageY, e.pressure]]);
  }

  const handleMouseDown = (event) => {
    //starting coordinates of the line 
    const {clientX, clientY} = event

    if(elementType === "selection"){

      //return the element at the position we we clicked
      const element = getElementAtPosition(clientX, clientY, elements)
      
      //if there is a element as the clicked position
      if(element){
        const offsetX = clientX - element.x1
        const offsetY = clientY - element.y1
        setSelectedElement({...element, offsetX, offsetY})

        if(element.position === 'inside'){
          setAction("moving")
        }else{
          setAction('resize')
        }
      }
    }else{
      const id = elements.length
      const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
      //add new element in the elements state
      setElementState(prevState => [...prevState, element])
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
      default:
        return "move";
    }
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
    }else if(action==="moving"){
      const  {id ,x1, x2, y1, y2, type, offsetX, offsetY} = selectedElement
      const width = x2-x1
      const height = y2-y1

      //this is done to make sure x1 and y1 don't get changed to where mousedown event was performed
      const newX1 = clientX - offsetX
      const newY1 = clientY - offsetY
      updateElement(id ,newX1, newY1,newX1 + width, newY1+height, type)
    }else if(action === "resize"){
      const  {id ,type,position, ...coordiantes} = selectedElement
      const {x1,y1,x2,y2} = resizedCoordinates(clientX, clientY, position, coordiantes)
      updateElement(id,x1,y1,x2,y2,type)
    }
  }

  const adjustmentRequired = type => ["line", "rectangle","circle"].includes(type);

  const handleMouseUp = () => {
    if(selectedElement){
      const index = selectedElement.id
      const {id, type} = elements[index]
      if((action === "drawing" || action === "resizing") && adjustmentRequired(type)){
        const {x1,y1,x2,y2} = adjustElementCorrdinates(elements[index])
        updateElement(id, x1,y1,x2,y2,type)
      }
    }
    setAction('none')
    setSelectedElement(null)
  }
  
  return (
    <div>
      <div style={{position:"fixed"}}>
        <input type="radio" id="selection" checked={elementType==="selection"} onChange={() => setTool("selection")}/>
        <label htmlFor="selection">Selection</label>
        <input type="radio" id="line" checked={elementType==="line"} onChange={() => setTool("line")}/>
        <label htmlFor="line">line</label>
        <input type="radio" id="rectangle" checked={elementType==="rectangle"} onChange={() => setTool("rectangle")}/>
        <label htmlFor="rectangle">Rectangle</label>
        <input type="radio" id="circle" checked={elementType==="circle"} onChange={() => setTool("circle")}/>
        <label htmlFor="circle">Circle</label>
        <input type="radio" id="pencil" checked={elementType==="pencil"} onChange={() => setTool("pencil")}/>
        <label htmlFor="circle">Pencil</label>
      </div>
      <canvas id="canvas" 
      width={window.innerWidth} 
      height={window.innerHeight}
      onMouseDown = {handleMouseDown}
      onMouseMove = {handleMouseMove}
      onMouseUp = {handleMouseUp}
      ></canvas>  
    </div>  
  );
}

export default DrawingBoardPlayer;