import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage'


export default function Video() {

    const [rec, setrec] = useLocalStorage('recording', '');
    //console.log(rec);
 
    useEffect(() => {
        var cur_prog = 0,html,css,js;
        const fakeCursor = document.createElement('div');
        var play = document.getElementsByClassName("play")[0];
        let i = 0;
        console.log(play);
        play.addEventListener("click",function(){
         
          //remove cursor from previous draw
          var cursor = document.getElementsByClassName("cursor");
          for(i = 0; i < cursor.length; i++){
                        cursor[i].remove();
          }

          //create a new cursor
          const fakeCursor = document.createElement('div');
          fakeCursor.className = "cursor";
          document.body.appendChild(fakeCursor);
          const startPlay = Date.now(); 
          
          //play recording
          let event = rec.events[i];
          if (!event) {
            return;
          }
          let offsetRecording = event.time - rec.startTime;
          let offsetPlay = (Date.now() - startPlay) * 1;
          
          function player() {
          if(offsetPlay >= offsetRecording) {
            drawEvent(event, fakeCursor, document.documentElement);
            i++;
            offsetRecording = event.time - rec.startTime;
            event = rec.events[i];
            
          }
          }
          
          })
   
          function drawEvent(event, fakeCursor, Doc) {
            if (event.type === "click" || event.type === "mousemove") {
                console.log("mouse");
                fakeCursor.style.top = event.y
                fakeCursor.style.left = event.x  
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
        <button className = "play">Play</button>
        </>
    )
}