import { request } from "../request";



const getQuizAPI = async (query:{
    testid:string
}) => {
    let url = "/api/quiz/get?";
    for(let key in query){
        url=url.concat(key.concat('=').concat(query[key]).concat('&'))
    }
    const token = localStorage.getItem('token')
    return request(url,{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getQuizAPI;