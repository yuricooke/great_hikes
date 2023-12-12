// Button.js
import React from "react";
import Icon from "./Icon";
import "./Components.css";

function Button({ label, icon, iconPosition, onClick }) {

    return (
        <button className="Button" onClick={onClick} >
            {icon && iconPosition === "left" && <Icon type={icon} />}
            {label && <span>{label}</span>}
            {icon && iconPosition === "right" && <Icon type={icon}  />}
            {icon && !iconPosition && <Icon type={icon}  />}
        </button>
    );

}

export default Button;
