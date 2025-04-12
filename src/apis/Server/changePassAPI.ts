import { request } from "../request";



const changePassAPI = async (data:{
    old_password: string,
    new_password: string
}) => {
    const token = localStorage.getItem('token');
    return request("/api/user/pwd",{
        method: "put",
        headers: {"Content-Type":"application/json", 'Authorization':`Bearer ${token}`},
        data: data,
    })
}

export default changePassAPI;