import axios from "axios";

export const runCode = (language, code) => async dispatch => {

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
