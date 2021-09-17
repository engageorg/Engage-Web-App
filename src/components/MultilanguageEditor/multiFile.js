import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from 'axios'


function MultiFile(){

    const [file,setFileValue] = useState('')

    async function handleOutput(){

    const words = file.split('\r');
    console.log(words)
    let code=''
    for(let i=0;i<words.length;i++){
        code = code+words[i];
    }
    console.log(code)
    await axios.post('/', {
        clientId: "92ed4b582caf3c545e22d2c5ab336568",
        clientSecret: "b530d3b1ce3b93a0ac4f745f074c8f0ea3c86a04e72ba4ddd62e36516acff521",
        language: "cpp14",
        versionIndex: "0",
        script:code
        }).then((e) => {
        console.log(e)
    }).catch((error) => {
        console.log(error)
    }) 
}

    function handleEditorChange(value) {
       setFileValue(value)
    }

    return (
    <>
        <button>
        main.cpp
        </button>
        <Editor
        height="90vh"
        width="100vw"
        defaultLanguage="C++"
        theme="vs-dark"
        onChange={handleEditorChange}
        value={file}
        />
        <button style = {{color : "white",cursor:"pointer", backgroundColor: "green", padding: "5px", borderRadius: "5px"}} onClick={handleOutput}>
            Run
        </button>
    </>
    )
}  

export default MultiFile