import React from "react";
import "./styles.css";
import { Link } from "react-router-dom"
function UserSection(props) {
  return (
    <section className = "usersection">
      
<main className="main">
	<div className="responsive-wrapper">
		<div className="main-header">
			<h1>Engage</h1>
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
                <a href="#" className="button">
					<span>Live Classes</span>
				</a>
                <Link to = "/recordform">
				<div className="button">
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
				<div className="card-grid">
					<article className="uscard">
						<div className="card-header">
							<div>
								<span><img src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>Chalk Board</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Custom ChalkBoard specially designed for teaching</p>
						</div>
						<div className="card-footer">
							<a href="#">View integration</a>
						</div>
					</article>


                    <article className="uscard">
						<div className="card-header">
							<div>
								<span><img src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>Web Development IDE</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Great Web Development for beginners, that works on vscode editor</p>
						</div>
						<div className="card-footer">
							<a href="#">View integration</a>
						</div>
					</article>


                    <article className="uscard">
						<div className="card-header">
							<div>
								<span><img src="https://assets.codepen.io/285131/zeplin.svg" /></span>
								<h3>C++ IDE</h3>
							</div>

						</div>
						<div className="card-body">
							<p>Learn DSA in C++, using the c++ compiler and IDE</p>
						</div>
						<div className="card-footer">
							<a href="#">View integration</a>
						</div>
					</article>

				</div>
			</div>
		</div>
	</div>
</main>
    </section>
  );
}

export default UserSection;
