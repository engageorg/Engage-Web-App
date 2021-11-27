import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import Split from 'react-split'

import {
  js,
  css,
  html,
  setSrcDocs,
} from "../actions";
import files from "../assets/files";
import "./style.css";
import ChalkBoard from "../ChalkBoard";

function TextEditor(props) {
  const srcDoc = useSelector((state) => state.srcDocs);

  const fileName = useSelector((state) => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

  function handleEditorChange(value) {
    file.value = value;
  }
  
  useEffect(() => {
      dispatch(setSrcDocs());
      document.getElementsByClassName("code_text")[0].addEventListener("keyup", function () {
        dispatch(setSrcDocs());
      });
      document.getElementsByClassName("closechalkboard")[0].addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display = "none"
      })

      document.getElementsByClassName("output")[0].addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display = "block"
        console.log("mousemovddddddddde");
      }) 
  },[]);

  useEffect(() => {
    var frame =
      document.getElementsByClassName("outputiframe")[0].contentDocument;
    
    frame.open();
    frame.write("");
    frame.write(srcDoc);
    frame.close();
    var fra =
      document.getElementsByClassName("outputiframe")[0].contentDocument;
    fra.addEventListener("click", function () {
      console.log("clicked!");
    });

    fra.addEventListener("mousemove", function () {
      console.log("mousemove");
    });
    

  });

  const handleOutput = () => {
    dispatch(setSrcDocs());
  };




  return (
    <div className="text-editor">
      {/* Sidebar   */}
      <div className="editor-sidebar">
        <div className="sidebar-heading">
          <span id="explorer-spam">Explorer</span>
          <button className="sidebar-add-file">
            {/* <i className = "fas fa-plus" style = {{color : "#fffffe" }}></i>  */}
          </button>
        </div>
        <div className="sidebar-navbutton">
          <button
            className="htmlfile"
            disabled={fileName === "index.html"}
            onClick={() => dispatch(html())}
          >
            <i className="fab fa-html5"></i>{" "}
            <span className="buttontext html">{files["index.html"].name} </span>
          </button>

          <button
            className="cssfile"
            disabled={fileName === "style.css"}
            onClick={() => dispatch(css())}
          >
            <i className="fab fa-css3-alt"></i>{" "}
            <span className="buttontext style">{files["style.css"].name} </span>
          </button>

          <button
            className="jsfile"
            disabled={fileName === "script.js"}
            onClick={() => dispatch(js())}
          >
            <i className="fab fa-js-square"></i>{" "}
            <span className="buttontext script">
              {files["script.js"].name}{" "}
            </span>
          </button>
        </div>
        <div className="sidebar-footer">

          <button
            
            style={{
              color: "white",
              backgroundColor: "green",
              padding: "7px",
              borderRadius: "5px",
            }}
            className="output"
          >
            <i className="fas fa-chalkboard-teacher"></i>
            <span
              className="outputtext"
              style={{ color: "white", backgroundColor: "green" }}
            >
              {" "}
              Chalkboard
            </span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="editor">
      <Split
          sizes={[25, 75]}
          direction="horizontal"
          cursor="col-resize"
          className="split-flex"
      >
        <Editor
          height="100vh"
          width="47vw"
          theme="vs-light"
          path={file.name}
          defaultLanguage={file.language}
          defaultValue={file.value}
          saveViewState={true}
          onChange={handleEditorChange}
          cursorSmoothCaretAnimation="true"
          value={file.value}
          className="code_text"
        />
        <iframe
          height="100vh"
       
          src="./output/output.html"
          title="output"
          className="outputiframe"
          frameBorder="0"
        />

</Split>
      </div>

      <div className="chalkboardweb">
          <button className = "closechalkboard"><i className=" fas fa-window-close"></i></button>
          <ChalkBoard />
      </div>
    </div>
  );
}

export default TextEditor;
