import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonMenuButton,
	IonPage,
	IonSkeletonText,
	IonSpinner,
	IonTitle,
	IonToolbar,
	useIonToast,
} from "@ionic/react";
import axios from "axios";
import { motion, PresenceContext } from "framer-motion";
import { checkmark } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import serverInfo from "../../../connection";
import ToggleSelector from "../../components/ToggleSelector";
import { editDb } from "../../Functions";
import "./Corretora.css";

const Corretora = (props: any) => {
		
	const setLeftAccount = () => {
		document.getElementById("setAccountSelector").className = 'left';
	}
	
	const setRightAccount = () => {
		document.getElementById("setAccountSelector").className = 'right';
	}
	
	useEffect(() => {
		loadUserData()
	}, []);
	
	const [user, setUser]:any = useState([]);
	
	const loadUserData = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			setUser(res.data)
		});
	}
	
	const saveToggleSelection = (e:any) => {
		console.log(e.parentNode);
		const selection = e.innerText.trim();
		if(!["real", "treinamento"].includes(selection)) return;
		editDb(["iqAccountType"], [selection], "");
		
	}
	
	const [chekingIq, setCheckingIq] = useState(false);
	
	const CheckSkeleton = () => {
		return (
			<>
				<h3 style={{marginTop: "50px"}}>
					<IonSkeletonText animated style={{ width: '80%' }} />
				</h3>
				<h3>
					<IonSkeletonText animated style={{ width: '50%' }} />
				</h3>
				<h3>
					<IonSkeletonText animated style={{ width: '30%' }} />
				</h3>
			</>
		)
	}
	
	const IqInfo = () => {
		return (
			<>
				<div className="AccountInfo">
					
					<ToggleSelector onClick={(e:any) => { saveToggleSelection(e.target) }} optionA="treinamento" optionB="real" selected={ user["iqAccountType"] == "real" ? "right" : "left" }/>
					
				</div>
				
			</>
		)
	}
	
	const [iqMail, setIqMail] = useState("");
	const [iqPassword, setIqPassword] = useState("");
	const [realBalance, setRealBalance] = useState(null);
	const [practiceBalance, setPracticeBalance] = useState(null);
	const iqMailInput = useRef(null);
	const iqPasswordInput = useRef(null);
	const [present, dismiss] = useIonToast();
	
	const checkIqUser = () => {
		
		if(chekingIq) return;
		
		let checkEmail = iqMailInput.current.value;
		let checkPassword = iqPasswordInput.current.value;
		
		if( checkEmail === "" || checkPassword === "") return;
		
		setCheckingIq(true);
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/checkIq`, { email: checkEmail, password: checkPassword, userKey: "ASD123", })
		.then((res) => {
			
			if(res.data["res"] === 1) {
				loadUserData()
				
				editDb(["iqEmail", "iqPassword"], [checkEmail, checkPassword], "login")
				
				present("Credentials saved!", 3000)
				setRealBalance("Soon...")
				setPracticeBalance("Soon...")
				setCheckingIq(false);
			} else {
				setCheckingIq(false);
				present("There is an error with your Iq Option account.", 3000)
				console.log("error", res.data)
			}
		});
		
	}
	
	return <>
		
		<div className="corretora">
			<h2>Iq Option</h2>
			
			<IonItem className="glimpseItem">
				<IonLabel position="floating">Email</IonLabel>
				<IonInput disabled={ chekingIq ? true : false } ref={iqMailInput} value={ user["iqEmail"] } className="glimpseInput" type="email" autocomplete="off" autocorrect="off"></IonInput>
			</IonItem>
			
			<IonItem className="glimpseItem">
				<IonLabel position="floating">Password</IonLabel>
				<IonInput disabled={ chekingIq ? true : false } ref={iqPasswordInput} value={ user["iqPassword"] } className="glimpseInput" type="password" autocomplete="off" autocorrect="off"></IonInput>
			</IonItem>
			
			<div className="corretoraButtons">
				<motion.div onClick={()=> {checkIqUser()}} whileTap={{ scale: 0.95 }} className="corretoraConnectButton shadowButton">
					
					{ chekingIq ? <IonSpinner name="circular" color="primary" /> : 'Connect' }
				</motion.div>
			</div>
			
			{iqMail}
			
			{
				chekingIq ? <CheckSkeleton/> : <IqInfo/>
			}
			
		</div>
		
	</>;
}

export default Corretora;
