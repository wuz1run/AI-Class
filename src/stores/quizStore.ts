// stores/jsonStore.ts
import { defineStore } from 'pinia';
import {changePassAPI, uploadQuizAPI} from "../apis";
import {useRequest} from "vue-hooks-plus";
import {ElNotification} from "element-plus";
// 明确定义数据结构
export interface QuizData {
    questions: Array<{
        question :string;
        answer :string;
        options :string[];
        tag :string;
        type:string;
    }>
}

export const useQuizStore = defineStore('quizStore', {
    state: () => ({
        jsonData: {} as QuizData,
        isLoading: false,
    }),

    actions: {
        addQuestion(question: string) {
            let newQuestion = JSON.parse(question);
            if (!this.jsonData.questions) {
                this.jsonData.questions = [];
            }
            this.jsonData.questions.push(newQuestion);
            useRequest(()=>uploadQuizAPI(question),{
                onSuccess(res){
                    if(res['code'] === 200){
                        ElNotification({title: 'Success', message: res['msg'] + '，习题上传成功', type: 'success',});
                    }else{
                        ElNotification({title: 'Warning', message: res['msg'], type: 'warning',});
                    }
                },
                onError(err){
                    ElNotification(err)
                }
            })
        },
        addMultipleQuestions(questions: QuizData[]) {
            questions.forEach(q => this.addQuestion(q));
        }
        },
        // 场景2：批量添加问题

getters: {
    // 获取处理后的数据
    questionCount: (state) => state.jsonData.questions?.length || 0,
        // 带格式化的数据展示
        formattedData: (state) => {
        return JSON.stringify(state.jsonData, null, 2);
    }
}
});