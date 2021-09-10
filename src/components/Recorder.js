import React from "react";
import IDE from "./IDE";
import MicRecorder from 'mic-recorder-to-mp3';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage';

var startTime;
export default function Recorder() {
  const Recording = { events: [] };
  //const [childValue, setValue] = useState('')
  var lastMouse = {x : 0, y : 0};
  var lastKey = "";
  let childValue;
  var lastKeyClass = "";

  function callbackFunction(childData){
    childValue = childData
    // console.log(childValue)
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
          y: e.pageY,
          value: lastKey,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
        console.log(e)
        Recording.events.push({
          type: "click",
          target: e.target.className,
          x: e.pageX,
          y: e.pageY,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "keyup",
      handler: function handleKeyPress(e) {
        console.log(e)
        lastKey = childValue
        lastKeyClass = e.target.className
        Recording.events.push({
          type: "keyup",
          target: e.target.className,
          x: lastMouse.x,
          y: lastMouse.y,
          value: childValue,
          keyCode: e.keyCode,
          time: Date.now() - startTime,
        });
        console.log("recording",childValue)
      },
    },
  ];

  const Mp3Recorder = new MicRecorder({ 
    bitRate: 128,
    prefix: "data:audio/wav;base64,"
  });

  function listen(eventName, handler) {
    return document.documentElement.addEventListener(eventName, handler, true);
  }

  function startRecording() {
    Recording.events = [];
    handlers.map((x) => listen(x.eventName, x.handler));
    Mp3Recorder
    .start()
    .then(() => {
      startTime = Date.now()
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
    let audioString
    let file
    Mp3Recorder
    .stop()
    .getMp3()
    .then(([buffer, blob]) => {
      file = new File(buffer, 'me-at-thevoice.mp3', {
        type: blob.type,
        lastModified: Date.now()
      });
      console.log(file)
      console.log(blob)
      console.log(URL.createObjectURL(file))
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
          audioString =(reader.result)
          var storageRef = firebase.storage().ref();
          var audioRef = storageRef.child('audio&amp');
          audioRef.putString(audioString, 'data_url').then((snapshot) => {
            alert('Recording saved!');
          }).catch((e) => {
            console.log(e)
          })
      }
    }).catch((e) => console.log(e));
    const recordingString = JSON.stringify(Recording)
    firebase.firestore().collection("events").add({
      recordingString,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).then((result) => {
      console.log("events succesfully added")
    })
  }

  function handleStop(e) {
    e.preventDefault();
    stopRecording();
    console.log("Recording Stopped.");
  }

  return (
    <>
      <div className="recorder">
      <div className = "recorder-button">
      {/* <button onClick={handleClick} className="record"> */}
        <i className="fas fa-microphone record" onClick={handleClick}></i>
        <i className="fas fa-microphone-slash stop-record" onClick={handleStop}></i>
        {/* Start Recording
      </button> */}
      {/* <button onClick={handleStop} className="stop-record">
        Stop Recording
      </button> */}
      </div>
      <IDE parentCallBack = {callbackFunction}/>
      </div>
    </>
  );
}
