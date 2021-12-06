import React, { useEffect, useState, useRef } from "react";
import ChalkBoard from "../ChalkBoard/index";
import Peer from "simple-peer";
import IDE from "../IDE";
import files from "../assets/files";
import { useDispatch } from "react-redux";
import {
  js,
  css,
  html,
  outputModalTrue,
  outputModalFalse,
  setSrcDocs,
} from "../actions";
import * as io from "socket.io-client";
import { useParams } from "react-router";
import img from "../assets/Gear-0.2s-200px.png";
import { motion } from "framer-motion"

function Preloader() {
  return (
    <div className="loader">
      <div className="preloader">
        <div className="preloaderText">Please Wait ...</div>
        <button className="answerButton">Enter</button>
        <div className="load">
          <img src={img} border="0" />
        </div>
      </div>
    </div>
  );
}

function LiveClassReceiver() {
  const { classid, type } = useParams();
  const name = type.slice(0, 3);
  const language = type.slice(3, 10);
  const socketRef = useRef();
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const dispatch = useDispatch();
  //TODO needed to reload the text editor
  const [refresh, setRefresh] = useState("");
  const userVideo = useRef();
  //while in development mode change document.location.origin to http://localhost:5000
  socketRef.current = io.connect("http://localhost:5000");
  function handleButtonEvents(target) {
    switch (target) {
      case "outputtext":
        dispatch(setSrcDocs());
        dispatch(outputModalTrue());
        break;
      case "output":
        dispatch(setSrcDocs());
        dispatch(outputModalTrue());
        break;
      case "buttontext output":
        dispatch(setSrcDocs());
        dispatch(outputModalTrue());
        break;
      case "fas fa-play":
        dispatch(setSrcDocs());
        dispatch(outputModalTrue());
        break;
      case "fas fa-window-close":
        dispatch(outputModalFalse());
        break;
      case "style.css":
        dispatch(css());
        break;
      case "buttontext style":
        dispatch(css());
        break;
      case "index.html":
        dispatch(html());
        break;
      case "script.js":
        dispatch(js());
        break;
      case "buttontext script":
        dispatch(js());
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    socketRef.current.emit("join-class", { classid: classid });
    const answerButton = document.getElementsByClassName("answerButton")[0];
    const contentWindow = document.getElementsByClassName("contentWindow")[0];
    socketRef.current.on("receiveData", (data) => {
      const drawStatus = {
        status: false,
      };
      const eve = new CustomEvent("status", { detail: drawStatus });
      document.dispatchEvent(eve);
      if (data.type === "pointerdown") {
        let eve = new PointerEvent("pointerdown", {
          altKey: data.altKey,
          altitudeAngle: data.altitudeAngle,
          azimuthAngle: data.azimuthAngle,
          bubbles: data.bubbles,
          button: data.button,
          buttons: data.buttons,
          cancelBubble: data.cancelBubble,
          cancelable: data.cancelable,
          clientX: data.clientX,
          clientY: data.clientY,
          ctrlKey: data.ctrlKey,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          pageX: data.pageX,
          pageY: data.pageY,
          pointerType: data.pointerType,
          screenX: data.screenX,
          screenY: data.screenY,
          shiftKey: data.shiftKey,
          target: data.target.className,
          tiltX: data.tiltX,
          tiltY: data.tiltY,
          timeStamp: data.timeStamp,
          toElement: data.toElement,
          twist: data.twist,
          type: data.type,
          width: data.width,
          x: data.x,
          y: data.y,
        });
        if (document.getElementsByClassName(data.target)[0])
          document.getElementsByClassName(data.target)[0].dispatchEvent(eve);
      } else if (data.type === "pointermove") {
        let eve = new PointerEvent("pointermove", {
          altKey: data.altKey,
          altitudeAngle: data.altitudeAngle,
          azimuthAngle: data.azimuthAngle,
          bubbles: data.bubbles,
          button: data.button,
          buttons: data.buttons,
          cancelBubble: data.cancelBubble,
          cancelable: data.cancelable,
          clientX: data.clientX,
          clientY: data.clientY,
          ctrlKey: data.ctrlKey,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          pageX: data.pageX,
          pageY: data.pageY,
          pointerType: data.pointerType,
          screenX: data.screenX,
          screenY: data.screenY,
          shiftKey: data.shiftKey,
          target: data.target.className,
          tiltX: data.tiltX,
          tiltY: data.tiltY,
          timeStamp: data.timeStamp,
          toElement: data.toElement,
          twist: data.twist,
          type: data.type,
          width: data.width,
          x: data.x,
          y: data.y,
        });
        if (document.getElementsByClassName(data.target)[0]) {
          document.getElementsByClassName(data.target)[0].dispatchEvent(eve);
        }
        const path = data.target;
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
        }
      } else if (data.type === "pointerup") {
        let eve = new PointerEvent("pointerup", {
          altKey: data.altKey,
          altitudeAngle: data.altitudeAngle,
          azimuthAngle: data.azimuthAngle,
          bubbles: data.bubbles,
          button: data.button,
          buttons: data.buttons,
          cancelBubble: data.cancelBubble,
          cancelable: data.cancelable,
          clientX: data.clientX,
          clientY: data.clientY,
          ctrlKey: data.ctrlKey,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          pageX: data.pageX,
          pageY: data.pageY,
          pointerType: data.pointerType,
          screenX: data.screenX,
          screenY: data.screenY,
          shiftKey: data.shiftKey,
          target: data.target.className,
          tiltX: data.tiltX,
          tiltY: data.tiltY,
          timeStamp: data.timeStamp,
          toElement: data.toElement,
          twist: data.twist,
          type: data.type,
          width: data.width,
          x: data.x,
          y: data.y,
        });
        if (document.getElementsByClassName(data.target)[0])
          document.getElementsByClassName(data.target)[0].dispatchEvent(eve);
      } else if (data.type === "click") {
        if (document.getElementsByClassName(data.target)[0] !== undefined) {
          let clickEvent = new MouseEvent("click", {
            pageX: data.x,
            pageY: data.y,
            bubbles: true,
            cancelable: true,
          });

          document
            .getElementsByClassName(data.target)[0]
            .dispatchEvent(clickEvent);
        }
        if (
          data.target === "rectangle" ||
          data.target === "ellipse" ||
          data.target === "arrow" ||
          data.target === "selection"
        )
          document.getElementsByClassName(data.target)[0].click();
        tar = document.getElementsByClassName(data.target)[0];
        if (tar != null) {
          handleButtonEvents(data.fileName);
          handleButtonEvents(data.target);
        }
      } else if (data.type === "keyup") {
        const path = data.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          if (path === "userInputArea") {
            tar.value = data.value;
          } else {
            files[data.fileName].value = data.value;
            handleButtonEvents(data.fileName);
            setRefresh(data.value);
          }
        }
      } else if (data.type === "output") {
        const path = data.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          if (path === "userOutputArea") {
            tar.value = data.value;
          }
        }
      } else if (data.type === "keydown") {
        if (document.getElementsByClassName("canvas_text")[0]) {
          document.getElementsByClassName("canvas_text")[0].innerText =
            data.innerText;
        }
      }
    });

    socketRef.current.on("emitStream", (data) => {
      console.log(data);
      document.getElementsByClassName("load")[0].style.display = "none";
      console.log("loaded");
      answerButton.style.display = "block";
      setCallerSignal(data);
      answerButton.addEventListener("click", () => {
        console.log("working");
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });

        peer.on("signal", (data) => {
          socketRef.current.emit("answerCall", {
            signalData: data,
            classid: classid,
          });
        });
        console.log(callerSignal);
        peer.signal(data);

        peer.on("stream", (stream) => {
          setStream(stream);
          userVideo.current.srcObject = stream;
        });
        document.getElementsByClassName("loader")[0].style.display = "none";
        contentWindow.style.display = "block";
      });
    });
  }, []);

  return (
    <div>
      <Preloader />
      <div className="contentWindow">
        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <div
            className="streamingWindow"
            style={{
              position: "absolute",
              zIndex: "3",
              display: "flex",
              flexDirection: "column",
              paddingRight: "10px",
            }}
          >
            {stream && (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            )}
          </div>
        </div>
        {name === "dra" ? (
          <div className="chalk">
            <ChalkBoard />
          </div>
        ) : (
          <IDE name={name} language={language} refresh={refresh} />
        )}
      </div>
    </div>
  );
}

export default LiveClassReceiver;
