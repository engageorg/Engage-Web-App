import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import { useSelector, useDispatch } from "react-redux";
import { js, css, html } from "../actions";
import files from "../assets/files";
import ReactPlayer from 'react-player'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage';

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
  let audioValue
  const dispatch = useDispatch();
  const file = files[fileName];
  let blobURL;

  // fetch recording from local storage
  let recording = { events: [], startTime: -1 };
  const recordingJsonValue = localStorage.getItem("recording");
  //const audioValue = JSON.parse(localStorage.getItem("file"));
  firebase.firestore().collection('events').orderBy('createdAt', 'desc').limit(1).get()
  .then((snap) => {
      snap.forEach((doc) => {
        recording = JSON.parse(doc.data().recordingString)
      })
  })

  if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);
  console.log(recording)  

  const handlePlayerClick = () => {
    setplayStatus(!playStatus);
    if (playStatus === false) {
      setplayStyle({display : "none"});
      setpauseStyle({display : "block"});
    } else {
      setplayStyle({display : "block"});
      setpauseStyle({display : "none"});
    }
  }

  
  useEffect(() => {
    var storageRef = firebase.storage().ref();
    var audioRef = storageRef.child('audio');
    storageRef.child('audio&amp').getDownloadURL().then((url) => {
      audioValue = url
      localStorage.setItem("url", url)
      console.log(audioValue)
    }).catch((e) => {
      console.log(e)
    })

  //fake cursor for playing
  const fakeCursor = document.createElement("div");
  blobURL = (localStorage.getItem("audio"))
  document.getElementById("root").appendChild(fakeCursor);
  fakeCursor.style.display = 'none'
  const audioPlayer = document.getElementById("audio_player")
  
  audioPlayer.addEventListener("onclick", (e) => {
    console.log("Click on the audioPlayer")
    console.log(e)
  })

    console.log(playStatus);
    // if(recording.events[recording.events.length - 1].time%1000 !==0){
    //   document.getElementsByClassName("right-time")[0].innerHTML = (Math.floor(recording.events[recording.events.length - 1].time+1000)/1000).toPrecision(1);
    // }else{
    //   document.getElementsByClassName("right-time")[0].innerHTML = recording.events[recording.events.length - 1].time/1000;
    // }
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
      handlePlayerClick()
      pausefunction();
      //this might be getting value different when the slider is moving
      let seekSliderValue = e.target.value;//this gives the current value so if slider is at 90 and you click on 10 then it will return 90
      i = Math.ceil((seekSliderValue * (recording.events.length))/100);
      if(time !== undefined){
        time = recording.events[i].time;
      }
      handlePlayerClick()
      playfunction();
    })

    // seekSlider.addEventListener("mouseup", () => {
    //   console.log("mouseup")
    //   playfunction();
    // })
    
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
      audioPlayer.pause();
      pausefunction();
      //console.log(audioPlayer.currentTime)
    });

    play.addEventListener("click", function () {
      console.log(i);
      console.log("clicked play")
      audioPlayer.play();
      playfunction();
    });

    function setProgreeBar() {
      const progress = (time/recording.events[recording.events.length - 1].time)*100;
      //seekSlider.value = progress;
      // if(parseFloat(document.getElementsByClassName("left-time")[0].innerHTML) <= parseFloat(document.getElementsByClassName("right-time")[0].innerHTML)){
      //   document.getElementsByClassName("left-time")[0].innerHTML = (time/1000).toPrecision(1);
      // }
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
       //document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px";
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
        fakeCursor.style.top = JSON.stringify(event.y) + "px";
        const path = event.target;
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          setKeycode(event.value);
        }
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
      <div className = "videoplayer"> 
      <div className="player" >
        <Pause style = {pauseStyle} onPlayerClick = {handlePlayerClick} /> 
        <Play style = {playStyle} onPlayerClick = {handlePlayerClick} />
      </div>   
      <div className="seek-slider">
        <div className="controller-wrapper">
            <input type="range" defaultValue="0" min = "0" max = "100" setp = "1" className="controller" id = "seekSlider"/>
        </div>
      </div>
      {/* <div className="controller-timings">
          <span className="left-time">00:00</span>
          <span className="right-time">00:00</span>
      </div> */}

      
      <audio id="audio_player" controls="controls"  style={{display:"none"}} src={localStorage.getItem("url")}></audio>
      </div>
    </>
  );
}