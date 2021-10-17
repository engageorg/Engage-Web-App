import React, { useEffect,useRef} from "react";
import DrawingBoard from '../DrawingBoard/index'
import * as io from 'socket.io-client'

function LiveClassReceiver() {
    const socketRef = useRef()
    socketRef.current = io.connect("http://localhost:5000")
    useEffect(() => {
        socketRef.current.on("receiveData", ({data}) => {
            console.log(data)
            if (data.type === "mousedown") {
                let eve = new MouseEvent("mousedown", {
                  bubbles: true,
                  cancelable: true,
                  button: data.button,
                  clientX : data.clientX,
                  clientY : data.clientY,
                  shiftKey : data.shiftKey,
                });
        
                if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
        
              }
              else if (data.type === "mousemove") {
                
                // TODO: Add e.buttons too
                let eve = new MouseEvent("mousemove", {
                  bubbles: true,
                  cancelable: true,
                  button: data.button,
                  clientX : data.clientX,
                  clientY : data.clientY,
                  shiftKey : data.shiftKey,
                });
        
                if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
                const path = data.target;
                var tar = document.getElementsByClassName(path)[0];
                if (tar != null) {
                  tar.focus();
        
                }
              }
              else if (data.type === "mouseup") {
                let eve = new MouseEvent("mouseup", {
                  bubbles: true,
                  cancelable: true
                });
                if(document.getElementById("canvas"))document.getElementById("canvas").dispatchEvent(eve);
              }
              else if (data.type === "click") {
                if(document.getElementsByClassName(data.target)[0] !== undefined && document.getElementsByClassName(data.target)[0].nodeName === "INPUT"){
                    document.getElementsByClassName(data.target)[0].click();
                }
              }
              else if(data.type === "keydown"){
                console.log("keydown event")
                if(document.getElementsByClassName("canvas_text")[0]){
                  document.getElementsByClassName("canvas_text")[0].innerText =  data.innerText;
                } 
              }
        })
    }, [])

    return (
        <>
            <DrawingBoard/>
        </>
    )
}



export default LiveClassReceiver