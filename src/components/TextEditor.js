import React from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Editor from "@monaco-editor/react";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from '../actions'
import files from "../assets/files";

function TextEditor(props) {
  console.log("running")
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
          <Button
            className = "htmlbutton"
            disabled={fileName === "index.html"}
            onClick={() => dispatch(html())}
          ><i className="fab fa-html5"></i> index.html</Button>
          </Grid>
          <Grid className="file">
          <Button
            className="stylebutton"
            disabled={fileName === "style.css"}
            onClick={() => dispatch(css())}
          ><i className="fab fa-css3-alt"></i> style.css
          </Button>
          </Grid>
          <Grid className="file">
          <Button
            className = "scriptbutton"
            disabled={fileName === "script.js"}
            onClick={() => dispatch(js())}
          >
              <i className="fab fa-js-square fa-1x"></i> script.js
            </Button>
          </Grid>
          </Grid>
        </Grid>
        <Grid xs={12} item sm={11}>
          <Editor
            height="100vh"
            width="100vw"
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
        <button onClick={handleOutput} className="outputbutton">See Output</button>
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
