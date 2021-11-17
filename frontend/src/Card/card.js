import React, {useEffect} from 'react'
import {useHistory, Link} from "react-router-dom";
import { motion } from "framer-motion";
import './styles.css'
function Card(props) {
    const history = useHistory();
    // useEffect(() => {
    //     const mainWindow = document.getElementById("lectureCard")
    //     for(let i=0;i<props.lectures.length;i++){
    //         var lecture = document.createElement("div")
    //         var playButton = document.createElement("button")
    //         playButton.textContent = "Play Lecture"
    //         var nameHeading = document.createElement("h3")
    //         var creator = document.createElement("h3")
    //         var language = document.createElement("h3")
    //         nameHeading.className = "nameoflecture"
    //         creator.className = "nameofcreator" 
    //         language.className = "languageofLecture"
    //         playButton.className = props.lectures[i].type + props.lectures[i].language
    //         playButton.id = props.lectures[i].id 
    //         lecture.appendChild(nameHeading)
    //         lecture.appendChild(creator)
    //         lecture.appendChild(language)
    //         lecture.appendChild(playButton)
    //         nameHeading.innerHTML = "Name - " + props.lectures[i].name
    //         creator.innerHTML = "Creator - " + props.lectures[i].creator
    //         if(props.lectures[i].language !== ''){
    //             language.innerHTML = "Language- " + props.lectures[i].language
    //         }
    //         mainWindow.appendChild(lecture)
    //     }
        
    //     mainWindow.addEventListener("click", (e) => {
    //         const id =  e.target.id
    //         console.log(e)
    //         const type =  e.target.className
    //         console.log(type)
    //          console.log(e.target.id)
    //         history.push({
    //             pathname:'/videoplayer',
    //             state:{id,type}
    //         });
    //     })
    // },[])   

    return (
        <>
            <motion.section  initial= {{opacity:0, scale: 0.8 }} animate={{opacity:1, scale: 1, duration:0.5}} transition= {{type: "Tween"}} className="hero-section">
                <div className="card-grid">
                {props.lectures.map((lecture) => {
                    const id = lecture.id;
                    const type = `${lecture.type}${lecture.language}`;
                    return(
                    <div key={lecture.id}>
                        <Link to = {`/${type}/${id}`}>
                        <div className="card">
                        <div className="card__background" style={{"backgroundImage": "../"}}></div>
                        <div className="card__content">
                            <p className="card__category">{lecture.creator}</p>
                            <h3 className="card__heading">{lecture.name}</h3>
                        </div>
                        </div>
                        </Link>
                    </div>)
                })}
                </div>
            </motion.section>
        </>    
    )
}

export default Card