import React, { useEffect, useRef, useState } from "react";
import ChalkBoard from "../ChalkBoard/index";
import files from "../assets/files";
import Peer from "simple-peer";
import * as io from "socket.io-client";
import "./style.css";
import firebase from "firebase/app";
import "firebase/firestore";
import IDE from "../IDE";
import { useParams } from "react-router";

const firebaseConfig = {
  apiKey: "AIzaSyAp2cQvNNp8fUKOv6kO_7wR5IsKROCoh14",
  authDomain: "engage-6ef42.firebaseapp.com",
  projectId: "engage-6ef42",
  storageBucket: "engage-6ef42.appspot.com",
  messagingSenderId: "27842359842",
  appId: "1:27842359842:web:e8f5b15f6a86ac66fa507b",
  measurementId: "G-EVEY2DP36T",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;

function LiveClassEmitter() {
  const { classid, type } = useParams();
  console.log(classid);
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
  console.log(
    "http://localhost:3000/receiver/" + name + language + "/" + classid
  );
  //TODO needed to reload the text editor
  const [refresh, setRefresh] = useState("");
  const socketRef = useRef();
  const [stream, setStream] = useState();
  //while in development mode change document.location.origin to http://localhost:5000
  socketRef.current = io.connect(document.location.origin);
  // Record each type of event
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  useEffect(async () => {
    const webcamVideo = document.getElementById("webcamVideo");
    socketRef.current.emit("join-class", { classid: classid });
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    webcamVideo.srcObject = localStream;
  }, []);

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
        };
        sendData(data);
      },
    },
    {
      eventName: "mousedown",
      handler: function handleMouseMove(e) {
        const data = {
          type: "mousedown",
          button: e.button,
          clientX: e.clientX,
          clientY: e.clientY,
          shiftKey: e.shiftKey,
          target: e.target.className,
        };
        sendData(data);
      },
    },
    {
      eventName: "mousemove",
      handler: function handleMouseMove(e) {
        const data = {
          type: "mousemove",
          button: e.button,
          clientX: e.clientX,
          clientY: e.clientY,
          shiftKey: e.shiftKey,
          target: e.target.className,
        };
        sendData(data);
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

  const startLive = async () => {
    // Reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    console.log(callDoc.id);
    socketRef.current.emit("classid", {callId:callDoc.id})

    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    handlers.map((x) => listen(x.eventName, x.handler));
  };

  function stopLive() {
    handlers.map((x) => removeListener(x.eventName, x.handler));
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <div className="streamingWindow">
          <div className="buttons">
            <button className="startButton" onClick={() => startLive()}>
              Start
            </button>
            <button className="stopButton" onClick={() => stopLive()}>
              Stop
            </button>
          </div>
          <video
            playsInline
            muted
            autoPlay
            playsInline
            id="webcamVideo"
            ref={myVideo}
            style={{ width: "300px" }}
          />
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
  );
}

export default LiveClassEmitter;
