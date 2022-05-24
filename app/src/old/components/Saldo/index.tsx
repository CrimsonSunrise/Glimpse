import React, { useEffect, useState } from "react";
import "./saldo.css";

const Saldo = (props: any) => {
	
	if(!props.balance) {
		return (
			<div>asd</div>
		)
	}
	
	return (
		<div className="saldo">
			
			<div className="currency">{props.currency}</div>

			<div className="balance">
				<span>+</span>

				<div>{ props.balance }</div>
			</div>
		</div>
	);
}

export default Saldo;