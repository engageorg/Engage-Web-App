import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import './index.css';
import Recorder from './components/Recorder';
import Video from './components/Video';
import IDE from "./components/IDE";
import allReducer from './reducers';

import firebase from 'firebase/app';

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

const store = createStore(
  allReducer, 
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path = "/videoplayer" component = {IDE} />
        <Route exact path = "/recorder" component = {Recorder} />
        <Route exact path = "/" component = {Video}/>
      </Switch>
    </Router>
  </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
