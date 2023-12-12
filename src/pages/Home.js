import { useNavigate } from "react-router-dom";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="Home">
      <video autoPlay muted loop className="video-background" id="video-bg">
      <source src="https://yuricooke.com/mvp/hikes.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="Glassbox">
        <div className="d-flex flex-column justify-content-center">
          <div className="Logo_Home">
            <img
              src="https://yuricooke.com/mvp/great_hikes.svg"
              className="img-fluid"
              alt="Great Hikes"
            />
            <h1 className="text-white">Great Hikes</h1>
          </div>
          <hr />
          <p className="text-center">Great Hikes from hikers for hikers</p>
          <button
            className="btn btn-dark btn-lg rounded-pill more-info my-3"
            onClick={() => navigate("/Hikes")}
          >
            Let's Hike!
          </button>
        </div>
      </div>
    </div>
  );

}
