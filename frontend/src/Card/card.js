import React, {useEffect} from 'react'
import {useHistory} from "react-router-dom";
import './styles.css'
function Card(props) {
    const history = useHistory();
    useEffect(() => {
        const mainWindow = document.getElementById("lectureCard")
        for(let i=0;i<props.lectures.length;i++){
            var lecture = document.createElement("div")
            var playButton = document.createElement("a")
            playButton.textContent = "Play Lecture"
            var nameHeading = document.createElement("h3")
            var creator = document.createElement("h3")
            var language = document.createElement("h3")
            nameHeading.className = "nameoflecture"
            creator.className = "nameofcreator" 
            language.className = "languageofLecture"
            playButton.className = props.lectures[i].type + props.lectures[i].language
            playButton.id = props.lectures[i].id 
            playButton.href = `/videoplayer?t=${props.lectures[i].type}&v=${props.lectures[i].id}&l=${props.lectures[i].language}`
            lecture.appendChild(nameHeading)
            lecture.appendChild(creator)
            lecture.appendChild(language)
            lecture.appendChild(playButton)
            nameHeading.innerHTML = "Name - " + props.lectures[i].name
            creator.innerHTML = "Creator - " + props.lectures[i].creator
            if(props.lectures[i].language !== ''){
                language.innerHTML = "Language- " + props.lectures[i].language
            }
            mainWindow.appendChild(lecture)
        }
        
        // mainWindow.addEventListener("click", (e) => {
        //     const id =  e.target.id
        //     console.log(e)
        //     const type =  e.target.className
        //     console.log(type)
        //      console.log(e.target.id)
        //     history.push({
        //         pathname:'/videoplayer',
        //         state:{id,type}
        //     });
        // })
    },[])   

    return (
        <>
        <div id="lectureCard">
        </div>
        </>    
    )
}

export default Card