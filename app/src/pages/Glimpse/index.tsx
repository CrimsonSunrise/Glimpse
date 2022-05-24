import { motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import './style.css'
import { IoChevronBack, IoSettingsSharp, IoCloudOffline, IoNotificationsSharp } from 'react-icons/io5';
import Payout from '../../old/pages/Payout';
import Corretora from '../../old/pages/Corretora';
import Ativos from '../../old/pages/Ativos';
import { IonIcon, IonPopover, IonSkeletonText, IonSpinner, useIonToast } from '@ionic/react';
import axios from 'axios';
import serverInfo from '../../connection';
import { editDb } from '../../old/Functions';
import Alerts from '../alerts'
import { alert } from 'ionicons/icons';
import ReactDOM from 'react-dom';
import Planos from '../sinais';
import Sinais from '../sinais';
import Ajustes from '../ajustes';
import Estrategias from '../Estratégias';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import livro from "../../Assets/livro.png";
import saude from "../../Assets/saude.png";
import alongando from "../../Assets/alongando.png";
import sabores from "../../Assets/sabores.png";
import amigos from "../../Assets/amigos.png";
import feliz from "../../Assets/feliz.png";

import { eyeOff, eye } from 'ionicons/icons';

export default function Glimpse(props:{}) {
    
    const [panelContent, setPanelContent] = useState();
    const [glimpseStatus, setGlimpseStatus] = useState(false);
    const [statusText, setStatusText] = useState("Start");
    const [glimpsePreparing, setGlimpsePreparing] = useState(false);
    const [userName, setUserName] = useState("");
    const [userIqProfit, setUserIqProfit] = useState(0.0);
    const [userIqLoss, setUserIqLoss] = useState(0.0);
    const [iqSessionProfit, setIqSessionProfit] = useState(0.0);
    const [preferedActives, setPreferedActives] = useState([]);
    const [Actives, setActives] = useState([]);
	const [user, setUser]:any = useState<any>({});
    const [iqPassword, setIqPassword] = useState(false);
    const _isMounted = useRef(true);
    const [present, dismiss] = useIonToast();
    const [alertsCount, setAlertsCount] = useState(0);
    const [canInteract, setCanInteract] = useState(false);
    const [haveStrategy, setHaveStrategy] = useState(false);
    const [mode, setMode] = useState("");
    const [modeInfo, setModeInfo] = useState<any>(<div className="selected-item"><IonSkeletonText animated style={{ width: '50px' }} /></div>);
    const [signalsSettings, setSignalsSettings] = useState<any>([]);
    const [strategySettings, setStrategySettings] = useState<any>([]);
    
    const [operating, setOperating] = useState(false);
    const [operatingData, setOperatingData] = useState<any>(null);
    
    const [testS, setTestS] = useState(0);
    
    const [slideAtual, setSlideAtual] = useState<any>("");
    const [allowSlide, setAllowSlide] = useState(true);
    
    const [canLoad, setCanLoad] = useState(true);
    
    const [useSlides, setUseSlides] = useState(false);
    
    let loadInterval:any;
    let sliderInterval:any;
    
    // <div className="selected-item">
                                    
    //     {
    //         user["strategy"] ? user["strategy"] : <IonSkeletonText animated style={{ width: '50px' }} />
    //     }
        
    // </div>
    
    const podeAtualizar = useRef(true);
    
    const openPanelSection = (content:any, panel:string) => {
        podeAtualizar.current = false;
        if(panel == "alerts") {
            setPanelContent(content)
            const panelSection = document.getElementById("panel-section");
            panelSection.className = "panel-section active";
        } else {
            if (!canInteract) return;
            setPanelContent(content)
            const panelSection = document.getElementById("panel-section");
            panelSection.className = "panel-section active";
        }
        
    }
    
    const closePanelSection = () => {
        podeAtualizar.current = true;
        setPanelContent(null)
        const panelSection = document.getElementById("panel-section");
        panelSection.className = "panel-section";
    }
    
    // function useInterval(callback:any, delay:any) {
    //     const savedCallback = useRef<any>();

    //     // Remember the latest callback.
    //     useEffect(() => {
    //         savedCallback.current = callback;
    //     }, [callback]);

    //     // Set up the interval.
    //     useEffect(() => {
    //         let id = setInterval(() => {
    //         savedCallback.current();
    //         }, delay);
    //         return () => clearInterval(id);
    //     }, [delay]);
    // }
    
    // useInterval(() => {
    //     setTestS(testS + 1);
    //     console.log(testS)
    // }, 1000);
    
    const changeSlidePic = () => {
        
        const pictures = [livro, saude, alongando, sabores, amigos, feliz]
        
        let rN = ((Math.random()*pictures.length)-1).toFixed(0) as any
        if (rN < 0) rN = 0;
        if (rN == -0) rN = 0;
        if (rN > pictures.length-1) rN = pictures.length-1;
        setSlideAtual(pictures[rN])
        
    }
    
    useEffect(() => {
        changeSlidePic();
        setCanInteract(false);
        const source = axios.CancelToken.source()
		let abortController = new AbortController();
		
		loadUserData()
		
		loadInterval = setInterval(() => {
			loadUserData();
		}, (serverInfo.updateTimeout*1000))
        
        sliderInterval = setInterval(() => {
            changeSlidePic();
		}, (serverInfo.updateTimeout*10000))
        
		return () => { // ComponentWillUnmount in Class Component
			_isMounted.current = false;
			clearInterval(loadInterval)
			clearInterval(sliderInterval)
			abortController.abort();
		}
        
    }, [])
    
    const loadUserData = () => {
        
        if( podeAtualizar.current == false ) return;
        
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		const source = axios.CancelToken.source();
		
		try {
			
			//console.log(_isMounted.current)
			
			if (!_isMounted.current) return
			
			axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", cancelToken: source.token}, {timeout: 5000})
			.then((res) => {
				
				setUser(res.data);
                
                setUseSlides(res.data.settings.glimpse.slides)
                
                setOperating(res.data["operating"]["operating"]);
                setOperatingData(res.data["operating"]);
                //console.log(res.data["operating"])
                
                if(res.data["name"].indexOf(" ") > -1 ){
                    setUserName(res.data["name"].split(" ")[0] + " " + res.data["name"].split(" ")[res.data["name"].split(" ").length-1]);
                }  else {
                    setUserName(res.data["name"]);
                }
                
                setIqSessionProfit(res.data["iqSessionProfit"].toFixed(2));
                
                setUserIqProfit(res.data["iqPeriodProfit"].toFixed(2));
                
                setUserIqLoss(res.data["iqPeriodLoss"].toFixed(2));
                
                setSignalsSettings(res.data["signalSettings"])
                setStrategySettings(res.data["strategySettings"])
                
                if(res.data["preferedActives"] == "todos") {
                    
                    setPreferedActives(["todos"]);
                    
                } else {
                    const prefActives = res.data["preferedActives"].split(",");
                    if(prefActives.length > 2) {
                        setPreferedActives([prefActives[0], prefActives[1], "..."]);
                    } else if (prefActives.length == 2) {
                        setPreferedActives([prefActives[0], prefActives[1]]);
                    } else {
                        setPreferedActives([prefActives[0]]);
                    }
                }
                
                if(res.data["iqPassword"] != "") {
                    setIqPassword(true)
                } else {
                    setIqPassword(false)
                }
                
                let aCount = 0;
                
                res.data.alerts.map((alert:any) => {
                    if(alert.read == false) {
                        aCount += 1;
                    }
                })
                
                showAlerts(res.data.alerts);
                
                setAlertsCount(aCount)
                
                let selectedMode = "";
                
                if(res.data["mode"] == "strategy") {
                    setMode("Estrategies")
                    
                    let stratInfo = "-";
                    setHaveStrategy(false);
                    
                    if (res.data["strategy"] != "") {
                        stratInfo = res.data["strategy"];
                        setHaveStrategy(true);
                    }
                    
                    setModeInfo(<div className="selected-item">{stratInfo}</div>)
                } else if(res.data["mode"] == "signals") {
                    setMode("Signals")
                    setHaveStrategy(true);
                    setModeInfo("")
                }else if(res.data["mode"] == "copy") {
                    setMode("Copy")
                    setModeInfo("")
                }
                
                const gStatus = res.data.glimpseStatus;
                
                if (gStatus != "operating" && gStatus != "off") {
                    
                    setGlimpsePreparing(true);
                    setGlimpseStatus(true);
                }
                
                if (glimpsePreparing == true) {
                    setCanInteract(false);
                    setGlimpseStatus(true);
                    if (gStatus == "operating") {
                        setGlimpsePreparing(false);
                        setStatusText("Stop");
                    }
                    
                }
                
                if (glimpsePreparing == false) {
                    
                    if(gStatus == "off") {
                        setGlimpseStatus(false);
                        setGlimpsePreparing(false);
                        setStatusText("Start");
                    }
                    
                    if(gStatus == "operating") {
                        setGlimpseStatus(true);
                        setGlimpsePreparing(false);
                        setStatusText("Stop");
                    }
                    
                }
                
                if(gStatus == "off") {
                    setCanInteract(true);
                } else {
                    setCanInteract(false);
                }
				
				axios.post(`${serverInfo.ApiAddress}/glimpse/ativos`, { type: "full" }).then((activesRes) => {
					
					let ativos:any = []
					
					activesRes.data.map((aRes:any) => {
						
						if(aRes.open == "True") {
							ativos.push([aRes.ativo, aRes.payout]);
						}
						
					})
					
					setActives(ativos)
					
				})
				
				
			});
		} catch (error) {
			if (axios.isCancel(error)) {
            } else {
                throw error
            }
		}
		
	}
    
    const toggleGlimpse = (text:string) => {
        
        if (!canInteract && text !="Parar") return;
        
        if (!haveStrategy) {
            present("Você precisa selecionar uma estratégia!", 3000);
            return;
        }
        
        if (user["iqPassword"] == "") {
            present("Configure sua conta IQ Option!", 3000);
            return;
        }
        
        if( glimpsePreparing ) return;
        
        if(!glimpseStatus) {
            
            const operating = {
                operating: false,
                active: "",
                money: 0,
                operacao: "",
                tries: [] as any
            }
            
            editDb(["glimpseStatus", "operating"], ["waiting", operating], "");
            
            setGlimpsePreparing(true);
            //setStatusText("Parar");
            setGlimpseStatus(true);
            
        } else {
            
            editDb(["glimpseStatus"], ["stopping"], "");
            setGlimpsePreparing(true);
            //setStatusText("Iniciar");
            //setGlimpseStatus(false);
            
        }
        
    }
    
    const Alert = (props:any) => {
        return (
            <div id={props.id} style={{ display: 'flex' }} onClick={() => { vanishAlert() }} className={"shown-alert shadowComponent " + props.type}>{props.title}</div>
        )
    }
    
    const [shownAlert, setShownAlert] = useState<any>([])
    
    const showAlerts = (alerts:any) => {
        
        let alertsToShow = [] as any;
        let shouldUpdate = false;
        
        alerts.map((alert:any) => {
            
            if(alert.shown == false) {
                shouldUpdate = true;
                alertsToShow.push(<Alert type={alert.type} key={alert.time} title={alert.title}/>)
                alert.shown = true;
            }
            
        })
        
        if (shouldUpdate) {
            editDb(["alerts"], [alerts], "")
            setShownAlert(alertsToShow)
            setTimeout(() => {
                vanishAlert()
            }, 3000)
        }
    }
    
    const vanishAlert = () => {
        setShownAlert(null);
    }
    
    const changePlan = (e:any, text:string) => {
        const plans = document.querySelectorAll(".plan");
        
        if(e.parentElement.className.split(" ").includes("mode-selector")) {
        
            plans.forEach(plan => {
                plan.className = "plan shadowComponent"
            })
            
            e.className = "plan shadowComponent active"
            editDb(["mode"], [text], "");
        }
    }
    
    const planSettings = (target:any) => {
        
        hideModeSelector()
        openPanelSection(target, "");
        
    }
    
    const showModeSelector = () => {
        if (!canInteract) return;
        document.querySelector(".mode-selector").className = "mode-selector shadowComponent active";
        document.querySelector(".mode-selector-back").className = "mode-selector-back active";
        
        //openPanelSection(<Planos/>)
    }
    
    const hideModeSelector = () => {
        document.querySelector(".mode-selector").className = "mode-selector shadowComponent";
        document.querySelector(".mode-selector-back").className = "mode-selector-back";
    }
    
    const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined })
    
    const ActivesList = () => {
        return (
            <>
                <div className="popover-active-list">
                    
                    {
                        Actives ?
                        
                        Actives.map((ativo, index) => {
                            
                            return (
                                <div key={index} className="active">
                                    <div className="active-name">{ativo[0]}</div>
                                    <div className="active-payout">{ativo[1]}%</div>
                                </div>
                            )
                            
                        })
                        
                        : <div className="active"><IonSkeletonText animated style={{ width: '50px' }} /></div>
                    }
                    
                </div>
            </>
        )
    }
    
    const AlgoAqui = () => {
        
        return (
            <>
                {
                    useSlides ?
                    <div className={allowSlide ? "waiting-slide shadowComponent active" : "waiting-slide"}>
                        
                        <motion.div whileTap={{ scale: 0.95 }} className="allow-slide" onClick={() => { setAllowSlide(!allowSlide) }}>
                        
                            <IonIcon icon={allowSlide ? eye : eyeOff}/>
                        
                        </motion.div>
                        
                        <div className="slide-text">
                            
                            {
                                allowSlide ?
                                "Waiting for the next order..."
                                : "Waiting for the next order."
                            }
                        </div>
                        
                        <img className="slide-image" src={slideAtual} alt="" />
                        
                    </div>
                    : 
                    <div className={allowSlide ? "waiting-slide active" : "waiting-slide"}>
                        <div className="slide-text">Waiting for the next order.</div>
                    </div>
                }
            </>
        )
        
    }
    
    const Operating = () => {
        
        let tries = [] as any
        
        let ac = "";
        let oper = "";
        let mn = "";
        
        if (operatingData != null) {
            tries = operatingData.tries
            
            ac = operatingData.active
            
            oper = operatingData.operacao
            
            mn = parseFloat(operatingData.money).toFixed(2)
            
        }
        
        return (
            
            <div className="operando">
                    
                <div className="operando-item">
                    <div className="operando-ativo">{ac}</div>-
                    <div className="operando-operacao">{oper}</div>-
                    <div className="operando-money">R$ {mn}</div>
                </div>
                
                <div className="operando-operacoes">
                    
                    
                    {
                        tries.map((tr:any, index:number) => {
                            
                            const ts = parseInt((Date.now() / 1000).toFixed(0))
                            
                            const df = ts - parseInt(tr.start)
                            
                            const pc = (df * 100) / 60
                            
                            let lineClass = ""
                            
                            if (index < tries.length - 1) {
                                lineClass = "operando-gap"
                            }
                            
                            return (
                                <div className="operando-row" key={index}>
                                    <div className="operando-op">
                                        <CircularProgressbar strokeWidth={10} value={ parseInt(tr.start) > 0 ? pc : 0} styles={buildStyles({
                                            strokeLinecap: 'butt',
                                            pathTransitionDuration: 0.5,
                                            pathColor: '#ffffff',
                                            textColor: 'transparent',
                                        })} />
                                    </div>
                                    <div className={lineClass}></div>
                                </div>
                            )
                            
                        })
                    }
                    
                </div>
                
            </div>
            
        )
        
    }
    
    return (
        <>
        
            <div id="glimpse" className={glimpseStatus ? "glimpse operating" : "glimpse"}>
                
                <IonPopover
                    cssClass='popover-actives-class'
                    event={popoverState.event}
                    isOpen={popoverState.showPopover}
                    keyboardClose={true}
                    onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
                >
                    <ActivesList/>
                </IonPopover>
                
                
                <div className="alert-wrapper">
                    
                    <div className="shown-alerts">
                        
                        {
                            shownAlert
                        }
                        
                    </div>
                    
                </div>
                
                <div className="header">
                    
                    <h1>Glimpse</h1>
                    
                    <div className="info-buttons">
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { Actives.length > 0 ? setShowPopover({ showPopover: true, event: e }) : console.log("nenhum") }} className="opened-actives-button shadowComponent">
                            
                            <div className={ Actives.length > 0 ? "opened-actives-count" : "opened-actives-count empty" }>{Actives.length}</div>
                            <div className="opened-actives-title">currency pairs</div>
                            
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.95 }} className="alerts-button" onClick={() => {openPanelSection(<Alerts/>, "alerts")}}>
                            
                            <IoNotificationsSharp/>
                            <div className={alertsCount ? "alerts-count active" : "alerts-count"}>{alertsCount}</div>
                            
                        </motion.div>
                        
                    </div>
                    
                </div>
                
                <div className="resumee block shadowComponent">
                    
                    <div className="resumee-name">
                        {
                            userName ? userName : <IonSkeletonText animated style={{ width: '50%' }} />
                        }
                    </div>
                    
                    <div className="resumee-cash">
                        {
                            userIqLoss == 0 ? '' :
                            <div className="resumee-equation">
                                ( <div className="equation-win">{ userIqProfit }</div> - <div className="equation-loss">{ userIqLoss }</div> )
                            </div>
                            
                        }
                        
                        <span>$</span>
                        <div className="resumee-media">
                            {
                                userIqProfit ? (userIqProfit - userIqLoss).toFixed(2) : <IonSkeletonText animated style={{ width: '100px' }} />
                            }
                        </div>
                    </div>
                    
                </div>
                
                <div className="operating-info">
                    
                    <h5>Profit in this session</h5>
                    
                    <div className="session-profit">
                        
                        <div className="session-profit-currency">$</div>
                        <div className="session-profit-positivity">+</div>
                        <div className="session-profit-balance">{iqSessionProfit}</div>
                        
                    </div>
                    
                </div>
                
                <div className="blocks">
                    
                    <div className="sideblock">
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => { openPanelSection(<Corretora/>, "") }} className="block small shadowComponent corretora">
                            
                            <div className="block-title">
                                Broker
                            </div>
                            
                            <div className={ iqPassword ? "block-status active" : "block-status" }>
                                <div></div>
                                <span>{ iqPassword ? "Conectado" : "Desconectado" }</span>
                            </div>
                            
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => { openPanelSection(<Payout/>, "") }} className="block small shadowComponent">
                            
                            <div className="block-title">
                                Payout
                            </div>
                            
                            <div className="block-selected-items">
                                
                                <div className="selected-item">
                                    
                                    {
                                        user["preferedPayout"] ? user["preferedPayout"] + "%" : <IonSkeletonText animated style={{ width: '50px' }} />
                                    }
                                    
                                </div>
                                
                            </div>
                            
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => { openPanelSection(<Ajustes nome={userName}  config={strategySettings}/>, "") }} className="block small shadowComponent">
                            
                            <div className="block-title">
                                Order options
                            </div>
                            
                        </motion.div>
                        
                    </div>
                    
                    <div className="sideblock">
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => { openPanelSection(<Ativos/>, "") }} className="block small shadowComponent">
                            
                            <div className="block-title">
                                Currency pairs
                            </div>
                            
                            <div className="block-selected-items">
                                
                                {
                                    preferedActives.length > 0 ? 
                                    
                                    preferedActives.map((ativo, index) => {
                                        return (
                                            <div key={index} className="selected-item">
                                                {ativo}
                                            </div>
                                        )
                                    })
                                    
                                    : <div className="selected-item"><IonSkeletonText animated style={{ width: '50px' }} /></div>
                                }
                                
                            </div>
                            
                        </motion.div>
                        
                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => { showModeSelector() }} className="block small shadowComponent">
                            
                            <div className="block-title">
                                Mode
                            </div>
                            
                            <div className="block-selected-items plano">
                                
                                <div className="block-type">{mode}</div>
                                
                                {
                                    modeInfo
                                }
                                
                            </div>
                            
                        </motion.div>
                        
                    </div>
                    
                </div>
                
                {
                    operating && glimpseStatus ? <Operating/> : <AlgoAqui/>
                }
                
                {/* <Operating/> */}
                
                {/* <button onClick={() => { showAlerts({title: "Algo aqui ou alí"}) }}>Test</button> */}
                
                <div id="glimpse-controls" className="glimpse-controls">
                    
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => { toggleGlimpse(statusText) }} className="control-button shadowComponent">
                        
                        {
                            glimpsePreparing ? <IonSpinner color="primary" name="crescent" /> : statusText
                        }
                        
                    </motion.div>
                    
                </div>
                
                <div className="mode-selector-back" onClick={() => { hideModeSelector() }}></div>
                
                <div className="mode-selector shadowComponent">
                    
                    <motion.div onClick={(e) => { changePlan(e.target, "strategy") }} whileTap={{scale:0.98}} className={ mode == "Estratégias" ? "plan shadowComponent active" : "plan shadowComponent" }>
                        <div className="plan-title">Estrategies</div>
                        <div className="plan-info">
                            {
                                user["strategy"] ? user["strategy"] : "-"
                            }
                        </div>
                        <motion.div whileTap={{scale:0.95}} className="plan-settings"onClick={(e) => { planSettings(<Estrategias nome={userName}  config={strategySettings}/>) }}><IoSettingsSharp/></motion.div>
                    </motion.div>
                    
                    <motion.div onClick={(e) => { changePlan(e.target, "signals") }} whileTap={{scale:0.98}} className={ mode == "Sinais" ? "plan shadowComponent active" : "plan shadowComponent" }>
                        <div className="plan-title">Signals</div>
                        <div className="plan-info"></div>
                        <motion.div whileTap={{scale:0.95}} className="plan-settings"onClick={(e) => { planSettings(<Sinais config={signalsSettings}/>) }}><IoSettingsSharp/></motion.div>
                    </motion.div>
                    
                    <motion.div onClick={(e) => {  }} whileTap={{scale:1}} className="disabled-plan shadowComponent">
                        <div className="plan-title">Copy</div>
                        <div className="plan-info">some trader</div>
                        <motion.div whileTap={{scale:0.95}} className="plan-settings" onClick={(e) => { planSettings(<Estrategias nome=""/>) }}><IoSettingsSharp/></motion.div>
                    </motion.div>
                    
                    <motion.div whileTap={{scale:0.95}} className="select-mode" onClick={() => {hideModeSelector()}}>
                        OK
                    </motion.div>
                    
                </div>
                
                <div id="panel-section" className="panel-section">
                    
                    <div className="panel-back">
                        
                        <motion.div whileTap={{ scale: 0.95 }} className="back-button" onClick={() => { closePanelSection() }}>
                            <IoChevronBack/> Home
                        </motion.div>
                        
                    </div>
                    
                    <div id="panel-content" className="panel-content">
                        
                        { panelContent }
                        
                    </div>
                    
                </div>
                
                <div className="pos-operation">
                    
                    
                    
                </div>
                
            </div>
        </>
    )
}
