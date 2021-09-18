import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from 'axios'
import files from "../../assets/files";
import { c, c99, cpp, cpp14, cpp17, python2, python3 } from '../../actions'
import { useSelector, useDispatch } from "react-redux";

function MultiFile(){
    const [language, setLanguage] = useState('')

    const fileName = useSelector(state => state.language);
    const dispatch = useDispatch();
  
    const file = files[fileName];
  
    function handleEditorChange(value) {
      console.log(fileName)
      console.log(value)
      file.value = value;
    }

    const languageList = {
        "C": "c",
        "C-99": "c99",
        "C++": "cpp",
        "C++ 14": "cpp14",
        "C++ 17": "cpp17",
        "Python 2": "python2",
        "Python 3": "python3",
      };

    useEffect(() => {
        const select = document.getElementById("language")
        for (let key in languageList) {
            var option = document.createElement("option");
            option.text = key;
            option.value = languageList[key];
            select.add(option);
          }

        select.addEventListener("change", (e) => {
          setLanguage(select.value)
          if(select.value === "c"){
            dispatch(c())
          }
          if(select.value === "c99"){
            dispatch(c99())
          }
          if(select.value === "cpp"){
            dispatch(cpp())
          }
          if(select.value === "cpp"){
            dispatch(cpp())
          }
          if(select.value === "cpp14"){
            dispatch(cpp14())
          }
          if(select.value === "cpp17"){
            dispatch(cpp17())
          }
          if(select.value === "python2"){
            dispatch(python2())
          }
          if(select.value === "python3"){
            dispatch(python3())
          }
        })
    }, [])

    async function handleOutput(){
    const words = file.value.split('\r');
    console.log(words)
    let code=''
    for(let i=0;i<words.length;i++){
        code = code+words[i];
    }
    console.log(code)
    await axios.post('/', {
        clientId: "92ed4b582caf3c545e22d2c5ab336568",
        clientSecret: "b530d3b1ce3b93a0ac4f745f074c8f0ea3c86a04e72ba4ddd62e36516acff521",
        language: language, 
        versionIndex: "0",
        script:code
        }).then((e) => {
        console.log(e)
    }).catch((error) => {
        console.log(error)
    }) 
}

    // function handleEditorChange(value) {
    //     file.value = value;
    // }

    return (
    <>
        <button>
        main.cpp
        </button>
        <select name="language" id="language">
        </select>
        <Editor
        height="90vh"
        width="100vw"
        defaultLanguage="C++"
        theme="vs-dark"
        onChange={handleEditorChange}
        value={file.value}
        />
        <button style = {{color : "white",cursor:"pointer", backgroundColor: "green", padding: "5px", borderRadius: "5px"}} onClick={handleOutput}>
            Run
        </button>
    </>
    )
}  

export default MultiFile