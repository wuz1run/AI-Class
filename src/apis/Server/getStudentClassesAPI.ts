import { request } from "../request";


const getStudentClassesAPI = async () => {
    const token = localStorage.getItem('token');
    return request("/api/class/classlist",{
        method: 'get',
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
    })
}

export default getStudentClassesAPI ;