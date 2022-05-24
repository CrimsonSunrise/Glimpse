import React from "react";
import "./mainbutton.css";
import { motion } from 'framer-motion';

const MainButton = (props: any) => {
    return (
        <motion.div whileTap={{ scale: 0.95 }}  className="mainButton shadowComponent">
            
            <div className="buttonSelection">{props.data}</div>
            <div className="buttonTitle">{props.title}</div>
            
        </motion.div>
    );
}

export default MainButton;