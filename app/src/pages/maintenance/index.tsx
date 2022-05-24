import { motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import './style.css'
import MaintenanceImage from "../../Assets/Maintenance.gif";

export default function Maintenance(props:{}) {
    
    return (
        <>
        
            <div className="maintenance">
                
                <div className="maintenance-header">Estamos preparando coisas incríveis para você!</div>
                
                <img src={MaintenanceImage} alt="" />
                
                <div className="maintenance-downtime">
                    
                    <div>15:00</div> - <div>15:30</div>
                    
                </div>
                
            </div>
            
        </>
    )
}
