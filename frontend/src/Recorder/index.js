import React, {useState} from "react";
import IDE from "../IDE";
import ChalkBoard from "../ChalkBoard/index";
import files from "../assets/files";
import MicRecorder from "mic-recorder-to-mp3";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import axios from "axios";
import "./style.css";
var startTime;
export default function Recorder(props) {
  const name = props.location.state.lectureType;
  const language = props.location.state.languageType;
  const [file, setFile] = useState(null);
  console.log(name);
  const Recording = { events: [] };
  var lastMouse = { x: 0, y: 0 };
  var lastKey = "";
  var audioString;
  let fileName;
  if (name === "dsa") {
    fileName = language;
  } else if (name === "ide") {
    fileName = "index.html";
  }
  let childValue;
  var lastKeyClass = "";

  function callbackFunction(childData) {
    childValue = childData;
    //console.log(childValue)
  }

  function handleChange(e) {
    console.log(e)
    setFile(e.target.files[0]);
  }

  // Record each type of event
  const handlers = [
    {
      eventName: "pointerup",
      handler: function handleMouseMove(e) {
        Recording.events.push({
          altKey: e.altKey,
          altitudeAngle: e.altitudeAngle,
          azimuthAngle: e.azimuthAngle,
          bubbles: e.bubbles,
          button: e.button,
          buttons: e.buttons,
          cancelBubble: e.cancelBubble,
          cancelable: e.cancelable,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pageX: e.pageX,
          pageY: e.pageY,
          pointerType: e.pointerType,
          screenX: e.screenX,
          screenY: e.screenY,
          shiftKey: e.shiftKey,
          target: e.target.className,
          tiltX: e.tiltX,
          tiltY: e.tiltY,
          timeStamp: e.timeStamp,
          toElement: e.toElement,
          twist: e.twist,
          type: e.type,
          width: e.width,
          x: e.x,
          y: e.y,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "pointerdown",
      handler: function handleMouseMove(e) {
        Recording.events.push({
          type: "pointerdown",
          altKey: e.altKey,
          altitudeAngle: e.altitudeAngle,
          azimuthAngle: e.azimuthAngle,
          bubbles: e.bubbles,
          button: e.button,
          buttons: e.buttons,
          cancelBubble: e.cancelBubble,
          cancelable: e.cancelable,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pageX: e.pageX,
          pageY: e.pageY,
          pointerType: e.pointerType,
          screenX: e.screenX,
          screenY: e.screenY,
          shiftKey: e.shiftKey,
          target: e.target.className,
          tiltX: e.tiltX,
          tiltY: e.tiltY,
          timeStamp: e.timeStamp,
          toElement: e.toElement,
          twist: e.twist,
          type: e.type,
          width: e.width,
          x: e.x,
          y: e.y,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "pointermove",
      handler: function handleMouseMove(e) {
        lastMouse = { x: e.pageX, y: e.pageY };
        Recording.events.push({
          altKey: e.altKey,
          altitudeAngle: e.altitudeAngle,
          azimuthAngle: e.azimuthAngle,
          bubbles: e.bubbles,
          button: e.button,
          buttons: e.buttons,
          cancelBubble: e.cancelBubble,
          cancelable: e.cancelable,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pageX: e.pageX,
          pageY: e.pageY,
          pointerType: e.pointerType,
          screenX: e.screenX,
          screenY: e.screenY,
          shiftKey: e.shiftKey,
          target: e.target.className,
          tiltX: e.tiltX,
          tiltY: e.tiltY,
          timeStamp: e.timeStamp,
          toElement: e.toElement,
          twist: e.twist,
          type: e.type,
          width: e.width,
          x: e.x,
          y: e.y,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "dblclick",
      handler: function handleMouseMove(e) {
        console.log(e);
        Recording.events.push({
          type: "dblclick",
          button: e.button,
          clientX: e.clientX,
          clientY: e.clientY,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
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
        Recording.events.push({
          type: "click",
          target: e.target.className,
          x: e.pageX,
          fileName: fileName,
          y: e.pageY,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "keyup",
      handler: function handleKeyPress(e) {
        console.log(files[fileName]);
        if (name === "ide" || name === "dsa") {
          lastKey = childValue;
          lastKeyClass = e.target.className;
          Recording.events.push({
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
            time: Date.now() - startTime,
          });
        }
      },
    },
    {
      eventName: "keydown",
      handler: function handleKeyPress(e) {
        let value = null;
        if(document.getElementsByClassName("canvas_text")[0]) value = document.getElementsByClassName("canvas_text")[0].value;
        Recording.events.push({
          type: "keydown",
          key: e.key,
          code: e.code,
          isComposing: e.isComposing,
          shiftKey: e.shiftKey,
          value: value,
          time: Date.now() - startTime,
        });
      },
    },
    {
      eventName: "mousedown",
      handler: function handleKeyPress(e) {
        if(e.target.className === 'gutter gutter-horizontal'){
          Recording.events.push({
            clientX: e.clientX,
            clientY: e.clientY,
            ctrlKey: e.ctrlKey,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            bubbles: e.bubbles,
          button: e.button,
            pageX: e.pageX,
            pageY: e.pageY,
            screenX: e.screenX,
            screenY: e.screenY,
            shiftKey: e.shiftKey,
            target: e.target.className,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            timeStamp: e.timeStamp,
            toElement: e.toElement,
            twist: e.twist,
            type: e.type,
            width: e.width,
            x: e.x,
            y: e.y,
            time: Date.now() - startTime,
          });
        }
      },
    },
    {
      eventName: "mouseup",
      handler: function handleKeyPress(e) {
        //console.log(e)
        if(e.target.className === 'gutter gutter-horizontal'){
          Recording.events.push({
            clientX: e.clientX,
            clientY: e.clientY,
            ctrlKey: e.ctrlKey,
            bubbles: e.bubbles,
          button: e.button,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            screenX: e.screenX,
            screenY: e.screenY,
            shiftKey: e.shiftKey,
            target: e.target.className,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            timeStamp: e.timeStamp,
            toElement: e.toElement,
            twist: e.twist,
            type: e.type,
            width: e.width,
            x: e.x,
            y: e.y,
            time: Date.now() - startTime,
          });
        }
      },
    },
    {
      eventName: "mousemove",
      handler: function handleKeyPress(e) {
        if(e.target.className === 'gutter gutter-horizontal'){
          Recording.events.push({
            clientX: e.clientX,
            clientY: e.clientY,
            ctrlKey: e.ctrlKey,
            bubbles: e.bubbles,
          button: e.button,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            screenX: e.screenX,
            screenY: e.screenY,
            shiftKey: e.shiftKey,
            target: e.target.className,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            timeStamp: e.timeStamp,
            toElement: e.toElement,
            twist: e.twist,
            type: e.type,
            width: e.width,
            x: e.x,
            y: e.y,
            time: Date.now() - startTime,
          });
        }
      },
    },
    // {
    //   eventName: "click",
    //   handler: function handleClick(e) {
    //     if(name === "dsa"){
    //       if(language  === "c" ||
    //       language === "c99" ||
    //       language === "cpp" ||
    //       language === "cpp14" ||
    //       language === "cpp17" ||
    //       language === "python2" ||
    //       language === "python3"){
    //         fileName = language
    //       }
    //       Recording.events.push({
    //         type: "click",
    //         target: e.target.className,
    //         x: e.pageX,
    //         fileName :fileName,
    //         y: e.pageY,
    //         value:files[fileName].value,
    //         time: Date.now() - startTime,
    //       });
    //     }
    //   },
    //   },
    {
      eventName:"selectstart",
      handler: function handleChange(e) {
        console.log(e)
      },
    },
    {
      eventName: "output",
      handler: function handleChange(e) {
        Recording.events.push({
          type: "output",
          target: "userOutputArea",
          time: Date.now() - startTime,
          value: e.detail.output,
        });
      },
    },
  ];

  const Mp3Recorder = new MicRecorder({
    bitRate: 128,
    prefix: "data:audio/wav;base64,",
  });

  function listeniframe(eventName, handler) {
    return document.documentElement.getElementsByClassName("outputiframe")[0].contentDocument.addEventListener(eventName, handler, true);
  }

  function listen(eventName, handler) {
    return document.documentElement.addEventListener(eventName, handler, true);
  }

  function startRecording() {
    startTime = Date.now();
    Recording.events = [];
    handlers.map((x) => listen(x.eventName, x.handler));
    if(name === "ide"){
      handlers.map((x) => listeniframe(x.eventName, x.handler));
    }
    Mp3Recorder.start()
      .then(() => {
        console.log("Started recording");
      })
      .catch((e) => console.error(e));
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
    document.getElementsByClassName("record")[0].style.display = "none";
    document.getElementsByClassName("stop-record")[0].style.display = "block";
    startRecording();
    console.log("The Button was clicked.");
  }

  function stopRecording() {
    // stop recording
    handlers.map((x) => removeListener(x.eventName, x.handler));
    //localStorage.setItem("recording", JSON.stringify(Recording));
    document.getElementsByClassName("stop-record")[0].style.display = "none";
    document.getElementsByClassName("record")[0].style.display = "block";
    Mp3Recorder.stop()
      .getMp3()
      .then(async ([buffer, blob]) => {
        console.log(blob);
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          audioString = reader.result;
        };
      })
      .catch((e) => console.log(e));
  }

  function uploadRecording() {
    // upload recording
    const recordingString = JSON.stringify(Recording);
    console.log(Recording);
    firebase
      .firestore()
      .collection("events")
      .add({
        recordingString,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        name: props.location.state.lectureName,
        creator: props.location.state.lectureCreator,
        type: props.location.state.lectureType,
      })
      .then((result) => {
        localStorage.setItem("recordingId", JSON.stringify(result.id));
        firebase
          .firestore()
          .collection("recordIndex")
          .add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            name: props.location.state.lectureName,
            type: props.location.state.lectureType,
            creator: props.location.state.lectureCreator,
            language: language,
            id: result.id,
          })
          .then((result) => {
            console.log("Recording Tally Saved");
          });
        console.log("Recording Saved");
        var storageRef = firebase.storage().ref();

        const id = JSON.parse(localStorage.getItem("recordingId"));
        localStorage.removeItem("recordingId");
        const lectureData = {
          recording: recordingString,
          audio: audioString,
        };
        var audioRef = storageRef.child(id);
        var imageRef = storageRef.child(`/images/${id}`);
        audioRef
          .putString(audioString, "data_url")
          .then((snapshot) => {
            alert("Audio saved!");
          })
          .catch((e) => {
            console.log(e);
          });
          imageRef
          .put(file)
          .then((snapshot) => {
            console.log("THUMNAIL SAVED")
          })
          .catch((e) => {
            console.log(e);
          });
        axios.post("http://localhost:5000/savedata", {
          lectureData,
        });
      });
  }

  function handleStop(e) {
    e.preventDefault();
    stopRecording();
    console.log("Recording Stopped.");
  }
  //console.log(Recording)
  return (
    <>
      <div className="recorder">
        <div className="recorder-button">
          <i className="fas fa-microphone record" onClick={handleClick}></i>
          <i
            className="fas fa-microphone-slash stop-record"
            onClick={handleStop}
          ></i>
        </div>
        <div className="upload-button">
          <i class="fas fa-file-upload record" onClick={uploadRecording}></i>
        </div>
        {/* <form className="uploadForm">
          <input id="thumnail" type="file" onChange={handleChange}/>
        </form> */}
        {name === "dra" ? (
          <div className="chalk">
            {" "}
            <ChalkBoard />{" "}
          </div>
        ) : (
          <IDE
            name={name}
            language={language}
            parentCallBack={callbackFunction}
          />
        )}
      </div>
    </>
  );
}
