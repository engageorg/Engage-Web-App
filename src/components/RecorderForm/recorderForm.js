import React, { useEffect} from 'react'
import {useHistory} from "react-router-dom";
import "./style.css"
function RecorderForm() {
    const history = useHistory();
    let lectureName;
    let lectureType;
    let lectureCreator;
    const navigateToRecorderWeb = () => history.push({
        pathname:'/recorder',
        state:{lectureType,lectureName, lectureCreator}}
    );
    useEffect(() => {
        const type = document.getElementById("lectureType")
        const name = document.getElementById("lectureName")
        const creator = document.getElementById("creator")
        const button = document.getElementById("submit")

        button.addEventListener("click", () => {
            lectureType = type.value
            lectureName = name.value
            lectureCreator = creator.value
        })
    },[])

    return (
        <>
        <form>
            <input id="lectureName" placeholder="Lecture Title"/>
            <input id="creator" placeholder="Creator"/>
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