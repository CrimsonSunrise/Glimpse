import {
	IonButtons,
	IonContent,
	IonHeader,
	IonItem,
	IonMenuButton,
	IonPage,
	IonRange,
	IonRow,
	IonTitle,
	IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import ToggleSelector from "../../components/ToggleSelector";
import "./Payout.css";
import Axios from "axios";
import { thunderstormOutline } from "ionicons/icons";
import { editDb } from "../../Functions";
import serverInfo from "../../../connection";

const Payout = (props: any) => {
	//let payout = 75;
	
	const [payout, setPayout] = useState(75);
		
	const setPayoutValue = (e:any) => {
		document.querySelector("#payout").textContent = e.value;
		//payout = e.value;
		//console.log(e.value)
		setPayout(e.value)
	}
	
	const setLeftAccount = () => {
		document.getElementById("payoutSelector").className = 'left';
	}
	
	const setRightAccount = () => {
		document.getElementById("payoutSelector").className = 'right';
	}
	
	const [user, setUser]:any = useState({})
	
	useEffect(() => {
		
		loadUserData()
		
	}, []);
	
	const [payoutType, setPayoutType] = useState("");
	
	const loadUserData = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		Axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			
			setUser(res.data)
			setPayoutType(res.data["preferedPayout"].substring(0, 1))
			let userPayout = parseInt(res.data["preferedPayout"].substring(2, 4))
			setPayout(userPayout)
			
		});
	}
	
	const test = (e:any) => {
		let payoutType = ""
		let toggleClassName = document.querySelector("#backgroundSelector").className
		if(toggleClassName == "left") {
			payoutType = "> "
		} else {
			payoutType = "= "
		}
		
		editDb(["preferedPayout"], [ payoutType + payout ], "");
	}
	
	const testOut = (e:any) => {
		let payoutType = ""
		let toggleClassName = document.querySelector("#backgroundSelector").className
		if(toggleClassName == "left") {
			payoutType = "> "
		} else {
			payoutType = "= "
		}
		
		editDb(["preferedPayout"], [ payoutType + payout ], "");
	}
	
	return <>
		
		<ToggleSelector id="payoutType"  onClick={(e:any) => {testOut(e.target)}} optionA="over" optionB="exactly" selected={ payoutType == "=" ? "right" : "left" }/>
		
		<div className="payoutLabel">
			<div id="payout">{payout}</div><span>%</span>
		</div>
		
		<IonRow>
			<IonRange value={payout} onPointerUp={(e) => { test(e.target) }} onIonChange={(e) => { setPayoutValue(e.target) }} min={75} max={99} step={1} snaps={true} ticks={false} color="primary" />
		</IonRow>
	
	</>;
}

export default Payout;
