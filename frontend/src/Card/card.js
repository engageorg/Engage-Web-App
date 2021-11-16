import React from 'react'
import {useHistory, Link} from "react-router-dom";
import './styles.css'
function Card(props) {
    const history = useHistory();

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