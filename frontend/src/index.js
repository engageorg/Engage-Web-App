import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { createStore, compose, applyMiddleware} from 'redux';
import { Provider } from 'react-redux';
import './index.css';
import Recorder from './components/Recorder/Recorder';
import Video from './components/Player/Player';
import RecorderForm from './components/RecorderForm/recorderForm';
import DrawingBoard from './components/DrawingBoard/drawBoard';
import allReducer from './reducers';
import thunk from 'redux-thunk'
import firebase from 'firebase/app';
import StartingComponent from './components/StartingComponent/startingCompoent';
import AllLectures from './components/Lectures/allLectures';

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

ReactDOM.render(
  <Provider store={store}>
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path = "/lectures" component = {AllLectures} />
        <Route exact path = "/drawboard" component = {DrawingBoard}/>
        <Route exact path = "/recordform" component = {RecorderForm}/>
        <Route exact path = "/recorder" component = {Recorder} ide="web"/>
        <Route exact path = "/videoplayer" component = {Video}/>
        <Route exact path = "/" component = {StartingComponent}/>
    </Switch>
    </Router>
  </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
