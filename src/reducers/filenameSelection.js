const filenameReducer = (state = "index.html", action) => {

    switch(action.type){
        case "js":
            state = "script.js"
            return state
        case "css":
            state = "style.css"
            return state
        case "html":
            state = "index.html"
            return state
        default:
            return state
    }
}

export default filenameReducer;