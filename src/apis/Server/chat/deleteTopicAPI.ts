import { request } from "../../request";



const deleteTopicAPI = async (query:{id:number}) => {
    const token = localStorage.getItem('token')
    return request("/api/chat/topic?topicid=".concat(String(query['id'])),{
        method: "delete",
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default deleteTopicAPI;