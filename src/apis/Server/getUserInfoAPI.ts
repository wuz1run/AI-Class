import { request } from "../request";

const token = localStorage.getItem('token')

const getUserInfoAPI = async () => {
    const token = localStorage.getItem('token')
    console.log("tokenNow："+token)
    return request("/api/user/personal",{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getUserInfoAPI;