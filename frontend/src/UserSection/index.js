import React from "react";
import "./styles.css";
import { Link } from "react-router-dom";
import {motion} from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

function UserSection() {
  const classid = uuidv4();
  return (
    <motion.section className = "usersection" initial= {{opacity:0, scale: 0.8 }} animate={{opacity:1, scale: 1}} transition= {{duration: 0.2}}>
      
<main className="main">
	<div className="responsive-wrapper">
		<div className="main-header">
			<h1>Engage Proof of Concept Demo</h1>
		</div>
		<div className="horizontal-tabs">
			<a href="#" className="active">Applications</a>
			<Link to = "/lectures">Watch Lectures</Link>
		</div>
		<div className="content-header">
			<div className="content-header-intro">
				<h2>Intergrations and connected apps</h2>
				<p>Supercharge your Productivity.</p>
			</div>
			<div className="content-header-actions">
                <a href="#" className="us_button">
					<span>Live Classes</span>
				</a>
                <Link to = "/recordform">
				<div className="us_button">
					<span>Record A Lecture</span>
				</div>
                </Link>
			</div>
		</div>
		<div className="content">
			<div className="content-panel">
				<div className="vertical-tabs">
					<a href="#" className="active">View all</a>
					<a href="#">Teaching tools</a>
					<a href="#">Computer Science</a>
					<a href="#">Chemistry</a>
					<a href="#">Physics</a>
				</div>
			</div>
			<div className="content-main">
				<div className="us-card-grid">
                    <Link to="/drawboard">
					<article className="uscard">
						<div className="card-header">
							<div>
								<span><img  className = "us_img" src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>Chalk Board</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Custom ChalkBoard specially designed for teaching, tailored made UI/UX for different subjects</p>
						</div>
						<div className="card-footer">
							<div>View integration</div>
						</div>
					</article>
                    </Link>
                    
					<Link to="/webd">
                    <article className="uscard">
						<div className="card-header">
							<div>
								<span><img className = "us_img" src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>WebD IDE</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Web Development IDE for beginners, that works on vscode editor</p>
						</div>
						<div className="card-footer">
							<div>View integration</div>
						</div>
					</article>
                    </Link>
                    
					<Link to="/drawboard">
                    <article className="uscard">
						<div className="card-header">
							<div>
								<span><img  className = "us_img" src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>C++ IDE</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Learn DSA in C++, using the c++ compiler and IDE</p>
						</div>
						<div className="card-footer">
							<div>View integration</div>
						</div>
					</article>
                    </Link>
					<Link to={{
							pathname: `/emitter/${classid}`
					}}>
                    <article className="uscard">
						<div className="card-header">
							<div>
								<span><img  className = "us_img" src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>Live Classes</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Conduct a Live Class Room Session</p>
						</div>
						<div className="card-footer">
							<div>View integration</div>
						</div>
					</article>
                    </Link>
				</div>
			</div>
		</div>
	</div>
</main>
    </motion.section>
  );
}

export default UserSection;
