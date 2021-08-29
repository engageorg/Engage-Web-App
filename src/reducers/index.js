import filenameReducer from "./filenameSelection";
import { combineReducers } from "redux";


const allReducers = combineReducers({
    fileName: filenameReducer
})

export default allReducers;
