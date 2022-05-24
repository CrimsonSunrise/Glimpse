import { IonInput, IonItem, IonLabel, IonRouterOutlet, IonSpinner, useIonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react'
import { Link, Redirect, Route } from 'react-router-dom';
import serverInfo from '../../connection';
import Home from '../home';
import Logo from "../../Assets/Glimpse_Logo2_thicc.png";
import './style.css';
import { editDb } from '../../old/Functions';

const Login = (props:any) => {
    
    const [registering, setRegistering] = useState(false);
    const [coding, setCoding] = useState(false);
    const [checkingCode, setCheckingCode] = useState(false);
    const [validCode, setValidCode] = useState("")
    const [logged, setLogged] = useState(false);
    const [loading, setLoading] = useState(true);
    const emailInput = useRef();
    const passwordInput = useRef();
    const registerEmailInput = useRef();
    const registerNameInput = useRef();
    const registerPasswordInput = useRef();
    const codeInput = useRef();
    const [present, dismiss] = useIonToast();
    
    let afterEmail = ""
    let afterPassword = ""
    
    useEffect(() => {
        
        //localStorage.removeItem("user");
        
        let user = localStorage.getItem("user")
        if(user != null && user != 'null') {
            //console.log("tem local")
            tryLogin("", user)
        } else {
            //console.log("não tem local")
            //window.location.href = '/login';
            setLoading(false);
        }
        
    }, [])
    
    const backFromCode = () => {
        if(checkingCode) return;
        setCoding(false)
    }
    
    const enterKey = (e: any) => {
        if (e.keyCode == 13) {
            tryLogin("", null);
        }
    };
    
    const tryLogin = async (type:string, u:any) => {
        
        setLoading(true);
        
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

        if (email === "" || password === "") {
            setLoading(false)
            return
        }
        //console.log(email, password)
        
        console.log(getLocation)
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/login`, {
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
                
                axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: email, userKey: "ASD123" })
                .then((res) => {
                    const userId = res.data["_id"]["$oid"]
                    const user = {
                        "id": userId,
                        "email": email,
                        "password": password
                    }
                    
                    localStorage.setItem("user", JSON.stringify(user));
                    
                    if(getLocation) {
                        
                        console.log("buscando")
                        
                        //axios.get(`https://json.geoiplookup.io`, {})
                        axios.get(`https://ipwhois.app/json/`, {})
                        .then((res) => {
                            
                            console.log("busquei")
                            
                            const loginData = {
                                time: new Date().toLocaleString(),
                                ip: res.data.ip,
                                location: res.data.city + ", " + res.data.region + ", " + res.data.country
                            }
                            
                            console.log(loginData)
                            
                            editDb(["lastLogin"], [loginData], "login")
                            
                            
                            //console.log("salvou... Acho")
                        }).then(() => {
                            //window.location.href = '/home'
                        })
                        .catch(error => {
                            console.log(error.response)
                        });
                        
                        
                    } else {
                        setLogged(true);
                    
                        window.location.href = '/home'
                    }
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    };
    
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
                    
                    axios.post(`${serverInfo.ApiAddress}/glimpse/useCode`, {userKey: "ASD123", code: validCode, user: userMail})
                    .then((useCodeRes) => {
                        
                        if(regRes.data.message == "User created!") {
                        
                            afterEmail = userMail;
                            afterPassword = userPassword;
                            
                            tryLogin("afterRegistration", null)
                            
                        }
                        
                    })
                    
                })
                
            } else {
                setLoading(false)
                present('Endereço de email em uso.', 3000)
            }
            
        })
        
    }
    
    return (
        <>
            {
                loading ? <div className="loginLoading"><IonSpinner color='primary' name="crescent" /></div> : 
            
        
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
            
            }
        </>
    )
    
}

export default Login;