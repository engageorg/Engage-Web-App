import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import files from "../../assets/files";
import { c, c99, cpp, cpp14, cpp17, python2, python3 } from "../../actions";
import { useSelector, useDispatch } from "react-redux";
import { runCode } from "../../actions/outputAction";
import "./style.css";
function MultiFile(props) {
  const [language, setLanguage] = useState(props.language);
  const fileName = useSelector((state) => state.language);
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
      colors: { "editor.background": "#293738" }
    });
  }

  const languageList = {
    "Python 2": "python2", 
    C: "c",
    "C-99": "c99",
    "C++": "cpp",
    "C++ 14": "cpp14",
    "C++ 17": "cpp17",
    "Python 3": "python3",
  };

  // useEffect(() => {
  //   const select = document.getElementsByClassName("language")[0]
  //   for (let key in languageList) {
  //     var option = document.createElement("option");
  //     option.text = key;
  //     option.value = languageList[key];
  //     option.className = languageList[key];
  //     select.add(option);
  //   }

  //   select.addEventListener("change", (e) => {
  //     setLanguage(select.value);
  //     if (select.value === "c") {
  //       dispatch(c());
  //     }
  //     if (select.value === "c99") {
  //       dispatch(c99());
  //     }
  //     if (select.value === "cpp") {
  //       dispatch(cpp());
  //     }
  //     if (select.value === "cpp") {
  //       dispatch(cpp());
  //     }
  //     if (select.value === "cpp14") {
  //       dispatch(cpp14());
  //     }
  //     if (select.value === "cpp17") {
  //       dispatch(cpp17());
  //     }
  //     if (select.value === "python2") {
  //       dispatch(python2());
  //     }
  //     if (select.value === "python3") {
  //       dispatch(python3());
  //     }
  //   });
  // }, []);

  function userOutput(e) {
    console.log(e);
  }

  function handleInput(e) {
    setInputValue(e.target.value);
  }

  function handleOutput() {
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

  return (
    <>
      <div className="multilanguageIde">
        <div className="editor">
        <div className="navbar">
          <span className="fileName">main 
          {language === "python2" || language === "python3" ? ".py": ".cpp"}
          </span>
          <div className="optionButton">
            <button
              className="showCodeOutput"
              onClick={handleOutput}
            >
              <i class="fas fa-play"></i> Execute
            </button>
          </div>
        </div>
          <Editor
            height="96vh"
            width="80vw"
            theme="vs-light"
            language="cpp"
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
                onChange={userOutput}
                value={outputValue}
              ></textarea>
            </div>
          </div>
      </div>
    </>
  );
}

export default MultiFile;
