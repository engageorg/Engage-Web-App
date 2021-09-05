import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html } from '../actions'
import files from "../assets/files";

function TextEditor(props) {
 
  const [srcDoc, setSrcDoc] = useState('')
  const [modalActive, setmodalActive] = useState(false);
  
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
      setmodalActive(true);
  }

  function handleCloseModal () {
    setmodalActive(false);
  }

  return (
    <div className = "texteditor">

      <button
        className = "htmlbutton"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
        <i class="fab fa-html5"></i> index.html
      </button>
      <button
        className = "stylebutton"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      > 
       <i class="fab fa-css3-alt"></i> style.css
      </button>
      <button
        className = "scriptbutton"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
        <i class="fab fa-js"></i> script.js
      </button>
      <div className = "IDE">
      <Editor
        height="80vh"
        width="100vw"
        theme="vs-dark"
        path={file.name}
        className = "editor"
        defaultLanguage={file.language}
        defaultValue={file.value}
        onChange={handleEditorChange}
        value = {(props.value) === undefined ? "" : props.value}
      />
      <ReactModal 
           isOpen={modalActive}
           contentLabel="onRequestClose Example"
           onRequestClose={handleCloseModal}
           className="Modal"
           overlayClassName="Overlay"
        >
      <iframe
          srcDoc={srcDoc}
          title="output"
          className = "outputiframe"
          sandbox="allow-scripts"
          frameBorder="0"
      />
      </ReactModal>
      </div>
      <button onClick = {handleOutput}>See Output</button>

      

    </div>
  );
}

export default TextEditor;
