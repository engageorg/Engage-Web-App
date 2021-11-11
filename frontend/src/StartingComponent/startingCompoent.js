import React from 'react';
import {useHistory} from "react-router-dom";

export default function StartingComponent() {

    const history = useHistory();
    const navigateToLectureScreen = () => history.push('/lectures')
    const navigateToDrawBoard = () => history.push('/drawboard')
    const navigateToDrawBoardStart = () => history.push('/emitter')
    const navigateToDrawBoardEnd = () => history.push('/receiver')
    const navigateToRecorderDraw = () => history.push('/recorder/drawboard');
    const navigateToRecordForm = () => history.push('/recordform');
    const navigateToPlayerDraw = () => history.push('/videoplayer/drawboard');
    return (
        <>
        <button className = "recordWebD" onClick={navigateToRecordForm}>Recorder A Lecture</button>
        {/* <button className = "recordOther" onClick={navigateToRecorderOther}>Recorder with Other</button> */}
        <button className = "playWebD" onClick={navigateToLectureScreen}>Watch lectures </button>
        {/* <button className = "playOther" onClick={navigateToPlayerOther}>Player with Other</button> */}
        <button onClick={navigateToDrawBoard}>Drawing Board</button>
        <button className = "recordWebD" onClick={navigateToRecorderDraw}>Recorder with Drawing Board</button>
        {/* <button className = "recordOther" onClick={navigateToRecorderOther}>Recorder with Other</button> */}
        <button className = "playWebD" onClick={navigateToDrawBoardStart}>Drawing Board Start</button>
        <button className = "playWebD" onClick={navigateToDrawBoardEnd}>Drawing Board End</button>
        </>
    )
}