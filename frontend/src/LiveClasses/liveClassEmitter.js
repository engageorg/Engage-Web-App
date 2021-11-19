import React, { useEffect, useRef, useState } from "react";
import ChalkBoard from '../ChalkBoard/index'
import Peer from "simple-peer"
import * as io from 'socket.io-client'

function LiveClassEmitter() {
    const socketRef = useRef()
    const [ stream, setStream ] = useState()
    //while in development mode change document.location.origin to http://localhost:5000
    socketRef.current = io.connect("http://localhost:5000")
    // Record each type of event
	const myVideo = useRef()
    const userVideo = useRef()
	const connectionRef= useRef()
    useEffect(() => {
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
        },
        {
            eventName: "keydown",
            handler: function handleMouseMove(e) {
                let innerText = document.getElementsByClassName("canvas_text")[0].innerText
                const data = {
                    type: "keydown",
                    target: e.target.className,
                    shiftKey: e.shiftKey,
                    innerText: innerText,
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
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socketRef.current.emit("sendStream", {
                signalData: data
            })
        })

        socketRef.current.on("callAccepted", (data) => {
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
            <div style={{position:"absolute", zIndex:"3",display:"flex", flexDirection:"column", paddingRight:"10px"}}>
                <button style={{backgroundColor:"red"}} onClick = {() => startLive()}>Start</button>
                <button style={{backgroundColor:"yellow"}} onClick = {() => stopLive()}>Stop</button>
                {stream && <video playsInline muted ref={myVideo} autoPlay style={{width: "300px" }} />}
            </div>
            </div>
            <div  className = "chalk"><ChalkBoard/></div>
        </>
    )
}

export default LiveClassEmitter