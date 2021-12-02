import React, { useLayoutEffect, useRef, useEffect } from "react";
import "./Popover.scss";
import { unstable_batchedUpdates } from "react-dom";
export const Popover = ({
  children,
  left,
  top,
  onCloseRequest,
  fitInViewport = false,
}) => {
  const popoverRef = useRef(null);
  // ensure the popover doesn't overflow the viewport
  useLayoutEffect(() => {
    if (fitInViewport && popoverRef.current) {
      const element = popoverRef.current;
      const { x, y, width, height } = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      if (x + width > viewportWidth) {
        element.style.left = `${viewportWidth - width}px`;
      }
      const viewportHeight = window.innerHeight;
      if (y + height > viewportHeight) {
        element.style.top = `${viewportHeight - height}px`;
      }
    }
  }, [fitInViewport]);
  useEffect(() => {
    if (onCloseRequest) {
      const handler = (event) => {
        if (!popoverRef.current?.contains(event.target)) {
          unstable_batchedUpdates(() => onCloseRequest(event));
        }
      };
      document.addEventListener("click", handler, false);
      //check with pointer down
      return () => document.removeEventListener("click", handler, false);
    }
  }, [onCloseRequest]);
  return (
    <div className="popover" style={{ top, left }} ref={popoverRef}>
      {children}
    </div>
  );
};
