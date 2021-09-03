import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import { useSelector, useDispatch } from "react-redux";
import { js, css, html } from "../actions";
import files from "../assets/files";
import InputRange from 'react-input-range';
import { func } from "prop-types";

const Pause = ({onPlayerClick}) => {
  return (
    <svg className="button" id = "pause" viewBox="0 0 60 60" onClick={onPlayerClick}>
      <polygon points="0,0 15,0 15,60 0,60" />
      <polygon points="25,0 40,0 40,60 25,60" />
    </svg>
  )
}

const Play = ({onPlayerClick}) => {
  return (
      <svg className="button" id = "play" viewBox="0 0 60 60" onClick={onPlayerClick}>
        <polygon points="0,0 50,30 0,60" />
      </svg>
  )
}


export default function Video() {

  const [keyCode, setKeycode] = useState('');
  const [playStatus, setplayStatus] = useState(false);
  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];
  //fake cursor for playing
  const fakeCursor = document.createElement("div");
  document.getElementById("root").appendChild(fakeCursor);
  fakeCursor.style.display = 'none'
  
  // fetch recording from local storage
  let recording = { events: [], startTime: -1 };
  const recordingJsonValue = localStorage.getItem("recording");
  if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);
  
  let playLecture = 1;
  let offsetRecording;
  let offsetPlay;

  const handlePlayerClick = () => {
    if (!playStatus) {
      setplayStatus(true)
    } else {
      setplayStatus(false)
    }
  }

  function deleteTimeStamp(){
    localStorage.removeItem("lastSessionTimeStamp")
  }

  useEffect(() => {
    
    // fake cursor, declared outside, so it will scoped to all functions
    fakeCursor.className = "customCursor";

    //when user clicked playbutton
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    const seekSlider =  document.getElementById("seekSlider");
    
    var i = 0;
    var paused = false;
    var valueHtml = "";
    var valueCss = "";
    var valueJs = "";
    var curValue = "";
    var time = 0, timer;
    
    console.log(seekSlider)
    seekSlider.addEventListener("change" , function(e) {

      pausefunction();

      let seekSliderValue = e.target.value;
      i = Math.floor((seekSliderValue * recording.events.length)/100);
      setProgreeBar()

      playfunction();
    })

    function pausefunction() {
      playLecture = 0;
      fakeCursor.style.display = 'none'
      //saves last value of offsetPlay
      paused = true;
      stopTimer();
    }
    function startTimer() {
     timer =  setInterval(() => time++, 1)
    }

    function stopTimer() {
      clearInterval(timer);
    }

    function playfunction() {
       //append fake cursor when user clicks play button
       fakeCursor.style.display = 'block'

       startTimer();
       var startTime = time;
       paused = false;
       //draw event to play all events in requestAnimationFrames
       var documentReference = document.documentElement;
       (function draw() {
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
           if (i < recording.events.length && !paused) {
             requestAnimationFrame(draw);
           }
         
       })();
    }

    pause.addEventListener("click", function () {
      console.log("clicked pause");
      pausefunction();

    });

    play.addEventListener("click", function () {
      console.log(i);
      console.log("clicked play")
      playfunction();
    });

    function setProgreeBar() {
      const progress = (i/recording.events.length)*100;
      console.log(progress);
      seekSlider.value = progress;

    }
    
    function handleButtonEvents(target) {
      switch (target) {
        case "stylebutton":
             dispatch(css())
             curValue = valueCss
          break;
        case "htmlbutton":
             dispatch(html())
             curValue = valueHtml
          break;
        case "scriptbutton":
             dispatch(js());
             curValue = valueJs
          break;
        default:
          break;
      }
    }

    function drawEvent(event, fakeCursor, documentReference) {
      if (event.type === "click" || event.type === "mousemove") {
       
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
        //document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px";
        fakeCursor.style.top = JSON.stringify(event.y) + "px";
      }
      if (event.type === "click") {
        
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
          setKeycode(event.value);
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
      <IDE val = {keyCode} />
      <button id="play">Play</button>
      <button id="pause">Pause</button>
    
      <div className="seek-slider">
        <div className="controller-wrapper">
            <input type="range" value = "0" min = "0" max = "100" className="controller" id = "seekSlider"/>
        </div>
      </div>
      <div className="controller-timings">
          <span className="left-time">00:00</span>
          <span className="right-time">00:00</span>
      </div>

      <div className="player" >
        {playStatus ? <Pause onPlayerClick= {handlePlayerClick} /> : <Play onPlayerClick = {handlePlayerClick} />}
      </div>

    {/* <div className="volume-slider">
        <div className="volume-low-icon">
            
        </div>
        <div className="controller-wrapper">
            <input type="range" min="0" max="100" className="controller" />
        </div>
        <div className="volume-up-icon">
         <img src = {}/>
        </div>
    </div> */}
    </>
  );
}