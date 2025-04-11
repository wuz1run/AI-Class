<template>
  <div class="preview-container">
    <div class="stats-header">
      <h1>在线答题系统</h1>
      <div class="stats">
        <el-tag type="primary">剩余时间: {{ formatTime(timer) }}</el-tag>
        <el-tag :type="submitted ? 'success' : 'info'">
          {{ submitted ? '已完成提交' : `已作答 ${answeredCount}/${quizList.length}` }}
        </el-tag>
      </div>
    </div>

    <div v-if="questionCount === 0" class="empty-wrapper">
      <el-empty description="正在加载题目..." />
    </div>

    <div v-else class="quiz-list">
      <el-card
          v-for="(quiz, index) in quizList"
          :key="quiz.quizesid"
          class="quiz-item"
          :class="{ 'correct-card': submitted && isCorrect(quiz) }"
      >
        <div class="question-content">
          <h3 class="question-text">{{ index + 1 }}. {{ quiz.question }}</h3>

          <!-- 选择题 -->
          <div v-if="quiz.type === 'choice'" class="options-container">
            <el-radio-group
                v-model="answers[quiz.quizesid]"
                :disabled="submitted"
            >
              <div
                  v-for="(option, optIndex) in quiz.options"
                  :key="optIndex"
                  class="option-item"
                  :class="getOptionClass(quiz, option)"
              >
                <el-radio
                    :label="option"
                    class="custom-radio"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
                  <span class="option-text">{{ option }}</span>
                </el-radio>
              </div>
            </el-radio-group>
          </div>

          <!-- 填空题 -->
          <div v-else class="cloze-input">
            <el-input
                v-model="answers[quiz.quizesid]"
                :disabled="submitted"
                placeholder="请输入答案"
                clearable
            >
              <template #append v-if="submitted">
              <span :class="isCorrect(quiz) ? 'correct-text' : 'error-text'">
                {{ quiz.answer }}
              </span>
              </template>
            </el-input>
          </div>
        </div>
      </el-card>

      <el-button
          type="success"
          size="large"
          @click="handleSubmit"
          :disabled="submitted || answeredCount < quizList.length"
      >
        {{ submitted ? '已提交' : '提交答案' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ElCard, ElTag, ElEmpty, ElNotification, ElRadio, ElRadioGroup, ElInput } from "element-plus";
import { computed, onMounted, ref } from 'vue';
import { useQuizStore } from "../../stores/quizStore";
import { getQuizAPI } from "../../apis";
import {useRequest} from "vue-hooks-plus";
import {uploadAnswerAPI} from "../../apis";
const quizStore = useQuizStore();
const { jsonData } = storeToRefs(quizStore);
const quizList = ref<Array<quizData>>([]);
import { useRoute } from 'vue-router';
import {userInfo} from "../index";
import {useMainStore} from "../../stores";
import userInfoStore from "../../stores/Server/userInfoStore";
const route = useRoute();
const id = route.params.id;
interface quizData {
  quizesid: number;
  question: string;
  answer: string;
  options: string[];
  type: string;
}
console.log('当前ID:', id);

// 学生答题状态
interface StudentAnswer {
  [key: string]: string;
}

const answers = ref<StudentAnswer>({});
const submitted = ref(false);
const timer = ref(1800); // 30分钟计时

// 格式化时间显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// 获取习题数据
onMounted(() => {
  useRequest(() => getQuizAPI({testid:String(id)}), {
    onSuccess(res) {
      if (res?.['code'] === 200) {
        // 确保每个题目都有唯一id
        quizList.value = res['data'] || [];
        startTimer();
      }
    },
    onError(err) {
      ElNotification.error('获取题目失败，请重试');
    }
  });
});

// 启动计时器
const startTimer = () => {
  const interval = setInterval(() => {
    if (timer.value > 0 && !submitted.value) {
      timer.value--;
    } else {
      clearInterval(interval);
    }
  }, 1000);
};

// 答案验证
const isCorrect = (quiz: any) => {
  console.log('当前答案:', answers.value[quiz.id]," 答案:', quiz.answer", answers.value[quiz.id]?.toString().trim() === quiz.answer?.toString().trim());
  return answers.value[quiz.quizsid]?.toString().trim() === quiz.answer?.toString().trim();
};

// 选项样式
const getOptionClass = (quiz: any, option: string) => {
  if (!submitted.value) return '';
  return {
    'correct-option': option === quiz.answer,
    'error-option': answers.value[quiz.id] === option && !isCorrect(quiz)
  };
};

// 已答题目数量
const answeredCount = computed(() =>
    Object.keys(answers.value).filter(key => answers.value[key]?.trim()).length
);

// 题目总数
const questionCount = computed(() => quizList.value?.length || 0);
const userinfostore = useMainStore().userInfoStore();
// 提交处理
const handleSubmit = async () => {
  try {
    submitted.value = true;
    // 构造提交数据
    const payload = quizList.value.map(quiz => ({
      quizid: quiz.quizesid,
      userid: userinfostore.userInfo?.userid,
      studentanswer: answers.value[quiz.quizesid],
      iscorrect: answers.value[quiz.quizesid] === quiz.answer
    }));
    console.log(payload)
    const response = await uploadAnswerAPI(payload);
    if (response['code'] === 200) {
      console.log('提交成功:', response['data']);
    }
  } catch (error) {
    console.error('提交失败:', error);
  }
};
</script>

<style scoped>
.preview-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.stats-header {
  margin-bottom: 30px;
  text-align: center;
}

.stats-header h1 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.quiz-list {
  display: grid;
  gap: 20px;
}

.quiz-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 20px;
}

.quiz-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.correct-card {
  border: 2px solid #67c23a;
  background: #f0f9eb;
}

.question-content {
  line-height: 1.7;
}

.question-text {
  margin: 15px 0;
  font-size: 16px;
  color: #34495e;
}

.options-container {
  width: 100%;
  margin: 20px 0;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s;
  border: 1px solid #eee;
}

.option-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
}

.correct-option {
  background: #e8f5e9;
  border-color: #a5d6a7;
}

.error-option {
  background: #fef0f0;
  border-color: #f56c6c;
}

.option-letter {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #409eff;
  color: white;
  border-radius: 4px;
  margin-right: 12px;
  font-weight: 500;
}

.cloze-input {
  max-width: 480px;
  margin-top: 20px;
}

.correct-text {
  color: #67c23a;
  font-weight: bold;
}

.error-text {
  color: #f56c6c;
  text-decoration: line-through;
}

:deep(.el-radio__label) {
  display: flex !important;
  align-items: center;
}

:deep(.el-radio__input) {
  margin-right: 12px;
}

.el-button {
  margin-top: 30px;
  width: 200px;
  justify-self: center;
}
</style>