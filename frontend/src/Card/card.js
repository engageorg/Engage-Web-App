import React, {useEffect} from 'react'
import {useHistory, Link} from "react-router-dom";
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
            <section className="hero-section">
                <div className="card-grid">
                {props.lectures.map((lecture) => {
                    const id = lecture.id;
                    const type = `${lecture.type}${lecture.language}`;
                    return(
                    <div key={lecture.id}>
                        <Link to = {`/${type}/${id}`}>
                        <div className="card">
                        <div className="card__background" style={{"backgroundImage": "url(https://images.unsplash.com/photo-1557177324-56c542165309?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)"}}></div>
                        <div className="card__content">
                            <p className="card__category">{lecture.creator}</p>
                            <h3 className="card__heading">{lecture.name}</h3>
                        </div>
                        </div>
                        </Link>
                    </div>)
                })}
                </div>
            </section>
        </>    
    )
}

export default Card