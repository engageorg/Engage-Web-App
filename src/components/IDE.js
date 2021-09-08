import React from 'react';
import TextEditor from './TextEditor';
import { Link } from 'react-router-dom';

function App(props) {
  return (
    <>
    <Link to="/videoplayer">videoplayer test</Link>
    <TextEditor 
     value = {props.val}
     parentCallBack = {props.parentCallBack}/>
    </>
  )
}

export default App;