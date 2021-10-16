import React, { useEffect, useRef } from "react";
import DrawingBoard from '../DrawingBoard/index'
import * as io from 'socket.io-client'

function LiveClassEmitter() {

    const socketRef = useRef()
    socketRef.current = io.connect("http://localhost:5000")
    // Record each type of event
    const handlers = [
        {
            eventName: "mouseup",
            handler: function handleMouseMove(e) {
                const data = {
                    type: "mouseup"
                }
                sendData(data)
            }
        },
        {
            eventName: "mousedown",
            handler: function handleMouseMove(e) {
                const data = {
                    type: "mousedown",
                    button: e.button,
                    clientX : e.clientX,
                    clientY : e.clientY,
                    shiftKey : e.shiftKey,
                }
                sendData(data)
            },
        },
        {
            eventName: "mousemove",
            handler: function handleMouseMove(e) {
                const data = {
                    type: "mousemove",
                    button: e.button,
                    clientX : e.clientX,
                    clientY : e.clientY,
                    shiftKey : e.shiftKey,  
                }
                sendData(data)
            },
        },
        {
            eventName: "click",
            handler: function handleMouseMove(e) {
                const data = {
                    type: "click",
                    target: e.target.className,
                }
                sendData(data)

            },
        }
    ];

    function sendData(data) {
        socketRef.current.emit("emitData", {data})
    }

    function removeListener(eventName, handler) {
        return document.documentElement.removeEventListener(
          eventName,
          handler,
          true
        );
      }
    
    function listen(eventName, handler) {
        return document.documentElement.addEventListener(eventName, handler, true);
    }

    function startLive() {
        handlers.map((x) => listen(x.eventName, x.handler));
    }

    function stopLive() {
        handlers.map((x) => removeListener(x.eventName, x.handler));
    }

    return (
        <>
            <div style={{position:"absolute", zIndex:"3"}}>
                <button style={{backgroundColor:"red"}} onClick = {() => startLive()}>Start</button>
                <button style={{backgroundColor:"yellow"}} onClick = {() => stopLive()}>Stop</button>
            </div>
            <DrawingBoard/>
        </>
    )
}

export default LiveClassEmitter