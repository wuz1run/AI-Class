// apis/quiz.ts
import { request } from "../request";
import { useQuizStore } from "../../stores/quizStore"



interface QuizAnswer {
    quizId: number,
    userid: number,
    studentanswer: string,
    iscorrect: boolean,
}


const submitQuizAPI = async (data: QuizAnswer) => {
    const token = localStorage.getItem('token');
    return request('/api/quiz/submit', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    });
};

export default submitQuizAPI;