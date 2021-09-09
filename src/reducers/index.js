import filenameReducer from "./filenameSelection";
import outputModalReducer, { outputSrcReducer } from "./outputModalReducer";
import { combineReducers } from "redux";


const allReducers = combineReducers({
    fileName: filenameReducer,
    outputModal: outputModalReducer,
    srcDocs: outputSrcReducer
})

export default allReducers;
