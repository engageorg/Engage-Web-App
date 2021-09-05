import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html } from '../actions'
import files from "../assets/files";




function TextEditor(props) {
 
  const [srcDoc, setSrcDoc] = useState('')
  
  
  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

  function handleEditorChange(value, event) {
    if(props.parentCallBack){
      props.parentCallBack(value)
    }
    files[fileName].value = value;

  }

  const handleOutput = () => {
      setSrcDoc(`
        <html>
          <body>${files["index.html"].value}</body>
          <style>${files["style.css"].value}</style>
          <script>${files["script.js"].value}</script>
        </html>
      `)  
  }

  return (
    <div className = "texteditor">

      <button
        className = "htmlbutton"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
        index.html
      </button>
      <button
        className = "stylebutton"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      >
        style.css
      </button>
      <button
        className = "scriptbutton"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
        script.js
      </button>
      <div className = "IDE">
      <Editor
        height="80vh"
        width="50vw"
        theme="vs-dark"
        path={file.name}
        className = "editor"
        defaultLanguage={file.language}
        defaultValue={file.value}
        onChange={handleEditorChange}
        value = {(props.value) === undefined ? "" : props.value}
      />
      <iframe
          srcDoc={srcDoc}
          title="output"
          className = "outputiframe"
          sandbox="allow-scripts"
          frameBorder="0"
      />
      </div>
      <button onClick = {handleOutput}>See Output</button>

      

    </div>
  );
}

export default TextEditor;
