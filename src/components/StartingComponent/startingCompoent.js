import React from 'react';
import {useHistory} from "react-router-dom";

export default function StartingComponent() {

    const history = useHistory();
    const navigateToRecorderWeb = () => history.push('/recorder/ide');
    const navigateToRecorderOther = () => history.push('/recorder/other');
    const navigateToPlayerWeb = () => history.push('/videoplayer/ide');
    const navigateToPlayerOther = () => history.push('/videoplayer/other');
    const navigateToDrawBoard = () => history.push('/drawboard')
    const navigateToRecorderDraw = () => history.push('/recorder/drawboard');
    const navigateToPlayerDraw = () => history.push('/videoplayer/drawboard');
    return (
        <>
        <button className = "recordWebD" onClick={navigateToRecorderWeb}>Recorder with webD</button>
        {/* <button className = "recordOther" onClick={navigateToRecorderOther}>Recorder with Other</button> */}
        <button className = "playWebD" onClick={navigateToPlayerWeb}>Player with webD </button>
        {/* <button className = "playOther" onClick={navigateToPlayerOther}>Player with Other</button> */}
        <button onClick={navigateToDrawBoard}>Drawing Board</button>
        <button className = "recordWebD" onClick={navigateToRecorderDraw}>Recorder with Drawing Board</button>
        {/* <button className = "recordOther" onClick={navigateToRecorderOther}>Recorder with Other</button> */}
        <button className = "playWebD" onClick={navigateToPlayerDraw}>Player with Drawing Board</button>
        </>
    )
}