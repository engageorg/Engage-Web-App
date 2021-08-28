import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './index.css';
import App from './components/Main';
import Video from './components/Video';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path = "/" component = {App} />
        <Route exact path = "/video" component = {Video} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
