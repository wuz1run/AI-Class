import { request } from "../request";
import {useQuizStore} from "../../stores/quizStore";

const uploadQuizAPI = async (data: string) => {
    const token = localStorage.getItem('token')
    return request('/api/quiz/upload',{
        method: 'post',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        data: data
    })
}

export default uploadQuizAPI;