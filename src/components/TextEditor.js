import React from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from '../actions'
import files from "../assets/files";

function TextEditor(props) {
  console.log("running")
  const srcDoc = useSelector(state => state.srcDocs);
  const modalActive = useSelector(state => state.outputModal);
  
  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];
 
  function handleEditorChange(value) {
    file.value = value;
  }
 
  const handleOutput = () => {
      dispatch(setSrcDocs());
      dispatch(outputModalTrue());
  }

  function handleCloseModal () {
     dispatch(outputModalFalse());   
  }
  
    

  return (
    <>
    <button onClick = {handleOutput} className = "outputbutton">See Output</button>
    <div className= "sidebar" >
    <div className = "nav-heading">
    <div className="explorer">Explorer</div>
    <button
        className = "htmlbutton"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
        <i className ="fab fa-html5"></i> index.html
      </button>
      <button
        className = "stylebutton"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      > 
       <i className = "fab fa-css3-alt"></i> style.css
      </button>
      <button
        className = "scriptbutton"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
        <i className="fab fa-js-square fa-1x"></i> script.js
      </button>
    </div>
    <div>
      <Editor
        height = "100vh"
        width = "90vw"
        theme = "vs-dark"
        path={file.name}
        className = "editor"
        defaultLanguage={file.language}
        defaultValue={file.value}
        saveViewState={true}
        onChange={handleEditorChange}
        value = {file.value}
      />
    </div>
    </div>
    <div className = "texteditor">
    <button onClick = {handleOutput} className = "outputbutton">See Output</button>
      <div className = "IDE">
      <ReactModal 
           isOpen={modalActive}
           contentLabel="onRequestClose Example"
           onRequestClose={handleCloseModal}
           className="Modal"
           overlayClassName="Overlay"
           ariaHideApp={false}
        >
        <button onClick={handleCloseModal}>Close</button>
      <iframe
          srcDoc={srcDoc}
          title="output"
          className = "outputiframe"
          sandbox="allow-scripts"
          frameBorder="0"
      />
      </ReactModal>
      </div>
    </div>
    </>
  );
}

export default TextEditor;
