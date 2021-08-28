import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import IDE from "./IDE";


export default function Recorder() {
  const Recording = { events: [], startTime: -1 };
  const [rec, setrec] = useLocalStorage("recording", Recording);


  // Record each type of event
  const handlers = [
    {
      eventName: "mousemove",
      handler: function handleMouseMove(e) {
        Recording.events.push({
          type: "mousemove",
          target: e.target.className,
          x: e.pageX,
          y: e.pageY,
          time: Date.now(),
        });
      },
    },
    {
      eventName: "click",
      handler: function handleClick(e) {
        console.log(e);
        Recording.events.push({
          type: "click",
          target: e.target.className,
          x: e.pageX,
          y: e.pageY,
          time: Date.now(),
        });
      },
    },
    {
      eventName: "keypress",
      handler: function handleKeyPress(e) {
        Recording.events.push({
          type: "keypress",
          target: e.target.className,
          value: e.target.value,
          keyCode: e.keyCode,
          time: Date.now(),
        });
      },
    },
  ];

  function listen(eventName, handler) {
    return document.documentElement.addEventListener(eventName, handler, true);
  }

  function startRecording() {
    Recording.startTime = Date.now();
    Recording.events = [];
    handlers.map((x) => listen(x.eventName, x.handler));
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
    // console.log(Recording);
    // console.log(rec)
    localStorage.setItem("recording", JSON.stringify(Recording))
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
      <IDE/>
      <button onClick={handleClick} className="record">
        Start Record
      </button>
      <button onClick={handleStop} className="button" id="record">
        Stop Recording
      </button>
      <button onClick={deleteLocalStroage} className="button" id="record">
        Delete localStroage
      </button>
    </>
  );
}
