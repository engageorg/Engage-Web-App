import React from 'react';
import TextEditor from './TextEditor';

function App(props) {
  return (
    <TextEditor 
     value = {props.val}/>
    
  )
}

export default App;