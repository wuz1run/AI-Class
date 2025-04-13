<script setup lang="ts">
import { useQuizStore } from "../../stores/quizStore";
import { storeToRefs } from 'pinia';
import {ElCard, ElTag, ElEmpty, ElNotification, ElCheckbox, ElMessage} from "element-plus";
import {computed, onMounted, ref, toRaw} from 'vue';
import {getClassesAPI, getQuizAPI} from "../../apis";
import { useRequest } from "vue-hooks-plus";
import { releaseQuizAPI } from '../../apis'
import {type QuizData} from "../../stores/quizStore";
import {Loading} from "@element-plus/icons-vue";
const quizStore = useQuizStore();
const { jsonData } = storeToRefs(quizStore);
const quizList = ref<Array<any>>([]);
const isReleasing = ref(false);
const selectAll = ref(false);
interface ClassInfo {
  classid: number;
  classname: string;
}
const membersLoading = ref(false);
const classes = ref<ClassInfo[]>([]);
const selectedClass = ref('');
// 获取习题数据
const fetchQuizFromAPI = () => {
  useRequest(() => getQuizAPI(), {
    onSuccess(res) {
      if (res['code'] === 200) {
        quizList.value = (res['data'] || []).map(item => ({
          ...item,
          selected: false
        }));
      } else {
        ElNotification({
          title: 'Warning',
          message: res['msg'] || '接口返回异常',
          type: 'warning',
        });
      }
    },
    onError(err) {
      ElNotification({
        title: 'Error',
        message: err?.toString() || '未知错误',
        type: 'error',
      });
    }
  });
}

const fetchQuizFromStore = () => {
//TODO store
}
// 题目数量计算
const questionCount = computed(() => quizList.value?.length || 0);

// 已选题目数量
const selectedCount = computed(() =>
    quizList.value.filter(item => item.selected).length
);

// 全选/全不选
const toggleSelectAll = () => {
  quizList.value = quizList.value.map(item => ({
    ...item,
    selected: selectAll.value
  }));
}

// 发布习题
const releaseQuiz = () => {
  const selectedQuestions = quizList.value.filter(item => item.selected);
  // 获取这些问题的 id
  const selectedQuestionsIds = selectedQuestions.map(item => item.quizesid);

  if (selectedCount.value === 0) {
    ElNotification({
      title: '警告',
      message: '请至少选择一个题目进行发布',
      type: 'warning',
    });
    return;
  }

  // 检查是否选择了班级
  if (!selectedClass.value) {
    ElNotification({
      title: '警告',
      message: '请选择班级进行发布',
      type: 'warning',
    });
    return;
  }

  isReleasing.value = true;

  // 调用发布接口时，传递班级 ID
  useRequest(() => releaseQuizAPI({ quizesid: selectedQuestionsIds, classid: selectedClass.value }), {
    onSuccess(res) {
      if (res['code'] === 200) {
        ElNotification({
          title: 'Success',
          message: '习题发布成功',
          type: 'success',
        });
      } else {
        ElNotification({
          title: 'Warning',
          message: res['msg'] || '发布失败',
          type: 'warning',
        });
      }
    },
    onError(err) {
      ElNotification({
        title: 'Error',
        message: err?.toString() || '发布请求失败',
        type: 'error',
      });
    },
    onFinally() {
      isReleasing.value = false;
    }
  });
}

const loadClasses = async () => {
  try {
    const res = await getClassesAPI();
    if (res.code === 200) {
      classes.value = res.data; // 接口返回的是数组
    }
  } catch (error) {
    ElMessage.error('获取班级失败');
  }
};
onMounted(() => {
  fetchQuizFromStore();
  fetchQuizFromAPI();
  loadClasses(); // 初始化加载班级列表
});
</script>

<template>

  <div class="preview-container">
    <div class="stats-header">
      <h1>习题预览</h1>
      <div class="selection-controls">
        <el-checkbox v-model="selectAll" @change="toggleSelectAll">
          全选 ({{ selectedCount }}/{{ quizList.length }})
        </el-checkbox>
        <el-tag type="primary">已选: {{ selectedCount }} 题</el-tag>
      </div>
      <div class="stats">
        <el-tag type="info">总题数: {{ quizList.length }}</el-tag>
        <el-tag type="success">选择题: {{ quizList.filter(q => q.type === 'choice').length }}</el-tag>
        <el-tag type="warning">填空题: {{ quizList.filter(q => q.type === 'cloze').length }}</el-tag>
        <el-tag type="warning">简答题: {{ quizList.filter(q => q.type === 'short_answer').length }}</el-tag>
      </div>
    </div>

    <div v-if="questionCount === 0" class="empty-wrapper">
      <el-empty description="题库初始化中..." />
    </div>

    <div v-else class="quiz-list">
      <el-card
          v-for="(quiz, index) in quizList"
          :key="index"
          class="quiz-item w-full h-full"
          shadow="hover"

      >
        <div class="card-header">
          <el-checkbox
              v-model="quiz.selected"
              @change="selectAll = selectedCount === quizList.length"
          />
          <div class="quiz-meta">
            <el-tag size="small">#{{ index + 1 }}</el-tag>
            <el-tag
                :type="quiz.type === 'choice' ? 'success' : 'warning'"
                size="small"
            >
              {{    quiz.type === 'choice' ? '选择题' :
                    quiz.type === 'cloze' ? '填空题' :
                    quiz.type === 'short_answer' ? '简答题' : '未知题型'
              }}
            </el-tag>
            <el-tag v-if="quiz.tag" type="info" size="small">{{ quiz.tag }}</el-tag>
          </div>
        </div>

        <div class="question-content">
          <h3 class="question-text" v-html="quiz.question"></h3>

          <div v-if="quiz.type === 'choice' && quiz.options?.length" class="options-grid">
            <div
                v-for="(option, optIndex) in quiz.options"
                :key="optIndex"
                class="option-item"
                :class="{ 'correct-option': option === quiz.answer }"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>

          <div class="answer-area">
            <el-tag effect="dark" type="primary" size="small">答案</el-tag>
            <span class="answer-text">{{ quiz.answer }}</span>
          </div>
        </div>
      </el-card>
      <div class="flex items-center gap-4">
        <select
            v-model="selectedClass"
            class="select select-bordered select-sm w-1024px h-256px"
            :disabled="!classes.length"
        >
          <option disabled value="">请选择班级</option>
          <option
              v-for="cls in classes"
              :key="cls.classid"
              :value="cls.classid"
          >
            {{ cls.classname }}
          </option>
        </select>

        <span v-if="membersLoading" class="text-sm text-gray-500">
        <el-icon class="animate-spin"><Loading /></el-icon>
        加载中...
      </span>
      </div>
      <el-button
          @click="releaseQuiz"
          :loading="isReleasing"
          type="primary"
          :disabled="selectedCount === 0"
      >
        发布选中习题 ({{ selectedCount }})
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.select{
  width:1024px;
  height:64px;
}.text-16xl
.stats-header {
  margin-bottom: 30px;
  text-align: center;
}

.selection-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  justify-content: center;
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
}

.quiz-list {
  display: grid;
  gap: 20px;
}

.quiz-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  width:1024px;
}

.quiz-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.quiz-meta {
  display: flex;
  gap: 8px;
}

.question-content {
  line-height: 1.7;
}

.question-text {
  margin: 15px 0;
  font-size: 16px;
  color: #34495e;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background: #f8f9fa;
  border: 1px solid #eee;
}

.correct-option {
  background: #e8f5e9;
  border-color: #a5d6a7;
}

.option-letter {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #3498db;
  color: white;
  border-radius: 4px;
  margin-right: 12px;
}

.answer-area {
  margin-top: 20px;
  padding: 12px;
  background: #f3f8ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.answer-text {
  font-family: monospace;
  font-size: 16px;
  color: #2c3e50;
}
</style>