import {
	IonButtons,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonLabel,
	IonMenuButton,
	IonPage,
	IonTitle,
	IonToolbar,
	useIonToast,
} from "@ionic/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./Estrategia.css";
import { editDb, toggleActive, toggleClass}  from '../../Functions';
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import axios from "axios";
import serverInfo from "../../../connection";

const Estrategias = (props: any) => {
	const setFilterActive = (e: any) => {
		toggleActive("strategyFilter", "active", e);
	}
	
	let tapTimerCounter = 0;
	let tapTimerCounterMax = 5;
	
	let tapTimer: any;
	
	const tapStart = () => {
		tapTimerCounter = 0;
		tapTimer = setInterval(() => {
			
			if(tapTimerCounter >= tapTimerCounterMax) {
				clearInterval(tapTimer);
				alert("abrindo");
			}
			
			tapTimerCounter += 1;
			
		}, 100)
	}
	
	const tapEnd = () => {
		clearInterval(tapTimer);
	}
	
	const [strategies, setStrategies]:any = useState([]);
	const [strategy, setStrategy]:any = useState("");
	
	useEffect(() => {
		loadStrategies()
	}, []);
	
	const loadStrategies = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			
			let userStrategies = res.data["ownedStrategies"]
			
			if(userStrategies == "todas") {
				
			} else {
				userStrategies = userStrategies.split(",")
			}
			
			axios.post(`${serverInfo.ApiAddress}/glimpse/getStrategies`, { userKey: "ASD123", })
			.then((strategyRes) => {
				
				let strategies = strategyRes.data
				
				let arr = strategies;
				arr.sort(dynamicSort("name"))
				
				let strategiesArray:any = []
				arr.forEach((el:any) => {
					strategiesArray.push(el.name)
				});
				
				
				
				setStrategies(strategiesArray)
			})
			
			//setStrategies(res.data["userStrategies"].split(","))
			setStrategy(res.data["strategy"])
			
		});
	}
	
	const selectStrategy = (e:any) => {
		toggleActive("strategy", "active", e)
		
		let estrategia = e.textContent.trim();
		
		let response = editDb(["strategy"], [estrategia], "")
		//console.log(response)
		
		
	}
	
	function dynamicSort(property:any) {
		var sortOrder = 1;
	
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
	
		return function (a:any,b:any) {
			if(sortOrder == -1){
				return b[property].localeCompare(a[property]);
			}else{
				return a[property].localeCompare(b[property]);
			}
		}
	}
	
	return <>
	
		<div className="strategiesWrapper">
			
			{/* <IonItem className="glimpseItem" style={{ flexShrink: 0 }}>
				<IonLabel position="floating">Buscar</IonLabel>
				<IonInput className="glimpseInput" type="text" autocomplete="off" autocorrect="off"></IonInput>
			</IonItem>
			
			<div className="strategyFilters">
				
				<motion.div onClick={(e) => { setFilterActive(e.target) }} whileTap={{ scale: 0.95 }} className="strategyFilter active"><ImSortAlphaAsc/></motion.div>
				<motion.div onClick={(e) => { setFilterActive(e.target) }} whileTap={{ scale: 0.95 }} className="strategyFilter"><ImSortAlphaDesc/></motion.div>
			
			</div> */}
		
			<div className="strategiesList">
			
				{
					strategies.map((strat:any, index:number) => {
						return(
							<motion.div key={index} onClick={(e) => { selectStrategy(e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className={ strategy.includes(strat) ? "strategy shadowComponent active" : "strategy shadowComponent" }>{strat}</motion.div>
						)
					})
				}
				
				{/* {
					setStrategies.map((item:string, index:number) => {
						<motion.div key={index} onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className={ strategies.includes(item) ? "strategy shadowComponent active" : "strategy shadowComponent" }>item</motion.div>
					})
				} */}
			
				{/* <motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent active">2xCall</motion.div>
				<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">2xPut</motion.div>
				<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">3xCall</motion.div>
				<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">3xPut</motion.div> */}
				
				<div className="strategiesListShadow">
					
				</div>
				
			</div>
			
		</div>
	
	</>;
}

// class Estrategias extends React.Component<props> {
// 	constructor(props: any) {
// 		super(props);
// 	}

// 	render() {
		
// 		const setFilterActive = (e: any) => {
// 			toggleActive("strategyFilter", "active", e);
// 		}
		
// 		let tapTimerCounter = 0;
// 		let tapTimerCounterMax = 5;
		
// 		let tapTimer: any;
		
// 		const tapStart = () => {
// 			tapTimerCounter = 0;
// 			tapTimer = setInterval(() => {
				
// 				if(tapTimerCounter >= tapTimerCounterMax) {
// 					clearInterval(tapTimer);
// 					alert("abrindo");
// 				}
				
// 				tapTimerCounter += 1;
				
// 			}, 100)
// 		}
		
// 		const tapEnd = () => {
// 			clearInterval(tapTimer);
// 		}
		
// 		return <>
		
// 			<div className="strategiesWrapper">
				
// 				<IonItem className="glimpseItem" style={{ flexShrink: 0 }}>
// 					<IonLabel position="floating">Buscar</IonLabel>
// 					<IonInput className="glimpseInput" type="text" autocomplete="off" autocorrect="off"></IonInput>
// 				</IonItem>
				
// 				<div className="strategyFilters">
					
// 					<motion.div onClick={(e) => { setFilterActive(e.target) }} whileTap={{ scale: 0.95 }} className="strategyFilter active"><ImSortAlphaAsc/></motion.div>
// 					<motion.div onClick={(e) => { setFilterActive(e.target) }} whileTap={{ scale: 0.95 }} className="strategyFilter"><ImSortAlphaDesc/></motion.div>
				
// 				</div>
			
// 				<div className="strategiesList">
				
// 					<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent active">2xCall</motion.div>
// 					<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">2xPut</motion.div>
// 					<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">3xCall</motion.div>
// 					<motion.div onClick={(e) => { toggleActive("strategy", "active", e.target); }} whileTap={{ scale: 0.95 }} onTapStart={() => { tapStart() }} onPointerUp={() => { tapEnd() }} onPointerOut={() => { tapEnd() }} className="strategy shadowComponent">3xPut</motion.div>
					
// 					<div className="strategiesListShadow">
						
// 					</div>
					
// 				</div>
				
// 			</div>
		
// 		</>;
// 	}
// }

export default Estrategias;
