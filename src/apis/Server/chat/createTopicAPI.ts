import { request } from "../../request";



const createTopicAPI = async (data:{topic:string}) => {
    const token = localStorage.getItem('token');
    return request("/api/chat/topic",{
        method: "post",
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
        data: data,
    })
}

export default createTopicAPI;