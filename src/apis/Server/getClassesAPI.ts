import { request } from "../request";


const getClassesAPI = async () => {
    const token = localStorage.getItem('token');
    return request("/api/class/list",{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getClassesAPI ;