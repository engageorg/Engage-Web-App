import files from "../assets/files"

const outputModalReducer = (state = false, action) => {

    switch(action.type){
        case "outputtrue":
            state = true
            return state
        case "outputfalse":
            state = false
            return state
        default:
            return state
    }
}

export const outputSrcReducer = (state = "", action) => {

    switch(action.type){
        case "setSrcdoc":
            state = `
            <html>
              <body>${files["index.html"].value}</body>
              <style>${files["style.css"].value}</style>
              <script>${files["script.js"].value}</script>
            </html>
          `
            return state
        default:
            return state
    }
}

export default outputModalReducer;