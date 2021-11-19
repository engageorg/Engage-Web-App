import React, { useEffect,useState,useRef} from "react";
import ChalkBoard from '../ChalkBoard/index'
import Peer from "simple-peer"
import * as io from 'socket.io-client'

function LiveClassReceiver() {
    const socketRef = useRef()
    const [ stream, setStream ] = useState()
    const [ receivingCall, setReceivingCall ] = useState(false)
    const [ callerSignal, setCallerSignal ] = useState()
    const userVideo = useRef()
    //while in development mode change document.location.origin to http://localhost:5000
    socketRef.current = io.connect("http://localhost:5000")
    useEffect(() => {
        socketRef.current.on("receiveData", ({data}) => {
            if (data.type === "mousedown") {
                console.log("mousedown")
                let eve = new PointerEvent("pointerdown", {
                  bubbles: true,
                  cancelable: true,
                  button: data.button,
                  clientX : data.clientX,
                  clientY : data.clientY,
                  shiftKey : data.shiftKey,
                });
        
                if(document.getElementsByClassName("excalidraw__canvas")[0])document.getElementsByClassName("excalidraw__canvas")[0].dispatchEvent(eve);
        
              }
              else if (data.type === "mousemove") {
                console.log("mousemove")
                // TODO: Add e.buttons too
                let eve = new PointerEvent("pointermove", {
                  bubbles: true,
                  cancelable: true,
                  button: data.button,
                  clientX : data.clientX,
                  clientY : data.clientY,
                  shiftKey : data.shiftKey,
                });
        
                if(document.getElementsByClassName("excalidraw__canvas")[0])document.getElementsByClassName("excalidraw__canvas")[0].dispatchEvent(eve);
                const path = data.target;
                var tar = document.getElementsByClassName(path)[0];
                if (tar != null) {
                  tar.focus();
        
                }
              }
              else if (data.type === "mouseup") {
                console.log("mouseup")
                let eve = new PointerEvent("pointerup", {
                  bubbles: true,
                  cancelable: true
                });
                if(document.getElementsByClassName("excalidraw__canvas")[0])document.getElementsByClassName("excalidraw__canvas")[0].dispatchEvent(eve);
              }
              else if (data.type === "click") {
                if(document.getElementsByClassName(data.target)[0] !== undefined && document.getElementsByClassName(data.target)[0].nodeName === "INPUT"){
                    document.getElementsByClassName(data.target)[0].click();
                }
              }
              else if(data.type === "keydown"){
                if(document.getElementsByClassName("canvas_text")[0]){
                  document.getElementsByClassName("canvas_text")[0].innerText =  data.innerText;
                } 
              }
        })

        socketRef.current.on("emitStream", (data) => {
          setCallerSignal(data.signalData)
        })

    }, [])
    
    function answerCall() {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
      })

      peer.on("signal", (data) => {
        socketRef.current.emit("answerCall", { 
          signalData: data
        })
      })
  
      peer.signal(callerSignal)

      peer.on("stream", (stream) => {
        setStream(stream)
        userVideo.current.srcObject = stream
      })
    }

    return (
        <>
            <div style={{display:"flex", flexDirection:"row-reverse"}}>
            <div style={{position:"absolute", zIndex:"3",display:"flex", flexDirection:"column", paddingRight:"10px"}}>
            <button className="answerButton" onClick={() => answerCall()}>Answer Call</button>
            {stream && <video playsInline ref={userVideo} autoPlay style={{width: "300px" }} />}
            </div>
            </div>
            <div  className = "chalk"><ChalkBoard/></div>
        </>
    )
}



export default LiveClassReceiver