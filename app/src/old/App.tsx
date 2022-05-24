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
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import Menu from "./components/Menu/";
import Page from "./pages/Page";
import { motion } from "framer-motion";
import Logo from "./Assets/Glimpse_Logo2_thicc.png";
import "./pages/Login/Login.css";
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
import { editDb } from "./Functions";
import axios from "axios";
import { Http, HttpResponse } from '@capacitor-community/http';
import Glimpse from "./pages/Glimpse";
import Login from "./pages/Login";
import serverInfo from "../connection";

const App: React.FC = () => {
    const [logged, setLogged] = useState(false);
    const history = useHistory();

    const emailInput = useRef();
    const passwordInput = useRef();
    const registerEmailInput = useRef();
    const registerNameInput = useRef();
    const registerPasswordInput = useRef();
    const codeInput = useRef();
    const [present, dismiss] = useIonToast();

    const enterKey = (e: any) => {
        if (e.keyCode == 13) {
            tryLogin("", null);
        }
    };

    const [input, setInput] = useState({
        name: "",
    });

    const handleLogin = () => {
        localStorage.setItem("user", JSON.stringify(input));
    };
    
    const handleLogout = () => {
        localStorage.removeItem("user");
    };
    
    useEffect(() => {
        
        localStorage.removeItem("user");
        
        let user = localStorage.getItem("user")
        if(user != null && user != 'null') {
            //console.log("tem local")
            tryLogin("", user)
        } else {
            //console.log("não tem local")
            setLoading(false);
        }
        
    }, [])
    
    

    let afterEmail = ""
    let afterPassword = ""
    
    const tryLogin = (type:string, u:any) => {
        
        let email = "";

        let password = "";
        
        let getLocation = false;
        
        if(u != null && type != "afterRegistration") {
            // Auto Connect
            getLocation = false;
            email = JSON.parse(u)["email"]
            password = JSON.parse(u)["password"]
        }
        
        if (u == null && type != "afterRegistration") {
            // Login button
            getLocation = true;
            email = (emailInput.current as HTMLInputElement).value;
            password = (passwordInput.current as HTMLInputElement).value;
        }
        
        if(type == "afterRegistration") {
            getLocation = true;
            email = afterEmail;
            password = afterPassword;
        }

        if (email === "" || password === "") return;
        console.log(email, password)
        
        Axios.post(`${serverInfo.ApiAddress}/glimpse/login`, {
            email: email,
            password: password,
        })
        .then(function (response) {
            
            //console.log(response.data)
            
            if (response.data["res"] == -1) {
                
                setLoading(false);
                present('Dados incorretos.', 3000)
                console.log("Não encontrado")
                
            } else if (response.data["res"] == 1) {
                
                console.log("Entrou")
                
                Axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: email, userKey: "ASD123" })
                .then((res) => {
                    const userId = res.data["_id"]["$oid"]
                    const user = {
                        "id": userId,
                        "email": email,
                        "password": password
                    }
                    
                    localStorage.setItem("user", JSON.stringify(user));
                    
                    if(getLocation) {
                
                        Axios.get(`https://json.geoiplookup.io/`, {})
                        .then((res) => {
                            
                            const loginData = {
                                time: new Date().toLocaleString(),
                                ip: res.data.ip,
                                location: res.data.city + ", " + res.data.region + ", " + res.data.country_name
                            }
                            
                            editDb(["lastLogin"], [loginData], "")
                            
                        })
                    }
                    
                    setLogged(true);
                    setLoading(false);
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    const UserLoggedIn = () => {
        return (
            <>
                <IonReactRouter>
                    <IonSplitPane contentId="main">
                        <Menu />
                        
                        <IonRouterOutlet id="main">
                            <Route path="/" exact={true}>
                                <Redirect to="/page/Glimpse" />
                            </Route>

                            <Route path="/page/:name" exact={true}>
                                <Page />
                            </Route>
                        </IonRouterOutlet>
                        
                    </IonSplitPane>
                </IonReactRouter>
            </>
        );
    };
    
    const [registering, setRegistering] = useState(false);
    const [coding, setCoding] = useState(false);
    const [checkingCode, setCheckingCode] = useState(false);
    const [validCode, setValidCode] = useState("")
    
    const backFromCode = () => {
        if(checkingCode) return;
        setCoding(false)
    }
    
    const tryCode = () => {
        
        
        if(checkingCode) return;
        
        const code = (codeInput.current as HTMLInputElement).value;
        
        if(code.length == 0) return;
        
        setCheckingCode(true)
        
        //checkCode(code)
        
        
        // or...
        // const response = await Http.request({ ...options, method: 'POST' })
        
        
        //return
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/checkCode`, { userKey: "ASD123", code: code })
        .then((res) => {
            
            if(res.data) {
                setCheckingCode(false)
                if(res.data.res == true) {
                    setValidCode(code)
                    setCoding(false);
                    setRegistering(true);
                } else {
                    present('Código expirado ou inexistente', 3000)
                }
            }
        }).catch(err => {
            present('Ocorreu um erro.', 3000)
        })
        
    }
    
    const registerUser = () => {
        
        setLoading(true)
        
        const userName = (registerNameInput.current as HTMLInputElement).value;
        const userMail = (registerEmailInput.current as HTMLInputElement).value;
        const userPassword = (registerPasswordInput.current as HTMLInputElement).value;
        
        if( userMail.length == 0 || userPassword.length == 0) return;
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userKey: "ASD123", userMail: userMail})
        .then((res) => {
            
            if (res.data.err == "nothing found") {
                
                axios.post(`${serverInfo.ApiAddress}/glimpse/insertUser`, { userKey: "ASD123", userName: userName, userMail: userMail, userPassword: userPassword})
                .then((regRes) => {
                    
                    if(regRes.data.message == "User created!") {
                        
                        afterEmail = userMail;
                        afterPassword = userPassword;
                        
                        tryLogin("afterRegistration", null)
                        
                    }
                    
                })
                
            } else {
                setLoading(false)
                present('Endereço de email em uso.', 3000)
            }
            
        })
        
    }

    const LoginPage = () => {
        return (
            <>
                <div className="login">
                    <div className="hero">
                        <div className="alpha shadowComponent">beta</div>
                        <img src={Logo} alt=""></img>
                        <span>Glimpse</span>
                    </div>

                    <div style={{ display: !registering && !coding ? "flex" : "none" }} className="loginContent">
                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Email</IonLabel>
                            <IonInput
                                ref={emailInput}
                                className="glimpseInput"
                                type="email"
                                autocomplete="off"
                                autocorrect="off"
                            ></IonInput>
                        </IonItem>

                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Senha</IonLabel>
                            <IonInput
                                ref={passwordInput}
                                className="glimpseInput"
                                type="password"
                                autocomplete="off"
                                autocorrect="off"
                                onKeyUp={(e) => {
                                    enterKey(e);
                                }}
                            ></IonInput>
                        </IonItem>

                        <div className="loginControls">
                            
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setCoding(true) }}
                                className="codeButton">Possui um código?</motion.div>
                            
                            <motion.div
                                onClick={() => {tryLogin("", null)}}
                                whileTap={{ scale: 0.95 }}
                                className="loginButton shadowComponent"
                            >
                                Entrar
                            </motion.div>
                        </div>
                    </div>
                    
                    <div style={{ display: coding ? "flex" : "none" }} className="codeContent" >
                        
                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Código</IonLabel>
                            <IonInput
                                disabled={ checkingCode ? true : false }
                                ref={codeInput}
                                className="glimpseInput"
                                type="text"
                                autocomplete="off"
                                autocorrect="off"
                            ></IonInput>
                        </IonItem>
                        
                        <div className="loginControls">
                            
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { backFromCode() }}
                                className="codeButton">Voltar</motion.div>
                            
                            <motion.div
                                onClick={() => { tryCode() }}
                                whileTap={{ scale: 0.95 }}
                                className="loginButton shadowComponent">
                                    {
                                        checkingCode ? <IonSpinner name="circular" /> : "Validar"
                                    }
                                </motion.div>
                                
                        </div>
                        
                    </div>
                    
                    <div style={{ display: registering ? "flex" : "none" }} className="registerContent">
                        
                        {/* <h2>Complete o seu registro</h2> */}
                        
                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Nome e sobrenome</IonLabel>
                            <IonInput
                                ref={registerNameInput}
                                className="glimpseInput"
                                type="text"
                                autocomplete="off"
                                autocorrect="off"
                            ></IonInput>
                        </IonItem>
                        
                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Email</IonLabel>
                            <IonInput
                                ref={registerEmailInput}
                                className="glimpseInput"
                                type="email"
                                autocomplete="off"
                                autocorrect="off"
                            ></IonInput>
                        </IonItem>
                        
                        <IonItem className="glimpseItem">
                            <IonLabel position="floating">Senha</IonLabel>
                            <IonInput
                                ref={registerPasswordInput}
                                className="glimpseInput"
                                type="password"
                                autocomplete="off"
                                autocorrect="off"
                            ></IonInput>
                        </IonItem>
                        
                        <div className="loginControls">
                            
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setCoding(false); setRegistering(false) }}
                                className="codeButton">Cancelar</motion.div>
                            
                            <motion.div
                                onClick={() => { registerUser() }}
                                whileTap={{ scale: 0.95 }}
                                className="loginButton shadowComponent"
                            >
                                Registrar
                            </motion.div>
                        </div>
                        
                    </div>
                    
                </div>
            </>
        );
    };
    
    const [loading, setLoading] = useState(true);
    
    const StartPages = () => {
        return (
            //logged ? <Page/> : <LoginPage />
            logged ? <div>Aqui</div> : <LoginPage />
            // logged ? <UserLoggedIn /> : <LoginPage />
        )
    }
    
    return (
        <IonApp className="App">
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/home" component={Page} />
                    <Route path="/login" component={Login} />
                    <Redirect exact from="/" to="/login" />
                </IonRouterOutlet>
            </IonReactRouter>
            
            {/* { loading ?  <div className="loader"><IonSpinner name="circular" /></div> : <StartPages/> } */}
            
            {/* { logged ? <UserLoggedIn /> : <LoginPage />} */}

            {/* <IonReactRouter>
                <IonSplitPane contentId="main">
                    <Menu />
                    <IonRouterOutlet id="main">
                        
                        <Route path="/" exact={true}>
                            <Redirect to="/page/Glimpse" />
                        </Route>
                        
                        <Route path="/page/:name" exact={true}>
                            <Page />
                        </Route>
                        
                        <Route path="/login" exact={true}>
                            <Login />
                        </Route>
                        
                    </IonRouterOutlet>
                </IonSplitPane>
            </IonReactRouter> */}
        </IonApp>
    );
};

export default App;
