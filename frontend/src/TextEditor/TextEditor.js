import React, { useEffect } from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from '../actions'
import files from "../assets/files"
import "./style.css"
import ChalkBoard from "../ChalkBoard";



function TextEditor(props) {
  const srcDoc = useSelector(state => state.srcDocs);
  const modalActive = useSelector(state => state.outputModal);

  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

  function handleEditorChange(value) {
    file.value = value;
  }
  
  useEffect( () => {

    var frame = document.getElementsByClassName("outputiframe")[0].contentDocument;
  
    frame.open()
    frame.write(srcDoc);
    frame.close()
    var fra = document.getElementsByClassName("outputiframe")[0].contentDocument;
    fra.addEventListener("click", function() {
      console.log("clicked!")
    })
  
    fra.addEventListener("mousemove", function() {
      console.log("mousemove")
    })
  
  });

  const handleOutput = () => {
    dispatch(setSrcDocs());
    console.log("l")
  }

  const handleDrawBoard = () => {
    dispatch(outputModalTrue());
    console.log("l")
  }

  function handleCloseModal() {
    dispatch(outputModalFalse());
  }

  return (
    <div className = "text-editor">

    {/* Sidebar   */}
    <div className = "editor-sidebar">
    <div className = "sidebar-heading">
      <span id = "explorer-spam" >Explorer</span>
      <button className = "sidebar-add-file">
        {/* <i className = "fas fa-plus" style = {{color : "#fffffe" }}></i>  */}
      </button>
    </div>
    <div className = "sidebar-navbutton">

     <button
        className = "htmlfile"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
      <i className ="fab fa-html5"></i> <span className = "buttontext html" >{files["index.html"].name} </span>
     </button>

     <button
        className = "cssfile"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      > 
      <i className = "fab fa-css3-alt"></i> <span className = "buttontext style" >{files["style.css"].name} </span>
      </button>

      <button
        className = "jsfile"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
      <i className="fab fa-js-square"></i> <span className = "buttontext script" >{files["script.js"].name} </span>
      </button>


    </div>
    <div className = "sidebar-footer">
    <button onClick={handleOutput} style = {{color : "white", backgroundColor: "green", padding: "5px", borderRadius: "5px"}} className="output"><i style = {{color : "white"}} className="fas fa-play"></i><span className = "outputtext" style = {{color : "white", backgroundColor: "green"}}> See Output</span></button>
    <button onClick={handleDrawBoard} style = {{color : "white", backgroundColor: "green", padding: "5px", borderRadius: "5px"}} className="output"><i style = {{color : "white"}} className="fas fa-play"></i><span className = "outputtext" style = {{color : "white", backgroundColor: "green"}}> Chalkboard</span></button>
    </div>
    </div>

    {/* Editor */}
    <div className = "editor">
    <Editor
            height="100vh"
            width="47vw"
            theme="vs-light"
            path={file.name}
            defaultLanguage={file.language}
            defaultValue={file.value}
            saveViewState={true}
            onChange={handleEditorChange}
            cursorSmoothCaretAnimation = "true"
            value={file.value}
          />
    <iframe
              height="100vh"
              width="47vw"
              src= "./output/output.html"
              title="output"
              className="outputiframe"
              frameBorder="0"
    />
    </div>


    <ReactModal
            className="outputModal Modal"
            isOpen={modalActive}
            contentLabel="onRequestClose Example"
            onRequestClose={handleCloseModal}
            overlayClassName="Overlay"
            ariaHideApp={false}
          >
           
            <div className="closeButton"><i className="fas fa-window-close" onClick={handleCloseModal}></i></div>
            <ChalkBoard/>
          
          </ReactModal>

    </div>
  );
}

export default TextEditor;
