import React from "react";
import "./Components.css";

function Reviews() {
    return (
        <div className="d-flex align-items-start">
              <button className="btn btn-dark  rounded-pill btn_review--user"><span class="material-symbols-outlined md-48">account_circle</span></button>
                <div className="ms-3 mt-1">
                    <h5>John Muir <span className="text-warning small ms-3">9.9<span class="material-symbols-outlined">hotel_class</span></span></h5>
                    <p className="mb-3 text-secondary">September 3, 1873</p>
                    <p>"The mountains are calling and I must go, and I will work on while I can, studying incessantly."</p>
                    <p>“Climb the mountains and get their good tidings. Nature's peace will flow into you as sunshine flows into trees. The winds will blow their own freshness into you, and the storms their energy, while cares will drop away from you like the leaves of Autumn.”</p>
                </div>
        </div>
    );
}

export default Reviews;
