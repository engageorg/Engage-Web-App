import ReactDOM from "react-dom";
import ChalkBoard from "./app";
import "./excalidraw-app/pwa";
import "./excalidraw-app/sentry";
window.__EXCALIDRAW_SHA__ = process.env.REACT_APP_GIT_SHA;
ReactDOM.render(<ChalkBoard />, document.getElementById("root"));
