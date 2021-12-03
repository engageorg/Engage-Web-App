import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Hook, Console, Unhook } from 'console-feed'
import Editor from "@monaco-editor/react";
import Split from 'react-split';
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
  const [logs, setLogs] = useState([])
  const fileName = useSelector((state) => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

  function handleEditorChange(value) {
    file.value = value;
  }
  
  useEffect(() => {
      let timer;     
      let selectedSidebar = false;  
      let consoleView = false;     
      const waitTime = 500; //in ms
      dispatch(setSrcDocs());
      document.getElementsByClassName("code_text")[0].addEventListener("keyup", function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
          dispatch(setSrcDocs());
      }, waitTime);
      });
      document.getElementsByClassName("closechalkboard")[0].addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display = "none"
      })

      document.getElementsByClassName("output")[0].addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display = "block"
      }) 

      

      document.getElementsByClassName("folder")[0].addEventListener("click", function () {
        console.log(selectedSidebar)
        if(selectedSidebar === true){
          document.getElementsByClassName("selected-sidebar")[0].style.display = "none";
          selectedSidebar = false;
        }
        else {
          document.getElementsByClassName("selected-sidebar")[0].style.display = "flex";
          selectedSidebar = true;
        }
      }) 

      document.getElementsByClassName("console-button")[0].addEventListener("click", function () {
       
        if(consoleView === true){
          document.getElementsByClassName("console_window")[0].style.display = "none";
          consoleView = false;
        }
        else {
          document.getElementsByClassName("console_window")[0].style.display = "block";
          consoleView = true;
        }
      }) 

      Hook(
        document.getElementsByClassName("outputiframe")[0].contentWindow.console,
        (log) => setLogs((currLogs) => [...currLogs, log]),
        false
      )
      return () => Unhook(document.getElementsByClassName("outputiframe")[0].contentWindow.console)
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
    

  }, [srcDoc]);


  return (
    <div className="text-editor">
      {/* Sidebar   */}
      <div className="editor-sidebar">
      <button className = "folder sidenav-buttons"><i class="far fa-folder"></i></button>
      <button className="output sidenav-buttons"> <i className="fas fa-chalkboard-teacher"></i></button> 
      </div>
      <div className="selected-sidebar">
       <div className="sidebar-heading">
          <span id="explorer-spam">Explorer</span>
          <button className="sidebar-add-file">
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

 
        </div> 
        </div>

      {/* Editor */}
      <div className="editor">
      <Split
          sizes={[75, 25]}
          expandToMin={true}
          direction="horizontal"
          dragInterval={1}
          cursor="col-resize"
          className="split-flex"
      > 
        <div className="editor-window">
          <div className = "editor-header">
          </div>
          <Editor
            height="95.2vh"
            theme="vs-dark"
            path={file.name}
            defaultLanguage={file.language}
            defaultValue={file.value}
            saveViewState={true}
            onChange={handleEditorChange}
            cursorSmoothCaretAnimation="true"
            value={file.value}
            className="code_text"
          /> 
        </div>
       
          <iframe
            height="97.6vh"
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

      {/* <div className = "console_window" style={{ backgroundColor: "#242424" }}>
              <Console  logs={logs} variant="dark" />
      </div> */}

      <footer className = "texteditor_footer">
      
      <div className = "side_footer">
           <span className = "footer_text l_footer"><i className="fas fa-user-tie"></i> {" "}Instructor</span>
           <span className = "footer_text l_footer error"><i className="far fa-times-circle"></i>{"  "} 0</span>
           <span className = "footer_text l_footer warnings"><i className="fas fa-exclamation-triangle"></i> {"  "}0</span>
       </div>
       <div className = "side_footer">
           <span className = "footer_text r_footer">Layout: US</span>
           <span className = "footer_text r_footer"><i className="fab fa-markdown"></i> HTML</span>
           <span className = "footer_text r_footer">CRLF</span>
           <span className = "footer_text r_footer">UTF-8</span>
           <span className = "footer_text r_footer console-button"><i className="fas fa-terminal"></i> {" "}Console</span>
       </div>
  
      </footer>
    </div>
  );
}

export default TextEditor;