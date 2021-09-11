import React, { useEffect, useState } from "react";
import IDE from "./IDE";
import files from "../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { js, css, html, outputModalTrue, outputModalFalse } from "../actions";
import Loader from "react-loader-spinner";
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage';

const LoaderDiv = (props) => {
  return (
    <div className = {props.status}>
      <Loader
        type="Puff"
        color="#3e3e42"
        height={100}
        width={100}
        timeout={3000} //3 secs
      />
    </div>
  )
}

export default function Video() {

  const [refresh, setRefresh] = useState("");
  const [loaderStatus,setloaderStatus] = useState("loading");
  const modalActive = useSelector(state => state.outputModal);
  const dispatch = useDispatch();

  
  useEffect(() => {

    let audioValue;
    let offsetPlay = 0;
    localStorage.setItem("lastSessionTimeStamp", JSON.stringify(offsetPlay));

    // fetch recording from local storage
    let recording = { events: [] };
    const recordingJsonValue = localStorage.getItem("recording");
    //const audioValue = JSON.parse(localStorage.getItem("file"));
    firebase.firestore().collection('events').orderBy('createdAt', 'desc').limit(1).get()
    .then((snap) => {
        snap.forEach((doc) => {
          recording = JSON.parse(doc.data().recordingString)
        })
        setloaderStatus("loading-hide");
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
  
  audioPlayer.addEventListener("onclick", (e) => {
    console.log("Click on the audioPlayer")
    console.log(e)
  })

    fakeCursor.className = "customCursor";
    
    var i = 0;
    var paused = false;
  
    audioPlayer.addEventListener("play", () => {
      audioPlayer.play();
      playfunction();
      console.log(audioPlayer.duration)
      console.log("audio play")
    })

    audioPlayer.addEventListener("pause", () => {
      console.log("clicked pause");
      audioPlayer.pause();
      pausefunction();
    })
    
    audioPlayer.addEventListener("ended", () => {
      pausefunction();
      console.log("ended audio")
    })

    audioPlayer.addEventListener("seeking", () => {
      fakeCursor.style.display = 'none';
      paused = true;
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

      //i = Math.floor((curTime/dur)*recording.events.length)
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
      //playfunction();
      audioPlayer.pause()
    })

    
    function pausefunction() {
      fakeCursor.style.display = 'none';
      paused = true;
      localStorage.setItem("lastSessionTimeStamp", JSON.stringify(offsetPlay));
    }


    function playfunction() {
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

         if (event.time <= offsetPlay && event.time<=audioPlayer.currentTime*1000) {
           //draws event amd matches with listner
           drawEvent(event, fakeCursor);
           i++;
         }

         
         if (i >= recording.events.length || paused) {
           clearInterval(frames);
         } 
     };

     frames = setInterval(() => {
       if(!paused) draw();
     }, 1)
    }

    
    function handleButtonEvents(target) {
      console.log(target)
      switch (target) {
        case "stylebutton":
             dispatch(css());   
                  
          break;
        case "htmlbutton":
             dispatch(html());     
          break;
        case "scriptbutton":
             dispatch(js());
          break;
        case "outputbutton":
             dispatch(outputModalTrue());
          break;
        default:
             if(modalActive === true){
               dispatch(outputModalFalse());
             }
          break;
      }
    }

    function drawEvent(event, fakeCursor) {
      if (event.type === "mousemove") {
        console.log("mousemove");
       //document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px";
        fakeCursor.style.left = JSON.stringify(event.x) + "px";
        fakeCursor.style.top = JSON.stringify(event.y) + "px";
        const path = event.target;
        var tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
        }
      }
      if (event.type === "click") {
        
        flashClass(fakeCursor, "click");
        tar = document.getElementsByClassName(event.target)[0];
        if(tar !=  null){
          handleButtonEvents(tar.className);
          flashClass(tar, "clicked");
        }
      }
      if (event.type === "keyup") {
        const path = event.target;
        tar = document.getElementsByClassName(path)[0];
        if (tar != null) {
          tar.focus();
          files[event.fileName].value = event.value;
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
  }, [dispatch,modalActive]);

  return (
    <>
      <LoaderDiv status = {loaderStatus}/>
      <IDE refresh = {refresh}/>
      <div className = "videoplayer"> 
      <audio id="audio_player" controls="controls" controlsList="nodownload" src={localStorage.getItem("url")}></audio>
      </div>
    </>
  );
}
