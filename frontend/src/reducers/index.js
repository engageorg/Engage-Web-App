import filenameReducer, { files } from "./filenameSelection";
import outputModalReducer, { outputSrcReducer } from "./outputModalReducer";
import { combineReducers } from "redux";
import languageReducer from "./languageSelection";
const allReducers = combineReducers({
    files : files,
    fileName: filenameReducer,
    outputModal: outputModalReducer,
    srcDocs: outputSrcReducer,
    language:languageReducer
})

export default allReducers;
