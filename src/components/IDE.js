import React from 'react';
import TextEditor from './TextEditor';

function App(props) {
  return (
    <>
    <TextEditor refresh = {props.refresh}/>
    </>
  )
}

export default App;