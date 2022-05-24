import { RefresherEventDetail } from '@ionic/core';
import { IonAvatar, IonButton, IonCheckbox, IonContent, IonDatetime, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonListHeader, IonNote, IonPopover, IonRadio, IonRadioGroup, IonRange, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, IonSkeletonText, IonSpinner, IonText, IonThumbnail, IonToggle } from '@ionic/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import { IoChevronBack } from 'react-icons/io5';
import './style.css';
import { closeCircle, home, star, navigate, informationCircle, checkmarkCircle, shuffle, alertCircle } from 'ionicons/icons';
import emailjs, { init } from 'emailjs-com';
import serverInfo from '../../connection';
import { editDb } from '../../old/Functions';
init("user_7oQipdD74sHeq17IwvGx9");

const Settings = (props: any) => {
    
    const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined });
    
    const [user, setUser] = useState<any>({});
    
    const [title, setTitle] = useState("SETTINGS");
    const [panelShowing, setPanelShowing] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState("");
    const [codeInfo, setCodeInfo] = useState("");
    
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [novaSenhaRepeat, setNovaSenhaRepeat] = useState("");
    
    const [confirmPasswordA, setConfirmPasswordA] = useState("");
    const [confirmPasswordB, setConfirmPasswordB] = useState("");
    const [confirmPasswordInfo, setConfirmPasswordInfo] = useState("");
    
    const [waiting, setWaiting] = useState(false);
    
    const [useAlerts, setUseAlerts] = useState<any>();
    const [glimpseStart, setGlimpseStart] = useState<any>();
    const [glimpseStop, setGlimpseStop] = useState<any>();
    const [activeClose, setActiveClose] = useState<any>();
    const [stopLossReached, setStopLossReached] = useState<any>();
    const [stopWinReached, setStopWinReached] = useState<any>();
    
    const [slides, setSlides] = useState(false);
    const [operationPriority, setOperationPriority] = useState<string>('gale');
    
    useEffect(() => {
        
        document.querySelector(".settings-terms").innerHTML = props.terms;
        
        loadUser()
        
    }, [])
    
    const loadUser = () => {
        
        let userMail = JSON.parse(localStorage.getItem("user"))["email"];
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123"}, {timeout: 5000})
		.then((res) => {
            
            setUser(res.data);
            
            const alerts = res.data.settings.alerts;
            const glimpse = res.data.settings.glimpse;
            
            setUseAlerts(alerts.useAlerts);
            setGlimpseStart(alerts.glimpseStart);
            setGlimpseStop(alerts.glimpseStop);
            setActiveClose(alerts.activeClose);
            setStopLossReached(alerts.stopLossReached);
            setStopWinReached(alerts.stopWinReached);
        
            setSlides(glimpse.slides);
            setOperationPriority(glimpse.operationPriority);
            
        })
        
    }
    
    function criarCodigo(length:number) {
		let resultado = '';
		const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var caracteresLenght = caracteres.length;
		for ( var i = 0; i < length; i++ ) {
			resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLenght));
	   	}
        editDb(["passwordRecoverCode"], [resultado], "")
	   	return resultado;
	}
    
    const handleSubmit = () => {
        
        showSecond();
        
	}
    
    const clearPass = () => {
        setConfirmPasswordA("")
        setConfirmPasswordB("")
        setSenhaAtual("")
        setNovaSenha("")
        setNovaSenhaRepeat("")
    }
    
    const showFirst = () => {
        
        document.querySelector(".alterar-senha-first").className = "alterar-senha-first active";
        document.querySelector(".alterar-senha-second").className = "alterar-senha-second";
        document.querySelector(".alterar-senha-third").className = "alterar-senha-third";
        
        clearPass()
    }
    
    const showSecond = () => {
        
        document.querySelector(".alterar-senha-first").className = "alterar-senha-first";
        document.querySelector(".alterar-senha-second").className = "alterar-senha-second active";
        document.querySelector(".alterar-senha-third").className = "alterar-senha-third";
        
        clearPass()
    }
    
    const showThird = () => {
        
        document.querySelector(".alterar-senha-first").className = "alterar-senha-first";
        document.querySelector(".alterar-senha-second").className = "alterar-senha-second";
        document.querySelector(".alterar-senha-third").className = "alterar-senha-third active";
        
        clearPass()
    }
    
    const hideBoth = () => {
        document.querySelector(".alterar-senha-first").className = "alterar-senha-first";
        document.querySelector(".alterar-senha-second").className = "alterar-senha-second";
        document.querySelector(".alterar-senha-third").className = "alterar-senha-third";
        
        clearPass()
    }
    
    const changeSettingsPage = (page:string, title:string) => {
        
        setTitle(title);
        setPanelShowing(true);
        document.querySelector(".settings-panel."+page).className = "settings-panel " + page + " active"
    }
    
    const closeSettingsPage = () => {
        
        document.querySelectorAll(".settings-panel").forEach(panel => {
            
            let classes = panel.className.split(" ")
            let filtered = classes.filter(function(value:any, index:any, arr:any){ 
                return value != "active";
            }) as any;
            
            panel.className = filtered.join(" ")
        })
        
        setTitle("Settings");
        setPanelShowing(false);
        
    }
    
    const verifyCode = () => {
        
        if(waiting) return;
        
        setWaiting(true)
        
        let userMail = JSON.parse(localStorage.getItem("user"))["email"];
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123"}, {timeout: 5000})
		.then((res) => {
              
            //console.log(res.data)
            if ( res.data.passwordRecoverCode == confirmationCode ) {
                
                showThird();
                setWaiting(false);
                
            } else {
                
                setCodeInfo("You typed an incorrect code.")
                setWaiting(false);
            }
            
        })
        
    }
    
    const changePassword = () => {
        
        closeSettingsPage();
        changeSettingsPage("alterar-senha", "Change password");
        
        showFirst();
        setWaiting(false);
        
    }
    
    const alterarSenhaCode = () => {
        
        if(waiting) return;
        
        setWaiting(true)
        
        if (confirmPasswordA.length < 1 || confirmPasswordB.length < 1) {
            
            setConfirmPasswordInfo("Password must have at least 1 character.");
            setWaiting(false);
            
            return;
        }
        
        if ( confirmPasswordA === confirmPasswordB ) {
            
            editDb(["password", "passwordRecoverCode"], [confirmPasswordA, ""], "");
            let u = JSON.parse(localStorage.getItem("user"));
            u.password = confirmPasswordA;
            localStorage.setItem("user", JSON.stringify(u));
            setTimeout(() => {
              
                hideBoth();
                closeSettingsPage();
                setWaiting(false);
                
            }, 1000)
            
        } else {
            
            setConfirmPasswordInfo("Passwords do not match.");
            setWaiting(false);
            
        }
        
    }
    
    const alterarSenhaSenha = () => {
        
        if(waiting) return;
        
        setWaiting(true)
        
        if (novaSenha.length < 1 || novaSenhaRepeat.length < 1) {
            
            setConfirmPasswordInfo("Password must have at least 1 character.");
            setWaiting(false);
            
            return;
        }
        
        if ( novaSenha === novaSenhaRepeat ) {
            
            setConfirmPasswordInfo("")
            
            if (senhaAtual === user.password) {
                
                editDb(["password"], [novaSenha], "");
                let u = JSON.parse(localStorage.getItem("user"));
                u.password = novaSenha;
                localStorage.setItem("user", JSON.stringify(u));
                setTimeout(() => {
                
                    hideBoth();
                    closeSettingsPage();
                    setWaiting(false);
                    
                }, 1000)
                
            } else {
                
                setConfirmPasswordInfo("Current passworn do not match.");
                setWaiting(false);
                
            }
            
        } else {
            
            setConfirmPasswordInfo("Passwords do not match.");
            setWaiting(false);
            
        }
        
    }
    
    const saveSettings = () => {
        
        setWaiting(true)
        
        let settings = {
            alerts : {
                useAlerts: useAlerts,
                glimpseStart: glimpseStart,
                glimpseStop: glimpseStop,
                activeClose: activeClose,
                stopLossReached: stopLossReached,
                stopWinReached: stopWinReached
            },
            glimpse: {
                slides: slides,
                operationPriority: operationPriority
            }
            // preferedServer: {
            //     usePreferentialServer: usePreferentialServer,
            //     preferentialID: preferentialID
            // }
        }
        
        editDb(["settings"], [settings], "")
        
        setWaiting(false)
    }
    
    return (
        <div className="settings">
            
            <div className="settings-header">
                <motion.div whileTap={{ scale: 0.95 }} className={ !panelShowing ? "settings-back hidden" : "settings-back" } onClick={() => { closeSettingsPage() }}>
                    <IoChevronBack/> Back
                </motion.div>
                <h5>{title}</h5>
            </div>
            
            <IonContent>
                {/*-- Default Item --*/}
                
                <IonItem button onClick={() => { changeSettingsPage("conta", "Account") }} detail>
                    <IonLabel className="settings-button-label">
                        Account
                    </IonLabel>
                </IonItem>
                
                <IonItem button onClick={() => { changeSettingsPage("glimpse", "Glimpse")}} detail>
                    <IonLabel className="settings-button-label">
                        Glimpse
                    </IonLabel>
                </IonItem>
                
                <IonItem button onClick={() => { changeSettingsPage("alertas", "Alerts")}} detail>
                    <IonLabel className="settings-button-label">
                        Alerts
                    </IonLabel>
                </IonItem>
                
                <IonItem button onClick={() => { changeSettingsPage("terms", "Terms")}} detail>
                    <IonLabel className="settings-button-label">
                        Terms
                    </IonLabel>
                </IonItem>

            </IonContent>
            
            <div className="settings-panel conta">
            
                <IonItem>
                    <IonNote className="settings-note" slot="start">Name</IonNote>
                    <IonLabel>{user.name}</IonLabel>
                </IonItem>
                
                <IonItem>
                    <IonNote className="settings-note" slot="start">Email</IonNote>
                    <IonLabel>{user.email}</IonLabel>
                </IonItem>
                
                <IonItem>
                    <IonNote className="settings-note" slot="start">Password</IonNote>
                    <IonLabel>•••••</IonLabel>
                    <IonButton className="settings-change-password" onClick={() => { changePassword() }} slot="end">
                        Change password
                    </IonButton>
                </IonItem>
            
            </div>
            
            <div className="settings-panel alertas">
                
                <h5>Alerts are shown inside the app when some event occurs.</h5>
                
                <IonItem>
                    <IonLabel>Alertas</IonLabel>
                    <IonToggle checked={useAlerts} onIonChange={(e) => { setUseAlerts(e.detail.checked); }} className="settings-toggle-alerts" slot="end"></IonToggle>
                </IonItem>
                
                <IonItem lines="none" disabled={!useAlerts}>
                    <IonLabel className="settings-notify-when">
                        Show alert when...
                    </IonLabel>
                </IonItem>
                
                <IonItem disabled={!useAlerts}>
                    <IonCheckbox className="settings-toggle-alerts" slot="start" checked={glimpseStart} onIonChange={(e) => { setGlimpseStart(e.detail.checked); }} />
                    <IonLabel>Glimpse starts</IonLabel>
                </IonItem>
                
                <IonItem disabled={!useAlerts}>
                    <IonCheckbox className="settings-toggle-alerts" slot="start" checked={glimpseStop} onIonChange={(e) => { setGlimpseStop(e.detail.checked); }} />
                    <IonLabel>Glimpse stops</IonLabel>
                </IonItem>
                
                <IonItem disabled={!useAlerts}>
                    <IonCheckbox className="settings-toggle-alerts" slot="start" checked={activeClose} onIonChange={(e) => { setActiveClose(e.detail.checked); }} />
                    <IonLabel>Currency pair closes</IonLabel>
                </IonItem>
                
                <IonItem disabled={!useAlerts}>
                    <IonCheckbox className="settings-toggle-alerts" slot="start" checked={stopLossReached} onIonChange={(e) => { setStopLossReached(e.detail.checked); }} />
                    <IonLabel>Reach Stop Loss</IonLabel>
                </IonItem>
                
                <IonItem disabled={!useAlerts}>
                    <IonCheckbox className="settings-toggle-alerts" slot="start" checked={stopWinReached} onIonChange={(e) => { setStopWinReached(e.detail.checked); }} />
                    <IonLabel>Reach Stop Win</IonLabel>
                </IonItem>
                
                <div className="alterar-senha-buttons">
                    
                    <div></div>
                    
                    <IonButton className="alterar-senha-button" onClick={() => { saveSettings() }} color="primary" style={{ justifySelf: "flex-end" }}>
                        {
                            waiting ? <IonSpinner name="crescent" color="light"/> : "Save"
                        }
                    </IonButton>
                    
                </div>
                
            </div>
            
            <div className="settings-panel glimpse">
            
                <IonItemGroup>
                    
                    {/* VISUAIS */}
                    
                    <IonItemDivider>
                        <IonLabel>Visual elements</IonLabel>
                    </IonItemDivider>
                    
                    <IonItem>
                        <IonLabel>Show slides while operating</IonLabel>
                        <IonCheckbox checked={slides} onIonChange={e => setSlides(e.detail.checked)} slot="start" />
                    </IonItem>
                    
                    {/* OPERACIONAIS */}
                    
                    <IonItemDivider style={{ paddingTop: "10px" }}>
                        <IonLabel>Operational settings</IonLabel>
                    </IonItemDivider>
                    
                    <IonRadioGroup value={operationPriority} onIonChange={e => setOperationPriority(e.detail.value)}>
                        <IonListHeader>
                            <IonLabel>
                                Operation priority
                                <IonIcon onClick={ (e: any) => { e.persist(); setShowPopover({ showPopover: true, event: e }) }} className="operation-priority-info" icon={alertCircle} />
                            </IonLabel>
                        </IonListHeader>

                        <IonItem>
                            <IonLabel style={{paddingLeft: "10px"}}>Martin Gale</IonLabel>
                            <IonRadio value="gale" slot="start" />
                        </IonItem>

                        <IonItem>
                            <IonLabel style={{paddingLeft: "10px"}}>Stop Loss and Stop Win</IonLabel>
                            <IonRadio value="stop" slot="start" />
                        </IonItem>
                        
                    </IonRadioGroup>
                    
                </IonItemGroup>
                
                <div className="alterar-senha-buttons">
                    
                    <div></div>
                    
                    <IonButton className="alterar-senha-button" onClick={() => { saveSettings() }} color="primary" style={{ justifySelf: "flex-end" }}>
                        {
                            waiting ? <IonSpinner name="crescent" color="light"/> : "Save"
                        }
                    </IonButton>
                    
                </div>
            
            </div>
            
            <div className="settings-panel terms">
                
                <div className="terms active settings-terms"></div>
                
            </div>
            
            <div className="settings-panel alterar-senha">
                
                <div className="alterar-senha-first">
                    
                    <h5 className="alterar-senha-info">{confirmPasswordInfo}</h5>
                    {/* <div className="spacer"></div> */}
                    
                    <IonItem>
                        <IonLabel>Current password</IonLabel>
                        <IonInput value={senhaAtual} onIonChange={e => setSenhaAtual(e.detail.value!)} type="password" placeholder="Senha atual"></IonInput>
                    </IonItem>
                    
                    <IonItem>
                        <IonLabel>New password</IonLabel>
                        <IonInput value={novaSenha} onIonChange={e => setNovaSenha(e.detail.value!)} type="password" placeholder="Nova senha"></IonInput>
                    </IonItem>
                    
                    <IonItem>
                        <IonLabel>Confirm password</IonLabel>
                        <IonInput value={novaSenhaRepeat} onIonChange={e => setNovaSenhaRepeat(e.detail.value!)} type="password" placeholder="Nova senha"></IonInput>
                    </IonItem>
                    
                    <div className="alterar-senha-buttons">
                        
                        <IonButton className="alterar-senha-button" onClick={() => { handleSubmit() }} color="light">Forgot my password</IonButton>
                        
                        <IonButton className="alterar-senha-button" onClick={() => { alterarSenhaSenha() }} color="primary" style={{ justifySelf: "flex-end" }}>
                            {
                                waiting ? <IonSpinner name="crescent" color="light"/> : "Alterar senha"
                            }
                        </IonButton>
                        
                    </div>
                    
                </div>
                
                <div className="alterar-senha-second">
                    
                    <p>We sent a code to <label className="alterar-senha-email-ref">{user.email}</label></p>
                    
                    <p>Type or paste the sent code in the input below to continue.</p>
                    
                    <IonItem>
                        <IonInput className="confirmation-code-input" maxlength={12} type="text" value={confirmationCode} placeholder="Código" onIonChange={e => setConfirmationCode(e.detail.value!)}></IonInput>
                    </IonItem>
                    
                    <h5 className="code-info">{codeInfo}</h5>
                    
                    <IonItem lines="none">
                        
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { verifyCode() }} className="confirmation-code-continue">
                            
                            {
                                waiting ? <IonSpinner name="crescent" color="light"/> : "Verify"
                            }
                            
                        </motion.button>
                        
                    </IonItem>
                    
                </div>
                
                <div className="alterar-senha-third">
                    
                    <h5>{confirmPasswordInfo}</h5>
                    
                    <IonItem>
                        <IonLabel>New password</IonLabel>
                        <IonInput value={confirmPasswordA} onIonChange={e => setConfirmPasswordA(e.detail.value!)} type="password" placeholder="Nova senha"></IonInput>
                    </IonItem>
                    
                    <IonItem>
                        <IonLabel>Confirm passworn</IonLabel>
                        <IonInput value={confirmPasswordB} onIonChange={e => setConfirmPasswordB(e.detail.value!)} type="password" placeholder="Nova senha"></IonInput>
                    </IonItem>
                    
                    <div className="alterar-senha-buttons">
                        
                        <div></div>
                        
                        <IonButton onClick={() => { alterarSenhaCode() }} className="alterar-senha-button" color="primary" style={{ justifySelf: "flex-end" }}>
                            
                            {
                                waiting ? <IonSpinner name="crescent" color="light"/> : "Change password"
                            }
                            
                        </IonButton>
                        
                    </div>
                    
                </div>
                
            </div>
            
            <IonPopover
                cssClass='my-custom-class'
                event={popoverState.event}
                isOpen={popoverState.showPopover}
                onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
            >
                <h5><b>Priority while operating</b></h5>
                
                <p>Specifies which criteria before ending ou stop an operation cycle.</p>
                
                <p>When "<b>Martin Gale</b>" is chosen, if the user opt to use Stop Loss or Win, the cycle of martin gales have to end for the Stop Loss or Win could stop the operations</p>
                
                <p>In other hand, when "<b>Stop Loss and Stop Win</b>" is chosen, the operation cycle will be stoped if the values between martin gales reach the stop loss or win.</p>
                
            </IonPopover>
            
        </div>
    )
}

export default Settings;