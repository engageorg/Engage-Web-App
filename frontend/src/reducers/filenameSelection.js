const filenameReducer = (state = "index.html", action) => {
  switch (action.type) {
    case "js":
      state = "script.js";
      return state;
    case "css":
      state = "style.css";
      return state;
    case "html":
      state = "index.html";
      return state;
    default:
      return state;
  }
};


const languageReducer = (state="c", action) => {
  switch(action.type){
    case "c":
      state = "c";
      return state;
    case "c99":
      state = "c99";
      return state;
    case "cpp":
      state = "cpp";
      return state;
    case "cpp14":
      state = "cpp14";
      return state;
    case "cpp17":
      state = "cpp17";
      return state;
    case "python2":
      state = "python2";
      return state;
    case "python3":
      state = "python3";
      return state;
    default:
      return state;
  }
}

export default filenameReducer;
