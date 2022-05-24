import { IonInput, IonItem, IonLabel, IonSpinner, IonContent, IonRefresher, IonRefresherContent } from "@ionic/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import serverInfo from "../../connection";
import moment from 'moment';
import { canConstructReadableStream } from "workbox-core/_private";
import { Chart } from "react-google-charts";
import { RefresherEventDetail } from '@ionic/core';
import { alertSharp, chevronDownCircleOutline } from 'ionicons/icons';
import { editDb } from "../../old/Functions";

const Alerts = (props: any) => {
    
    const [alerts, setAlerts] = useState<any>([]);
    const [haveAlerts, setHaveAlert] = useState(false);
    
    function doRefresh(event: CustomEvent<RefresherEventDetail>) {
        loadAlerts()
        
        setTimeout(() => {
            event.detail.complete();
        }, 300);
    }
    
    const loadAlerts = () => {
        const source = axios.CancelToken.source();
        const userID = JSON.parse(localStorage.getItem("user")).id
        const userMail = JSON.parse(localStorage.getItem("user"))["email"];
        //console.log(userID)
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", cancelToken: source.token}, {timeout: 5000})
        .then((res) => {
            if(res.data.alerts[0] == "") {
                setAlerts([]);
                setHaveAlert(false)
            } else {
                let nAlerts = res.data.alerts
				
				let arr = nAlerts;
                
				arr.sort(dynamicSort("time"))
				
				setAlerts(arr.reverse())
                
                setHaveAlert(true)
            }
        })
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
    
    useEffect(() => {
        loadAlerts()
        
    },[])
    
    const WaitAlerts = () => {
        
        if(!haveAlerts) {
            return (
                <span>Não há alertas.</span>
            )
        } else {
            return (
                <IonSpinner className="spinner" name="crescent" color="primary" />
            )
        }
        
    }
    
    const readAlert = (alert:any, id:number) => {
        
        const divAlerts = document.querySelectorAll(".alert");
        let isReadable = false;
        
        if(alert.className.split(" ").includes("unread")) {
            isReadable = true;
        }
        
        divAlerts.forEach(a => {
            let classes = a.className.split(" ")
            if (classes.includes("active")) {
                classes = classes.filter(e => e !== 'active');
                a.className = classes.join(" ")
            }
        })
        
        let newArray = alerts;
        
        newArray.map((a:any) => {
            if(a.time == id) {
                a.read = true
            }
            
        })
        
        alert.className = "alert shadowComponent active"
        
        if (isReadable)
            editDb(["alerts"] , [newArray], "");
        
    }
    
    return (
        <>
            <div className="alerts">
                
                <div className="alerts-header">
                
                    
                
                </div>
                
                <div className="alerts-content">
                    
                    <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullFactor={0.2} pullMin={10} pullMax={50}>
                        <IonRefresherContent></IonRefresherContent>
                    </IonRefresher>
                    
                    {
                        alerts.length != [] ?
                        alerts.map((alert:any, index:number) => {
                            
                            let horario = moment.unix(parseInt(alert.time)).format("DD/MM/YYYY HH:mm:ss")
                            
                            return (
                                
                                <div key={index} className={alert.read == false ? "alert shadowComponent unread " + alert.type : "alert shadowComponent " + alert.type} onClick={(e) => { readAlert(e.target, alert.time) }}>
                                    <div className="alert-header">
                                        <div className="alert-title">{alert.title}</div>
                                        <div className="alert-time">{horario}</div>
                                    </div>
                                    <div className="alert-content">
                                        
                                        {alert.description}
                                        
                                    </div>
                                    
                                </div>
                                
                            )
                            
                        })
                        
                        : 
                    
                        <WaitAlerts />
                    }
                    
                    
                    
                    
                    
                    {/* <div className="alert shadowComponent unread" onClick={(e) => { readAlert(e.target) }}>
                        <div className="alert-header">
                            <div className="alert-title">Título do alerta ou outra coisa</div>
                            <div className="alert-time">27/10/2021 15:49</div>
                        </div>
                        <div className="alert-content">
                            
                            Sua conta foi bloquada por motivos de segurança.
                            <br/>Entre em contato com o suporte.
                            
                        </div>
                        
                    </div>
                    
                    <div className="alert shadowComponent" onClick={(e) => { readAlert(e.target) }}>
                        <div className="alert-header">
                            <div className="alert-title">Título do alerta ou outra coisa</div>
                            <div className="alert-time">27/10/2021 15:49</div>
                        </div>
                        <div className="alert-content">
                            
                            Sua conta foi bloquada por motivos de segurança.
                            <br/>Entre em contato com o suporte.
                            
                        </div>
                        
                    </div>
                    
                    <div className="alert shadowComponent unread" onClick={(e) => { readAlert(e.target) }}>
                        <div className="alert-header">
                            <div className="alert-title">Título do alerta ou outra coisa</div>
                            <div className="alert-time">27/10/2021 15:49</div>
                        </div>
                        <div className="alert-content">
                            
                            Sua conta foi bloquada por motivos de segurança.
                            <br/>Entre em contato com o suporte.
                            
                        </div>
                        
                    </div> */}
                    
                </div>
                
            </div>
        </>
    )
}

export default Alerts;