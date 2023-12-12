// Carousel.js
import React, { useRef } from "react";

const Carousel = ({ children }) => {
  const carouselRef = useRef(null);

  return (
    <div>
      <div className="carousel row justify-content-around me-lg-3 px-3" ref={carouselRef}>
        {children}
      </div>
    </div>
  );
};

export default Carousel;
