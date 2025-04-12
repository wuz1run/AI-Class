import { request } from "../../request";

const token = localStorage.getItem('token');

const checkAnswerAPI = async (data: {
    student_answer: string,
    correct_answer: string
}) => {
    return request('/api1/v1/essay/correct', {
        method: 'post',
        headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${token}`},
        data: data,
    })
}

export default checkAnswerAPI;