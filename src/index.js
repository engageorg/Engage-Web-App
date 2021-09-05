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

const store = createStore(
  allReducer, 
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path = "/" component = {IDE} />
        <Route exact path = "/recorder" component = {Recorder} />
        <Route exact path = "/videoplayer" component = {Video} />
      </Switch>
    </Router>
  </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
