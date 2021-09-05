import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import { useSelector, useDispatch } from "react-redux";
import { js, css, html } from "../actions";
import files from "../assets/files";

export default function App() {

    //Variables
    const [editorValue, seteditorValue] = useState('');


    //fetch recording from local storage
    var recording = { events: [] };
    const recordingJsonValue = localStorage.getItem("recording");
    if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);

    useEffect(() => {
       
        //fake cursor for playing
        const fakeCursor = document.createElement("div");
        document.getElementById("root").appendChild(fakeCursor);
        fakeCursor.style.display = 'none'

        //to check if paused or not
        const paused = false;
                
        //buttons
        const play = document.getElementById("play");
        const pause = document.getElementById("pause");
        const seekSlider =  document.getElementById("seekSlider");



        //1. stop current event
        //2. seek to some value
        //3. play from seeked event 
        seekSlider.addEventListener("change", function(e) {

            let seekSliderValue = e.target.value;
            console.log(seekSliderValue);
        })

        function playEvents() {
            //append fake cursor when user clicks play button
            fakeCursor.style.display = 'block'
     
            startTimer();
     
            paused = false;
            //draw event to play all events in requestAnimationFrames
            var documentReference = document.documentElement;
            (function draw() {
              if(paused === false){
                //select an event and check if its empty
                let event = recording.events[i];
                //console.log(event);
                if (!event) {
                  return;
                }
     
                if (event.time <= time) {
                  //draws event amd matches with listner
                  drawEvent(event, fakeCursor, documentReference);
                  i++;
                  setProgreeBar()
                }
     
                //animates in avg frame rate (60 fps mostly) of display, so motion is smooth(tells the browser that animation needs to happen)
                if (i < recording.events.length) {
                  requestAnimationFrame(draw);
                }
               }
            })();
         }



    }, [])

    return(
        <>
      <IDE val = {editorValue} />
      <button id="play">Play</button>
      <button id="pause">Pause</button>
    
      <div className="seek-slider">
        <div className="controller-wrapper">
            <input type="range"  min = "0" max = "100" className="controller" id = "seekSlider"/>
        </div>
      </div>
        </>
    );
}