import React, { useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Video() {
  const [rec, setrec] = useLocalStorage("recording", "");

  useEffect(() => {
    // fake cursor, declared outside, so it will scoped to all functions
    const fakeCursor = document.createElement("div");
    fakeCursor.className = "cursor";

    //when user clicked playbutton
    var play = document.getElementById("play");

    play.addEventListener("click", function () {
      let i = 0;
      //append fake cursor when user clicks play button
      document.getElementById("root").appendChild(fakeCursor);
      const startPlay = Date.now();

      //draw event to play all events in requestAnimationFrames
      var documentReference = document.documentElement;
      (function draw() {
        //select an event and check if its empty
        let event = rec.events[i];
        if (!event) {
          return;
        }

        //To check if event is valid
        let offsetRecording = event.time - rec.startTime;
        let offsetPlay = (Date.now() - startPlay) * 1;
        if (offsetPlay >= offsetRecording) {
          //draws event amd matches with listner
          drawEvent(event, fakeCursor, documentReference);
          i++;
        }

        //animates in avg frame rate (60 fps mostly) of display, so motion is smooth(tells the browser that animation needs to happen)
        if (i < rec.events.length) {
          requestAnimationFrame(draw);
        }
      })();
    });

    function drawEvent(event, fakeCursor, documentReference) {
      if (event.type === "click" || event.type === "mousemove") {
        console.log("mouse");
        document.getElementsByClassName("cursor")[0].style.top =
          JSON.stringify(event.y) + "px";
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
      }
      if (event.type === "click") {
        console.log("mouseclick");
        flashClass(fakeCursor, "click");
        console.log(event.target);
        var tar = document.getElementsByClassName(event.target)[0];
        flashClass(tar, "clicked");
      }
      if (event.type === "keypress") {
        console.log("keypress");
        const path = event.target;
        var tar = document.getElementsByClassName(path)[0];
        tar.focus();
        tar.value = event.value;
      }
    }

    function flashClass(el, className) {
      el.classList.add(className);
      setTimeout(function () {
        el.classList.remove(className);
      }, 200);
    }
  });

  return (
    <>
      <div className="heading">test</div>

      <input className="input1"></input>

      <input className="input2"></input>

      <input className="input3"></input>

      <button className="record">Start Record</button>
      <button className="button" id="record">
        Stop Recording
      </button>
      <button id="play">Play</button>
    </>
  );
}
