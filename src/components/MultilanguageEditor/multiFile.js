import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from 'axios'


function MultiFile(){

    const [file,setFileValue] = useState('')
    const [language, setLanguage] = useState('')

    const languageList = {
        C: "c",
        "C-99": "c99",
        "C++": "cpp",
        "C++ 14": "cpp14",
        "C++ 17": "cpp17",
        PHP: "php",
        Perl: "perl",
        "Python 2": "python2",
        "Python 3": "python3",
        Ruby: "ruby",
        "GO Lang": "go",
        Scala: "scala",
        "Bash Shell": "bash",
        SQL: "sql",
        Pascal: "pascal",
        "C#": "csharp",
        "VB.Net": "vbn",
        Haskell: "haskell",
        "Objective C": "objc",
        Swift: "swift",
        Groovy: "groovy",
        Fortran: "fortran",
        Lua: "lua",
        TCL: "tcl",
        Hack: "hack",
        RUST: "rust",
        D: "d",
        Ada: "ada",
        Java: "java",
        "R Language": "r",
        "FREE BASIC": "freebasic",
        VERILOG: "verilog",
        COBOL: "cobol",
        Dart: "dart",
        YaBasic: "yabasic",
        Clojure: "clojure",
        NodeJS: "nodejs",
        Scheme: "scheme",
        Forth: "forth",
        Prolog: "prolog",
        Octave: "octave",
        CoffeeScript: "coffeescript",
        Icon: "icon",
        "F#": "fsharp",
        "Assembler - NASM": "nasm",
        "Assembler - GCC": "gccasm",
        Intercal: "intercal",
        Nemerle: "nemerle",
        Ocaml: "ocaml",
        Unlambda: "unlambda",
        Picolisp: "picolisp",
        SpiderMonkey: "spidermonkey",
        "Rhino JS": "rhino",
        CLISP: "clisp",
        Elixir: "elixir",
        Factor: "factor",
        Falcon: "falcon",
        Fantom: "fantom",
        Nim: "nim",
        Pike: "pike",
        SmallTalk: "smalltalk",
        "OZ Mozart": "mozart",
        LOLCODE: "lolcode",
        Racket: "racket",
        Kotlin: "kotlin",
        Whitespace: "whitespace",
        Erlang: "erlang",
        J: "jlang"
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
          //console.log(language)
        })
    }, [])

    async function handleOutput(){

    const words = file.split('\r');
    console.log(words)
    let code=''
    for(let i=0;i<words.length;i++){
        code = code+words[i];
    }
    console.log(code)
    console.log(language)
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

    function handleEditorChange(value) {
       setFileValue(value)
    }

    function handleLanguageChange(lang){
        console.log(lang)
    }

    return (
    <>
        <button>
        main.cpp
        </button>
        <select onChange={handleLanguageChange} name="language" id="language">
        </select>
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