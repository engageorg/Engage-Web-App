import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import files from "../assets/files";
import ChalkBoard from "../ChalkBoard";
import ReactModal from "react-modal";
import { c, c99, cpp, cpp14, cpp17, python2, python3 } from "../actions";
import { useSelector, useDispatch } from "react-redux";
import { runCode } from "../actions/outputAction";
import "./style.css";
function MultiFile(props) {
  const [language, setLanguage] = useState(props.language);
  const [modalActive, setModal] = useState(false);
  const dispatch = useDispatch();
  const [outputValue, setOutputValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const file = files[language];

  function handleEditorChange(value) {
    file.value = value;
  }

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("my-cool-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#293738" },
    });
  }

  function handleModal() {
    setModal(true);
  }

  function handleInput(e) {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    document
      .getElementsByClassName("closechalkboard")[0]
      .addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display =
          "none";
      });

    document
      .getElementsByClassName("showModal")[0]
      .addEventListener("click", function () {
        document.getElementsByClassName("chalkboardweb")[0].style.display =
          "block";
      });
  }, []);

  function handleOutput(e) {
    if (e.isTrusted) {
      const words = file.value.split("\r");
      let code = "";
      for (let i = 0; i < words.length; i++) {
        code = code + words[i];
      }
      dispatch(runCode(language, code, inputValue)).then((e) => {
        setOutputValue(e.data.output);
        const data = {
          output: e.data.output,
        };
        //creating a custom like predefined events like click or mousemove and more
        const event = new CustomEvent("output", { detail: data });
        //dispatching the event in document.documentElement where we listen for it in while recording
        document.documentElement.dispatchEvent(event);
      });
    }
  }

  return (
    <>
      <div className="multilanguageIde">
        <div className="navbar">
          <div className="editor">
            <div className="navbar">
              <span className="fileName">
                main
                {language === "python2" || language === "python3"
                  ? ".py"
                  : ".cpp"}
              </span>
              <div className="optionButton">
                <button className="showModal" onClick={handleModal}>
                  <i className="fas fa-chalkboard-teacher"></i>
                </button>
                <button className="showCodeOutput" onClick={handleOutput}>
                  <i className="fas fa-play"></i> Execute
                </button>
              </div>
            </div>
            <Editor
              height="95.3vh"
              width="80vw"
              theme="vs-dark"
              language="python"
              options={{ fontSize: 18, fontWeight: 400, fontFamily: "cursive" }}
              onChange={handleEditorChange}
              value={file.value}
              beforeMount={handleEditorWillMount}
            />
          </div>
          <div className="inputOutput">
            <div className="inputArea">
              <h3>Input</h3>
              <textarea
                rows="20"
                cols="52"
                className="userInputArea"
                onChange={handleInput}
                placeholder="Enter Input"
              ></textarea>
            </div>
            <div className="outputArea">
              <h3>Output</h3>
              <textarea
                rows="20"
                cols="52"
                className="userOutputArea"
                defaultValue={outputValue}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="chalkboardweb">
          <button className="closechalkboard">
            <i className=" fas fa-window-close"></i>
          </button>
          <ChalkBoard />
        </div>
      </div>
    </>
  );
}

export default MultiFile;
