import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Menu from "../components/Menu";
// import Button from "../components/Button";
import Background from "../components/Background";
import Carousel from "../components/Carousel";
import HikeCard from "../components/HikeCard";

import hikes from "../data/hikes.json";

import "./Hikes.css";

export default function Hikes() {
  const [hikeList, setHikeList] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [selectedHike, setSelectedHike] = useState({});

  useEffect(() => {
    setHikeList(hikes.hikesData || []);
  }, []);

  useEffect(() => {
    if (hikeList.length > 0) {
      setBackgroundImage(hikeList[0]?.imageUrl || "");
      setSelectedHike(hikeList[0] || {});
    }
  }, [hikeList]);

  const navigate = useNavigate();

  const handleBoxClick = (hike) => {
    setBackgroundImage(hike.imageUrl || "");
    setSelectedHike(hike);
  };

  return (
    <div className="Hikes">
      <Background id="Hikes" backgroundImage={`url(${backgroundImage})`} />
      <Menu />
        
      <div className="row">
        <div className="col-lg-6 Hikes_Content">
          <div className="Great_Hikes">
            <img src="https://yuricooke.com/mvp/great_hikes.svg" alt="Great Hikes" width="110px"/>
            <h1>Great Hikes</h1>
          </div>
            

          <div className="Location">
            <p className="my-3">
              {selectedHike.continent} <span className='mx-3'>|</span> {selectedHike.country}
            </p>
          </div>

          <div className="my-3 Info">
              <h2>{selectedHike.title}</h2>
              <p dangerouslySetInnerHTML={{
                  __html: selectedHike.description,
                }}
              />
          </div>

          <div>
            <button className="btn btn-success rounded-pill explore" onClick={() => navigate(`/Hikes/${selectedHike.id}`)} ><span class="material-symbols-outlined">hiking</span> Let's hike!</button>

            {/* <Button label="Hike info!" icon="hiking" iconPosition="left" className="IconButton" onClick={() => navigate(`/Hikes/${selectedHike.id}`)} /> */}
          </div>

        </div>
        <div className="offset-lg-8 col-lg-4 Carousel">
          <Carousel>
            {hikeList.map((hike) => (
              <HikeCard
              key={hike.id}
              image={hike.imageUrl} 
              title={hike.title}
              continent={hike.continent}
              country={hike.country}
              onClick={() => handleBoxClick(hike)}
            />
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
}
