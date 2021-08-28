import React, { useState, useEffect } from 'react';
import Editor from './Editor'
import useLocalStorage from '../src/hooks/useLocalStorage'
import MicRecorder from 'mic-recorder-to-mp3';
import VideoScreen from './VideoScreen';

function App() {
  const Mp3Recorder = new MicRecorder({ bitRate: 128 });
  const [html, setHtml] = useLocalStorage('html', '')
  const [css, setCss] = useLocalStorage('css', '')
  const [js, setJs] = useLocalStorage('js', '')
  const [srcDoc, setSrcDoc] = useState('')
  const [Recording,setRecording] = useState({ events: [], startTime: -1 }); 
  const [tempRecording,settempRecording] = useState({ events: [], startTime: -1 }); 
  const [Audio,setAudio] = useState({ isRecording: false,blobURL: '',isBlocked: false});
  const [BlobUrl,setBlobUrl] = useState('');

  // Record each type of event
  const handlers = [
      {
        eventName: "mousemove",
        handler: function handleMouseMove(e) {
          Recording.events.push({
            type: "mousemove",
            x: e.pageX,
            y: e.pageY,
            time: Date.now()
          });
        }
      },
      {
        eventName: "click",
        handler: function handleClick(e) {
          Recording.events.push({
            type: "click",
            target: e.target.className,
            x: e.pageX,
            y: e.pageY,
            time: Date.now()
          });
        }
      },
      {
        eventName: "keypress",
        handler: function handleKeyPress(e) {
          Recording.events.push({
            type: "keypress",
            target: e.target.className,
            value: e.target.value,
            keyCode: e.keyCode,
            time: Date.now()
          });
        }
      }
  ];
  function listen(eventName, handler) {
      return document.documentElement.addEventListener(eventName, handler, true);
    }
   
  function removeListener(eventName, handler) {
       return document.documentElement.removeEventListener(
         eventName,
         handler,
         true
       );
  }
  
  function startRecording() {
    Recording.startTime = Date.now();
    Recording.events = [];
    handlers.map(x => listen(x.eventName, x.handler));

  }

  function handleClick(e) {
    e.preventDefault();
    startRecording();
    console.log('The Button was clicked.');

  }
  function stopRecording() {
    // stop recording
  
    handlers.map(x => removeListener(x.eventName, x.handler));
    console.log(Recording);
  }
  function handleStop(e) {
    e.preventDefault();
    stopRecording();
    console.log('Recording Stopped.');

  }
  function start() {
    if (Audio.isBlocked) {
      console.log('Permission Denied');
    } else {
      var A = Audio;
      A.isRecording = true;
      setAudio(A);
      Mp3Recorder
        .start()
        .then(() => {
          var A = Audio;
          A.isRecording = true;
          setAudio(A);
        }).catch((e) => console.error(e));
    }
  };

  function stop(){
    var A = Audio;
    A.isRecording = true;
    setAudio(A);
    Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, babu]) => {
        const blob = URL.createObjectURL(babu)
        var A = Audio;
        A.isRecording = false;
        A.blobURL = blob;
        setBlobUrl(blob);
        setAudio(A);
      }).catch((e) => console.log(e));
      console.log("working:", Audio.blobURL);
      console.log(Audio)
      settempRecording(Recording);
  }; 

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
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        var A = Audio;
        A.isBlocked = false;
        setAudio(A);
      },
      () => {
        var A = Audio;
        A.isBlocked = true;
        setAudio(A)
      },
    );
  },[Audio.isRecording])
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
      <button onClick={handleClick} className = "button" id="record"><img id="record_img" src="https://img.icons8.com/dusk/64/000000/record.png"/></button>
      <button onClick={handleStop} className = "button" id="record">Stop Recording</button>
      
<button onClick={start} disabled={Audio.isRecording}>Record Audio</button>
<button onClick={stop} disabled={Audio.isRecording}>Stop Audio</button>
{console.log(Audio)};
<audio src={BlobUrl} controls="controls" />

<VideoScreen rec = {Recording}/>
    </>
  )
}

export default App;
