import { request } from "../../request";



const uploadChatHistoryAPI= async (data: {
    topicid: number,
    chatHistory: Array<any>,
}) => {
    const token = localStorage.getItem('token');
    return request(`/api/chat/upload?topicid=${data.topicid}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data.chatHistory

    });
}

export default uploadChatHistoryAPI;
