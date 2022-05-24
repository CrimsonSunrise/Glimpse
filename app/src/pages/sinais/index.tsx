import { IonCheckbox, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonRadio, IonSelect, IonSelectOption, IonSpinner, useIonAlert, useIonPopover, useIonToast } from "@ionic/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import serverInfo from "../../connection";
import moment from 'moment';
import { IoTrashOutline, IoRefreshOutline, IoSettingsSharp } from 'react-icons/io5';
import { AiOutlinePlus, AiOutlineClear } from 'react-icons/ai'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { ImPaste } from 'react-icons/im'
import { Clipboard } from '@capacitor/clipboard';
import { editDb, insertSignals } from "../../old/Functions";

const Sinais = (props: any) => {
    
    const [textareaText, setTextareaText] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [addedSignals, setAddedSignals] = useState<any>([]);
    const [settingsOpened, setSettingsOpened] = useState(false);
    
    const [saving, setSaving] = useState(false);
    const [presentAlert] = useIonAlert();
    const [presentToast, dismissToast] = useIonToast();
    
    const PopoverList: React.FC<{onHide: () => void;}> = ({ onHide }) => (
        <IonList>
            <IonItem button onClick={() =>{onHide(); abrirAddLista(); setSettingsOpened(false)}}>Add list</IonItem>
            <IonItem disabled button onClick={() => {onHide(); ; setSettingsOpened(false)}}>Import list</IonItem>
            <IonItem disabled button onClick={() => {onHide(); ; setSettingsOpened(false)}}>Clear canceled</IonItem>
            <IonItem disabled={ addedSignals.length > 0 ? false : true } button onClick={() => { onHide(); confirmLimpar(); setSettingsOpened(false) }}>Clear all</IonItem>
        </IonList>
    );
    
    const confirmLimpar = () => {
        presentAlert({
            cssClass: 'addConfirm',
            header: 'Clear?',
            message: 'Are you sure?',
            buttons: [
              'Cancel',
              { text: 'Yes', handler: (d) => limparLista() },
            ],
        })
    }
    
    const [present, dismiss] = useIonPopover(PopoverList, { onHide: () => dismiss() });
    
    const cancelSignal = (signal:any, time:any) => {
        
        let newSignals = addedSignals;
        
        let newStatus = "";
        
        if(signal.parentElement.className.split(" ").includes("canceled")) {
            
            signal.parentElement.className = "sinal shadowComponent";
            newStatus = "active"
            
        } else {
            
            signal.parentElement.className = "sinal shadowComponent canceled";
            newStatus = "canceled"
            
        }
        
        newSignals.map((signal:any) => {
            
            if (signal.hora == time) {
                signal.status = newStatus;
            }
            
        })
        
        setAddedSignals(newSignals)
        insertSignals(newSignals, "user")
        
    }
    
    const pasteFromClipboard = async () => {
        if(verificando) return;
        const { type, value } = await Clipboard.read();
        if(type == "text/plain" && value != "") {
            setTextareaText(value);
        }
    };
    
    const abrirAddLista = () => {
        if(addedSignals.length > 0) {
            confirmAddition()
        } else {
            confirmOpenAddList()
        }
    }
    
    const confirmOpenAddList = () => {
        document.querySelector(".add-list").className = "add-list active";
    }
    
    const fecharAddLista = () => {
        setTextareaText("");
        setVerificando(false)
        document.querySelector(".add-list").className = "add-list";
        
    }
    
    const limparLista = () => {
        insertSignals([], "user");
        setAddedSignals([])
    }
    
    const clearTextarea = () => {
        if(verificando) return;
        setTextareaText("");
    }
    
    const checarLista = () => {
        if(verificando || textareaText.length < 15) return;
        setVerificando(true)
        
        const listaAtivos = ['GBPNZD', 'CADJPY', 'EURUSD-OTC', 'EURUSD', 'GBPUSD-OTC', 'USDCAD', 'AUDJPY', 'EURCHF', 'USDCHF', 'EURGBP-OTC', 'GBPCHF', 'EURAUD', 'GBPJPY', 'EURGBP', 'GBPAUD', 'USDJPY', 'AUDCAD', 'AUDUSD', 'GBPCAD', 'CHFJPY', 'EURJPY', 'NZDUSD', 'EURCAD', 'GBPUSD', 'NZDUSD-OTC', 'AUDCAD-OTC', 'USDCHF-OTC', 'CADCHF', 'EURNZD', 'EURJPY-OTC']
        
        let listaProcessada = [] as any;
        
        const separators = [",", ".", "|", ";"]
        
        let separator = "";
        
        let lista = textareaText;
        lista = lista.replace("/", "").trim()
        
        lista = lista.replace(/\//g, '');
        lista = lista.replace(/ /g, '');
        lista = lista.replace(/\r/g, '');
        
        separators.map(s => {
            if(lista.indexOf(s) > -1) {
                separator = s;
            }
        })
        
        let novaLista = lista.split("\n")
        
        novaLista.map(linha => {
            let linhaArray = linha.split(separator);
            let novoSinal = {
                status: "active",
                ativo: "",
                hora: "",
                operacao: "",
                resultado: ""
            }
            
            linhaArray.map(palavra => {
                if(listaAtivos.includes(palavra.toUpperCase())) {
                    novoSinal.ativo = palavra
                }
                
                if(palavra.indexOf(":") > -1) {
                    let horario = palavra.split(":")
                    novoSinal.hora = horario[0] + ":" + horario[1]
                }
                
                if(palavra.toUpperCase() == "CALL" || palavra.toUpperCase() == "PUT") {
                    novoSinal.operacao = palavra.toLowerCase()
                }
                
            })
            
            listaProcessada.push(novoSinal)
        })
        
        insertSignals(listaProcessada, "user");
        
        setAddedSignals(listaProcessada)
        fecharAddLista()
        //console.log(listaProcessada)
    }
    
    const confirmAddition = () => {
        presentAlert({
            cssClass: 'addConfirm',
            header: 'Atenção!',
            message: 'Adicionar uma nova lista de sinais apagará a lista anterior.',
            buttons: [
              'Cancelar',
              { text: 'Continuar', handler: (d) => confirmOpenAddList() },
            ],
            //onDidDismiss: (e) => console.log('did dismiss'),
        })
    }
    
    const getSignals = () => {
        let dbSignals = [] as any;
        const userId = JSON.parse(localStorage.getItem("user"))["id"];
        axios.post(`${serverInfo.ApiAddress}/glimpse/getSignals`, { user: userId, userKey: "ASD123" })
        .then((res) => {
            //console.log(res.data.user)
            if (res.data.length == 1) {
                dbSignals = res.data[0]
                if (dbSignals.signals.length > 0){
                    setAddedSignals(dbSignals.signals)
                }
            }
        });
    }
    
    useEffect(() => {
        
        getSignals();
        
        // setMoney(props.config.money)
        // setUseGale(props.config.gale)
        // setGaleCount(props.config.galeCount)
        // setGaleType(props.config.galeType)
        // setSobra(props.config.sobra)
    }, [])
    
    
    return (
        <>
            <div className="sinais">
                
                <div className="sinais-content">
                    
                    <div className="sinais-controls">
                        
                        <p></p>
                        
                        <motion.div whileTap={{ scale:0.95 }} className="sinal-control shadowComponent options" onClick={(e) =>present({event: e.nativeEvent,})}><IoSettingsSharp/></motion.div>
                    </div>
                    
                    <div className={settingsOpened ? "sinais-list contracted" : "sinais-list"}>
                        
                        {
                            addedSignals.length > 0 ? 
                            addedSignals.map((signal:any, index:number) => {
                                
                                let d = moment();
                                const dateTimeNow = parseInt(d.format('HHmm'));
                                const dateTimeToCompare = parseInt(signal.hora.replace(":", ""));
                                let outDated = "";
                                if(dateTimeNow > dateTimeToCompare) outDated = "outdated";
                                let canceled = "";
                                if(signal.status == "canceled") {
                                    canceled = "canceled"
                                }
                                
                                return (
                                    <div key={index} className={"sinal shadowComponent " + outDated + " " + canceled}>
                                        <div className="sinal-time">{signal.hora}</div>
                                        <div className="sinal-active">{signal.ativo}</div>
                                        <div className="sinal-operation">{signal.operacao}</div>
                                        <div className={"sinal-result "+signal.resultado}>{signal.resultado}</div>
                                        <div className="sinal-cancel" onClick={(e) => {cancelSignal(e.target, signal.hora)}}><IoTrashOutline className="cancel"/><IoRefreshOutline className="reactivate"/></div>
                                    </div>
                                )
                                
                            })
                            : <span className="emptyList">Your signal list is empty.</span>
                        }
                        
                    </div>
                    
                </div>
                
                <div className="add-list">
                    
                    <div className="add-controls">
                        <motion.div whileTap={{ scale:0.95 }} onClick={() => { clearTextarea() }} className="add-control-clear shadowComponent"><AiOutlineClear/> <span>Clear</span></motion.div>
                        <motion.div whileTap={{ scale:0.95 }} onClick={() => { pasteFromClipboard() }} className="add-control-paste shadowComponent"><ImPaste/> <span>Paste</span></motion.div>
                    </div>
                    
                    <textarea disabled={verificando} className="add-sinais-list" value={textareaText} onChange={(e) => { setTextareaText(e.target.value) }} placeholder="Type or paste your signal list" spellCheck={false}></textarea>
                    
                    <div className="add-buttons">
                        
                        <motion.div whileTap={{ scale:0.95 }} onClick={() => { fecharAddLista() }} className="add-cancel shadowComponent">Cancel</motion.div>
                        <motion.div whileTap={{ scale:0.95 }} onClick={() => { checarLista() }} className="add-check shadowComponent add-check">
                            {
                                verificando ? <IonSpinner color="secondary" name="crescent" /> : "Verify"
                            }
                        </motion.div>
                        
                    </div>
                    
                </div>
                
            </div>
            
        </>
    )
}

export default Sinais;