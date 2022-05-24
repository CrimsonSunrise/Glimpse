import { RefresherEventDetail } from '@ionic/core';
import { IonRefresher, IonRefresherContent, IonSkeletonText } from '@ionic/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import serverInfo from '../../../connection';
import './Rank.css';

const Rank = (props: any) => {
    
    const [rankItems, setRankItems] = useState([]);
    const [names, setNames] = useState<any>([]);
    const [surnames, setSurnames] = useState<any>([]);
    
    useEffect(() => {
        loadNames();
        loadRank();
    }, [])
    
    const loadNames = () => {
        axios.post(`${serverInfo.ApiAddress}/glimpse/getRandomNames`, { userKey: "ASD123" }).then((res) => {
			
            setNames(res.data[0].value.name);
            setSurnames(res.data[0].value.sourname);
            
        })
    }
    
    const loadRank = () => {
        axios.post(`${serverInfo.ApiAddress}/glimpse/getRank`, { userKey: "ASD123" }).then((res) => {
			
            setRankItems(res.data)
            
        })
    }
    
    function doRefresh(event: CustomEvent<RefresherEventDetail>) {
        loadRank()
        
        setTimeout(() => {
            event.detail.complete();
        }, 300);
    }
    
    return (
        <div className="rank">
            
            <h5>Rank</h5>
            
            <div className="rank-header">
                <div className="rank-header-position">#</div>
                <div className="rank-header-name">Nome</div>
                <div className="rank-header-profit">$</div>
            </div>
            
            <div className="rank-items">
                
                <IonRefresher slot="fixed" onIonRefresh={doRefresh} pullFactor={0.2} pullMin={10} pullMax={50}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                
                {
                    rankItems.length > 0 ?
                    
                    rankItems.map((rank:any, index) => {
                        
                        let nome = rank.name;
                        let activeClass = "";
                        if (nome != props.userName) {
                            let ra = Math.random()*names.length-1
                            if(ra < 0) ra = 0; 
                            let rb = Math.random()*surnames.length-1
                            if(rb < 0) rb = 0; 
                            nome = names[ra.toFixed(0)] + " " + surnames[rb.toFixed(0)]
                        } else {
                            activeClass = "active"
                        }
                        
                        return (
                            <div key={index} className={"rank-item shadowComponent " + activeClass}>
                                <div className="rank-position">{index+1}</div>
                                <div className="rank-name">{nome}</div>
                                <div className="rank-profit">{(rank.profit).toFixed(2)}</div>
                                {/* <div className="rank-profit">{(rank.profit - rank.loss).toFixed(2)} - ({rank.profit.toFixed(2)}, {rank.loss.toFixed(2)})</div> */}
                            </div>
                        )
                        
                    })
                    
                    :
                    
                    <IonSkeletonText animated style={{ width: '100px' }} />
                }
                
                {/* <div className="rank-item shadowComponent">
                    <div className="rank-position">1</div>
                    <div className="rank-name">asd</div>
                    <div className="rank-profit">123465</div>
                </div> */}
                
            </div>
            
        </div>
    )
}

export default Rank;