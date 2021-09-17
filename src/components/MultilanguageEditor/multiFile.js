import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from 'axios'


function MultiFile(){

    const [file,setFileValue] = useState('')
    // axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
    // axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    // axios.defaults.headers.post['Content-length'] = '32';
    // useEffect(() => {
    // }, [])
    //axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    async function handleOutput(){
        const headers = {
            'Content-Type': 'application/json',
        };
    await axios.post('/', {
        clientId: "92ed4b582caf3c545e22d2c5ab336568",
        clientSecret: "b530d3b1ce3b93a0ac4f745f074c8f0ea3c86a04e72ba4ddd62e36516acff521",
        language: "cpp14",
        versionIndex: "0",
        script:"#include<iostream> \n using namespace std; int main() { cout<<0; return 0; }"
    }).then((e) => {
        console.log(e)
    }).catch((error) => {
        console.log(error)
    }) 
//     axios.get('http://restcountries.eu/rest/v2/all')
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
// });
}

    function handleEditorChange(value) {
       console.log(value)
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