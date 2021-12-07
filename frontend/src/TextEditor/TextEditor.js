import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Hook, Console, Unhook } from "console-feed";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { js, css, html, setSrcDocs } from "../actions";
import files from "../assets/files";
import "./style.css";
import ChalkBoard from "../ChalkBoard";

function TextEditor(props) {
  const srcDoc = useSelector((state) => state.srcDocs);
  const [logs, setLogs] = useState([]);
  const fileName = useSelector((state) => state.fileName);
  const [Ln, setLn] = useState(1);
  const [Col, setCol] = useState(1);
  const dispatch = useDispatch();
  const editorRef = useRef(null);

  const file = files[fileName];

  function handleEditorChange(value) {
    file.value = value;
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    
    //monaco editor custom language color
    // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-language
    monaco.editor.defineTheme('ace', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', foreground: '5c6773' },
        { token: 'invalid', foreground: 'ff3333' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'strong', fontStyle: 'bold' },
        { token: 'variable', foreground: '5c6773' },
        { token: 'variable.predefined', foreground: '5c6773' },
        { token: 'constant', foreground: 'f08c36' },
        { token: 'comment', foreground: 'abb0b6', fontStyle: 'italic' },
        { token: 'number', foreground: 'f08c36' },
        { token: 'number.hex', foreground: 'f08c36' },
        { token: 'regexp', foreground: '4dbf99' },
        { token: 'annotation', foreground: '41a6d9' },
        { token: 'type', foreground: '41a6d9' },
        { token: 'delimiter', foreground: '5c6773' },
        { token: 'delimiter.html', foreground: '5c6773' },
        { token: 'delimiter.xml', foreground: '5c6773' },
        { token: 'tag', foreground: 'e7c547' },
        { token: 'tag.id.jade', foreground: 'e7c547' },
        { token: 'tag.class.jade', foreground: 'e7c547' },
        { token: 'meta.scss', foreground: 'e7c547' },
        { token: 'metatag', foreground: 'e7c547' },
        { token: 'metatag.content.html', foreground: '86b300' },
        { token: 'metatag.html', foreground: 'e7c547' },
        { token: 'metatag.xml', foreground: 'e7c547' },
        { token: 'metatag.php', fontStyle: 'bold' },
        { token: 'key', foreground: '41a6d9' },
        { token: 'string.key.json', foreground: '41a6d9' },
        { token: 'string.value.json', foreground: '86b300' },
        { token: 'attribute.name', foreground: 'f08c36' },
        { token: 'attribute.value', foreground: '0451A5' },
        { token: 'attribute.value.number', foreground: 'abb0b6' },
        { token: 'attribute.value.unit', foreground: '86b300' },
        { token: 'attribute.value.html', foreground: '86b300' },
        { token: 'attribute.value.xml', foreground: '86b300' },
        { token: 'string', foreground: '86b300' },
        { token: 'string.html', foreground: '86b300' },
        { token: 'string.sql', foreground: '86b300' },
        { token: 'string.yaml', foreground: '86b300' },
        { token: 'keyword', foreground: 'f2590c' },
        { token: 'keyword.json', foreground: 'f2590c' },
        { token: 'keyword.flow', foreground: 'f2590c' },
        { token: 'keyword.flow.scss', foreground: 'f2590c' },
        { token: 'operator.scss', foreground: '666666' }, //
        { token: 'operator.sql', foreground: '778899' }, //
        { token: 'operator.swift', foreground: '666666' }, //
        { token: 'predefined.sql', foreground: 'FF00FF' }, //
      ],
      colors: {
        'editor.background': '#fafafa',
        'editor.foreground': '#5c6773',
        'editorIndentGuide.background': '#ecebec',
        'editorIndentGuide.activeBackground': '#e0e0e0',
      },
    });

    // monaco.editor.setTheme('ace');
  }

  function handleEditorSearch() {
    editorRef.current.focus();
    editorRef.current.trigger('', 'actions.find');
  }
  function handleFullScreen() {
    let eve2 = new KeyboardEvent("keydown", {
      altKey: false,
      bubbles: true,
      cancelBubble: false,
      cancelable: true,
      charCode: 0,
      code: "ControlLeft",
      composed: true,
      ctrlKey: true,
      currentTarget: null,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 0,
      isComposing: false,
      key: "Control",
      keyCode: 17,
      location: 1,
    });
    let eve = new KeyboardEvent("keydown", {
      altKey: false,
      bubbles: true,
      cancelBubble: false,
      cancelable: true,
      charCode: 0,
      code: "KeyF",
      composed: true,
      ctrlKey: false,
      currentTarget: null,
      defaultPrevented: false,
      detail: 0,
      eventPhase: 0,
      isComposing: false,
      key: "f",
      keyCode: 70,
      location: 0,
    });
    document.dispatchEvent(eve2);
    document.dispatchEvent(eve);
  }

  useEffect(() => {
    let timer;
    let consoleView = false;
    let selectedSidebar = false;
    const waitTime = 500; //in ms
    dispatch(setSrcDocs());
    document
      .getElementsByClassName("code_text")[0]
      .addEventListener("keydown", function () {
        setLn(editorRef.current.getPosition().lineNumber);
        setCol(editorRef.current.getPosition().column);
      });
    document
      .getElementsByClassName("code_text")[0]
      .addEventListener("keyup", function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
          dispatch(setSrcDocs());
        }, waitTime);
      });

    document.addEventListener("keydown", function (e) {
      console.log(e);
    });
    document
      .getElementsByClassName("closechalkboard")[0]
      .addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display =
          "none";
      });

    document
      .getElementsByClassName("output")[0]
      .addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display =
          "block";
      });

    document
      .getElementsByClassName("fas fa-times")[0]
      .addEventListener("click", function () {
        document.getElementsByClassName("console-window")[0].style.display =
          "none";
      });

    document
      .getElementsByClassName("folder")[0]
      .addEventListener("click", function () {
        if (selectedSidebar === true) {
          document.getElementsByClassName("selected-sidebar")[0].style.display =
            "none";
          document.getElementsByClassName("folder")[0].className =
            "folder sidenav-buttons";
          selectedSidebar = false;
        } else {
          document.getElementsByClassName("selected-sidebar")[0].style.display =
            "flex";
          document.getElementsByClassName("folder")[0].className =
            "folder sidenav-buttons sidenav_button_active";
          selectedSidebar = true;
        }
      });

    document
      .getElementsByClassName("console-button")[0]
      .addEventListener("click", function () {
        if (consoleView === true) {
          document.getElementsByClassName("console-window")[0].style.display =
            "none";
          consoleView = false;
        } else {
          document.getElementsByClassName("console-window")[0].style.display =
            "block";
          consoleView = true;
        }
      });
    if (document.getElementsByClassName("outputiframe")[0].contentWindow) {
      Hook(
        document.getElementsByClassName("outputiframe")[0].contentWindow
          .console,
        (log) => setLogs((currLogs) => [...currLogs, log]),
        false
      );
      // return () => Unhook(document.getElementsByClassName("outputiframe")[0].contentWindow.console)
    }
  }, []);

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
      <div className="editor-sidebar">
        <button className="suprise_button sidenav-buttons">
          <i className="fas fa-laugh-wink"></i>
        </button>
        <button className="folder sidenav-buttons">
          <i className="far fa-folder"></i>
        </button>
        <button className="full sidenav-buttons" onClick={handleFullScreen}>
          <i className="fas fa-expand-arrows-alt"></i>
        </button>
        <button className="full sidenav-buttons" onClick={handleEditorSearch}>
          <i className="fas fa-search"></i>
        </button>
        <button className="output sidenav-buttons">
          {" "}
          <i className="fas fa-chalkboard-teacher"></i>
        </button>
      </div>
      <div className="selected-sidebar">
        <div className="sidebar-heading">
          <span id="explorer-spam">Explorer</span>
          <button className="sidebar-add-file"></button>
        </div>
        <div className="sidebar-navbutton">

          {Object.keys(files).map((key,index) => (
            <button
              className={files[key].class}
              disabled={fileName === files[key].name}
              onClick={() => dispatch(files[key].func)}
            > 
              <i className={files[key].icon}></i>{" "}
              <span className={`buttontext `+files[key].btntext}>{files[key].name} </span>
            </button>
          ))}

          {/* <button
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
          </button> */}
        </div>
        {/* <div className="sidebar-footer">

 
        </div>  */}
      </div>

      <div className="editor">
        <Split
          sizes={[65, 35]}
          direction="horizontal"
          cursor="col-resize"
          className="split-flex"
        >
          <div className="editor-window">
            <div className="editor-header">
              <button
                className="top_ui_buttons htmlfile_2"
                disabled={fileName === "index.html"}
                onClick={() => dispatch(html())}
              >
                <i className="fab fa-html5"></i>
                <span className="buttontext html">
                  {files["index.html"].name}{" "}
                </span>
              </button>

              <button
                className="top_ui_buttons cssfile_2"
                disabled={fileName === "style.css"}
                onClick={() => dispatch(css())}
              >
                <i className="fab fa-css3-alt"></i>
                <span className="buttontext style">
                  {files["style.css"].name}{" "}
                </span>
              </button>

              <button
                className="top_ui_buttons jsfile_2"
                disabled={fileName === "script.js"}
                onClick={() => dispatch(js())}
              >
                <i className="fab fa-js-square"></i>
                <span className="buttontext script">
                  {files["script.js"].name}
                </span>
              </button>
            </div>
            <Editor
              height="calc(100vh - 2.4vh - 35px)"
              theme="vs-dark"
              path={file.name}
              defaultLanguage={file.language}
              defaultValue={file.value}
              saveViewState={true}
              onMount={handleEditorDidMount}
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
      <div className="console-window">
        <div className="console-heading">
          <span style={{ marginLeft: "15px" }}>Console</span>{" "}
          <i
            style={{ marginRight: "15px", marginTop: "4px" }}
            className="fas fa-times"
          ></i>
        </div>
        <Console logs={logs} variant="dark" />
      </div>
      <div className="chalkboardweb">
        <button className="closechalkboard">
          <i className=" fas fa-window-close"></i>
        </button>
        <ChalkBoard />
      </div>

      <footer className="texteditor_footer">
        <div className="side_footer">
          <span className="footer_text l_footer">
            <i className="fas fa-user-tie"></i> Instructor
          </span>
          <span className="footer_text l_footer error">
            <i className="far fa-times-circle"></i>
            {"  "} 0
          </span>
          <span className="footer_text l_footer warnings">
            <i className="fas fa-exclamation-triangle"></i> {"  "}0
          </span>
        </div>
        <div className="side_footer">
          <span className="footer_text r_footer line-col-num">{`Ln ${Ln}, Col ${Col}`}</span>
          <span className="footer_text r_footer">Layout: US</span>
          <span className="footer_text r_footer language">
            <i className="fab fa-markdown"></i> {file.language}
          </span>
          <span className="footer_text r_footer">CRLF</span>
          <span className="footer_text r_footer">UTF-8</span>
          <span className="footer_text r_footer console-button">
            <i className="fas fa-terminal"></i> Console
          </span>
        </div>
      </footer>
    </div>
  );
}

export default TextEditor;
