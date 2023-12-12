import React from "react";
import Icon from "./Icon";

import "./Components.css"
// import { useNavigate } from "react-router-dom";


function Menu() {

//   const navigate = useNavigate();

    const icons = [
        { type: "hiking" },
        { type: "group" },
        { type: "favorite" }
    ];

    return (
        <div className="menu_navbar pt-5">
            <button className="btn btn-lg btn-dark rounded-pill btn-actions mt-3" title="Account" ><span class="material-symbols-outlined btn-user">person</span></button>
            <div className="menu_icons">
            {icons.map((icon, index) => (
                <Icon key={index} type={icon.type} />
            ))}
            </div>
        </div>
    );
}

export default Menu;
