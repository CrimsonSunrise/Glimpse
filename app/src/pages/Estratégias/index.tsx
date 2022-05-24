import {
	IonBackdrop,
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonMenuButton,
	IonPage,
	IonPopover,
	IonSelect,
	IonSelectOption,
	IonSpinner,
	IonTitle,
	IonToolbar,
	useIonAlert,
	useIonPopover,
	useIonToast,
} from "@ionic/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./style.css";
import { RiMapPin2Fill } from "react-icons/ri";
import axios from "axios";
import { editDb, toggleActive } from "../../old/Functions";
import serverInfo from "../../connection";
import { IoSettingsSharp } from 'react-icons/io5';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai'
import { CgArrowTopRight, CgArrowBottomRight } from 'react-icons/cg';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FaRegEye } from "react-icons/fa"
import { GiMirrorMirror } from "react-icons/gi"

const Estrategias = (props: any) => {
	
	const [userName, setUserName] = useState("");
	const [newName, setNewName] = useState("");
	const [selectedCreator, setSelectedCreator] = useState("");
	const [canEdit, setCanEdit] = useState(false);
	const [canErase, setCanErase] = useState(false);
	const [candleCount, setCandleCount] = useState(3);
	const [selectedCandleIndex, setSelectedCandleIndex] = useState(null);
	
	// const [useGale, setUseGale] = useState(false);
    // const [galeType, setGaleType] = useState("dobro");
    // const [galeCount, setGaleCount] = useState(1);
    // const [money, setMoney] = useState(2);
    // const [sobra, setSobra] = useState(1);
	
    const [saving, setSaving] = useState(false);
	const [testCandles, setTestCandles] = useState<any>([]);
	const [decisao, setDecisao] = useState("call");
    const [presentAlert] = useIonAlert();
	const [presentToast, dismissToast] = useIonToast();
	const [occurrencies, setOccurrencies] = useState(0);
	const [firstWin, setFirstWin] = useState(0);
	const [firstGale, setFirstGale] = useState(0);
	const [secondGale, setSecondGale] = useState(0);
	const [allLoss, setAllLoss] = useState(0);
    const [settingsOpened, setSettingsOpened] = useState(false);
	const [useEspelho, setUseEspelho] = useState(false);
	const [newSequencia, setNewSequencia] = useState<any>([]);
	
	const [detailTitle, setDetailTitle] = useState("");
	const [detailCreator, setDetailCreator] = useState("");
	const [detailSequence, setDetailSequence] = useState<any>([]);
	const [detailMirror, setDetailMirror] = useState(false);
	const [detailDecision, setDetailDecision] = useState("");
	
	const [minCandleCount, setMinCandleCount] = useState(3);
	const [maxCandleCount, setMaxCandleCount] = useState(12);
	
	const [editingStrategy, setEditingStrategy] = useState(false);
	
	const [currentStrategy, setCurrentStrategy] = useState<any>([]);
	
	const [OwnedStrategies, setOwnedStrategies] = useState<any>([]);
	
	const PopoverList: React.FC<{onHide: () => void;}> = ({ onHide }) => (
        <IonList>
            <IonItem button onClick={() => {onHide(); openCreation() }}>Create strategy</IonItem>
            <IonItem disabled={!canEdit} button onClick={() => {onHide(); }}>Edit strategy</IonItem>
            <IonItem disabled={!canErase} button onClick={() => {onHide() }}>Delete strategy</IonItem>
        </IonList>
    );
	
	const [present, dismiss] = useIonPopover(PopoverList, { onHide: () => dismiss() });
	
	const setFilterActive = (e: any) => {
		toggleActive("strategyFilter", "active", e);
	}
	
	const showDetails = (strat:any, e:any) => {
		
		setCurrentStrategy(strat);
		
		setDetailTitle(strat.name)
		setDetailCreator(strat.createdBy)
		const nSeq = strat.sequence.replace(" ", "").split(",")
		let nSeqCandles = [] as any;
		
		nSeq.map((seq:any) => {
			
			if(seq == "1") {
				nSeqCandles.push("green")
			} else if (seq == "-1") {
				nSeqCandles.push("red")
			} else {
				nSeqCandles.push("doji")
			}
		})
		
		setDetailSequence(nSeqCandles)
		setDetailMirror(strat.mirror)
		setDetailDecision(strat.operation)
		setDetailShowPopover({ showPopover: true, event: e })
		
	}
	
	const editStrategy = () => {
		
		if(!currentStrategy) return;
		
		console.log(currentStrategy)
		
		setDetailShowPopover({ showPopover: false, event: null })
		
		setEditingStrategy(true)
		
		setNewName(currentStrategy.name)
		setDecisao(currentStrategy.operation)
		setCandleCount(currentStrategy.sequence.replace(" ", "").split(",").length);
		setUseEspelho(currentStrategy.mirror)
		let currentColors = [] as any;
		
		currentStrategy.sequence.replace(" ", "").split(",").map((v:any) => {
			
			if( v == "1") {
				currentColors.push("green")
			} else if (v == "-1") {
				currentColors.push("red")
			} else {
				currentColors.push("doji")
			}
			
		})
		
		setCandleColors(currentColors)
		
		openCreation();
		
	}
	
	const [strategies, setStrategies]:any = useState([]);
	const [strategy, setStrategy]:any = useState("");
	
	useEffect(() => {
		loadStrategies();
		loadTestCandles();
		setUserName(props.nome)
		
	}, []);
	
	const loadTestCandles = () => {
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getTestCandles`, { userKey: "ASD123", })
		.then((res) => {
			setTestCandles(res.data)
		})
		
	}
	
	const loadStrategies = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			
			let userStrategies = res.data["ownedStrategies"]
			setOwnedStrategies(userStrategies)
			
			let strategiesToShow = [] as any;
			
			axios.post(`${serverInfo.ApiAddress}/glimpse/getStrategies`, { userKey: "ASD123", })
			.then((strategyRes) => {
				
				let strategies = strategyRes.data
				
				let arr = strategies;
				arr.sort(dynamicSort("name"))
				
				let strategiesArray:any = []
				arr.forEach((el:any) => {
					strategiesArray.push(el)
					if (userStrategies.includes(el.name)) {
						strategiesToShow.push(el)
					}
				});
				setStrategies(strategiesToShow)
			})
			
			setStrategy(res.data["strategy"])
			
		});
	}
	
	const selectStrategy = (e:any, name:string) => {
		
		if(!e.className.split(" ").includes("strategy")) return;
		
		toggleActive("strategy", "active", e)
		
		let response = editDb(["strategy"], [name], "")
		
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
	
	const checkStrategy = () => {
		
		const sStrat = document.querySelector(".strategy.active")
		const sName = sStrat.querySelector(".strategy-name").textContent.trim();
		const sCreator = sStrat.querySelector(".strategy-creator").textContent.trim();
		setSelectedCreator(sCreator)
	}
	
	const scandles = [
        {o: 0, c: 1},
        {o: 1, c: 2},
        {o: 2, c: 3},
        {o: 3, c: 4},
        {o: 4, c: 5},
        {o: 5, c: 6},
        {o: 6, c: 7},
        {o: 7, c: 8},
        {o: 8, c: 9},
        {o: 9, c: 10},
        {o: 10, c: 11},
        {o: 11, c: 12},
        {o: 12, c: 13},
        {o: 13, c: 14},
        {o: 14, c: 15},
    ]
	
	const [candles, setCandles] = useState<any>([
		{ o: 0, c: 0 },
		{ o: 0, c: 0 },
		{ o: 0, c: 0 },
	])
	
	const [candleColors, setCandleColors] = useState<any>(["green", "green", "green"]);
	
	const setCandlesColors = () => {
		
		let newCandleColors = [] as any;
		
		document.querySelectorAll(".candle").forEach(c=> {
			let cClassArray = c.className.split(" ")
			if ( cClassArray.includes("red") ) {
				newCandleColors.push("red")
			}
			
			if ( cClassArray.includes("doji") ) {
				newCandleColors.push("doji")
			}
			
			if ( cClassArray.includes("green") ) {
				newCandleColors.push("green")
			}
		})
		
		setCandleColors(newCandleColors)
		
	}
	
	const CandleChart = (props:any) => {
        
		let candleMontant = []
		let heights = [0]
		
		for (let i = 0; i < candleCount; i++) {
			candleMontant.push({
				candle: "A"
			})
		}
		
		for (let i = 1; i < candles.length; i++) {
			
			const candleValue = candles[i-1].o - candles[i-1].c
			
			let nextHeight = 0;
			
			if (candleValue < 0) {
				nextHeight = heights[i-1] - 20;
			} else if (candleValue > 0) {
				nextHeight = heights[i-1] + 20;
			} else {
				nextHeight = 0
			}
			
			heights.push(nextHeight)
			
		}
		
        return (
			<div className="creationChart">
				
				<div className="candlesWrapper">
					
					{
						candleMontant.map((candle, index) => {
							return (
								<div key={index} className={"candle " + candleColors[index]} onClick={(e)=>{ selectCandle(e.target, index) }}>
									<div style={{ top: heights[index] }}></div>
								</div>
							)
						})
					}
					
				</div>
				
				<div className="decision">
						
					<motion.div whileTap={{ scale: 0.95 }} onClick={(e) => {changeDecision(e.target)}} className={ decisao == "call" ? "decision-button call shadowComponent active" : "decision-button call shadowComponent" }><CgArrowTopRight/></motion.div>
					<motion.div whileTap={{ scale: 0.95 }} onClick={(e) => {changeDecision(e.target)}} className={ decisao == "put" ? "decision-button put shadowComponent active" : "decision-button put shadowComponent" }><CgArrowBottomRight/></motion.div>
					
				</div>
				
			</div>	
		)
        
    }
	
	const changeDecision = (e:any) => {
		
		let newDecision = ""
		
		let buttonClass = e.className.split(" ")
		
		if( buttonClass.includes("call")) {
			newDecision = "call";
		} else if (buttonClass.includes("put")) {
			newDecision = "put"
		}
		
		if( newDecision != decisao) {
			setDecisao(newDecision)
		}
	}
	
	const selectCandle = (e:any, index:number) => {
		let jaTem = false;
		const itemClassName = document.getElementsByClassName("candle").item(index).className.split(" ");
		
		if (itemClassName.includes("active")) {
			jaTem = true
		}
		
		document.querySelectorAll(".candle").forEach(c=> {
			let cClassArray = c.className.split(" ")
			let arr = cClassArray.filter(e => e !== 'active');
			c.className = arr.join(" ")
		})
		
		if (jaTem == true) {
			let nClass = itemClassName.filter(e => e !== 'active');
			document.getElementsByClassName("candle").item(index).className = nClass.join(" ");
			document.querySelector(".candle-colors").className = "candle-colors"
		} else {
			itemClassName.push("active")
			document.getElementsByClassName("candle").item(index).className = itemClassName.join(" ");
			document.querySelector(".candle-colors").className = "candle-colors active"
		}
	}
	
	const adjustCandleColor = (color:string) => {
		
		document.querySelectorAll(".candle").forEach(sc => {
			
			if(sc.className.split(" ").includes("active")) {
				sc.className = "candle active " + color
			}
			
		})
		
		document.querySelector(".candle-colors").className = "candle-colors"
		document.querySelectorAll(".candle").forEach(c=> {
			let cClassArray = c.className.split(" ")
			let arr = cClassArray.filter(e => e !== 'active');
			c.className = arr.join(" ")
		})
		
		setCandlesColors()
	}
	
	const ajustCandleCount = (number:number) => {
		
		document.querySelector(".candle-colors").className = "candle-colors"
		
		let newCount = 0;
		
		if (number < 0 && candleCount > minCandleCount) {
			newCount = candleCount - 1;
		}
		
		if (number > 0 && candleCount < maxCandleCount) {
			newCount = candleCount + 1;
			let nCColor = candleColors;
			nCColor.push("green")
			setCandleColors(nCColor)
		}
		
		setCandleCount(newCount);
		//console.log(candles)
	}
	
	const removeFocus = (e:any) => {
		const cCan = ["settings-save", "settings-test", "strategy-creation", "strategy-creation active", "candle-controls", "candlesWrapper", "native-input sc-ion-input-md"]
		if(cCan.includes(e.className)) {
			document.querySelector(".candle-colors").className = "candle-colors"
			document.querySelectorAll(".candle").forEach(c=> {
				let cClassArray = c.className.split(" ")
				let arr = cClassArray.filter(e => e !== 'active');
				c.className = arr.join(" ")
			})
		}
		
	}
	
	const criarEstrategia = () => {
		
		let sequenciaToSave = [] as any;
		
		document.querySelectorAll(".candle").forEach(candle => {
			if (candle.className.split(" ").includes("red")) {
				sequenciaToSave.push("-1")
			}
			
			if (candle.className.split(" ").includes("doji")) {
				sequenciaToSave.push("0")
			}
			
			if (candle.className.split(" ").includes("green")) {
				sequenciaToSave.push("1")
			}
		})
		
		if (saving) return;
		
        if (newName == "") {
			presentToast("Give your strategy a name.", 3000);
			return;
		}
		
		if (newName.length < 3) {
			presentToast("Strategy name must have at least 3 characters.", 3000);
			return;
		}
		
		if (newName.toUpperCase().indexOf("GLIMPSE") > -1) {
			presentToast("Not possible to use this name.", 3000);
			return;
		}
		
		if (sequenciaToSave == 0) return;
		
        setSaving(true);
		
		if(editingStrategy) {
			
			axios.post(`${serverInfo.ApiAddress}/glimpse/editStrategy`,
			{
				userKey: "ASD123",
				name: newName,
				createdBy: userName,
				sequence: sequenciaToSave.join(","),
				operation: decisao,
				mirror: useEspelho
			})
			.then((res) => {
				if (res.data.res == 1) {
					setStrategies([]);
					loadStrategies();
					setEditingStrategy(false);
					setSaving(false);
					cancelCreation();
				} else if (res.data.res == 0) {
					presentToast("Select another name for your strategy.", 3000);
					setSaving(false);
				}
			})
			
		} else {
			
			axios.post(`${serverInfo.ApiAddress}/glimpse/createStrategy`,
			{
				userKey: "ASD123",
				name: newName,
				createdBy: userName,
				sequence: sequenciaToSave.join(","),
				operation: decisao,
				mirror: useEspelho
			})
			.then((res) => {
				console.log(res.data)
				if (res.data.res == 1) {
					let newOwnedStrategies = OwnedStrategies
					newOwnedStrategies.push(newName)
					editDb(["ownedStrategies"], [newOwnedStrategies], "")
					setStrategies([]);
					loadStrategies();
					setTimeout(() => {
						setEditingStrategy(false);
						setSaving(false);
						cancelCreation();
					}, 1000)
					
				} else if (res.data.res == 0) {
					presentToast("Select another name for your strategy.", 3000);
					setSaving(false);
				}
			})
			
		}
	}
	
	const openCreation = () => {
		
		document.querySelector(".strategy-creation").className = "strategy-creation active"
	}
	
	const cancelCreation =() => {
		
		setEditingStrategy(false);
		
		setCandleColors(["green", "green", "green"]);
		setCandleCount(3);
		setNewName("");
		setUseEspelho(false)
		setDecisao("put")
		document.querySelector(".strategy-creation").className = "strategy-creation"
	}
	
	const testarSequencia = (e:any) => {
		
		document.querySelector(".candle-colors").className = "candle-colors"
		
		let sequencia = "";
		let sequenciaToSave = [] as any;
		
		document.querySelectorAll(".candle").forEach(candle => {
			if (candle.className.split(" ").includes("red")) {
				sequencia += "-";
				sequenciaToSave.push("-1")
			}
			
			if (candle.className.split(" ").includes("doji")) {
				sequencia += "0"
				sequenciaToSave.push("0")
			}
			
			if (candle.className.split(" ").includes("green")) {
				sequencia += "+"
				sequenciaToSave.push("1")
			}
		})
		
		setNewSequencia(sequenciaToSave)
		
		let winDePrimeira = "";
		let galeOuLoss = "";
		let comDoji = "";
		let fGale = "";
		let sGale = "";
		let tLoss = ""
		let ttLoss = "";
		let tttLoss = "";
		let ttttLoss = "";
		
		if (decisao == "call") {
			
			winDePrimeira = sequencia + "+"
			fGale = sequencia + "-+"
			sGale = sequencia + "--+"
			tLoss = sequencia + "---"
			ttLoss = sequencia + "----"
			tttLoss = sequencia + "-----"
			ttttLoss = sequencia + "------"
			
		} else if (decisao == "put") {
			
			winDePrimeira = sequencia + "-"
			fGale = sequencia + "+-"
			sGale = sequencia + "--+"
			tLoss = sequencia + "+++"
			ttLoss = sequencia + "++++"
			tttLoss = sequencia + "+++++"
			ttttLoss = sequencia + "++++++"
		}
		
		comDoji = sequencia + "0"
		
		let tOccurr = checkSequencia(sequencia)
		let totalWin = checkSequencia(winDePrimeira);
		let fGaleWin = checkSequencia(fGale);
		let sGaleWin = checkSequencia(sGale);
		let totalLoss = checkSequencia(tLoss) + checkSequencia(comDoji) + checkSequencia(ttLoss) + checkSequencia(tttLoss) +  + checkSequencia(ttttLoss);
		
		let total = totalWin + fGaleWin + sGaleWin + totalLoss
		//console.log(tOccurr, totalWin, fGaleWin, sGaleWin, totalLoss)
		setOccurrencies(tOccurr)
		
		let winPercent = (totalWin * 100) / total;
		let fGalePercent = (fGaleWin * 100) / total;
		let sGalePercent = (sGaleWin * 100) / total;
		let sAllLossPercent = (totalLoss * 100) / total;
		
		setFirstWin(winPercent)
		setFirstGale(fGalePercent)
		setSecondGale(sGalePercent)
		setAllLoss(sAllLossPercent)
		
		e.persist();
		setShowPopover({ showPopover: true, event: e })
	}
	
	const checkSequencia = (sequencia:string) => {
		let searchStrLen = sequencia.length;
		
		if (searchStrLen == 0) {
			return;
		}
		
		//let pop = [] as any;
		
		let totalOccurrencies = 0;
		
		testCandles.map((tc:any) => {
			
			let startIndex = 0, index, indices = [];
			
			//console.log(tc.candles)
			
			while ((index = tc.candles.indexOf(sequencia, startIndex)) > -1) {
				indices.push(index);
				// pop.push({
				// 	"a": tc.ativo,
				// 	"i": index
				// })
				startIndex = index + searchStrLen;
			}
			
			totalOccurrencies += indices.length
		})
		
		//console.log(pop)
		
		return totalOccurrencies;
	}
	
	const invertCandles = () => {
		
		let newColors = [] as any;
		
		candleColors.map((color:any) => {
			
			if (color == "red") newColors.push("green")
			if (color == "green") newColors.push("red")
			if (color == "doji") newColors.push("doji")
			
		})
		
		if( decisao == "call") setDecisao("put")
		if( decisao == "put") setDecisao("call")
		
		setCandleColors(newColors)
		
	}
	
	const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined })
	const [detailPopoverState, setDetailShowPopover] = useState({ showPopover: false, event: undefined })
	
	const TestResult = (props:any) => {
		
		
		return (
			<div className="test-result">
				
				<div className="result-occurrencies">
					{occurrencies} ocurrencies*
				</div>
				
				<div className="result-bar">
					<div className="result-bar-back">
						<div className="r-bar win-bar" style={{ width: firstWin+'%', borderRadius: allLoss == 0 && secondGale == 0 && firstGale == 0 ? "20px" : "20px 0 0 20px" }}>
							<div className="r-bar-percent even">
								{
									firstWin > 0 ? firstWin.toFixed(0) + "%" : ""
								}
							</div>
						</div>
						<div className="r-bar first-gale" style={{ width: firstGale+'%', borderRadius: allLoss == 0 && secondGale == 0 ? "0 20px 20px 0" : "0" }}>
							<div className="r-bar-percent odd">
								{
									firstGale > 0 ? firstGale.toFixed(0) + "%" : ''
								}
							</div>
						</div>
						<div className="r-bar second-gale" style={{ width: secondGale+'%', borderRadius: allLoss == 0 ? "0 20px 20px 0" : "0" }}>
							<div className="r-bar-percent even">
								{
									secondGale > 0 ? secondGale.toFixed(0) + "%" : ""
								}
							</div>
						</div>
						<div className="r-bar third-or-loss" style={{ width: allLoss+'%', borderRadius: firstWin == 0 && secondGale == 0 && firstGale == 0 ? "20px" : "0 20px 20px 0" }}>
							<div className="r-bar-percent odd">
								{
									allLoss > 0 ? allLoss.toFixed(0) + "%" : ""
								}
							</div>
						</div>
					</div>
				</div>
				
				<div className="result-labels">
					
					<div className="result-label">
						<div className="result-color win-bar">a</div>
						<div className="result-name">win at first</div>
					</div>
					
					<div className="result-label">
						<div className="result-color first-gale">a</div>
						<div className="result-name">win at second gale</div>
					</div>
					
					<div className="result-label">
						<div className="result-color second-gale">a</div>
						<div className="result-name">win at third gale</div>
					</div>
					
					<div className="result-label">
						<div className="result-color third-or-loss">a</div>
						<div className="result-name">loss ou many gales</div>
					</div>
					
				</div>
				
				<span>*reference values for past months.</span>
				
			</div>
		)
		
	}
	
	const StrategyDetail = (e:any) => {
		
		return (
			<div className="strategy-detail">
				
				{
					userName == currentStrategy.createdBy ? <motion.div onClick={() => { editStrategy() }} whileTap={{ scale: 0.95 }} className="strategy-detail-edit shadowComponent">Edit</motion.div> : ""
				}
				
				
				<div className="strategy-detail-title">{detailTitle}</div>
				
				<div className="strategy-detail-creator">{detailCreator}</div>
				
				<div className="strategy-detail-sequence">
					
					{
						detailSequence.map((candle:any, index:number) => {
							
							return (
								<div key={index} className={"sds " + candle}></div>
							)
							
						})
					}
					
					<div className="strategy-detail-decision">
						
						<div className={detailDecision}>
							
							{
								detailDecision == "call" ? <CgArrowTopRight/> : <CgArrowBottomRight/>
							}
						</div>
						{/* <div><CgArrowBottomRight/></div> */}
						
					</div>
					
				</div>
				
				
					{
						detailMirror ? <div className="strategy-detail-mirror"><GiMirrorMirror/> Mirrowed sequence</div> : ""
					}
				
				
			</div>
		)
		
	}
	
	return <>
	
		<div className="strategiesWrapper">
			
			<div className="strategies-controls">
				
				<p></p>
				
				<motion.div whileTap={{ scale:0.95 }} className="strategy-control shadowComponent options" onClick={(e) => { present({event: e.nativeEvent,}); checkStrategy() }}><IoSettingsSharp/></motion.div>
			</div>
		
			<div className={settingsOpened ? "strategiesList contracted" : "strategiesList"}>
			
				{
					strategies.map((strat:any, index:number) => {
						return(
							<motion.div key={index} onClick={(e) => { selectStrategy(e.target, strat.name); }} whileTap={{ scale: 0.95 }} className={ strategy.includes(strat.name) ? "strategy shadowComponent active" : "strategy shadowComponent" }>
								
								<div className="strategy-name">{strat.name}</div>
								
								<div className="strategy-creator">{strat.createdBy}</div>
								
								<div className="strategy-look" onClick={(e) => { showDetails(strat, e) }}><IoSettingsSharp/></div>
								
							</motion.div>
						)
					})
				}
				
				<div className="strategiesListShadow"></div>
				
			</div>
			
		</div>
		
		<div className="strategy-creation" onClick={(e) => { removeFocus(e.target) }}>
			
			<h1></h1>
			
			<div className="strategy-creation-name">
				<IonItem className="glimpseItem">
					<IonLabel position="floating">Strategy name</IonLabel>
					<IonInput
						disabled={editingStrategy}
						className="glimpseInput"
						type="email"
						autocomplete="off"
						autocorrect="off"
						value={newName}
						maxlength={20}
						onIonChange={e => setNewName(e.detail.value!)}
					></IonInput>
				</IonItem>
			</div>
			
			<div className="candle-controls">
				<motion.div whileTap={{ scale: 0.95 }} className="candle-invert shadowComponent" onClick={() => { invertCandles() }}>Invert</motion.div>
				<div className="candle-controls-candlecount">
					<div className="candle-count">{candleCount} candles</div>
					<motion.button disabled={ candleCount == minCandleCount } whileTap={{ scale: candleCount == minCandleCount ? 1 : 0.95 }} className="candle-control" onClick={(e) => { ajustCandleCount(-1) }}><AiOutlineMinus/></motion.button>
					<motion.button disabled={ candleCount == maxCandleCount } whileTap={{ scale: candleCount == maxCandleCount ? 1 : 0.95 }} className="candle-control" onClick={(e) => { ajustCandleCount(1) }}><AiOutlinePlus/></motion.button>
				</div>
				
				
			</div>
			
			<CandleChart/>
			
			<div className="candle-colors">
				
				<motion.div whileTap={{ scale: 0.95 }} onClick={() => { adjustCandleColor("red") }} className="candle-color red shadowComponent"></motion.div>
				<motion.div whileTap={{ scale: 0.95 }} onClick={() => { adjustCandleColor("doji") }} className="candle-color doji shadowComponent"></motion.div>
				<motion.div whileTap={{ scale: 0.95 }} onClick={() => { adjustCandleColor("green") }} className="candle-color green shadowComponent"></motion.div>
				
			</div>
			
			<div className="signals-settings-content creation">
				
				<IonItem lines="full">
					<IonLabel className="signals-settings-label">Mirror sequence</IonLabel>
					<IonCheckbox checked={useEspelho} onIonChange={e => setUseEspelho(e.detail.checked)} />
				</IonItem>
				
			</div>
			
			<div className="strategy-creation-buttons">
				
				<motion.div whileTap={{ scale: 0.95 }} onClick={() => { cancelCreation() }} className="settings-cancel shadowComponent">
					Cancel
				</motion.div>
				
				<motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { testarSequencia(e); removeFocus(e) }} className="settings-test shadowComponent">
					Test
				</motion.div>
				
				<motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { criarEstrategia(); removeFocus(e) }} className="settings-save shadowComponent">
					{
						saving ? <IonSpinner name="crescent" color="light"/> : "Save"
					}
				</motion.div>
				
			</div>
			
		</div>
		
		<IonPopover
			cssClass='my-custom-class'
			event={popoverState.event}
			isOpen={popoverState.showPopover}
			keyboardClose={true}
			onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
		>
			<TestResult/>
		</IonPopover>
		
		<IonPopover
			cssClass='detailPopoverClass'
			event={detailPopoverState.event}
			isOpen={detailPopoverState.showPopover}
			keyboardClose={true}
			onDidDismiss={() => setDetailShowPopover({ showPopover: false, event: undefined })}
		>
			<StrategyDetail/>
		</IonPopover>
		
	</>;
}

export default Estrategias;
