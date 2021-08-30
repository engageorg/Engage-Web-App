import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import { useSelector, useDispatch } from "react-redux";
import { js, css, html } from "../actions";
import files from "../assets/files";

export default function Video() {
  const [valueCode, setValue] = useState("");
  const [previousValueCode, setPreviousValue] = useState("");

  const [keyCode, setKeycode] = useState('');

  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];
  const fakeCursor = document.createElement("div");
  document.getElementById("root").appendChild(fakeCursor);
  fakeCursor.style.display='none'
  // fetch recording from local storage
  let recording = { events: [], startTime: -1 };
  const recordingJsonValue = localStorage.getItem("recording");
  if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);
  //console.log(recording);
  let playLecture = 1;
  let pauseLecture = 0;
  useEffect(() => {
    console.log("THIS")
    // fake cursor, declared outside, so it will scoped to all functions
    fakeCursor.className = "customCursor";

    //when user clicked playbutton
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    let i = 0;

    pause.addEventListener("click", function () {
      //setPlay(0)
      console.log("Pause Button Clicked")
      //playLecture !== 0 ? 0: 1;
      //if(playLecture!==0){
        playLecture = 0;
        fakeCursor.style.display = 'none'
      //}
    });

    play.addEventListener("click", function () {
      //setPlay(1)
      //append fake cursor when user clicks play button
      console.log("Play button click")
      fakeCursor.style.display = 'block'
      const startPlay = Date.now();
      playLecture = 1;
      //draw event to play all events in requestAnimationFrames
      var documentReference = document.documentElement;
      //if(playLecture === 1){
      (function draw() {
        if (playLecture === 1) {
          //select an event and check if its empty
          let event = recording.events[i];
          //console.log(event);
          if (!event) {
            return;
          }

          //To check if event is valid
          let offsetRecording = event.time - recording.startTime;
          let offsetPlay = (Date.now() - startPlay) * 1;
          if (offsetPlay >= offsetRecording) {
            //draws event amd matches with listner
            //console.log(playLecture);
            //console.log(pauseLecture);
            drawEvent(event, fakeCursor, documentReference);
            i++;
          }

          //animates in avg frame rate (60 fps mostly) of display, so motion is smooth(tells the browser that animation needs to happen)
          if (i < recording.events.length) {
            requestAnimationFrame(draw);
          }
        }
      })();
      //}
    });
    
    function handleButtonEvents(target) {
      switch (target) {
        case "stylebutton":
             dispatch(css())
          break;
        case "htmlbutton":
             dispatch(html())
          break;
        case "scriptbutton":
             dispatch(js());
          break;
        default:
          break;
      }
    }

    function drawEvent(event, fakeCursor, documentReference) {
      if (event.type === "click" || event.type === "mousemove") {
        console.log("mouse");
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
        //document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px";
        fakeCursor.style.top = JSON.stringify(event.y) + "px";
      }
      if (event.type === "click") {
        console.log("mouseclick");
        flashClass(fakeCursor, "click");
        //console.log(event.target);
        var tar = document.getElementsByClassName(event.target)[0];
        if(tar !=  null){
          handleButtonEvents(tar.className);
          flashClass(tar, "clicked");
        }
      }
      if (event.type === "keypress") {
        const path = event.target;
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          setKeycode(keyCode => keyCode + String.fromCharCode(event.keyCode));
        }
      }
    }

    function flashClass(el, className) {
      el.classList.add(className);
      setTimeout(function () {
        el.classList.remove(className);
      }, 200);
    }
  }, []);

  return (
    <>
      <IDE val = {keyCode}/>
      <button className="record">Start Record</button>
      <button className="button" id="record">
        Stop Recording
      </button>
      <button id="play">Play</button>
      <button id="pause">Pause</button>
      {/* <button>{playLecture}</button>
      <button>{pauseLecture}</button> */}
    </>
  );
}
