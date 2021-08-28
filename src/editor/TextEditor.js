import React, { useState } from "react";

import Editor from "@monaco-editor/react";
import files from "./files";



function TextEditor(props) {
  const [fileName, setFileName] = useState("script.js");

  const file = files[fileName];

  return (
    <div className = "texteditor">
      <button
        className = "scriptbutton"
        disabled={fileName === "script.js"}
        onClick={() => setFileName("script.js")}
      >
        script.js
      </button>
      <button
        className = "stylebutton"
        disabled={fileName === "style.css"}
        onClick={() => setFileName("style.css")}
      >
        style.css
      </button>
      <button
        className = "htmlbutton"
        disabled={fileName === "index.html"}
        onClick={() => setFileName("index.html")}
      >
        index.html
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
