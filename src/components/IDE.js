import React from 'react';
import TextEditor from './TextEditor/TextEditor';
import MultiFile from './MultilanguageEditor/multiFile';

function App(props) {
  return (
    <>
    {/* <TextEditor refresh = {props.refresh}/> */}
    <MultiFile refresh = {props.refresh}/>
    </>
  )
}

export default App;