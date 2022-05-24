import { useIonToast } from "@ionic/react";
import axios from "axios";
import React from "react";
import serverInfo from "../../connection";

export function toggleClass(toggleClass: string, activeElement: any ) {
	
	let currentClasses = activeElement.className.split(" ");
	const index = currentClasses.indexOf(toggleClass);
	if (index > -1) {
		currentClasses.splice(index, 1);
	} else {
		currentClasses.push(toggleClass)
	}
	
	activeElement.className = currentClasses.join(" ");
}

export function toggleActive( elementClass: string, toggleClass: string, activeElement: any ) {
	
	let currentClasses = activeElement.className.split(" ");
	if(activeElement.className.split(" ").indexOf(toggleClass) > -1 ) {
		return
	}
	
	document.querySelectorAll(`.${elementClass}`).forEach((element) => {
		const elementCurrentClasses = element.className.split(" ");
		const index = elementCurrentClasses.indexOf(toggleClass);
		if (index > -1) {
			elementCurrentClasses.splice(index, 1);
		}
		element.className = elementCurrentClasses.join(" ")
	});
	
	currentClasses.push(toggleClass);
	activeElement.className = currentClasses.join(" ");
}

export function editDb(fields: object, values: object, type: string) {
	
	const userId = JSON.parse(localStorage.getItem("user"))["id"];
	
	axios.post(`${serverInfo.ApiAddress}/glimpse/updateUser`, { userMail: userId, userKey: "ASD123", fields: fields, values: values })
	.then((resb) => {
		console.log(resb.data)
		
		if(type == "login") {
			window.location.href = '/home'
		}
		
	});
}

export function insertSignals(signals:any, type:string) {
	
	const userId = JSON.parse(localStorage.getItem("user"))["id"];
	
	axios.post(`${serverInfo.ApiAddress}/glimpse/insertSignals`, { user: userId, userKey: "ASD123", signals: signals, type: type })
	.then((resb) => {
		console.log(resb.data)
	});
	
}