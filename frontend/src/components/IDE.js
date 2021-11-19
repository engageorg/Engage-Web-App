import React from 'react';
import TextEditor from './TextEditor/TextEditor';
import MultiFile from './MultilanguageEditor/multiFile';

function App(props) {
  return (
    <>
    {props.name === "ide" ? <TextEditor refresh = {props.refresh}/> :<MultiFile language={props.language} refresh = {props.refresh}/>}
    </>
  )
}

export default App;