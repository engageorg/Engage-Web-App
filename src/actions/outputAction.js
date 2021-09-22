import axios from "axios";

export const runCode = (language, code, input) => async dispatch => {
    return await axios.post('https://cors-anywhere.herokuapp.com/https://api.jdoodle.com/v1/execute', {
        clientId: "92ed4b582caf3c545e22d2c5ab336568",
        clientSecret: "b530d3b1ce3b93a0ac4f745f074c8f0ea3c86a04e72ba4ddd62e36516acff521",
        language: language, 
        stdin:input,
        versionIndex: "0",
        script:code
    })
}
