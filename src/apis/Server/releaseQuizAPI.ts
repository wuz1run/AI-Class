import { request } from "../request";

const releaseQuizAPI = async (data:{
    quizesid:Array<number>,
    classid:number,
}) => {
    const token = localStorage.getItem('token')
    return request("/api/quiz/release",{
        method: "post",
        headers: {"Content-Type":"application/json",'Authorization':`Bearer ${token}`},
        data: data,
    })
}

export default releaseQuizAPI;