import axios from "axios";

const env = process.env.NODE_ENV; // current environment

export const runCode = (language, code, input) => async dispatch => {
    let url
    if(env === "development") {
        url = 'http://localhost:5000/'
    }else{
        url = 'https://fierce-reef-05156.herokuapp.com/' 
    }
    return await axios.post( url+'api/compile', {
        language: language, 
        stdin:input,
        versionIndex: "0",
        script:code
    })
}
