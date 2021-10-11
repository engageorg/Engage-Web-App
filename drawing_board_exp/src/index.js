import React from "react";
import ReactDOM from "react-dom";
import getStroke from "perfect-freehand";
import rough from "roughjs/dist/rough.umd.js";

import "./styles.css";

var elements = [];

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

function isInsideAnElement(x, y) {
  return (element) => {
    const x1 = getElementAbsoluteX1(element)
    const x2 = getElementAbsoluteX2(element)
    const y1 = getElementAbsoluteY1(element)
    const y2 = getElementAbsoluteY2(element)

    return (x >= x1 && x <= x2) && (y >= y1 && y <= y2)
  }
}

function newElement(type, x, y, width = 0, height = 0) {
  const element = {
    type: type,
    x: x,
    y: y,
    width: width,
    height: height,
    isSelected: false
  };
  return element;
}

function exportAsPNG({
  exportBackground,
  exportVisibleOnly,
  exportPadding = 10
}) {
  if ( !elements.length ) return window.alert("Cannot export empty canvas.");

  // deselect & rerender

  clearSelection();
  drawScene();

  // calculate visible-area coords

  let subCanvasX1 = Infinity;
  let subCanvasX2 = 0;
  let subCanvasY1 = Infinity;
  let subCanvasY2 = 0;

  elements.forEach(element => {
    subCanvasX1 = Math.min(subCanvasX1, getElementAbsoluteX1(element));
    subCanvasX2 = Math.max(subCanvasX2, getElementAbsoluteX2(element));
    subCanvasY1 = Math.min(subCanvasY1, getElementAbsoluteY1(element));
    subCanvasY2 = Math.max(subCanvasY2, getElementAbsoluteY2(element));
  });

  // create temporary canvas from which we'll export

  const tempCanvas = document.createElement("canvas");
  const tempCanvasCtx = tempCanvas.getContext("2d");
  tempCanvas.style.display = "none";
  document.body.appendChild(tempCanvas);
  tempCanvas.width = exportVisibleOnly
    ? subCanvasX2 - subCanvasX1 + exportPadding * 2
    : canvas.width;
  tempCanvas.height = exportVisibleOnly
    ? subCanvasY2 - subCanvasY1 + exportPadding * 2
    : canvas.height;

  if (exportBackground) {
    tempCanvasCtx.fillStyle = "#FFF";
    tempCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // copy our original canvas onto the temp canvas
  tempCanvasCtx.drawImage(
    canvas, // source
    exportVisibleOnly // sx
      ? subCanvasX1 - exportPadding
      : 0,
    exportVisibleOnly // sy
      ? subCanvasY1 - exportPadding
      : 0,
    exportVisibleOnly // sWidth
      ? subCanvasX2 - subCanvasX1 + exportPadding * 2
      : canvas.width,
    exportVisibleOnly // sHeight
      ? subCanvasY2 - subCanvasY1 + exportPadding * 2
      : canvas.height,
    0, // dx
    0, // dy
    exportVisibleOnly ? tempCanvas.width : canvas.width, // dWidth
    exportVisibleOnly ? tempCanvas.height : canvas.height // dHeight
  );

  // create a temporary <a> elem which we'll use to download the image
  const link = document.createElement("a");
  link.setAttribute("download", "excalibur.png");
  link.setAttribute("href", tempCanvas.toDataURL("image/png"));
  link.click();

  // clean up the DOM
  link.remove();
  if (tempCanvas !== canvas) tempCanvas.remove();
}

function rotate(x1, y1, x2, y2, angle) {
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  return [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
  ];
}

var generator = rough.generator();

function generateDraw(element) {
  if (element.type === "selection") {
    element.draw = (rc, context) => {
      const fillStyle = context.fillStyle;
      context.fillStyle = "rgba(0, 0, 255, 0.10)";
      context.fillRect(element.x, element.y, element.width, element.height);
      context.fillStyle = fillStyle;
    };
  } else if (element.type === "rectangle") {
    const shape = generator.rectangle(0, 0, element.width, element.height);
    element.draw = (rc, context) => {
      context.translate(element.x, element.y);
      rc.draw(shape);
      context.translate(-element.x, -element.y);
    };
  } else if (element.type === "ellipse") {
    const shape = generator.ellipse(
      element.width / 2,
      element.height / 2,
      element.width,
      element.height
    );
    element.draw = (rc, context) => {
      context.translate(element.x, element.y);
      rc.draw(shape);
      context.translate(-element.x, -element.y);
    };
  } else if (element.type === "arrow") {
    const x1 = 0;
    const y1 = 0;
    const x2 = element.width;
    const y2 = element.height;

    const size = 30; // pixels
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Scale down the arrow until we hit a certain size so that it doesn't look weird
    const minSize = Math.min(size, distance / 2);
    const xs = x2 - ((x2 - x1) / distance) * minSize;
    const ys = y2 - ((y2 - y1) / distance) * minSize;

    const angle = 20; // degrees
    const [x3, y3] = rotate(xs, ys, x2, y2, (-angle * Math.PI) / 180);
    const [x4, y4] = rotate(xs, ys, x2, y2, (angle * Math.PI) / 180);

    const shapes = [
      //    \
      generator.line(x3, y3, x2, y2),
      // -----
      generator.line(x1, y1, x2, y2),
      //    /
      generator.line(x4, y4, x2, y2)
    ];

    element.draw = (rc, context) => {
      context.translate(element.x, element.y);
      shapes.forEach(shape => rc.draw(shape));
      context.translate(-element.x, -element.y);
    };
    return;
  } else if (element.type === "text") {
    element.draw = (rc, context) => {
      const font = context.font;
      context.font = element.font;
      context.fillText(
        element.text,
        element.x,
        element.y + element.measure.actualBoundingBoxAscent
      );
      context.font = font;
    };
  } else if (element.type === "pencil") { 
     element.draw =  (rc, context) => {
      //getStroke returns an array of points representing the outline of a stroke
      const stroke = getSvgPathFromStroke(getStroke(element.points, {
        size:5
      }))
      //The Path2D interface of the Canvas 2D API is used to declare a path that can then be used on a CanvasRenderingContext2D object
      context.fill(new Path2D(stroke))
     };
  } else {
    throw new Error("Unimplemented type " + element.type);
  }
}

// If the element is created from right to left, the width is going to be negative
// This set of functions retrieves the absolute position of the 4 points.
// We can't just always normalize it since we need to remember the fact that an arrow
// is pointing left or right.
function getElementAbsoluteX1(element) {
  return element.width >= 0 ? element.x : element.x + element.width;
}
function getElementAbsoluteX2(element) {
  return element.width >= 0 ? element.x + element.width : element.x;
}
function getElementAbsoluteY1(element) {
  return element.height >= 0 ? element.y : element.y + element.height;
}
function getElementAbsoluteY2(element) {
  return element.height >= 0 ? element.y + element.height : element.y;
}

function setSelection(selection) {
  const selectionX1 = getElementAbsoluteX1(selection);
  const selectionX2 = getElementAbsoluteX2(selection);
  const selectionY1 = getElementAbsoluteY1(selection);
  const selectionY2 = getElementAbsoluteY2(selection);
  elements.forEach(element => {
    const elementX1 = getElementAbsoluteX1(element);
    const elementX2 = getElementAbsoluteX2(element);
    const elementY1 = getElementAbsoluteY1(element);
    const elementY2 = getElementAbsoluteY2(element);
    element.isSelected =
      element.type !== "selection" &&
      selectionX1 <= elementX1 &&
      selectionY1 <= elementY1 &&
      selectionX2 >= elementX2 &&
      selectionY2 >= elementY2;
  });
}

function clearSelection() {
  elements.forEach(element => {
    element.isSelected = false;
  });
}

class App extends React.Component {

  componentDidMount() {
    this.onKeyDown = event => {
      if (event.key === "Backspace" && event.target.nodeName !== "INPUT") {
        for (var i = elements.length - 1; i >= 0; --i) {
          if (elements[i].isSelected) {
            elements.splice(i, 1);
          }
        }
        drawScene();
        event.preventDefault();
      } else if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        const step = event.shiftKey ? 5 : 1;
        elements.forEach(element => {
          if (element.isSelected) {
            if (event.key === "ArrowLeft") element.x -= step;
            else if (event.key === "ArrowRight") element.x += step;
            else if (event.key === "ArrowUp") element.y -= step;
            else if (event.key === "ArrowDown") element.y += step;
          }
        });
        drawScene();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown, false);
  }

  constructor() {
    super();
    this.state = {
      draggingElement: null,
      elementType: "selection",
      exportBackground: false,
      exportVisibleOnly: true,
      exportPadding: 10
    };
  }

  render() {
    const ElementOption = ({ type, children }) => {
      return (
        <label>
          <input
            type="radio"
            checked={this.state.elementType === type}
            onChange={() => {
              this.setState({ elementType: type });
              clearSelection();
              drawScene();
            }}
          />
          {children}
        </label>
      );
    };

    return <>
      <div className="exportWrapper">
        <button onClick={() => {
          exportAsPNG({
            exportBackground: this.state.exportBackground,
            exportVisibleOnly: this.state.exportVisibleOnly,
            exportPadding: this.state.exportPadding
          })
        }}>Export to png</button>
        <label>
          <input type="checkbox"
            checked={this.state.exportBackground}
            onChange={e => {
              this.setState({ exportBackground: e.target.checked })
            }}
          /> background
        </label>
        <label>
          <input type="checkbox"
            checked={this.state.exportVisibleOnly}
            onChange={e => {
              this.setState({ exportVisibleOnly: e.target.checked })
            }}
          />
          visible area only
        </label>
        (padding:
          <input type="number" value={this.state.exportPadding}
            onChange={e => {
              this.setState({ exportPadding: e.target.value });
            }}
            disabled={!this.state.exportVisibleOnly}/>
        px)
      </div>
     
      <div>
        {/* Can't use the <ElementOption> form because ElementOption is re-defined
          on every render, which would blow up and re-create the entire DOM tree,
          which in addition to being inneficient, messes up with browser text
          selection */}
        {ElementOption({ type: "selection", children: "Selection" })}
        {ElementOption({ type: "pencil", children: "Pencil" })}
        {ElementOption({ type: "rectangle", children: "Rectangle" })}
        {ElementOption({ type: "ellipse", children: "Circle" })}
        {ElementOption({ type: "arrow", children: "Arrow" })}
        {ElementOption({ type: "text", children: "Text" })}
        
        
        <canvas
          id="canvas"

          width={window.innerWidth}
          height={window.innerHeight}

          onMouseDown = 

          {e => {
         
            // Sometimes, when you have nested elements, one of them with
            // the event attached to it, it can be confusing to understand
            // what your browser sees as the parent. Here, you can specify
            // which parent.
            // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element/49580241
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;
            console.log("x", x);
            const element = newElement(this.state.elementType, x, y);
            let isDraggingElements = false;
            const cursorStyle = document.documentElement.style.cursor;

            if (this.state.elementType === "selection") {
              const selectedElement = elements.find(element => {
                const isSelected = isInsideAnElement(x, y)(element)
                if (isSelected) {
                  element.isSelected = true
                }
                return isSelected
              })

              if (selectedElement) {
                this.setState({ draggingElement: selectedElement });
              } else {
                clearSelection()
              }

              isDraggingElements = elements.some(element => element.isSelected);

              if (isDraggingElements) {
                document.documentElement.style.cursor = "move";
              }
            }
            
            if (this.state.elementType === "pencil") {
                element.points = [{x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop}]
            } else if (this.state.elementType === "text") {
              const text = prompt("What text do you want?");
              if (text === null) {
                return;
              }
              element.text = text;
              element.font = "20px Virgil";
              const font = context.font;
              context.font = element.font;
              element.measure = context.measureText(element.text);
              context.font = font;
              const height =
                element.measure.actualBoundingBoxAscent +
                element.measure.actualBoundingBoxDescent;

              // Center the text
              element.x -= element.measure.width / 2;
              element.y -= element.measure.actualBoundingBoxAscent;
              element.width = element.measure.width;
              element.height = height;
            }

            generateDraw(element);
            elements.push(element);
            
            if (this.state.elementType === "text") {
              this.setState({
                draggingElement: null,
                elementType: "selection"
              });
              element.isSelected = true;
            } else {
              this.setState({ draggingElement: element });
            }

            let lastX = x;
            let lastY = y;

            const onMouseMove = e => {
              if (isDraggingElements) {
                const selectedElements = elements.filter(el => el.isSelected);
                if (selectedElements.length) {
                  const x = e.clientX - e.target.offsetLeft;
                  const y = e.clientY - e.target.offsetTop;
                  selectedElements.forEach(element => {
                    element.x += x - lastX;
                    element.y += y - lastY;
                    //TODO : Add move for freehand element
                    // if(element.type === "pencil"){
                    //   element.points.forEach(point => {
                    //     point.x = e.clientX - point.x;
                    //     point.y = e.clientY - point.y;
                    //   })
                    // }
                  });
                  lastX = x;
                  lastY = y;
                  drawScene();
                  return;
                }
              }
              
              // It is very important to read this.state within each move event,
              // otherwise we would read a stale one!
              const draggingElement = this.state.draggingElement;
              if (!draggingElement) return;
              let width = e.clientX - e.target.offsetLeft - draggingElement.x;
              let height = e.clientY - e.target.offsetTop - draggingElement.y;
              draggingElement.width = width;
              // Make a perfect square or circle when shift is enabled
              draggingElement.height = e.shiftKey ? width : height;

              if(draggingElement.type === "pencil"){
                console.log(draggingElement);
                draggingElement.points = [...draggingElement.points, {x : e.clientX - e.target.offsetLeft, y : e.clientY - e.target.offsetTop}]
              }

              generateDraw(draggingElement);

              if (this.state.elementType === "selection") {
                setSelection(draggingElement);
              }
              drawScene();
            };

            const onMouseUp = e => {
              const { draggingElement, elementType } = this.state

              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);

              document.documentElement.style.cursor = cursorStyle;

              // if no element is clicked, clear the selection and redraw
              if (draggingElement === null ) {
                clearSelection()
                drawScene();
                return
              }

              if (elementType === "selection") {
                if (isDraggingElements) {
                  isDraggingElements = false;
                }
                elements.pop()
              } else {
                draggingElement.isSelected = true;
              }

              this.setState({
                draggingElement: null,
                elementType: "selection"
              });
              drawScene();
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);

            drawScene();
          }}

        />

      </div>
    </>;
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
const canvas = document.getElementById("canvas");
const rc = rough.canvas(canvas);
const context = canvas.getContext("2d");

// Big hack to ensure that all the 1px lines are drawn at 1px instead of 2px
// https://stackoverflow.com/questions/13879322/drawing-a-1px-thick-line-in-canvas-creates-a-2px-thick-line/13879402#comment90766599_13879402
context.translate(0.5, 0.5);

function drawScene() {
  ReactDOM.render(<App />, rootElement);

  context.clearRect(-0.5, -0.5, canvas.width, canvas.height);

  elements.forEach(element => {
    element.draw(rc, context);
    if (element.isSelected) {
      const margin = 4;

      const elementX1 = getElementAbsoluteX1(element);
      const elementX2 = getElementAbsoluteX2(element);
      const elementY1 = getElementAbsoluteY1(element);
      const elementY2 = getElementAbsoluteY2(element);
      const lineDash = context.getLineDash();
      context.setLineDash([8, 4]);
      context.strokeRect(
        elementX1 - margin,
        elementY1 - margin,
        elementX2 - elementX1 + margin * 2,
        elementY2 - elementY1 + margin * 2
      );
      context.setLineDash(lineDash);
    }
  });
}

drawScene();