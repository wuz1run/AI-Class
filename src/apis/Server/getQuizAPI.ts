import { request } from "../request";



const getQuizAPI = async () => {
    let url = "/api/quiz/get";
    const token = localStorage.getItem('token')
    return request(url,{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getQuizAPI;