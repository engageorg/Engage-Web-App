import React, { useEffect} from 'react'
import {useHistory} from "react-router-dom";
import "./style.css"
function RecorderForm() {
    const history = useHistory();
    let lectureName;
    let lectureType;
    let lectureCreator;
    let languageType;
    const navigateToRecorderWeb = () => history.push({
        pathname:'/recorder',
        state:{lectureType,lectureName, lectureCreator, languageType}}
    );

    const languageList = {
        "Python 2": "python2", 
        C: "c",
        "C-99": "c99",
        "C++": "cpp",
        "C++ 14": "cpp14",
        "C++ 17": "cpp17",
        "Python 3": "python3",
      };
    

    useEffect(() => {

        const select = document.getElementById("language");
        for (let key in languageList) {
          var option = document.createElement("option");
          option.text = key;
          option.value = languageList[key];
          option.className = languageList[key];
          select.add(option);
        }

        const type = document.getElementById("lectureType")
        const name = document.getElementById("lectureName")
        const creator = document.getElementById("creator")
        const button = document.getElementById("submit")

        button.addEventListener("click", () => {
            lectureType = type.value
            lectureName = name.value
            lectureCreator = creator.value
            if(lectureType === "dsa"){
                languageType = select.value
            }else{
                languageType = ''
            }
        })
        type.addEventListener("change", (e) =>{
            if(e.target.value === "dsa"){
                select.style.display = "block"
            }else{
                select.style.display = "none"
            }
        })
    },[])

    return (
        <>
        <form>
            <input id="lectureName" placeholder="Lecture Title"/>
            <input id="creator" placeholder="Creator"/>
            <select name="language" id="language"></select>
            <select id="lectureType">
                <option value="ide">Web Developerment</option>
                <option value="dsa">DSA</option>
                <option value="dra">Chalk Board</option>
            </select>
            <button type="button"  onClick={navigateToRecorderWeb} id="submit">Submit</button>
        </form>
        </>
    )
}

export default RecorderForm