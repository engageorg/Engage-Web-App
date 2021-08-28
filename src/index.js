import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './index.css';
import Recorder from './components/Recorder';
import Video from './components/Video';
import IDE from "./components/IDE";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path = "/" component = {IDE} />
        <Route exact path = "/recorder" component = {Recorder} />
        <Route exact path = "/videoplayer" component = {Video} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
