import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ChalkBoard from "./ChalkBoard";
import TextEditor from "./TextEditor/TextEditor";
import Recorder from "./Recorder";
import Player from "./Player";
import Test from "./TestComponent";
import UserSection from "./UserSection";
import { createStore, compose, applyMiddleware } from "redux";
import RecorderForm from "./RecorderForm/recorderForm";
import MultiFile from "./MultilanguageEditor/multiFile";
import Video from "./Player";
import LiveClassEmitter from "./LiveClasses/liveClassEmitter";
import LiveClassReceiver from "./LiveClasses/liveClassReceiver";
import AllLectures from "./Lectures/allLectures";
import allReducer from "./reducers";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import "./App.css";


const middleware = [thunk];

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  allReducer,
  composeEnhancer(applyMiddleware(...middleware))
);

function App() {
  return (
    <>
      <Provider store={store}>
        <Router>
          <Route exact path="/" component={UserSection} />
          <Route exact path="/lectures" component={AllLectures} />
          <Route exact path="/player/:type/:id" component={Player} />
          <Route path="/emitter/:type/:classid" component={LiveClassEmitter} />
          <Route
            exact
            path="/receiver/:type/:classid"
            component={LiveClassReceiver}
          />
          <Route exact path="/drawboard" component={ChalkBoard} />
          <Route exact path="/webd" component={TextEditor} />
          <Route exact path="/dsaide" component={MultiFile} />
          <Route exact path="/recordform" component={RecorderForm} />
          <Route exact path="/classform" component={RecorderForm} />
          <Route exact path="/videoplayer" component={Video} />
          <Route exact path="/test" component={Test} />
          <Route exact path="/recorder" component={Recorder} ide="web" />
        </Router>
      </Provider>
    </>
  );
}

export default App;