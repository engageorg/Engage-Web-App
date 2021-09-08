import React from 'react';
import TextEditor from './TextEditor';

function App(props) {
  return (
    <>
    <TextEditor 
     value = {props.val}
     parentCallBack = {props.parentCallBack}/>
    </>
  )
}

export default App;