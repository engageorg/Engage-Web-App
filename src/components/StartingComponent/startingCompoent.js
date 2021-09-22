import React from 'react';
import {useHistory} from "react-router-dom";

export default function StartingComponent() {

    const history = useHistory();
    const navigateToRecorderWeb = () => history.push('/recorder/ide');
    const navigateToRecorderOther = () => history.push('/recorder/other');
    const navigateToPlayerWeb = () => history.push('/videoplayer/ide');
    const navigateToPlayerOther = () => history.push('/videoplayer/other');
    return (
        <>
        <button className = "recordWebD" onClick={navigateToRecorderWeb}>Recorder with webD</button>
        <button className = "recordOther" onClick={navigateToRecorderOther}>Recorder with Other</button>
        <button className = "playWebD" onClick={navigateToPlayerWeb}>Player with webD </button>
        <button className = "playOther" onClick={navigateToPlayerOther}>Player with Other</button>
        </>
    )
}