import React, { useEffect,useRef} from "react";
import DrawingBoardLive from '../DrawingBoard/drawBoardPlayer'
import * as io from 'socket.io-client'

const env = process.env.NODE_ENV; // current environment
let url
if(env === "development") {
  url = 'http://localhost:5000/'
}else{
  url = 'https://fierce-reef-05156.herokuapp.com/' 
}


function LiveClasses() {
    const socketRef = useRef()
    useEffect(() => {
        socketRef.current = io.connect(url)

        socketRef.current.on("liveStart", ({event}) => {
            //console.log(event)
            let eve = new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                button: event.button,
                clientX : event.clientX,
                clientY : event.clientY,
                shiftKey : event.shiftKey,
              });
              //document.getElementsByClassName(event.type)[0].click()
              if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
          })

          //similar to click event in the Player.js
          socketRef.current.on("toolChange", ({event}) => {
            console.log(event)
            if(event === "rectangle" || event === "ellipse" || event === "arrow" || event === "selection") document.getElementsByClassName(event)[0].click();
          })

          socketRef.current.on("liveDrawing", ({event}) => {
            console.log(event)
            let eve = new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                button: event.button,
                clientX : event.clientX,
                clientY : event.clientY,
                shiftKey : event.shiftKey,
              });
              //document.getElementsByClassName(event.type)[0].click()
              if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
          })
          socketRef.current.on("liveEnd", ({event}) => {
            let eve = new MouseEvent("mouseup", {
                bubbles: true,
                cancelable: true
              });
              if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
          })
    }, [socketRef])

    return (
        <>
            <DrawingBoardLive/>
        </>
    )
}

export default LiveClasses