import React, { useEffect } from "react";
import "./ToggleSelector.css";

const ToggleSelector = (props: any) => {
	
	const setLeftAccount = () => {
		if(props.disabled) return;
		document.getElementById("backgroundSelector").className = 'left';
	}
	
	const setRightAccount = () => {
		if(props.disabled) return;
		document.getElementById("backgroundSelector").className = 'right';
	}
	
	
	
    return (
		<>
			<div className="toggleSelector" onClick={props.onClick}>
					
				<div id="backgroundSelector" className={props.selected}></div>
				<div className="toggle" onClick={ setLeftAccount }>{props.optionA}</div>
				<div className="toggle" onClick={ setRightAccount }>{props.optionB}</div>
				
			</div>
		</>
	);
};

export default ToggleSelector;