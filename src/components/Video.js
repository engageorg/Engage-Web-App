import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage'


export default function Video() {

    const [rec, setrec] = useLocalStorage('recording', '');
    //console.log(rec);
 
    useEffect(() => {
    const fakeCursor = document.createElement('div');
    fakeCursor.className = "cursor";
    var play = document.getElementById("play");
    let i = 0;
    play.addEventListener("click",function(){ 
                  document.getElementById("root").appendChild(fakeCursor);
                  const startPlay = Date.now();

                  var doc = document.documentElement;
                  (function draw(){
                    let event = rec.events[i];
                    if (!event) {
                      return;
                    }
                    let offsetRecording = event.time - rec.startTime;
                    let offsetPlay = (Date.now() - startPlay) * 1;
                    if (offsetPlay >= offsetRecording) {
                      drawEvent(event, fakeCursor, doc);
                      i++;
                    }   
                    
                    if(i < rec.events.length){
                      requestAnimationFrame(draw);
                    }
                  })();
      })

     

          function drawEvent(event, fakeCursor, Doc) {
            if (event.type === "click" || event.type === "mousemove") {
                console.log("mouse");
                document.getElementsByClassName("cursor")[0].style.top = JSON.stringify(event.y) + "px"
                fakeCursor.style.left = JSON.stringify(event.x) + "px"
                console.log("y:", fakeCursor.style);  
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
            setTimeout(function(){ el.classList.remove(className); }, 200);
          }
    })

    return(
        <>
        <div className = "heading">test</div>
        
        <input className = "input1"></input>
        
        <input className = "input2"></input>
        
        <input className = "input3"></input>

        <button  className="record">Start Record</button>
        <button  className = "button" id="record">Stop Recording</button>
        <button id = "play">Play</button>
        </>
    )
}