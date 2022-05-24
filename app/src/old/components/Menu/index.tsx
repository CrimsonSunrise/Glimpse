import {
	IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
} from "@ionic/react";

import { Link, useLocation } from "react-router-dom";
import {
    archiveOutline,
    archiveSharp,
    bookmarkOutline,
    heartOutline,
    heartSharp,
    mailOutline,
    mailSharp,
    paperPlaneOutline,
    paperPlaneSharp,
    trashOutline,
    trashSharp,
    warningOutline,
    warningSharp,
} from "ionicons/icons";
import "./Menu.css";
import internal from "stream";
import { Route, Router } from "workbox-routing";
import { useEffect, useState } from "react";
import axios from "axios";
import serverInfo from "../../../connection";

interface AppPage {
    url: string;
    title: string;
	buttonLong: number;
}

const appPages: AppPage[] = [
    {
        title: "Glimpse",
        url: "/page/Glimpse",
		buttonLong: 145
    },
    {
        title: "Rank",
        url: "/page/Rank",
		buttonLong: 210
    },
    {
        title: "Assinatura",
        url: "/page/Assinatura",
		buttonLong: 170
    },
    {
        title: "Configurações",
        url: "/page/Configuracões",
		buttonLong: 210
    }
];

const Menu: React.FC = () => {
    const location = useLocation();
	
	const toggleSelected = (e:any) => {
		const buttons = document.querySelectorAll('.menuButton');
		buttons.forEach(button => {
			button.className = 'menuButton';
		})
		e.className = 'menuButton selected';
	}
	
	const handleLogout = () => {
        localStorage.removeItem("user");
		window.location.reload();
    };
	
	const [user, setUser]:any = useState({})
	
	useEffect(() => {
		
		loadUserData()
		
	}, []);
	
	const [payoutType, setPayoutType] = useState("");
	const [userName, setUserName] = useState("")
	
	const loadUserData = () => {
		let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
		axios.post(`${serverInfo.ApiAddress}/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
		.then((res) => {
			
			setUser(res.data)
			let name = res.data["name"]
			if (name.indexOf(" ") > -1) {
				const names = name.split(" ")
				let otherName = names[0] + " " + names[names.length-1]
				setUserName(otherName)
			} else {
				setUserName(name)
			}
		});
	}

    return (
		<IonMenu className="sideMenu" contentId="main" type="overlay">
			
			<div className="sideMenuSideTile"></div>
			
            <IonContent>
				
					<div className="menuHeader">
						
						<div className="headerGreetings">
							<div className="ola">Olá,</div>
							<div className="userName">{ userName }</div>
						</div>
						
						<div className="headerImage">
							
							<div className="userImage">
								
								<img alt="" src={user["image"]}></img>
								
							</div>
							
						</div>
						
					</div>
					
					<div  className="menuButtons">
						
						{appPages.map((appPage, index) => {
							return (
								// <div className="menuButton">{appPage.title}</div>
								<IonMenuToggle key={index}>
									
									<Link to={appPage.url} className={ index == 0 ? "menuButton selected" : "menuButton"} onClick={(e) => { toggleSelected(e.target) }}>
										<div style={{ width: appPage.buttonLong }} className="menuButtonBg">
											<div className="menuButtonTop"></div>
											<div className="menuButtonTopCover"></div>
											<div className="menuButtonBottom"></div>
											<div className="menuButtonBottomCover"></div>
										</div>
										<div className="menuButtonLabel">{appPage.title}</div>
									</Link>
								</IonMenuToggle>
								
								
								
								// <IonMenuToggle key={index} autoHide={false}>
								//     <IonItem
								//         className={
								//             location.pathname === appPage.url
								//                 ? "selected"
								//                 : ""
								//         }
								//         routerLink={appPage.url}
								//         routerDirection="none"
								//         lines="none"
								//         detail={false}
								//     >
								//         <IonIcon
								//             slot="start"
								//             ios={appPage.iosIcon}
								//             md={appPage.mdIcon}
								//         />
								//         <IonLabel>{appPage.title}</IonLabel>
								//     </IonItem>
								// </IonMenuToggle>
							);
						})}
						
						
					</div>
				
					<div className="logout" onClick={ handleLogout }>Sair</div>
						
            </IonContent>
        </IonMenu>
    );
};

export default Menu;
