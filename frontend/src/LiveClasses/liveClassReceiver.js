import React, { useEffect, useState, useRef } from "react";
import ChalkBoard from "../ChalkBoard/index";
import Peer from "simple-peer";
import IDE from "../IDE";
import files from "../assets/files";
import firebase from "firebase/app";
import "firebase/firestore";
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
let remoteStream = null;

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
  const [answerId, setAnswerId] = useState("");
  const userVideo = useRef();
  //while in development mode change document.location.origin to http://localhost:5000
  socketRef.current = io.connect(document.location.origin);
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
    const remoteVideo = document.getElementById("remoteVideo");
    socketRef.current.emit("join-class", { classid: classid });
    remoteStream = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    remoteVideo.srcObject = remoteStream;
    const button = document.getElementsByClassName("answerButton")[0];
    socketRef.current.on("answerId", (data) => {
      setAnswerId(data)
    })
    button.style.display = "none";
    socketRef.current.on("receiveData", (data) => {
      //console.log(data)
      button.style.display = "block";
      const drawStatus = {
        status: false,
      };
      const eve = new CustomEvent("status", { detail: drawStatus });
      document.dispatchEvent(eve);
      if (data.type === "mousedown") {
        //console.log("mousedown")
        let eve = new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: data.button,
          clientX: data.clientX,
          clientY: data.clientY,
          shiftKey: data.shiftKey,
        });

        if (document.getElementsByClassName(data.target)[0])
          document.getElementsByClassName(data.target)[0].dispatchEvent(eve);
      } else if (data.type === "mousemove") {
        let eve = new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          button: data.button,
          clientX: data.clientX,
          clientY: data.clientY,
          shiftKey: data.shiftKey,
        });

        if (document.getElementsByClassName(data.target)[0]) {
          document.getElementsByClassName(data.target)[0].dispatchEvent(eve);
        }
        const path = data.target;
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
        }
      } else if (data.type === "mouseup") {
        //console.log("mouseup")
        let eve = new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          button: data.button,
          clientX: data.clientX,
          clientY: data.clientY,
          shiftKey: data.shiftKey,
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
      console.log(data.signalData);
      setCallerSignal(data.signalData);
    });
  }, []);

  const answerCall = async () => {
    const callId = answerId;
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });
    
    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // const peer = new Peer({
    //   initiator: false,
    //   trickle: false,
    //   stream: stream
    // })
    // peer.on("signal", (data) => {
    //   socketRef.current.emit("answerCall", {
    //     signalData: data,
    //     classid:classid
    //   })
    // })
    // peer.signal(callerSignal)
    // peer.on("stream", (stream) => {
    //   setStream(stream)
    //   userVideo.current.srcObject = stream
    // })
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <div
          style={{
            position: "absolute",
            zIndex: "3",
            display: "flex",
            flexDirection: "column",
            paddingRight: "10px",
          }}
        >
          <button className="answerButton" onClick={() => answerCall()}>
            Answer Call
          </button>

          <video
            playsInline
            ref={userVideo}
            id="remoteVideo"
            autoPlay
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

export default LiveClassReceiver;
