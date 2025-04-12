import { request } from "../request";


const createClassAPI = async (name:string) => {
    const token = localStorage.getItem('token');
    return request("/api/class/create",{
        method: "post",
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
        data: {name}
    })
}

export default createClassAPI;