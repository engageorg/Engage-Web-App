import React, { useEffect} from 'react'
import {useHistory} from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "./style.css"
import { v4 as uuidv4 } from 'uuid';
function RecorderForm() {
    const classid = uuidv4();
    const path = document.location.pathname
    const history = useHistory();
    var imageString;
    let lectureName;
    let lectureType;
    let lectureCreator;
    let languageType;
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
        const navigateToRecorderWeb = () => history.push({
            pathname:'/recorder',
            state:{lectureType, lectureName, lectureCreator, languageType}}
        );
        const navigateToLiveClass = () => history.push({
            pathname:`/emitter/${lectureType+languageType}/${classid}`,
            state:{lectureType, lectureName, lectureCreator, languageType}}
        );
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
        const thumNailButton = document.getElementsByClassName('thumnailImage')[0]
        const thumNailPreview = document.getElementsByClassName('thumNailPreview')[0]
        button.addEventListener("click", () => {
            lectureType = type.value
            lectureName = name.value
            lectureCreator = creator.value
            if(lectureType === "dsa"){
                languageType = select.value
            }else{
                languageType = ''
            }
            if(lectureName && lectureCreator){
                if( path==="/classform") navigateToLiveClass()
                else navigateToRecorderWeb()   
               }else{
                   alert("Fill The Form")
               }
            axios.post("http://localhost:5000/savelecture/thum", {
                imageString,
              }).then(response => {
                if(response.data) {
                  alert("Lecture Saved")
                }
              })
        })
        thumNailButton.addEventListener("change", (e) => {
            console.log(e.target.files[0])
            if(e.target.files[0].type === "image/jpeg" && e.target.files[0].size<=100000) {
                var reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onloadend = () => {
                    console.log(reader)
                    console.log(e.target.files[0])
                    thumNailPreview.src = reader.result
                    imageString = reader.result
                    thumNailPreview.style.display = "block"
                };
            }else{
                alert("Improper image type")
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
        <motion.div  initial= {{opacity:0, scale: 0.8 }} animate={{opacity:1, scale: 1, duration:0.5}} transition= {{type: "Tween"}}>
        <form className="lectureForm">
            <input id="lectureName" placeholder="Lecture Title"/>
            <input id="creator" placeholder="Creator"/>
            <select id="lectureType">
                <option value="ide">Web Developerment</option>
                <option value="dsa">DSA</option>
                <option value="dra">Chalk Board</option>
            </select>
            <input type = 'file' className="thumnailImage"/>
            <img className='thumNailPreview'></img>
            <select name="language" id="language"></select>
            <button type="button" id="submit">Submit</button>
        </form>
        </motion.div>
    )
}

export default RecorderForm