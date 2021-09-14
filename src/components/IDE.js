import React from 'react';
import TextEditor from './TextEditor/TextEditor';

function App(props) {
  return (
    <>
    <TextEditor refresh = {props.refresh}/>
    </>
  )
}

export default App;