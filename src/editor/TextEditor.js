import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html } from '../actions'
import files from "./files";



function TextEditor(props) {
  
  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

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

      <Editor
        height="80vh"
        theme="vs-dark"
        path={file.name}
        className = "editor"
        defaultLanguage={file.language}
        defaultValue={file.value}
        value = {props.value}
      />
    </div>
  );
}

export default TextEditor;
