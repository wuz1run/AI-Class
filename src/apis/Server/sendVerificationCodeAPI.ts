import { request } from "../request";

const sendVerificationCodeAPI = async (email:string) => {
    return request("/api/user/sendemail",{
        method: "post",
        headers: {"Content-Type":"application/json",},
        data: email,
    })
}

export default sendVerificationCodeAPI;