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

const Ajustes = (props: any) => {
    
    const [useGale, setUseGale] = useState(false);
    const [galeType, setGaleType] = useState("dobro");
    const [galeCount, setGaleCount] = useState(1);
    const [money, setMoney] = useState(2);
    const [sobra, setSobra] = useState(1);
    const [saving, setSaving] = useState(false);
    const [userName, setUserName] = useState("");
    const [useStopLoss, setUseStopLoss] = useState(false);
    const [stopLossValue, setStopLossValue] = useState(0.0);
    const [useStopWin, setUseStopWin] = useState(false);
    const [stopWinValue, setStopWinValue] = useState(0.0);
    
    useEffect(() => {
        
        setUserName(props.nome)
		setMoney(props.config.money)
        setUseGale(props.config.gale)
        setGaleCount(props.config.galeCount)
        setGaleType(props.config.galeType)
        setSobra(props.config.sobra)
        setUseStopLoss(props.config.stopLoss)
        setStopLossValue(props.config.stopLossValue)
        setUseStopWin(props.config.stopWin)
        setStopWinValue(props.config.stopWinValue)
        
    }, [])
    
    const saveConfigs = () => {
		
        if (saving) return;
        
        setSaving(true)
        
        const newConfigs = {
            money: money,
            gale: useGale,
            galeCount: galeCount,
            galeType: galeType,
            sobra: sobra,
            stopLoss: useStopLoss,
            stopLossValue: stopLossValue,
            stopWin: useStopWin,
            stopWinValue: stopWinValue
        }
        
        editDb(["strategySettings", "signalSettings"], [newConfigs, newConfigs], "")
        
        setTimeout(() => {
            
            setSaving(false);
            
        }, 1000)
        
    }
    
    return (
        <>
            <div className="ajustes">
                
                <div className="ajustes-content">
                    
                    <IonItem>
                        <IonLabel className="signals-settings-label">Order value - R$</IonLabel>
                        <IonInput className="signals-settings-number-input" min="2" max="9999" type="number" placeholder="Digite um valor" value={money >= 2 ? money : 2} onIonChange={e => setMoney(parseFloat(e.detail.value!) >= 2 ? parseFloat(e.detail.value!) : 2)}></IonInput>
                    </IonItem>
                    
                    <IonItem lines="full">
                        <IonLabel className="signals-settings-label">Martin Gale</IonLabel>
                        <IonCheckbox checked={useGale} onIonChange={e => setUseGale(e.detail.checked)} />
                    </IonItem>
                    
                    <IonItem className={ useGale ? "ionitem-active active" : "ionitem-active" } lines="full" disabled={!useGale}>
                        <IonLabel className="signals-settings-label">Martin Gale count</IonLabel>
                        <IonInput className="signals-settings-number-input" type="number" placeholder="Digite um valor" value={galeCount} onIonChange={e => setGaleCount(parseInt(e.detail.value!))}></IonInput>
                    </IonItem>
                    
                    <IonItem className={ useGale ? "ionitem-active active" : "ionitem-active" } disabled={!useGale}>
                        <IonLabel className="signals-settings-label">Martin Gale type</IonLabel>
                        <IonSelect
                            interface="popover"
                            placeholder="Selecione um"
                            onIonChange={e => setGaleType(e.detail.value)}
                            value={galeType}>
                            <IonSelectOption value="dobro">Double</IonSelectOption>
                            <IonSelectOption value="cobrir">Only cover</IonSelectOption>
                            <IonSelectOption value="sobra">Cover and profit</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    
                    <IonItem className={ useGale && galeType == "sobra" ? "ionitem-active active" : "ionitem-active" } lines="full" disabled={!useGale}>
                        <IonLabel className="signals-settings-label">profit value - R$</IonLabel>
                        <IonInput className="signals-settings-number-input" type="number" placeholder="Digite um valor" value={sobra} onIonChange={e => setSobra(parseFloat(e.detail.value!))}></IonInput>
                    </IonItem>
                    
                    <IonItem lines="full">
                        <IonLabel className="signals-settings-label">Stop Loss</IonLabel>
                        <IonCheckbox checked={useStopLoss} onIonChange={e => setUseStopLoss(e.detail.checked)} />
                    </IonItem>
                    
                    <IonItem className="ionitem-active active" lines="full" disabled={!useStopLoss} hidden={!useStopLoss}>
                        <IonLabel className="signals-settings-label">Stop Loss value</IonLabel>
                        <IonInput className="signals-settings-number-input" type="number" placeholder="Digite um valor" value={stopLossValue} onIonChange={e => setStopLossValue(parseFloat(e.detail.value!))}></IonInput>
                    </IonItem>
                    
                    <IonItem lines="full">
                        <IonLabel className="signals-settings-label">Stop Win</IonLabel>
                        <IonCheckbox checked={useStopWin} onIonChange={e => setUseStopWin(e.detail.checked)} />
                    </IonItem>
                    
                    <IonItem className="ionitem-active active" lines="full" disabled={!useStopWin} hidden={!useStopWin}>
                        <IonLabel className="signals-settings-label">Stop Win value</IonLabel>
                        <IonInput className="signals-settings-number-input" type="number" placeholder="Digite um valor" value={stopWinValue} onIonChange={e => setStopWinValue(parseFloat(e.detail.value!))}></IonInput>
                    </IonItem>
                        
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => { saveConfigs() }} className="settings-save shadowComponent">
                        {
                            saving ? <IonSpinner name="crescent" color="light"/> : "Salvar"
                        }
                    </motion.div>
                    
                </div>
                
            </div>
            
        </>
    )
}

export default Ajustes;