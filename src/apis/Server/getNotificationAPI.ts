import { request } from "../request";


const getNotificationAPI = async () => {
    const token = localStorage.getItem('token')
    return request("/api/user/notification",{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getNotificationAPI;