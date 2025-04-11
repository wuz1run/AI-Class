import { request } from "../../request";



const modifyTitleAPI = async (data:{
    id: number,
    new_topic: string,
}) => {
    const token = localStorage.getItem('token');
    return request("/api/chat/topic",{
        method: "put",
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
        data:data,
    })
}

export default modifyTitleAPI;