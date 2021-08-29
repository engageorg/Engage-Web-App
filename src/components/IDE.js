import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage'
import TextEditor from './TextEditor';

function App(props) {
  return (
    <TextEditor 
     value = {props.val}/>
    
  )
}

export default App;