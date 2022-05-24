import React, { useEffect, useState } from "react";
import "./glimpsecontrol.css";
import { motion } from 'framer-motion';
import { IonSpinner } from "@ionic/react";
import { editDb } from "../../Functions";

const GlimpseControl = (props: any) => {
    
    const [glimpseStatus, setGlimpseStatus] = useState("");
    const [glimpseAction, setGlimpseAction] = useState("");
    
    const [waitingAction, setWaitingAction] = useState(false);
    
    useEffect(() => {
        
        setGlimpseStatus(props.status)
        
        if(props.status == "-") {
            setGlimpseStatus("-")
            setGlimpseAction("-")
        }
        
        if(props.status == "off") {
            setGlimpseStatus("Parado")
            setWaitingAction(false);
            setGlimpseAction("Iniciar")
        }
        
        if(props.status == "assigning") {
            setGlimpseStatus("Iniciando")
            setWaitingAction(true);
            setGlimpseAction("")
        }
        
        if(props.status == "waiting") {
            setGlimpseStatus("Aguardando")
            setWaitingAction(true);
            setGlimpseAction("")
        }
        
        if(props.status == "stopping") {
            setGlimpseStatus("Parando...")
            setWaitingAction(true);
            setGlimpseAction("")
        }
        
        if(props.status == "operating") {
            setGlimpseStatus("+ " + props.profit.toFixed(2))
            setWaitingAction(false);
            setGlimpseAction("Parar")
        }
        
    })
    
    const actionButton = (action: string) => {
        
        if(action == "Iniciar") {
            setWaitingAction(true);
            setGlimpseStatus("Aguardando")
            editDb(["glimpseStatus"], ["waiting"], "")
        }
        
        if(action == "Parar") {
            setWaitingAction(false);
            setGlimpseStatus("Parando...")
            editDb(["glimpseStatus"], ["stopping"], "")
        }
        
    }
    
    return (
        <div className="glimpseControl shadowComponent">
            
            <div className="status">{ glimpseStatus }</div>
            
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => { actionButton(glimpseAction) }} className="glimpseButton shadowComponent">
                {
                    waitingAction ? <IonSpinner name="circular" color="primary" /> : glimpseAction
                }
            </motion.div>
            
        </div>
    );
}

export default GlimpseControl;