import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonIcon,
} from "@ionic/react";
import { useLocation, useParams } from "react-router";
import ExploreContainer from "../components/ExploreContainer";
import "./Page.css";
import Glimpse from "./Glimpse/";
import Assinatura from "./Assinatura/";
import Configuracoes from "./Configuracoes/";
import React, { useEffect, useState } from "react";
import BackPageModel from './BackPageModel';
import Corretora from './Corretora';
import Ativos from './Ativos';
import Estrategias from './Estratégias/';
import Payout from './Payout';
import { chevronBack } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import Rank from "./Rank";
import { motion } from "framer-motion";
import { IoMdClose, IoMdMenu } from 'react-icons/io'

const Page: React.FC = () => {
    
    let history = useHistory();
    //const location = useLocation();
    //let { name } = useParams<{ name: string }>();
    
    const backPages = ["Ativos", "Corretora", "Estratégias", "Payout"]
    
    const [menuOpen, setMenuOpen] = useState(false);
    
    
    
    return (
        
        <>
            Algo aqui
        </>
        // <IonPage>
            
        //     <IonContent fullscreen>
                
        //         <div className="pageContent">
                    
        //             Aqui terá algo.
                    
        //         </div>
                
        //     </IonContent>
            
        //     <motion.div whileTap={{ scale: 0.95 }} onClick={() => { setMenuOpen(!menuOpen) }} className={ menuOpen ? "menuButton" : "menuButton shadowComponent" }>
                
        //         {
        //             menuOpen ? <IoMdClose/> : <IoMdMenu/>
        //         }
                
        //     </motion.div>
            
        //     <div className={ menuOpen ? "backMask active" : "backMask" } onClick={() => { setMenuOpen(false) }} ></div>
            
        //     <div className={ menuOpen ? "menu active" : "menu" }>
                
        //         <motion.div whileTap={{ scale: 0.95 }} onClick={() => {  }} className="menu-item active">Glimpse</motion.div>
        //         <motion.div whileTap={{ scale: 0.95 }} className="menu-item">Rank</motion.div>
        //         <motion.div whileTap={{ scale: 0.95 }} className="menu-item">Assinatura</motion.div>
        //         <motion.div whileTap={{ scale: 0.95 }} className="menu-item">Configurações</motion.div>
                
        //     </div>
            
        // </IonPage>
    );
};

export default Page;