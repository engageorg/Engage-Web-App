import React, { useEffect, useState } from "react";
import IDE from "../IDE";
import files from "../assets/files";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from "../actions";
import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/storage';
import "./style.css";
import ChalkBoard from "../ChalkBoard/index";
import img from "../assets/Gear-0.2s-200px.png"

function Preloader(){
  return(
    <div className = "loader">
       <div className ="preloader">
        <div className = "load">
	         <img src= {img} border="0"/>
        </div>
       </div>
    </div>
  )
}

export default function Video(props) {
  
  //lecture fetching from firebase and which text editor to open
  const { id, type } = useParams();
  const name = type.slice(0,3)
  const language = type.slice(3, 10)

  //TODO needed to reload the text editor
  const [refresh, setRefresh] = useState("");

  const dispatch = useDispatch();
  
  
  useEffect(() => {

    //TODO naming of var 
    const playerBlock = document.getElementsByClassName("player-content")[0];
    const videoPlayer = document.getElementsByClassName('videoplayer')[0];
    const playButton = document.getElementsByClassName("playButton")[0];
    const audioPlayer = document.getElementById("audio_player")
    var startPlay;
    let offsetPlay = 0;
    var i = 0;
    var paused = false;

    localStorage.setItem("lastSessionTimeStamp", JSON.stringify(offsetPlay));

    // fetch recording from local storage
    let recording = { events: [] };

    // fetch from firebase collection
    firebase.firestore().collection('events').where(firebase.firestore.FieldPath.documentId(), '==', id).get()
    .then((snap) => {
        snap.forEach((doc) => {
             console.log(doc.data())
             recording = JSON.parse(doc.data().recordingString)
        })
      }).catch((err) => {
        console.log(err)
      })


    // fetch from cloud storage
    var storageRef = firebase.storage().ref();
    storageRef.child((id)).getDownloadURL().then((url) => {
      audioPlayer.src = url
      localStorage.setItem("url", url)
    }).catch((e) => {
      console.log(e)
    })

    //fake cursor for playing, create and append
    const fakeCursor = document.createElement("div");
    fakeCursor.className = "customCursor";
    document.getElementById("root").appendChild(fakeCursor);
    fakeCursor.style.display = 'none'

    function playerPlay() {
      playButton.style.display="none"
      playfunction();
      const data = {
        status:false
      }
      const event = new CustomEvent("status", { detail: data });
      document.dispatchEvent(event);
    }

    function playerPause() {
      console.log("clicked pause");
      const data = {
        status:true
      }
      const event = new CustomEvent("status", { detail: data });
      document.dispatchEvent(event);
      pausefunction();
    }


    //pause/play on spacebar and dispach an event acc
    playerBlock.addEventListener("keypress", (e) => {
      if(e.charCode === 32){
        if(audioPlayer.paused){
          audioPlayer.play()
          playerPlay()
          console.log("audio play")
        }else{
          audioPlayer.pause()
          playerPause()
        }
      }
    })
    
    //init player
    audioPlayer.addEventListener("canplay", () => {
      document.getElementsByClassName("player-content")[0].style.display = "block";
      document.getElementsByClassName("loader")[0].style.display = "none";
      console.log("loaded")
    })
    
    //TODO
    audioPlayer.addEventListener("play", () => {
      playerPlay()
      console.log("audio play")
    })
    
    //TODO
    audioPlayer.addEventListener("pause", () => {
      playerPause()
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
        if(recording.events[x].time >= curTime*1000){
          i=x;
          break;
        }
      }

      if( recording.events[i].time>(curTime*1000)){
        localStorage.setItem("lastSessionTimeStamp", recording.events[i].time)
      }else{
        localStorage.setItem("lastSessionTimeStamp", curTime*1000)
      }
    
    })

    playButton.addEventListener("click", () => {
      playButton.style.display="none";
      videoPlayer.style.display="flex";
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
           
           //must have pause before
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
          //  if(i >= (recording.events.length - 1)){
          //    paused = true
          //  }
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
        case "output":
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
      if (event.type === "mousedown") {
        let eve = new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: event.button,
          clientX : event.clientX,
          clientY : event.clientY,
          shiftKey : event.shiftKey,
        });
        console.log(event.target)
        if(document.getElementsByClassName(event.target)[0])document.getElementsByClassName(event.target)[0].dispatchEvent(eve);

      }
      else if (event.type === "mousemove") {

        // TODO: Add e.buttons too
        let eve = new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          button: event.button,
          clientX : event.clientX,
          clientY : event.clientY,
          shiftKey : event.shiftKey,
        });
       
        if(document.getElementsByClassName(event.class)[0]){
          document.getElementsByClassName(event.class)[0].dispatchEvent(eve);
        }
        
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
      else if (event.type === "keydown") {
        if(document.getElementsByClassName("canvas_text")[0]){
          document.getElementsByClassName("canvas_text")[0].innerText =  event.innerText;
        } 
      }
      else if (event.type === "mouseup") {
        
        let eve = new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true
        });
        if(document.getElementsByClassName(event.target)[0])document.getElementsByClassName(event.target)[0].dispatchEvent(eve);
      }
      else if (event.type === "click") {
        if(document.getElementsByClassName(event.target)[0] !== undefined){
          let clickEvent = new MouseEvent("click", {
            pageX: event.x,
            pageY: event.y, 
            bubbles: true,
            cancelable: true,
          });
          
          document.getElementsByClassName(event.target)[0].dispatchEvent(clickEvent);
        }
        if(event.target === "rectangle" || event.target === "ellipse" || event.target === "arrow" || event.target === "selection") document.getElementsByClassName(event.target)[0].click();
        flashClass(fakeCursor, "click");
        tar = document.getElementsByClassName(event.target)[0];
        if(tar !=  null){
          handleButtonEvents(event.fileName);
          handleButtonEvents(event.target);
          flashClass(tar, "clicked");
        }
      }
      else if (event.type === "keyup") {
        const path = event.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          if(path==="userInputArea"){
            tar.value = event.value
            }else{
              files[event.fileName].value = event.value;
              handleButtonEvents(event.fileName);
              setRefresh(event.value);
            }
        }
      }
      else if(event.type === "output") {
        const path = event.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          if(path==="userOutputArea"){
            tar.value = event.value
            }
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
      <Preloader/>
      <div className = "player-content">
      <div className = "videoscreen">
      {/* <IDE name={name} refresh = {refresh}/> */}
      {name==="dra" ? <div className="chalk"><ChalkBoard /></div>: <IDE name={name} language={language} refresh={refresh}/>}
      </div>
      <div className="playButton">
      <div className="container"><a className="button button-play"></a></div>
      </div>
      <div className = "videoplayer"> 
         <audio id="audio_player" controls="controls" controlsList="nodownload"></audio>
      </div>
      </div>

    </div>
  );
}
