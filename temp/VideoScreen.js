import React, { useState, useEffect } from 'react';
import Editor from './Editor'

function App(props) {

  console.log("video: ",props.rec);
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [srcDoc, setSrcDoc] = useState('')
  const rec = props.rec;
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `)
    }, 250)

    return () => clearTimeout(timeout)
  }, [html, css, js])
  
  useEffect(() => {
    var cur_prog = 0,html,css,js;
    const fakeCursor = document.createElement('div');
    var play = document.getElementById("pa");
    let i = 0;
    play.addEventListener("click",function(){
      var cursor = document.getElementsByClassName("cursor");
      for(i = 0; i < cursor.length; i++){
                    cursor[i].remove();
      }
      const fakeCursor = document.createElement('div');
                  fakeCursor.className = "cursor";
                  document.body.appendChild(fakeCursor);
                  const startPlay = Date.now();
      })
      var doc = document.documentElement;
      const startPlay = Date.now();
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
          var tar = document.getElementById(event.target);
          flashClass(tar, "clicked");
        }
        if (event.type === "keypress") {
          console.log("keypress");
          const path = event.target;
          var tar = document.getElementById(path);
          tar.focus();
          tar.value = event.value;
        } 
      }

      function flashClass(el, className) {
        el.classList.add(className);
        setTimeout(function(){ el.classList.remove(className); }, 200);
      }
  })
  return (
    <>
       <div className="pane top-pane">
        <Editor
          language="xml"
          displayName="HTML"
          value={html}
          onChange={setHtml}
          classn="htmltext"
        />
        <Editor
          language="css"
          displayName="CSS"
          value={css}
          onChange={setCss}
          classn="csstext"
        />
        <Editor
          language="javascript"
          displayName="JS"
          value={js}
          onChange={setJs}
          classn="jstext"
          
        />
      </div>
      <div className="pane">
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          frameBorder="0"
          width="100%"
          height="100%"
        />
      </div>
      <button id="pa">play</button>
    </>
  )
}

export default App;