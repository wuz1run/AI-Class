import { request } from "../../request";



const getChatHistoryAPI = async (query:{
    topicid?: number,
    page_num?: number,
    page_size?: number,
}) => {
    const token = localStorage.getItem('token')
    let url = "/api/chat/history?";
    for(let key in query){
        url=url.concat(key.concat('=').concat(query[key]).concat('&'))
    }
    return request(url,{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getChatHistoryAPI;