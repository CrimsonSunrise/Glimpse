import { IonContent, IonPage } from '@ionic/react';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import { IoMdClose, IoMdMenu, IoMdLogOut } from 'react-icons/io';
import Glimpse from '../Glimpse';
import Rank from '../../old/pages/Rank';
import './style.css'
import Operacoes from '../operations';
import Maintenance from '../maintenance';
import Settings from '../settings';
import axios from 'axios';
import serverInfo from '../../connection';
import { editDb } from "../../old/Functions";

const Home = (props:any) => {
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState(<Glimpse/>);
    const [maintenance, setMaintenance] = useState(false);
    const [allowButton, setAllowButton] = useState(false);
    const [userName, setUserName] = useState("");
    const [Terms, setTerms] = useState<any>("");
    
    useEffect(() => {
        let userMail = JSON.parse(localStorage.getItem("user"))["email"];
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123"}, {timeout: 5000})
		.then((res) => {
            
            setUserName(res.data.name)
            if(res.data.readTerms == false) {
                document.querySelector(".terms").className = "terms active"
            }
            
        });
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getTerms`, { userKey: "ASD123" })
		.then((res) => {
			setTerms(res.data[0].value);
            document.querySelector(".terms-content").innerHTML = res.data[0].value
		});
        
    }, [])
    
    const logout = () => {
        
        localStorage.removeItem("user")
        window.location.href = '/'
        
    }
    
    const changePage = (page:any, menuIndex:any) => {
        
        const menuButtons = document.getElementsByClassName("menu-item");
        for (let i = 0; i < menuButtons.length; i++) {
            menuButtons[i].className = 'menu-item';
        }
        
        menuIndex.className = 'menu-item active';
        
        setSelectedPage(page);
        
        setMenuOpen(!menuOpen);
    } 
    
    const acceptTerms = () => {
        
        editDb(["readTerms"], [true], "")
        document.querySelector(".terms").className = "terms"
    }
    
    const getScrollPos = (e:any) => {
        if ((e.target.scrollHeight - 100) <= e.target.scrollTop + e.target.offsetHeight) {
            setAllowButton(true)
        } else {
            setAllowButton(false)
        }
    }
    
    return (
        <>
            <IonPage>
            
                <IonContent fullscreen>
                    
                    <div className="pageContent">
                         
                        {
                            maintenance ? 
                            <Maintenance/> : selectedPage
                        }
                        
                    </div>
                    
                </IonContent>
                
                <motion.div whileTap={{ scale: 0.95 }} onClick={() => { setMenuOpen(!menuOpen) }} className={ menuOpen ? "menuButton " + maintenance : "menuButton shadowComponent " + maintenance }>
                    
                    {
                        menuOpen ? <IoMdClose/> : <IoMdMenu/>
                    }
                    
                </motion.div>
                
                <div className={ menuOpen ? "backMask active" : "backMask" } onClick={() => { setMenuOpen(false) }} ></div>
                
                <div className={ menuOpen ? "menu active" : "menu" }>
                    
                    <motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { changePage(<Glimpse/>, e.target) }} className="menu-item active">Glimpse</motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { changePage(<Operacoes/>, e.target) }} className="menu-item">Operations</motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { changePage(<Rank userName={userName}/>, e.target) }} className="menu-item">Rank</motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => {  }} className="menu-item">Shop</motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} onClick={(e) => { changePage(<Settings terms={Terms}/>, e.target) }} className="menu-item">Settings</motion.div>
                    
                    <div className="version">
                        <span>version</span>
                        <div>1.0b</div>
                    </div>
                    <motion.div onClick={() => { logout() }} whileTap={{ scale: 0.95 }} className="logout-buttom"><IoMdLogOut/> Logout</motion.div>
                    
                </div>
                
                <div className="terms">
                    
                    <h1>Leia com atenção</h1>
                    
                    <div className="terms-content" onScroll={(e) => { getScrollPos(e) }}>
                        
                        
                        
                    </div>
                    
                    <div className="terms-accept">
                        
                        <motion.button disabled={!allowButton} whileTap={{ scale: 0.95 }} onClick={() => { logout() }} className="term-button deny-term shadowComponent">Não aceito</motion.button>
                        <motion.button disabled={!allowButton} whileTap={{ scale: 0.95 }} onClick={() => { acceptTerms() }} className="term-button accept-term shadowComponent">Estou de acordo</motion.button>
                    
                    </div>
                    
                </div>
                
            </IonPage>
        </>
    )
    
}

export default Home;