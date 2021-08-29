const filenameReducer = (state = "index.html", action) => {

    switch(action.type){
        case "js":
            state = "script.js"
            return state
            break;
        case "css":
            state = "style.css"
            return state
            break;
        case "html":
            state = "index.html"
            return state
            break;
        default:
            return state
    }
}

export default filenameReducer;