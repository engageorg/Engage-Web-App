import React, { useEffect, useRef, useState } from "react";
import ChalkBoard from "../ChalkBoard/index";
import files from "../assets/files";
import Peer from "simple-peer";
import * as io from "socket.io-client";
import { motion } from "framer-motion";
import "./style.css";
import IDE from "../IDE";
import { useParams } from "react-router";
const env = process.env.NODE_ENV; // current environment

let url;
if (env === "development") {
  url = "http://localhost:3000/receiver/";
} else {
  url = "https://fierce-reef-05156.herokuapp.com/receiver/";
}
let socketUrl;
if (env === "development") {
  socketUrl = "http://localhost:5000";
} else {
  socketUrl = "https://fierce-reef-05156.herokuapp.com";
}

var constraints = {
  audio: {
    echoCancellationType: "system",
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 24000,
    sampleSize: 16,
    channelCount: 2,
    volume: 0.5,
  },
  video: true,
};

function LiveClassEmitter() {
  const { classid, type } = useParams();
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
  const joinLink = url + name + language + "/" + classid;
  //TODO needed to reload the text editor
  const [refresh, setRefresh] = useState("");
  const socketRef = useRef();
  const [stream, setStream] = useState();
  //while in development mode change document.location.origin to http://localhost:5000
  socketRef.current = io.connect(socketUrl);
  // Record each type of event
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  useEffect(() => {
    socketRef.current.emit("admin-class", { classid: classid });
    const inviteButton = document.getElementsByClassName("inviteButton")[0];
    const inviteLink = document.getElementsByClassName("inviteLink")[0];

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });

    inviteButton.addEventListener("click", () => {
      navigator.clipboard.writeText(inviteLink.value);
      alert("link Copied");
    });
  }, []);

  const handlers = [
    {
      eventName: "pointerup",
      handler: function handleMouseMove(e) {
        const data = {
          type: e.type,
          bubbles: e.bubbles,
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pointerType: e.pointerType,
          target: e.target.className,
        };
        sendData(data);
      },
    },
    {
      eventName: "pointerdown",
      handler: function handleMouseMove(e) {
        const data = {
          type: "pointerdown",
          bubbles: e.bubbles,
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pointerType: e.pointerType,
          target: e.target.className,
        };
        sendData(data);
      },
    },
    {
      eventName: "pointermove",
      handler: function handleMouseMove(e) {
        const data = {
          type: e.type,
          bubbles: e.bubbles,
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pointerType: e.pointerType,
          target: e.target.className,
          x: e.x,
          y: e.y,
        };
        sendData(data);
      },
    },
    {
      eventName: "mousedown",
      handler: function handleMouseMove(e) {
        const data = {
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          bubbles: e.bubbles,
          button: e.button,
          target: e.target.className,
          type: e.type,
        };
        if(e.target.className === 'gutter gutter-horizontal'){
          sendData(data);
        }
      },
    },
    {
      eventName: "mousemove",
      handler: function handleMouseMove(e) {
        const data = {
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          bubbles: e.bubbles,
          button: e.button,
          target: e.target.className,
          type: e.type,
        };
        if(e.target.className === 'gutter gutter-horizontal'){
          sendData(data);
        }
      },
    },
    {
      eventName: "mouseup",
      handler: function handleMouseMove(e) {
        const data = {
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          bubbles: e.bubbles,
          button: e.button,
          target: e.target.className,
          type: e.type,
        };
        if(e.target.className === 'gutter gutter-horizontal'){
          sendData(data);
        }
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
        };
        sendData(data);
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
          };
          sendData(data);
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
        };
        sendData(data);
      },
    },
  ];

  function sendData(data) {
    socketRef.current.emit("emitData", classid, data);
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
      config: {
        iceServers: [
          {
            urls: "stun:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683",
          },
          {
            urls: "turn:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683",
          },
        ],
      },
      stream: stream,
    });

    peer.on("signal", (data) => {
      socketRef.current.emit("sendStream", {
        signalData: data,
        classid: classid,
      });
    });

    socketRef.current.on("callAccepted", (data) => {
      console.log(data.signalData);
      peer.signal(data.signalData);
    });
    handlers.map((x) => listen(x.eventName, x.handler));
  }

  function stopLive() {
    handlers.map((x) => removeListener(x.eventName, x.handler));
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <button onClick={() => startLive()} className="inviteButton">
          <input className="inviteLink" defaultValue={joinLink} />
          <i className="fas fa-clipboard-list"></i>
        </button>
        <motion.div
          drag={true}
          dragConstraints={{ left: -1000, top: -800, right: 0, bottom: 0 }}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          dragElastic={0.5}
          whileTap={{ cursor: "grabbing" }}
          style={{ cursor: "grab", overflow: "hidden" }}
          className="streamingWindow"
        >
          {stream && (
            <video
              className="instructorStream"
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: "300px" }}
            />
          )}
        </motion.div>
      </div>

      {name === "dra" ? (
        <div className="chalk">
          <ChalkBoard />
        </div>
      ) : (
        <IDE name={name} language={language} refresh={refresh} />
      )}
    </>
  );
}

export default LiveClassEmitter;
