import filenameReducer from "./filenameSelection";
import outputModalReducer, { outputSrcReducer } from "./outputModalReducer";
import { combineReducers } from "redux";
import languageReducer from "./languageSelection";
import playerReducer from "./playerReducer";
const allReducers = combineReducers({
    fileName: filenameReducer,
    outputModal: outputModalReducer,
    srcDocs: outputSrcReducer,
    language:languageReducer,
    player:playerReducer
})

export default allReducers;
