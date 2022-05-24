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
import React, { useEffect } from "react";
import BackPageModel from './BackPageModel';
import Corretora from './Corretora';
import Ativos from './Ativos';
import Estrategias from './Estratégias/';
import Payout from './Payout';
import { chevronBack } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import Rank from "./Rank";

const Page: React.FC = () => {
    
    let history = useHistory();
    const location = useLocation();
    let { name } = useParams<{ name: string }>();
    
    const BackButton = () => {
        return (
            <IonButtons style={{ cursor: "pointer" }} slot="start" onClick={() => {history.goBack()}}>
                <IonIcon icon={chevronBack}></IonIcon>
            </IonButtons>
        )
    }
    
    const backPages = ["Ativos", "Corretora", "Estratégias", "Payout"]
    
    return (
        <IonPage>
            
            <div className="pageHead">
                
                <IonButtons slot="start" className="sideMenuButton">
                    { backPages.indexOf(name) > -1 ? <BackButton/> : <IonMenuButton/>}
                </IonButtons>
                
                <IonTitle className="pageTitle">{name}</IonTitle>
                
            </div>

            <IonContent fullscreen>
                
                <div className="pageContent">
                    
                    { location.pathname === '/page/Glimpse' ? <Glimpse/> : ''}
                    { location.pathname === '/page/Assinatura' ? <Assinatura/> : ''}
                    { location.pathname === '/page/Configuracões' ? <Configuracoes/> : ''}
                    { location.pathname === '/page/Rank' ? <Rank/> : ''}
                    
                    { location.pathname === '/page/Corretora' ? <Corretora/> : ''}
                    { location.pathname === '/page/Ativos' ? <Ativos/> : ''}
                    { location.pathname === '/page/Estratégias' ? <Estrategias/> : ''}
                    { location.pathname === '/page/Payout' ? <Payout userPayout={75}/> : ''}
                    
                </div>
                
            </IonContent>
        </IonPage>
    );
};

export default Page;