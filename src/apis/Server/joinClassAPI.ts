import { request } from "../request";

const joinClassAPI = async (invitecode:string) => {
    const token = localStorage.getItem('token')
    return request("/api/class/join",{
        method: "post",
        headers: {"Content-Type":"application/json",'Authorization':`Bearer ${token}`},
        data: invitecode,
    })
}

export default joinClassAPI;