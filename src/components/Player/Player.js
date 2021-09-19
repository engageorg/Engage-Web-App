import React, { useEffect, useState } from "react";
import IDE from "../IDE";
import files from "../../assets/files";
import { useDispatch } from "react-redux";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from "../../actions";
import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/storage';
import "./style.css";
import Playbutton from "../../assets/playbutton.svg"
let audioValue;

export default function Video() {

  const [refresh, setRefresh] = useState("");
  const dispatch = useDispatch();

  
  useEffect(() => {

    let offsetPlay = 0;
    localStorage.setItem("lastSessionTimeStamp", JSON.stringify(offsetPlay));
    const videoPlayer = document.getElementsByClassName('videoplayer')[0]
    const playButton = document.getElementsByClassName("playButton")[0]
    // fetch recording from local storage
    let recording = { events: [] };
    const recordingJsonValue = localStorage.getItem("recording");
    //const audioValue = JSON.parse(localStorage.getItem("file"));
    firebase.firestore().collection('events').orderBy('createdAt', 'desc').limit(1).get()
    .then((snap) => {
        snap.forEach((doc) => {
          recording = JSON.parse(doc.data().recordingString)
        })
        // setloaderStatus("loading-hide");
      })

    if (recordingJsonValue != null) recording = JSON.parse(recordingJsonValue);

    console.log(recording);

    var storageRef = firebase.storage().ref();
    storageRef.child('audio&amp').getDownloadURL().then((url) => {
      audioValue = url
      localStorage.setItem("url", url)
      console.log(audioValue)
    }).catch((e) => {
      console.log(e)
    })

    //fake cursor for playing
    const fakeCursor = document.createElement("div");
    document.getElementById("root").appendChild(fakeCursor);
    fakeCursor.style.display = 'none'
    const audioPlayer = document.getElementById("audio_player")
    var startPlay;
    console.log(playButton)
    audioPlayer.addEventListener("onclick", (e) => {
      console.log("Click on the audioPlayer")
      console.log(e)
    })

    fakeCursor.className = "customCursor";
    
    var i = 0;
    var paused = false;

    audioPlayer.addEventListener("canplaythrough", () => {
      console.log("loaded")
    })
  
    audioPlayer.addEventListener("play", () => {
      playButton.style.display="none"
      playfunction();
      console.log("audio play")
    })

    audioPlayer.addEventListener("pause", () => {
      console.log("clicked pause");
      pausefunction();
    })
    
    audioPlayer.addEventListener("ended", () => {
      pausefunction();
      console.log("ended audio")
    })

    audioPlayer.addEventListener("seeking", () => {
      fakeCursor.style.display = 'none';
      pausefunction()
      audioPlayer.pause()
      //returns the time at which the audio is after seeking it
      const curTime = audioPlayer.currentTime
     
      //TODO: Implement binary search or lower bound
      for(let x=0;x<recording.events.length;x++){
        if(recording.events[x].time>curTime*1000){
          i=x;
          break;
        }
      }

      console.log(i)
      console.log(recording.events[i].time)
      console.log(curTime)
      //localStorage.setItem("lastSessionTimeStamp", JSON.stringify(recording.events[i].time))
      if( recording.events[i].time>(curTime*1000)){
        localStorage.setItem("lastSessionTimeStamp", recording.events[i].time)
      }else{
        localStorage.setItem("lastSessionTimeStamp", curTime*1000)
      }
      //handlePlayerClick()
    })

    playButton.addEventListener("click", () => {
      playButton.style.display="none"
      videoPlayer.style.display="flex"
      audioPlayer.play();
      playfunction();
    })

    function pausefunction() {
      fakeCursor.style.display = 'none';
      paused = true;
      localStorage.setItem("lastSessionTimeStamp", JSON.stringify(offsetPlay));
    }


    function playfunction() {
       
      if( document.getElementsByClassName("videoscreen")[0] != null) document.getElementsByClassName("videoscreen")[0].className = "visiblescreen";
       //append fake cursor when user clicks play button
       fakeCursor.style.display = 'block';
       startPlay = Date.now()
       paused = false;
       var frames;
       //draw event to play all events in requestAnimationFrames
       function draw() {
           //select an event and check if its empty
           let event = recording.events[i];
           if (!event) {
             return;
           }

           if(localStorage.getItem("lastSessionTimeStamp") !== null){
            offsetPlay = JSON.parse(localStorage.getItem("lastSessionTimeStamp")) + Date.now() - startPlay;
           }
           else{
            offsetPlay = (Date.now() - startPlay) * 1;
           }

         if (event.time <= offsetPlay) {
           //draws event amd matches with listner
           drawEvent(event, fakeCursor);
           i++;
         }

         
         if (i >= recording.events.length || paused) {
           clearInterval(frames);
           if(i >= (recording.events.length - 1)){
             i = 0
           }
         } 

     };

     frames = setInterval(() => {
       if(!paused) draw();
     }, 1)
    }

    
    function handleButtonEvents(target) {
      switch (target) {
        case "outputtext":
             dispatch(setSrcDocs());
             dispatch(outputModalTrue());
          break;
        case "buttontext output":
            dispatch(setSrcDocs());
            dispatch(outputModalTrue());
         break;
        case "fas fa-play":
          dispatch(setSrcDocs());
          dispatch(outputModalTrue());
          break;
        case "fas fa-window-close":
             dispatch(outputModalFalse());
          break;
        case "style.css":
            dispatch(css());             
         break;
        case "buttontext style":
          dispatch(css());             
         break;
        case "index.html":
            dispatch(html());     
         break;
        case "script.js":
            dispatch(js());
         break;
        case "buttontext script":
            dispatch(js());
         break;
        default: 
          break;
      }
    }

    function drawEvent(event, fakeCursor) {
      if (event.type === "mousemove") {
       //document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px";
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
        fakeCursor.style.top = JSON.stringify(event.y) + "px";
        const path = event.target;
        handleButtonEvents(event.fileName);
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();

        }
      }
      if (event.type === "click") {
        
        flashClass(fakeCursor, "click");
        tar = document.getElementsByClassName(event.target)[0];
        if(tar !=  null){
          handleButtonEvents(event.fileName);
          handleButtonEvents(event.target);
          flashClass(tar, "clicked");
        }
      }
      if (event.type === "keyup") {
        const path = event.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          files[event.fileName].value = event.value;
          handleButtonEvents(event.fileName);
          setRefresh(event.value);
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
    <div>
      <div className = "videoscreen">
      <IDE refresh = {refresh}/>
      </div>
      <div className="playButton">
      <div className="container"><a className="button button-play"></a></div>
      </div>
      <div className = "videoplayer"> 
      <audio preload = "auto" id="audio_player" controls="controls" controlsList="nodownload" src={audioValue}></audio>
      </div>
    </div>
  );
}
