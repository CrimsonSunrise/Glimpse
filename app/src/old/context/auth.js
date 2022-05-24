import Axios from "axios";

export const getUser = () => {
	let userMail = JSON.parse(localStorage.getItem("user"))["email"];
		
	Axios.post(`http://192.168.1.100:5000/glimpse/getUser`, { userMail: userMail, userKey: "ASD123", })
	.then((res) => {
		
		//console.log(res.data)
		//setUser(res.data)
		return res.data;
		
	});
}