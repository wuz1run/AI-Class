import { request } from "../../request";

const token = localStorage.getItem('token');

const checkAnswerAPI = async (data: {
    student_answer: string,
    correct_answer: string
}) => {
    return request('http://26eb465d.r31.cpolar.top/api/v1/essay/correct', {
        method: 'post',
        headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${token}`},
        data: data,
    })
}

export default checkAnswerAPI;