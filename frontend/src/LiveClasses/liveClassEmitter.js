import React, { useEffect, useRef, useState } from "react";
import ChalkBoard from '../ChalkBoard/index'
import files from "../assets/files";
import Peer from "simple-peer"
import * as io from 'socket.io-client'
import "./style.css"
import IDE from '../IDE'
import { useParams } from "react-router";
function LiveClassEmitter() {
    const { classid, type } = useParams();
    console.log(classid)
    const name = type.slice(0, 3);
    var lastMouse = { x: 0, y: 0 };
    const language = type.slice(3, 10);
    var lastKey = "";
    let fileName;
    if (name === "dsa") {
      fileName = language;
    } else if (name === "ide") {
      fileName = "index.html";
    }
    let childValue;
    var lastKeyClass = "";
    console.log("http://localhost:3000/receiver/"+name+language+"/"+classid)
     //TODO needed to reload the text editor
    const [refresh, setRefresh] = useState("");
    const socketRef = useRef()
    const [ stream, setStream ] = useState()
    //while in development mode change document.location.origin to http://localhost:5000
    socketRef.current = io.connect('http://localhost:5000')
    // Record each type of event
	const myVideo = useRef()
    const userVideo = useRef()
	const connectionRef= useRef()
    useEffect(() => {
    socketRef.current.emit("join-class", {classid:classid})

        //console.log(document.location.origin)
        navigator.mediaDevices.getUserMedia({ video:true,audio: true}).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })
    }, [])

    const handlers = [
        {
            eventName: "mouseup",
            handler: function handleMouseMove(e) {
                const data = {
                    type: "mouseup",
                    target: e.target.className,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    shiftKey: e.shiftKey,
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
                    target:e.target.className
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
                    target:e.target.className
                }
                sendData(data)
            },
        },
        {
            eventName: "click",
            handler: function handleMouseMove(e) {
                if (
                    e.target.className === "cssfile" ||
                    e.target.className === "buttontext style" ||
                    e.target.className === "fab fa-css3-alt"
                  )
                    fileName = "style.css";
                  if (
                    e.target.className === "jsfile" ||
                    e.target.className === "buttontext script" ||
                    e.target.className === " fa-js-square"
                  )
                    fileName = "script.js";
                  if (
                    e.target.className === "htmlfile" ||
                    e.target.className === "buttontext html" ||
                    e.target.className === "fab fa-html5fab"
                  )
                  fileName = "index.html";
                  console.log(e.target.className);
                    const data = {
                    type: "click",
                    target: e.target.className,
                    x: e.pageX,
                    fileName: fileName,
                    y: e.pageY,
                }
                sendData(data)
            },
        },
        {
            eventName: "keyup",
            handler: function handleKeyPress(e) {
              console.log(files[fileName]);
              if (name === "ide" || name === "dsa") {
                lastKey = childValue;
                lastKeyClass = e.target.className;
                const data = {
                  type: "keyup",
                  target: e.target.className,
                  x: lastMouse.x,
                  y: lastMouse.y,
                  fileName: fileName,
                  value:
                    e.target.className === "userInputArea"
                      ? e.target.value
                      : files[fileName].value,
                  keyCode: e.keyCode,
                }
                sendData(data)
              }
            },
        },
        {
            eventName: "output",
            handler: function handleChange(e) {
              const data = {
                type: "output",
                target: "userOutputArea",
                value: e.detail.output,
              }
              sendData(data)
            },
        },
    ];

    function sendData(data) {
        socketRef.current.emit("emitData", classid,data)
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
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socketRef.current.emit("sendStream", {
                signalData: data,
                classid:classid
            })
        })

        socketRef.current.on("callAccepted", (data) => {
            console.log(data.signalData)
            peer.signal(data.signalData)
		})

        handlers.map((x) => listen(x.eventName, x.handler));
    }

    function stopLive() {
        handlers.map((x) => removeListener(x.eventName, x.handler));
    }

    return (
        <>
            <div style={{display:"flex", flexDirection:"row-reverse"}}>
            <div className="streamingWindow">
                <div className="buttons">
                <button className="startButton" onClick = {() => startLive()}>Start</button>
                <button className="stopButton" onClick = {() => stopLive()}>Stop</button>
                </div>
                {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "300px" }} />}
            </div>
            </div>
            {name === "dra" ? (
            <div className="chalk">
              <ChalkBoard />
            </div>
          ) : (
            <IDE name={name} language={language} refresh={refresh} />
          )}
        </>
    )
}

export default LiveClassEmitter