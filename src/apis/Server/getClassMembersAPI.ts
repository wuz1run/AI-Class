import { request } from "../request";



const getClassMembersAPI = async (query:{
    classid?: number,
}) => {
    const token = localStorage.getItem('token')
    let url = "/api/class/members?";
    for (let key in query) {
        url=url.concat(key.concat('=').concat(query[key]).concat('&'))
    }
    return request(url,{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},

    })
}

export default getClassMembersAPI ;