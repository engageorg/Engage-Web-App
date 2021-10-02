import React, {useState, useEffect, Component} from 'react'
import {useHistory} from "react-router-dom";
import "./style.css"
import { BrowserRouter as Router, Route } from "react-router-dom";
import Recorder from '../Recorder/Recorder';
function RecorderForm() {
    const history = useHistory();
    const [lectureName, setLectureName] = useState('')
    const [lectureType, setLectureType] = useState('')
    const navigateToRecorderWeb = () => history.push({
        pathname:'/recorder',
        state:{lectureType,lectureName}}
    );
    useEffect(() => {
        const type = document.getElementById("lectureType")
        const name = document.getElementById("lectureName")
        const button = document.getElementById("submit")

        button.addEventListener("click", () => {
            setLectureType(type.value)
            setLectureName(name.value)
        })
    },[])

    return (
        <>
        <form>
            <input id="lectureName" placeholder="Lecture Title"/>
            <select id="lectureType">
                <option value="ide">Web Developerment</option>
                <option value="other">DSA</option>
                <option value="drawboard">Other</option>
            </select>
            <button type="button"  onClick={navigateToRecorderWeb} id="submit">Submit</button>
        </form>
        </>
    )
}

export default RecorderForm