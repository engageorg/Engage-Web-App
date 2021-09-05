import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import { useSelector, useDispatch } from "react-redux";
import { js, css, html } from "../actions";
import files from "../assets/files";


const Pause = (props) => {
  return (
    <svg className="button" style = {props.style} id = "pause" viewBox="0 0 60 60" onClick={props.onPlayerClick}>
      <polygon points="0,0 15,0 15,60 0,60" />
      <polygon points="25,0 40,0 40,60 25,60" />
    </svg>
  )
}

const Play = (props) => {
  return (
      <svg className="button" style = {props.style}  id = "play" viewBox="0 0 60 60" onClick={props.onPlayerClick}>
        <polygon points="0,0 50,30 0,60" />
      </svg>
  )
}


export default function Video() {

  const [keyCode, setKeycode] = useState('');
  const [playStatus, setplayStatus] = useState(false);
  const [playStyle, setplayStyle] = useState({display : "block"});
  const [pauseStyle, setpauseStyle] = useState({display : "none"});
  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];
  
  // fetch recording from local storage
  let recording = { events: [], startTime: -1 };
  const recordingJsonValue = localStorage.getItem("recording");
  if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);
  

  const handlePlayerClick = () => {
    setplayStatus(!playStatus);
    if (!playStatus) {
      setplayStyle({display : "none"});
      setpauseStyle({display : "block"});
    } else {
      setplayStyle({display : "block"});
      setpauseStyle({display : "none"});
    }
  }

  useEffect(() => {
      //fake cursor for playing
  const fakeCursor = document.createElement("div");
  document.getElementById("root").appendChild(fakeCursor);
  fakeCursor.style.display = 'none'


    console.log(playStatus);
    document.getElementsByClassName("right-time")[0].innerHTML = recording.events[recording.events.length - 1].time/1000;
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
  
    seekSlider.addEventListener("change", function(e) {

      pausefunction();

      let seekSliderValue = e.target.value;
      console.log(seekSliderValue);
      i = Math.ceil((seekSliderValue * (recording.events.length))/100);
      if(time !== undefined){
        time = recording.events[i].time;
      }

      playfunction();
    })

    function pausefunction() {
      fakeCursor.style.display = 'none';
      paused = true;
      stopTimer();
    }
    function startTimer() {
     timer =  setInterval(() => {
       time++
       setProgreeBar();
      }, 1)
    }

    function stopTimer() {
      clearInterval(timer);
    }

    function playfunction() {
       //append fake cursor when user clicks play button
       fakeCursor.style.display = 'block'

       startTimer();

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
           }

           //animates in avg frame rate (60 fps mostly) of display, so motion is smooth(tells the browser that animation needs to happen)
           if (i < recording.events.length && !paused) {
             requestAnimationFrame(draw);
           }
           else{
             stopTimer();
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
      const progress = (time/recording.events[recording.events.length - 1].time)*100;
      //seekSlider.value = progress;
  
      document.getElementsByClassName("left-time")[0].innerHTML = time/1000;
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
      {/* <button id="play">Play</button>
      <button id="pause">Pause</button> */}
    
      <div className="seek-slider">
        <div className="controller-wrapper">
            <input type="range" defaultValue="0" min = "0" max = "100" setp = "1" className="controller" id = "seekSlider"/>
        </div>
      </div>
      <div className="controller-timings">
          <span className="left-time">00:00</span>
          <span className="right-time">00:00</span>
      </div>

      <div className="player" >
        <Pause style = {pauseStyle} onPlayerClick = {handlePlayerClick} /> 
        <Play style = {playStyle} onPlayerClick = {handlePlayerClick} />
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