import React from "react";
import "./Components.css";

function Icon({ type }) {
    return (
        <div className="">
            <img className={type} alt={type} />
        </div>
    );
}

export default Icon;
