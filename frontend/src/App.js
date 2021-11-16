import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ChalkBoard from "./ChalkBoard";
import Recorder from "./Recorder";
import Player from "./Player";
import { createStore, compose, applyMiddleware} from 'redux';
import StartingComponent from './StartingComponent/startingCompoent'
import RecorderForm from './RecorderForm/recorderForm'
import Video from './Player';
import LiveClassEmitter from "./LiveClasses/liveClassEmitter";
import LiveClassReceiver from './LiveClasses/liveClassReceiver'
import AllLectures from './Lectures/allLectures'
import firebase from 'firebase/app';
import allReducer from './reducers';
import thunk from 'redux-thunk'
import { Provider } from 'react-redux';
import './App.css';


const firebaseConfig = {
  apiKey: "AIzaSyAp2cQvNNp8fUKOv6kO_7wR5IsKROCoh14",
  authDomain: "engage-6ef42.firebaseapp.com",
  projectId: "engage-6ef42",
  storageBucket: "engage-6ef42.appspot.com",
  messagingSenderId: "27842359842",
  appId: "1:27842359842:web:e8f5b15f6a86ac66fa507b",
  measurementId: "G-EVEY2DP36T",
};

if (firebase.apps.length===0){
  firebase.initializeApp(firebaseConfig);
}

const middleware = [thunk]

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const store = createStore(
  allReducer, 
  composeEnhancer(applyMiddleware(...middleware)),
);


function App() {
  return (
    <>
        <Provider store={store}>
    <Router>
    
      <Route exact path = "/" component = {StartingComponent}/>
      <Route exact path = "/lectures" component = {AllLectures}/>
      <Route exact path = "/:type/:id" component = {Player}/>
      <Route exact path = "/emitter" component = {LiveClassEmitter}/>
      <Route exact path = "/receiver" component = {LiveClassReceiver}/>
      <Route exact path = "/drawboard" component = {ChalkBoard}/>
      <Route exact path = "/recordform" component = {RecorderForm}/>
      <Route exact path = "/videoplayer" component = {Video}/>
      <Route exact path = "/recorder" component = {Recorder} ide="web"/>
      
    </Router>
    </Provider>
    </>
  );
}

export default App;
