import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import "./styles.css"
import ChalkBoard from "../ChalkBoard/excalidraw-app"
import TextEditor from "../TextEditor/TextEditor"

 const WebD = (props) => {
  const images = [
    <TextEditor refresh = {props.refresh}/>,
    <ChalkBoard/>
  ];

  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = wrap(0, images.length, page);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="example-container">
      <AnimatePresence exitBeforeEnter={true}  custom={direction}>
        <motion.div
          className = "slider"
        >
          {images[imageIndex]}
        </motion.div>
      </AnimatePresence>
      <div className="next" onClick={() => paginate(1)}>
        {"‣"}
      </div>
      <div className="prev" onClick={() => paginate(-1)}>
        {"‣"}
      </div>
    </div>
  );
};

export default WebD;