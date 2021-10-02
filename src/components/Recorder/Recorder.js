import React from "react";
import IDE from "../IDE";
import DrawingBoard from "../DrawingBoard/drawBoard";
import files from "../../assets/files";
import MicRecorder from 'mic-recorder-to-mp3';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage';
import './style.css'

var startTime;
export default function Recorder(props) {
  const name = props.location.state.lectureType
  const Recording = { events: [] };
  var lastMouse = {x : 0, y : 0};
  var lastKey = "";
  let fileName
  if(name === "other"){
    fileName="c"
  }else if(name=== "ide"){
    fileName="index.html"
  }
  let childValue;
  var lastKeyClass = "";

  function callbackFunction(childData){
    childValue = childData
    console.log(childValue)
  }
  // Record each type of event
  const handlers = [
    {
      eventName: "mousemove",
      handler: function handleMouseMove(e) {
        lastMouse  = {x : e.pageX, y :e.pageY};
        Recording.events.push({
          type: "mousemove",
          target: lastKeyClass,
          x: e.pageX,
          fileName : fileName,
          y: e.pageY,
          value: lastKey,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
        if(name === "ide" || name === "other"){
          if(e.target.className === "cssfile" || e.target.className === "buttontext style" || e.target.className === "fab fa-css3-alt") fileName = "style.css"
          if(e.target.className === "jsfile" || e.target.className === "buttontext script" || e.target.className === " fa-js-square") fileName = "script.js" 
          if(e.target.className === "htmlfile" || e.target.className === "buttontext html" || e.target.className === "fab fa-html5fab") fileName = "index.html"
          console.log(e.target.className);
          Recording.events.push({
            type: "click",
            target: e.target.className,
            x: e.pageX,
            fileName :fileName,
            y: e.pageY,
            time: Date.now() - startTime,
          });
        }
      },
    },
    {
      eventName: "keyup",
      handler: function handleKeyPress(e) {
        if(name === "ide" || name === "other"){
          lastKey = childValue
          lastKeyClass = e.target.className
          Recording.events.push({
            type: "keyup",
            target: e.target.className,
            x: lastMouse.x,
            y: lastMouse.y,
            fileName: fileName,
            value: (e.target.className === "userInputArea") ? e.target.value :files[fileName].value,
            keyCode: e.keyCode,
            time: Date.now() - startTime,
          });
        }
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
        if(name === "ide" || name === "other"){
          if(e.target.value  === "c" || 
          e.target.value === "c99" || 
          e.target.value === "cpp" || 
          e.target.value === "cpp14" || 
          e.target.value === "cpp17" || 
          e.target.value === "python2" || 
          e.target.value === "python3"){
            fileName = e.target.value
          }
          if(fileName !== "script.js" || fileName !== "style.css" || fileName !== "index.html")
          Recording.events.push({
            type: "click",
            target: e.target.className,
            x: e.pageX,
            fileName :fileName,
            y: e.pageY,
            value:files[fileName].value,
            time: Date.now() - startTime,
          });
        }
      },
      },
    {
      eventName:"output",
      handler:function handleChange(e){
        Recording.events.push({
          type:"output",
          target:"userOutputArea",
          time:Date.now() - startTime,
          value:e.detail.output
        })
      }
    },
    {
      eventName:"drawStart", 
      handler:function handleChange(e){
      Recording.events.push({
        type:"drawStart",
        time:Date.now() - startTime,
        value:e.detail
        })
      }
    },
    {
      eventName:"drawEnd", 
      handler:function handleChange(e){
      Recording.events.push({
        type:"drawEnd",
        time:Date.now() - startTime,
        value:e.detail
        })
      }
    },
    {
      eventName:"drawing", 
      handler:function handleChange(e){
      Recording.events.push({
        type:"drawing",
        time:Date.now() - startTime,
        value:e.detail
        })
      }
    },
    {
      eventName:"movingStart",
      handler:function handleChange(e){
        Recording.events.push({
          type:"movingStart",
          time:Date.now() - startTime,
          value:e.detail.element
        })
      }
    },
    {
      eventName:"moving",
      handler:function handleChange(e){
        Recording.events.push({
          type:"moving",
          time:Date.now()-startTime,
          value:e.detail
        })
      }
    },
    {
      eventName:"resizeStart",
      handler:function handleChange(e){
        Recording.events.push({
          type:"resizeStart",
          time:Date.now() - startTime,
          value:e.detail
        })
      }
    },
    {
      eventName:"resizing",
      handler:function handleChange(e){
        Recording.events.push({
          type:"resizing",
          time:Date.now()-startTime,
          value:e.detail
        })
      }
    }
  ];

  const Mp3Recorder = new MicRecorder({ 
    bitRate: 128,
    prefix: "data:audio/wav;base64,"
  });

  function listen(eventName, handler) {
    return document.documentElement.addEventListener(eventName, handler, true);
  }

  function startRecording() {
    startTime = Date.now()
    Recording.events = [];
    handlers.map((x) => listen(x.eventName, x.handler));
    Mp3Recorder
    .start()
    .then(() => {
      console.log("Started recording")
    }).catch((e) => console.error(e));
  }

  function removeListener(eventName, handler) {
    return document.documentElement.removeEventListener(
      eventName,
      handler,
      true
    );
  }

  function handleClick(e) {
    e.preventDefault();
    document.getElementsByClassName("record")[0].style.display="none"
    document.getElementsByClassName("stop-record")[0].style.display="block"
    startRecording();
    console.log("The Button was clicked.");
  }

  function stopRecording() {
    // stop recording
    handlers.map((x) => removeListener(x.eventName, x.handler));
    localStorage.setItem("recording", JSON.stringify(Recording))
    document.getElementsByClassName("stop-record")[0].style.display="none"
    document.getElementsByClassName("record")[0].style.display="block"
    const recordingString = JSON.stringify(Recording)
    // console.log(sizeof(recordingString))
    // data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Recording));
    // console.log(data)
    // console.log(sizeof(recordingString))
    console.log(Recording)
    firebase.firestore().collection("events").add({
      recordingString,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      name:props.location.state.lectureName,
      type:props.location.state.lectureType
    }).then((result) => {
      firebase.firestore().collection("recordIndex").add({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        name:props.location.state.lectureName,
        type:props.location.state.lectureType,
        id:result.id
      }).then((result) => {
        console.log("Recording Tally Saved")
      })
      console.log("Recording Saved")
    })
    let audioString
    Mp3Recorder
    .stop()
    .getMp3()
    .then(([buffer, blob]) => {
      new File(buffer, 'me-at-thevoice.mp3', {
        type: blob.type,
        lastModified: Date.now()
      })
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
          audioString =(reader.result)
          // console.log(sizeof(audioString))
          var storageRef = firebase.storage().ref();
          var audioRef = storageRef.child('audio&amp');
          audioRef.putString(audioString, 'data_url').then((snapshot) => {
            alert('Audio saved!');
          }).catch((e) => {
            console.log(e)
          })
      }
    }).catch((e) => console.log(e));
  }

  function handleStop(e) {
    e.preventDefault();
    stopRecording();
    console.log("Recording Stopped.");
  }
  console.log(Recording)
  return (
    <>
      <div className="recorder">
      <div className = "recorder-button">
        <i className="fas fa-microphone record" onClick={handleClick}></i>
        <i className="fas fa-microphone-slash stop-record" onClick={handleStop}></i>
      </div>
      {name === "drawboard" ?<DrawingBoard/>:<IDE name={name} parentCallBack = {callbackFunction}/>}
      </div>
    </>
  );
}
