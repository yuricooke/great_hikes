
import React from 'react';
import './Components.css'; 

const HikeCard = ({ image, title, continent, country, onClick }) => {
  return (
    <div className="hike_card" onClick={onClick} tabIndex={0}>
      <img className='hike_img' src={image} alt={title} />
      <div className='hike_card-info'>

        <h5>{title}</h5>
        <p>
        {continent} <span className='mx-2'>|</span> {country}
        </p>
      </div>
    </div>
  );
};

export default HikeCard;
