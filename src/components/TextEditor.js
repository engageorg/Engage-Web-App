import React from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Grid from '@material-ui/core/Grid';
import Editor from "@monaco-editor/react";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from '../actions'
import files from "../assets/files";

function TextEditor(props) {
  const srcDoc = useSelector(state => state.srcDocs);
  const modalActive = useSelector(state => state.outputModal);

  const fileName = useSelector(state => state.fileName);
  const dispatch = useDispatch();

  const file = files[fileName];

  function handleEditorChange(value) {
    file.value = value;
  }

  const handleOutput = () => {
    dispatch(setSrcDocs());
    dispatch(outputModalTrue());
  }

  function handleCloseModal() {
    dispatch(outputModalFalse());
  }



  return (
    <>
      <Grid container direction="row">
        <Grid className="sidebar" item xs={12} sm={1}>
          <div className="explorer">Explorer</div>
          <Grid container direction="column" justifyContent="center">
          <Grid className="file">
          <button
        className = "htmlbutton html"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
        <i className ="fab fa-html5"></i> <span className = "buttontext html" > index.html  </span>
      </button>
          </Grid>
          <Grid className="file">
          <button
        className = "stylebutton style"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      > 
       <i className = "fab fa-css3-alt"></i> <span className = "buttontext style" >style.css  </span>
      </button>
          </Grid>
          <Grid className="file">
          <button
        className = "scriptbutton script"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
        <i className="fab fa-js-square fa-1x"></i> <span className = "buttontext script" > script.js </span>
      </button>
          </Grid>
          </Grid>
        </Grid>
        <Grid xs={12} item sm={11}>
          <Editor
            height="100vh"
            width="94vw"
            theme="vs-light"
            path={file.name}
            className="editor"
            defaultLanguage={file.language}
            defaultValue={file.value}
            saveViewState={true}
            onChange={handleEditorChange}
            value={file.value}
          />
        </Grid>
      </Grid>
      <div className="texteditor">
        <button onClick={handleOutput} className="outputbutton output"><i className="fas fa-play"></i><span className = "buttontext output"> See Output</span></button>
        <div className="IDE">
          <ReactModal
            className="outputModal Modal"
            isOpen={modalActive}
            contentLabel="onRequestClose Example"
            onRequestClose={handleCloseModal}
            overlayClassName="Overlay"
            ariaHideApp={false}
          >
            <Grid container direction="column"> 
            <div className="closeButton"><i className="fas fa-circle" onClick={handleCloseModal}></i></div>
            <iframe
              srcDoc={srcDoc}
              title="output"
              className="outputiframe"
              sandbox="allow-scripts"
              frameBorder="0"
            />
            </Grid>
          </ReactModal>
        </div>
      </div>
    </>
  );
}

export default TextEditor;
