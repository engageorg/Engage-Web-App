import React, {useLayoutEffect, useEffect, useState} from 'react';
import rough from 'roughjs/bundled/rough.esm'
import { createElement } from 'react';

//A generator is a readonly property that lets you create a drawable object for a shape that can be later used with the draw method.
const generator = rough.generator()

function ExcaliClonePlayer(props) {
  const [elements, setElementState] = useState([])
  const [elementType ,setTool] = useState('')
  const [action, setAction] = useState('none')
  const [selectedElement, setSelectedElement] =useState('none')

  function callFunctions(){
    if(props.event.type==="drawStart"){
        console.log(props.event)
        if(props.event.value.type==="rectangle"){console.log("rectangle draw")}
    }
  }

  function createElement(id, x1,y1,x2,y2, type) {
    let roughElement
    if(type === "line"){
      roughElement = generator.line(x1,y1,x2,y2)
    }
    else if(type==="rectangle"){
      roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1)
    }
    else if(type === "circle"){
      const a = {x:x1, y:y1}
      const b = {x:x2, y:y2}
      const diameter = distance(a,b)
      console.log(diameter)
      roughElement = generator.circle((x1+x2)/2,(y1+y2)/2,diameter)
    }
    return {id, x1, y1, x2, y2, type,roughElement}
  }


  const updateElement = (id,x1,y1, x2, y2, type) => {
    const updatedElement = createElement(id,x1,y1, x2,y2, type)
    
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
  
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    const line = document.getElementById("line")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const roughCanvas = rough.canvas(canvas)
    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))
  }, [elements])

  useEffect(() => {
    console.log(props.event)
      const line = document.getElementById("line")
      const rectangle = document.getElementById("rectangle")
      const circle = document.getElementById("circle")
      const selection = document.getElementById("selection")
      if(props.event.type === "drawStart") {
        if(props.event.value.type === "line"){
            line.click()
            const id = props.event.value.id
            const clientX = props.event.value.clientX
            const clientY = props.event.value.clientY
            const elementType = props.event.value.type
            console.log(id,clientX,clientY,clientX, clientY, elementType)
            const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
            //add new element in the elements state
            setElementState(prevState => [...prevState, element])
        }
        if(props.event.value.type === "rectangle"){
            rectangle.click()
            const id = props.event.value.id
            const clientX = props.event.value.clientX
            const clientY = props.event.value.clientY
            const elementType = props.event.value.type
            console.log(id,clientX,clientY,clientX, clientY, elementType)
            const element = createElement(id,clientX,clientY,clientX,clientY, elementType);
            //add new element in the elements state
            setElementState(prevState => [...prevState, element])
        }
        if(props.event.value.type === "circle"){
          circle.click()
          const id = props.event.value.id
          const clientX = props.event.value.clientX
          const clientY = props.event.value.clientY
          const elementType = props.event.value.type
          console.log(id,clientX,clientY,clientX, clientY, elementType)
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


      if(props.event.type === "drawEnd"){
        setAction('none')
        setSelectedElement(null)
      }
    
  }, [props.event])

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
    updateElement(index,x1,y1, clientX, clientY, elementType)
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

  const handleMouseUp = () => {
    if(selectedElement){
      const index = selectedElement.id
      const {id, type} = elements[index]
      if(action === "drawing"){
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

export default ExcaliClonePlayer;
