import { webDFiles } from "../assets/files";

var fi = webDFiles;

export const files = (state = webDFiles, action) => {
  switch(action.type){
    case "uploadfile":
      state = action.file;
      fi = webDFiles
      return state;
    default:
      return state;
  }
}

const filenameReducer = (state = files[0], action) => {
  switch (action.type) {
    case "changefile":
      state = fi.find( (file) => file.id === action.f_id )
      console.log(files.find( (file) => file.id === action.f_id ));
      return state;
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

export default filenameReducer;
