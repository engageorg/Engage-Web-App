import React from "react";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { js, css, html, outputModalTrue, outputModalFalse, setSrcDocs } from '../../actions'
import files from "../../assets/files";
import "./style.css"

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
    console.log("l")
  }

  function handleCloseModal() {
    dispatch(outputModalFalse());
  }

  return (
    <div className = "text-editor">

    {/* Sidebar   */}
    <div className = "editor-sidebar">
    <div className = "sidebar-heading">
      <span id = "explorer-spam" >Explorer</span>
      <button className = "sidebar-add-file">
        {/* <i className = "fas fa-plus" style = {{color : "#fffffe" }}></i>  */}
      </button>
    </div>
    <div className = "sidebar-navbutton">

     <button
        className = "htmlfile"
        disabled={fileName === "index.html"}
        onClick={() => dispatch(html()) }
      >
      <i className ="fab fa-html5"></i> <span className = "buttontext html" >{files["index.html"].name} </span>
     </button>

     <button
        className = "cssfile"
        disabled={fileName === "style.css"}
        onClick={() => dispatch(css())}
      > 
      <i className = "fab fa-css3-alt"></i> <span className = "buttontext style" >{files["style.css"].name} </span>
      </button>

      <button
        className = "jsfile"
        disabled={fileName === "script.js"}
        onClick={() => dispatch(js())}
      >
      <i className="fab fa-js-square fa-1x"></i> <span className = "buttontext script" >{files["script.js"].name} </span>
      </button>


    </div>
    <div className = "sidebar-footer">
    <button onClick={handleOutput} style = {{color : "white", backgroundColor: "green", padding: "5px", borderRadius: "5px"}} className="output"><i style = {{color : "white"}} className="fas fa-play"></i><span className = "buttontext" style = {{color : "white", backgroundColor: "green"}}> See Output</span></button>
    </div>
    </div>

    {/* Editor */}
    <div className = "editor">
    <Editor
            height="100vh"
            width="94vw"
            theme="vs-light"
            path={file.name}
            defaultLanguage={file.language}
            defaultValue={file.value}
            saveViewState={true}
            onChange={handleEditorChange}
            value={file.value}
          />
    </div>


    <ReactModal
            className="outputModal Modal"
            isOpen={modalActive}
            contentLabel="onRequestClose Example"
            onRequestClose={handleCloseModal}
            overlayClassName="Overlay"
            ariaHideApp={false}
          >
           
            <div className="closeButton"><i className="fas fa-circle" onClick={handleCloseModal}></i></div>
            <iframe
              srcDoc={srcDoc}
              title="output"
              className="outputiframe"
              sandbox="allow-scripts"
              frameBorder="0"
            />
          
          </ReactModal>

      {/* <Grid container direction="row">
        <Grid className="sidebar" item xs={12} sm={1}>
          <div className="explorer">Explorer</div>
          <Grid item xs={8} container direction="column" justifyContent="center">
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
          <Grid container xs={4}><div className = "outputbuttondiv"><button onClick={handleOutput} className="outputbutton output"><i className="fas fa-play"></i><span className = "buttontext output"> See Output</span></button></div></Grid>
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
      </div> */}
    </div>
  );
}

export default TextEditor;
