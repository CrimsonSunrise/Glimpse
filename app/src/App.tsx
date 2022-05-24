import {
    IonApp,
    IonInput,
    IonItem,
    IonLabel,
    IonRouterOutlet,
    IonSpinner,
    IonSplitPane,
    useIonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "./Assets/Glimpse_Logo2_thicc.png";
import Axios from "axios";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { Router } from "workbox-routing";
import { useEffect, useRef, useState } from "react";
import { canConstructResponseFromBodyStream } from "workbox-core/_private";
import axios from "axios";
import { Http, HttpResponse } from '@capacitor-community/http';
import Home from "./pages/home";
import Login from "./pages/Login";
import { ScreenOrientation } from '@ionic-native/screen-orientation';

const App: React.FC = () => {
    
    //ScreenOrientation.lock("portrait")
    
    return (
        <IonApp className="App">
            
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/home" component={Home} exact={true} />
                    <Route path="/login" component={Login} exact={true} />
                    <Route exact path="/" render={() => <Redirect to="/login" />} />
                </IonRouterOutlet>
            </IonReactRouter>
            
        </IonApp>
    );
};

export default App;
