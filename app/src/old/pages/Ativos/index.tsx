import {
	IonButtons,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonInput,
	IonItem,
	IonLabel,
	IonMenuButton,
	IonPage,
	IonRow,
	IonTitle,
	IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import "./Ativos.css";
import { ImSortAlphaAsc, ImSortAlphaDesc } from 'react-icons/im'
import { motion } from "framer-motion";
import { editDb, toggleActive, toggleClass}  from '../../Functions';
import axios from "axios";
import serverInfo from "../../../connection";

const Ativos = (props: any) => {
	
	const [ativos, setAtivos]:any = useState([])
	
	const setFilterActive = (e: any) => {
			
		toggleActive("filter", "active", e);
		
	}
	
	useEffect(() => {
		loadActives()
	}, []);
	
	const [preferedActives, setPreferedActives] = useState([]);
	
	let selectedAtivos:any
	
	const loadActives = () => {
		
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			
			setPreferedActives(res.data["preferedActives"].split(","))
			selectedAtivos = res.data["preferedActives"].split(",");
			//console.log(selectedAtivos)
			
		});
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/ativos`, { type: "full" })
		.then((res) => {
			
			let ativosArray = res.data;
			ativosArray.sort(dynamicSort("ativo"));
			setAtivos(ativosArray)
		});
	}
	
	const sortAsc = () => {
		let arr = ativos;
		arr.sort(dynamicSort("ativo"))
		setAtivos(arr)
		//console.log(ativos)
	}
	
	const sortDesc = () => {
		let arr = ativos;
		arr.sort(dynamicSort("-ativo"))
		setAtivos(arr)
		//console.log(ativos)
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
	
	const todos = useRef(null);
	
	function selectAtivo(e:any) {
		toggleClass("active", e);
		let ativo = e.innerText.trim()
		
		//let pref = preferedActives
		let pref:any = []
		
		if(ativo == "todos") {
			
			pref = ["todos"]
			
			document.querySelectorAll(".ativo").forEach(element => {
				element.className = 'ativo shadowComponent'
			});
			
			toggleActive("ativo", "active", e)
			
		} else {
			todos.current.className = "ativo shadowComponent";
			
			pref = []
			
			document.querySelectorAll(".ativo.active").forEach(element => {
				//element.className = 'ativo shadowComponent'
				//console.log(element);
				pref.push(element.textContent.trim())
			});
			
			if(pref.length == 0) {
				pref = ["todos"]
				todos.current.className = "ativo shadowComponent active";
			}
		}
		
		editDb(["preferedActives"], [pref.join(",")], "");
		
		return
		
		const index = pref.indexOf(ativo);
		
		if (index > -1) {
			pref.splice(index, 1);
		} else {
			pref.push(ativo)
		}
		setPreferedActives(pref)
		
		console.log(pref)
		
		editDb(["preferedActives"], [pref.join(",")], "");
	}
	
	return <>
		<div className="activesWrapper">
			
			{/* <IonItem className="glimpseItem" style={{ flexShrink: 0 }}>
				<IonLabel position="floating">Buscar</IonLabel>
				<IonInput className="glimpseInput" type="text" autocomplete="off" autocorrect="off"></IonInput>
			</IonItem> */}
			
			{/* <div className="filterAtivos">
				
				<motion.div onClick={(e) => { setFilterActive(e.target); sortAsc() }} whileTap={{ scale: 0.95 }} className="filter active"><ImSortAlphaAsc/></motion.div>
				<motion.div onClick={(e) => { setFilterActive(e.target); sortDesc() }} whileTap={{ scale: 0.95 }} className="filter"><ImSortAlphaDesc/></motion.div>
			
			</div> */}
			
			
		
			<div className="ActivesList">
				
				<IonRow style={{ display: "block", width: "100%" }}>
					<motion.div ref={todos} onClick={(e) => { selectAtivo(e.target) }} whileTap={{ scale: 0.95 }} className={ preferedActives.includes("todos") ? "ativo shadowComponent active" : "ativo shadowComponent" }>
						
						todos
						
					</motion.div>
				</IonRow>
				
				{ ativos.map((ativo:any, index:number) => {
					
					return (
						<motion.div key={index} onClick={(e) => { selectAtivo(e.target) }} whileTap={{ scale: 0.95 }} className={ preferedActives.includes(ativo.ativo) ? "ativo shadowComponent active" : "ativo shadowComponent" }><div>{ativo.ativo}</div></motion.div>
					)
				})}
				
				<div className="ativo invisible"></div>
				<div className="ativo invisible"></div>
				
				<div className="activesListShadow"></div>
				
			</div>
			
		</div>
		
	</>;
}

export default Ativos;
