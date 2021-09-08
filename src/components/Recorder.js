import React, {useState} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import IDE from "./IDE";
import MicRecorder from 'mic-recorder-to-mp3';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage';

export default function Recorder() {
  const Recording = { events: [] };
  const [rec, setrec] = useLocalStorage("recording", Recording);
  //const [childValue, setValue] = useState('')
  var lastMouse = {x : 0, y : 0};
  var lastKey = "";
  let childValue;
  var lastKeyClass = "";
  var curtime = 0, timer;
  function startTimer() {
    timer =  setInterval(() => curtime++, 1)
   }


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
          y: e.pageY,
          value: lastKey,
          time: curtime,
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
        Recording.events.push({
          type: "click",
          target: e.target.className,
          x: e.pageX,
          y: e.pageY,
          time: curtime,
        });
        
        
      },
    },
    // { 
    //   eventName: "keydown",
    //   handler: function handkeydown(e) {
    //     // let str
    //     // switch (e.keyCode) {
    //     //   case 37:
    //     //       str = 'Left Key pressed!';
    //     //       break;
    //     //   case 38:
    //     //       str = 'Up Key pressed!';
    //     //       break;
    //     //   case 39:
    //     //       str = 'Right Key pressed!';
    //     //       break;
    //     //   case 40:
    //     //       str = 'Down Key pressed!';
    //     //       break;
    //     // }
    //     // console.log(e.keyCode ,str);
    //     // link to how to move pointer : https://stackoverflow.com/questions/34968174/set-text-cursor-position-in-a-textarea
    //     Recording.events.push({
    //       type: "keypress",
    //       target: e.target.className,
    //       x: lastMouse.x,
    //       y: lastMouse.y,
    //       value: e.target.value,
    //       keyCode: e.keyCode,
    //       time: curtime,
    //     });

    //   },
    // },
    {
      eventName: "keypress",
      handler: function handleKeyPress(e) {
        lastKey = childValue
        lastKeyClass = e.target.className
        Recording.events.push({
          type: "keypress",
          target: e.target.className,
          x: lastMouse.x,
          y: lastMouse.y,
          value: childValue,
          keyCode: e.keyCode,
          time: curtime,
        });
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
    startTimer()
    Recording.events = [];
    handlers.map((x) => listen(x.eventName, x.handler));
    Mp3Recorder
    .start()
    .then(() => {
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
    startRecording();
    console.log("The Button was clicked.");
  }

  function stopRecording() {
    // stop recording
    handlers.map((x) => removeListener(x.eventName, x.handler));
    localStorage.setItem("recording", JSON.stringify(Recording))
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
            console.log('Uploaded a data_url string!');
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

  function deleteLocalStroage() {
    localStorage.removeItem("recording")
  }

  return (
    <>
      <div className = "recorder-button">
      <button onClick={handleClick} className="record">
        Start Record
      </button>
      <button onClick={handleStop} className="stop-record">
        Stop Recording
      </button>
      </div>
      <IDE parentCallBack = {callbackFunction}/>
    </>
  );
}
