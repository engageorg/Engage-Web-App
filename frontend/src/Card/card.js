import React from 'react'
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import './styles.css'
function Card(props) {
    console.log(props.lectures)
    return (
        <>
            <motion.section  initial= {{opacity:0, scale: 0.8 }} animate={{opacity:1, scale: 1, duration:0.5}} transition= {{type: "Tween"}} className="hero-section">
                <div className="card-grid">
                {props.lectures.map((lecture) => {
                    const id = lecture.id;
                    const type = `${lecture.type}${lecture.language}`;
                    return(
                    <div key={lecture.id}>
                        <Link to = {`/player/${type}/${id}`}>
                        <div className="card">
                        <div className="card__background"></div>
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