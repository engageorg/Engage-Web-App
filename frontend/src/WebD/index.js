import React from "react";
import ChalkBoard from "../ChalkBoard";
import TextEditor from "../TextEditor/TextEditor";
import "fullpage.js/vendors/scrolloverflow"; // Optional. When using scrollOverflow:true
import ReactFullpage from "@fullpage/react-fullpage";
import "./styles.css";

class FullpageWrapper extends React.Component {
  onLeave(origin, destination, direction) {
    console.log("Leaving section " + origin.index);
  }
  afterLoad(origin, destination, direction) {
    console.log("After load: " + destination.index);
  }
  render() {
    return (
      <ReactFullpage
        scrollOverflow={true}
        onLeave={this.onLeave.bind(this)}
        afterLoad={this.afterLoad.bind(this)}
        render={({ state, fullpageApi }) => {
          return (
            <div id="fullpage-wrapper">

              <div className="section">
                <div className="slide" data-anchor="slide1" >
                  <TextEditor/>
                </div>
                <div className="slide" data-anchor="slide2" >
                 <div id = "webd_draw"><ChalkBoard/></div>
                 
                </div>
              </div>

            </div>
          );
        }}
      />
    );
  }
}


export default FullpageWrapper;
