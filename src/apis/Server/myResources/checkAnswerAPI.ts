import { request } from "../../request";

const checkAnswerAPI = async (data: {
    student_answer: string,
    correct_answer: string
}) => {
    const token = localStorage.getItem('token');
    return request('http://40944903.r31.cpolar.top/api1/v1/essay/correct', {
        method: 'POST',
        timeout:300000,
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        data: data, // 确保数据被正确序列化
    });
}

export default checkAnswerAPI;