import React from 'react';
import TextEditor from './TextEditor/TextEditor';
import MultiFile from './MultilanguageEditor/multiFile';
import WebD from './WebD';

function App(props) {
  console.log(props)
  return (
    <>
    {props.name === "ide" ? <WebD/> :<MultiFile language={props.language} refresh = {props.refresh}/>}
    </>
  )
}

export default App;