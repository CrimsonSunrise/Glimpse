import {
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonPage,
	IonTitle,
	IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import "./Glimpse.css";
import Saldo from "../../components/Saldo";
import MainButton from "../../components/MainButton";
import GlimpseControl from "../../components/GlimpseControl";
import { Link } from "react-router-dom";
import Axios from "axios";
import serverInfo from "../../../connection";

const Glimpse = (props: any) => {
	
	const [user, setUser]:any = useState({})
	const [operating, setOperating] = useState(true)
	const [actives, setActives] = useState([])
	const _isMounted = useRef(true);
	
	let loadInterval:any;
	
	useEffect(() => {
		// const source = Axios.CancelToken.source()
		// let abortController = new AbortController();
		
		// loadUserData()
		
		// loadInterval = setInterval(() => {
		// 	loadUserData()
		// }, 2000)
		
		// return () => { // ComponentWillUnmount in Class Component
		// 	_isMounted.current = false;
		// 	clearInterval(loadInterval)
		// 	abortController.abort();
		// }
		
	}, [])
	
	const [periodProfit, setPeriodProfit] = useState(0.0)
	
	const loadUserData = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		const source = Axios.CancelToken.source()
		
		try {
			
			//console.log(_isMounted.current)
			
			if (!_isMounted.current) return
			
			Axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", cancelToken: source.token}, {timeout: 5000})
			.then((res) => {
				
				setUser(res.data)
				setPeriodProfit(res.data["iqPeriodProfit"])
				
				if( res.data["glimpseStatus"] == "waiting" || res.data["glimpseStatus"] == "operating" || res.data["glimpseStatus"] == "assigning" || res.data["glimpseStatus"] == "stopping") {
					setOperating(true)
				} else {
					setOperating(false)
				}
				
				Axios.post(`${serverInfo.ApiAddress}/glimpse/ativos`, { type: "full" }).then((activesRes) => {
					
					let ativos:any = []
					
					activesRes.data.map((aRes:any) => {
						
						if(aRes.open == "True") {
							ativos.push([aRes.ativo, aRes.payout])
						}
						
					})
					
					setActives(ativos)
					
				})
				
				
			});
		} catch (error) {
			if (Axios.isCancel(error)) {
            } else {
                throw error
            }
		}
		
	}
	
	return (
		<>
			<Saldo currency="R$" balance={ periodProfit.toFixed(2) } />
			
			<div className="glimpseComponents">
				
				<div className={ operating ? "mainButtons disabled" : "mainButtons" }>
					<Link className={ operating ? "disabled" : "" } to="/page/Corretora"><MainButton title="Corretora" data="Iq Option" /></Link>
					<Link className={ operating ? "disabled" : "" } to="/page/Ativos"><MainButton title="Ativos" data={ user ? user["preferedActives"] : 0 } /></Link>
					<Link className={ operating ? "disabled" : "" } to="/page/Payout"><MainButton title="Payout" data={ user ? user["preferedPayout"] : 0 } /></Link>
					<Link className={ operating ? "disabled" : "" } to="/page/Estratégias"><MainButton title="Estratégia" data={ user ? user["strategy"] : 0 } /></Link>
				</div>
				
				<div className="activesInfo">
					
					{
						actives.map((ativo:any, index)=>{
							return (
								<div key={index} className="activeInfo shadowComponent">
									<div className="activeName">{ativo[0]}</div>
									<div className="activePayout">{ativo[1]}%</div>
								</div>
							)
						})
					}
					
				</div>

				<GlimpseControl profit={user["iqSessionProfit"]} status={ user ? user["glimpseStatus"] : '-' } />
				
			</div>
		</>
	);
}

export default Glimpse;
