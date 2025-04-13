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

          <!-- 简答题 -->
          <div v-else-if="quiz.type === 'short_answer'" class="essay-question">
            <el-input
                v-model="answers[quiz.quizesid]"
                :disabled="submitted"
                placeholder="请输入答案"
                clearable
                :class="{ 'submitted-essay': submitted }"
            />
            <!-- 简答题评分结果显示 -->
            <div v-if="submitted && answers[quiz.quizesid]" class="essay-feedback">
              <div class="correct-answer">
                正确答案：<span class="correct-text">{{ quiz.answer }}</span>
              </div>

              <!-- 确保简答题评分信息正确显示 -->
              <div class="scoring-info">
                <template v-if="isScoring && scoringInProgress[quiz.quizesid]">
                  <pre class="loading-state">正在评分中...</pre>
                </template>

                <template v-else-if="!isScoring && !essayScores[quiz.quizesid]">
                  <el-button size="small" type="primary" @click="scoreSpecificEssay(quiz)" class="retry-btn">
                    点击开始评分
                  </el-button>
                </template>

                <!-- 评分结果 -->
                <div v-else-if="essayScores[quiz.quizesid]" class="score-result">
                  <!-- 添加调试信息 -->
                  <pre v-if="isDebugging" style="background: #f0f0f0; padding: 5px; margin-bottom: 10px; font-size: 12px;">
quizId: {{ quiz.quizesid }}
有评分数据: {{ !!essayScores[quiz.quizesid] }}
相似度: {{ essayScores[quiz.quizesid]?.similarity_percentage }}
                  </pre>

                  <el-tag
                      :type="essayScores[quiz.quizesid].similarity_percentage >= 60 ? 'success' : 'danger'"
                      effect="dark"
                      class="similarity-tag"
                  >
                    相似度: {{ essayScores[quiz.quizesid].similarity_percentage.toFixed(2) }}%
                    ({{ essayScores[quiz.quizesid].similarity_percentage >= 60 ? '通过' : '未通过' }})
                  </el-tag>

                  <!-- 逻辑矛盾状态 -->
                  <el-tag
                      :type="essayScores[quiz.quizesid].has_logical_contradictions ? 'danger' : 'info'"
                      effect="plain"
                      class="contradiction-tag"
                  >
                    逻辑矛盾: {{ essayScores[quiz.quizesid].has_logical_contradictions ? '是' : '否' }}
                  </el-tag>

                  <!-- 评分原因 -->
                  <div
                      v-if="essayScores[quiz.quizesid].reasons && essayScores[quiz.quizesid].reasons.length"
                      class="detail-section reason-section"
                  >
                    <h4 class="detail-heading">评分原因</h4>
                    <ul class="reason-list">
                      <li
                          v-for="(reason, idx) in essayScores[quiz.quizesid].reasons"
                          :key="idx"
                          class="reason-item"
                      >
                        <el-icon color="#f56c6c" class="warning-icon">
                          <Warning />
                        </el-icon>
                        {{ reason }}
                      </li>
                    </ul>
                  </div>

                  <!-- 要点分析 -->
                  <div
                      v-if="essayScores[quiz.quizesid].key_points_analysis && essayScores[quiz.quizesid].key_points_analysis.length"
                      class="detail-section keypoints-section"
                  >
                    <h4 class="detail-heading">要点分析</h4>
                    <div class="keypoints-list">
                      <div
                          v-for="(point, pIdx) in essayScores[quiz.quizesid].key_points_analysis"
                          :key="pIdx"
                          class="keypoint-item"
                          :class="{ 'missing': !point.present }"
                      >
                        <div class="keypoint-header">
                          <el-icon :color="point.present ? '#67c23a' : '#f56c6c'">
                            <SuccessFilled v-if="point.present" />
                            <CircleCloseFilled v-else />
                          </el-icon>
                          <span class="keypoint-text">{{ point.key_point }}</span>
                        </div>
                        <div class="keypoint-comment">{{ point.comment }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- 逻辑矛盾详情 -->
                  <div
                      v-if="essayScores[quiz.quizesid].has_logical_contradictions && essayScores[quiz.quizesid].contradiction_details && essayScores[quiz.quizesid].contradiction_details.length"
                      class="detail-section contradiction-section"
                  >
                    <h4 class="detail-heading">逻辑矛盾</h4>
                    <div class="contradiction-list">
                      <div
                          v-for="(detail, cIdx) in essayScores[quiz.quizesid].contradiction_details"
                          :key="cIdx"
                          class="contradiction-item"
                      >
                        <el-icon color="#f56c6c" class="error-icon">
                          <CircleCloseFilled />
                        </el-icon>
                        {{ detail || '检测到未说明的逻辑矛盾' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      <!-- 增加调试信息 -->
      <div v-if="isDebugging && submitted" class="debug-panel">
        <h3>调试信息</h3>
        <div>评分状态: {{ isScoring ? '正在评分' : '未在评分' }}</div>
        <div>评分进度: {{ Object.keys(scoringInProgress).filter(k => scoringInProgress[k]).length }}/{{ Object.keys(scoringInProgress).length }}</div>
        <div>评分结果数: {{ Object.keys(essayScores).length }}</div>
        <!-- 添加评分结果详情 -->
<!--        <div v-if="Object.keys(essayScores).length > 0">-->
<!--          <h4>评分结果详情:</h4>-->
<!--          <pre style="max-height: 200px; overflow: auto; background: #f5f5f5; padding: 10px; font-size: 12px;">{{ JSON.stringify(essayScores, null, 2) }}</pre>-->
<!--        </div>-->
        <el-button @click="forceReassessAllEssays" size="small" type="warning" style="margin-right: 10px;">强制重新评分</el-button>
        <el-button @click="refreshEssayView" size="small" type="primary">刷新视图</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ElCard, ElTag, ElEmpty, ElNotification, ElRadio, ElRadioGroup, ElInput, ElCollapse, ElCollapseItem, ElButton } from "element-plus";
import { SuccessFilled, CircleCloseFilled, Warning } from '@element-plus/icons-vue';
import { computed, onMounted, ref, watch, nextTick, reactive } from 'vue';
import { useQuizStore } from "../../stores/quizStore";
import { getQuizAPI } from "../../apis";
import { useRequest } from "vue-hooks-plus";
import { uploadAnswerAPI } from "../../apis";
// 简答题
import { checkAnswerAPI } from "../../apis";
const quizStore = useQuizStore();
const { jsonData } = storeToRefs(quizStore);
const quizList = ref<Array<quizData>>([]);
import { useRoute } from 'vue-router';
import { userInfo } from "../index";
import { useMainStore } from "../../stores";
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

// 调试标志 - 可以根据需要开启或关闭
const isDebugging = ref(true);

// 检测是否安装了Vue Devtools
const hasVueDevtools = ref(false);
onMounted(() => {
  // 检查浏览器是否安装了Vue Devtools
  setTimeout(() => {
    hasVueDevtools.value = !!(window.__VUE_DEVTOOLS_GLOBAL_HOOK__);
    if (!hasVueDevtools.value && isDebugging.value) {
      console.warn('建议安装Vue Devtools插件以更好地调试响应式数据');
    }
  }, 1000);
});

// 添加API错误记录对象
const apiErrors = ref({});

// 添加简答题逻辑
const isEssayQuestion = (quiz: quizData) => quiz.type === 'short_answer';

// 学生答题状态
interface StudentAnswer {
  [key: string]: string;
}

// 添加评分中标志 - 全局状态
const isScoring = ref(false);

// 添加单个题目评分中标志
const scoringInProgress = ref<{[key: number]: boolean}>({});

// 添加评分重试计数器
const retryCounters = ref<{[key: number]: number}>({});

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

        // 初始化每个题目的评分状态
        quizList.value.forEach(quiz => {
          if (isEssayQuestion(quiz)) {
            scoringInProgress.value[quiz.quizesid] = false;
            retryCounters.value[quiz.quizesid] = 0;
          }
        });

        startTimer();
      } else {
        ElNotification.error({
          title: '加载失败',
          message: res?.['message'] || '获取题目失败，请重试'
        });
      }
    },
    onError(err) {
      console.error('获取题目API错误:', err);
      ElNotification.error({
        title: '加载失败',
        message: '获取题目失败，请检查网络连接'
      });
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
      if (timer.value === 0 && !submitted.value) {
        ElNotification.warning({
          title: '时间到',
          message: '考试时间已结束，系统将自动提交'
        });
        handleSubmit();
      }
    }
  }, 1000);
};

// 答案验证
const isCorrect = (quiz: quizData) => {
  if (!isEssayQuestion(quiz)) {
    return answers.value[quiz.quizesid]?.toString().trim() === quiz.answer?.toString().trim();
  }

  // 简答题判定
  if (essayScores.value[quiz.quizesid]) {
    return essayScores.value[quiz.quizesid].similarity_percentage >= 60;
  }

  return false;
};

// 添加简答题评分结果存储
const essayScores = ref<{
  [key: number]: {
    similarity_percentage: number,
    reasons: string[],
    key_points_analysis: Array<{
      key_point: string,
      present: boolean,
      matched_text: string | null,
      comment: string
    }>,
    has_logical_contradictions: boolean,
    contradiction_details: string[]
  }
}>({});

// 创建深度响应式数据存储
const deepReactiveScores = reactive({});

// 选项样式
const getOptionClass = (quiz: quizData, option: string) => {
  if (!submitted.value) return '';
  return {
    'correct-option': option === quiz.answer,
    'error-option': answers.value[quiz.quizesid] === option && !isCorrect(quiz)
  };
};

// 已答题目数量
const answeredCount = computed(() =>
    Object.keys(answers.value).filter(key => answers.value[key]?.trim()).length
);

// 题目总数
const questionCount = computed(() => quizList.value?.length || 0);
const userinfostore = useMainStore().userInfoStore();

// 简单的本地评分备用方案
const fallbackScoring = (studentAnswer, correctAnswer) => {
  if (!studentAnswer) return {
    similarity_percentage: 0,
    reasons: ["未提供答案"],
    key_points_analysis: [],
    has_logical_contradictions: false,
    contradiction_details: []
  };

  // 一个非常简单的相似度计算
  const normalizeText = (text) => text.trim().toLowerCase();
  const studentNormalized = normalizeText(studentAnswer);
  const correctNormalized = normalizeText(correctAnswer);

  // 计算重叠词的粗略相似度
  const studentWords = new Set(studentNormalized.split(/\s+/));
  const correctWords = new Set(correctNormalized.split(/\s+/));

  let commonWords = 0;
  for (const word of studentWords) {
    if (correctWords.has(word)) commonWords++;
  }

  const similarity = correctWords.size > 0
      ? (commonWords / correctWords.size) * 100
      : 0;

  return {
    similarity_percentage: similarity,
    reasons: ["使用备用评分系统评分，结果仅供参考"],
    key_points_analysis: [{
      key_point: "关键词匹配",
      present: similarity > 30,
      matched_text: null,
      comment: `答案包含约${similarity.toFixed(0)}%的关键词`
    }],
    has_logical_contradictions: false,
    contradiction_details: []
  };
};

// 带重试功能的评分函数
const scoreWithRetry = async (quiz, maxRetries = 3) => {
  const quizId = quiz.quizesid;
  const answer = answers.value[quizId];
  let lastError = null;

  if (!answer) {
    throw new Error('没有填写答案');
  }

  console.log(`评分题目 ${quizId} 详细信息:`, {
    question: quiz.question.substring(0, 30) + '...',
    answerLength: answer.length,
    correctAnswerLength: quiz.answer?.length || 0
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    retryCounters.value[quizId] = attempt;
    console.log(`题目 ${quizId} 评分尝试 ${attempt}/${maxRetries}`);

    try {
      // 实际API调用
      const result = await checkAnswerAPI({
        student_answer: answer,
        correct_answer: quiz.answer
      });

      console.log(`题目 ${quizId} API响应:`, {
        status: result?.code,
        dataPresent: !!result?.data,
        responseSize: result ? JSON.stringify(result).length : 0
      });

      // 验证响应
      if (!result) {
        throw new Error('API返回为空');
      }

      if (result.code !== 200) {
        throw new Error(result.message || `API返回错误代码: ${result.code}`);
      }

      if (!result.data) {
        throw new Error('API返回数据为空');
      }

      // 处理成功响应
      return result.data;
    } catch (error) {
      lastError = error;
      console.warn(`题目 ${quizId} 尝试 ${attempt} 失败:`, error);

      // 记录错误
      apiErrors.value[`${quizId}_attempt_${attempt}`] = {
        time: new Date().toISOString(),
        error: error.message,
        details: error.stack || '无堆栈信息'
      };

      // 如果还有重试机会，等待后重试
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // 所有重试都失败，使用备用方案
  console.warn(`题目 ${quizId} 评分API调用失败，使用本地备用评分`);
  return fallbackScoring(answer, quiz.answer);
};

// 刷新视图函数
const refreshEssayView = async () => {
  console.log('手动刷新视图...');

  // 创建essayScores的深拷贝
  const currentScores = JSON.parse(JSON.stringify(essayScores.value));

  // 先清空
  essayScores.value = {};

  // 等待下一个DOM更新周期
  await nextTick();

  // 再重新赋值
  essayScores.value = currentScores;

  // 再次等待DOM更新
  await nextTick();

  console.log('视图刷新完成');

  ElNotification.success({
    title: '刷新完成',
    message: '视图已手动刷新',
    duration: 2000
  });
};

// 单个简答题评分函数
const scoreSpecificEssay = async (quiz) => {
  const quizId = quiz.quizesid;
  const answer = answers.value[quizId];

  if (!answer) {
    ElNotification.warning({
      title: '无法评分',
      message: '没有填写答案，无法进行评分'
    });
    return null;
  }

  // 设置全局和局部评分状态
  isScoring.value = true;
  scoringInProgress.value[quizId] = true;

  console.log(`开始评分题目 ${quizId}, 答案: "${answer.substring(0, 20)}${answer.length > 20 ? '...' : ''}"`);

  try {
    // 使用带重试的评分函数
    const scoreData = await scoreWithRetry(quiz);

    console.log(`题目 ${quizId} 评分成功:`, scoreData);

    // 修改：使用全新对象更新评分结果，确保响应式
    const newScores = { ...essayScores.value };
    newScores[quizId] = {
      similarity_percentage: scoreData.similarity_percentage || 0,
      reasons: scoreData.reasons || [],
      key_points_analysis: scoreData.key_points_analysis || [],
      has_logical_contradictions: scoreData.has_logical_contradictions || false,
      contradiction_details: scoreData.contradiction_details || []
    };

    // 同时更新到深度响应式对象中
    deepReactiveScores[quizId] = { ...newScores[quizId] };

    // 更新普通响应式对象
    essayScores.value = newScores;

    // 强制更新DOM
    await nextTick();

    // 添加调试输出
    console.log(`题目 ${quizId} 评分数据已更新:`, {
      similarityValue: essayScores.value[quizId]?.similarity_percentage,
      fullData: { ...essayScores.value[quizId] },
      reactiveData: { ...deepReactiveScores[quizId] }
    });

    // 检查是否使用了备用评分
    if (scoreData.reasons && scoreData.reasons.includes("使用备用评分系统评分，结果仅供参考")) {
      ElNotification.warning({
        title: '备用评分',
        message: `题目${quizId}使用了本地备用评分系统，结果仅供参考`,
        duration: 5000
      });
    }

    return scoreData;
  } catch (error) {
    console.error(`评分问题 ${quizId} 最终失败:`, error);

    // 记录最终错误
    apiErrors.value[`${quizId}_final`] = {
      time: new Date().toISOString(),
      error: error.message,
      details: error.stack || '无堆栈信息'
    };

    ElNotification.error({
      title: '评分错误',
      message: `题目${quizId}评分失败: ${error.message}`,
      duration: 0
    });
    return null;
  } finally {
    // 清除评分状态
    scoringInProgress.value[quizId] = false;
    retryCounters.value[quizId] = 0;

    // 检查是否所有评分都完成
    const stillScoring = Object.values(scoringInProgress.value).some(value => value === true);
    if (!stillScoring) {
      isScoring.value = false;
    }
    console.log(`题目 ${quizId} 评分完成，状态更新。当前全局评分状态:`, isScoring.value);
  }
};

// 显示所有API错误的函数
const showAllErrors = () => {
  console.table(apiErrors.value);
  // 可以添加导出错误日志功能
  ElNotification.info({
    title: '错误日志',
    message: '错误日志已在控制台打印',
    duration: 3000
  });
};

// 强制重新评分所有简答题
const forceReassessAllEssays = async () => {
  const essayQuestions = quizList.value.filter(isEssayQuestion);

  if (essayQuestions.length === 0) {
    ElNotification.info({ message: '没有需要评分的简答题' });
    return;
  }

  // 清空当前评分结果
  essayScores.value = {};
  // 清空错误记录
  apiErrors.value = {};

  ElNotification.info({
    title: '开始重新评分',
    message: `正在重新评分${essayQuestions.length}道简答题`,
    duration: 3000
  });

  // 重新评分所有简答题
  const results = await Promise.allSettled(essayQuestions.map(quiz => {
    if (answers.value[quiz.quizesid]?.trim()) {
      return scoreSpecificEssay(quiz);
    }
    return Promise.resolve(null);
  }));

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failCount = essayQuestions.length - successCount;

  // 强制刷新视图
  await refreshEssayView();

  ElNotification.success({
    title: '重新评分完成',
    message: `成功: ${successCount}, 失败: ${failCount}`,
    duration: 0
  });

  if (failCount > 0) {
    console.error('评分失败的题目:', results
        .map((r, i) => ({result: r, quiz: essayQuestions[i]}))
        .filter(item => item.result.status !== 'fulfilled' || !item.result.value)
        .map(item => item.quiz.quizesid)
    );
  }
};

// 提交处理
const handleSubmit = async () => {
  try {
    submitted.value = true;

    // 筛选出简答题
    const essayQuestions = quizList.value.filter(isEssayQuestion);

    console.log('开始评分简答题...');
    console.log('评分前状态:', {
      essayQuestions: essayQuestions.length,
      answers: Object.keys(answers.value).length
    });

    // 设置全局评分状态
    isScoring.value = true;

    // 并行处理简答题评分
    if (essayQuestions.length > 0) {
      // 初始化评分进度状态
      essayQuestions.forEach(quiz => {
        if (answers.value[quiz.quizesid]) {
          scoringInProgress.value[quiz.quizesid] = true;
        }
      });

      const essayPromises = essayQuestions.map(async (quiz) => {
        if (answers.value[quiz.quizesid]) {
          return await scoreSpecificEssay(quiz);
        }
        return null;
      });

      // 等待评分完成
      const results = await Promise.allSettled(essayPromises);

      // 检查是否有评分失败的题目
      const failedQuizzes = results
          .map((r, i) => ({result: r, quiz: essayQuestions[i]}))
          .filter(item => item.result.status !== 'fulfilled' || !item.result.value);

      if (failedQuizzes.length > 0) {
        console.warn('有评分失败的题目:', failedQuizzes.map(item => item.quiz.quizesid));

        ElNotification.warning({
          title: '部分评分失败',
          message: `${failedQuizzes.length}道题目评分失败，已使用备用评分`,
          duration: 0
        });

        // 对失败的题目使用备用评分
        const newScores = { ...essayScores.value };
        failedQuizzes.forEach(item => {
          const quiz = item.quiz;
          newScores[quiz.quizesid] = fallbackScoring(
              answers.value[quiz.quizesid],
              quiz.answer
          );
        });
        essayScores.value = newScores;
      }

      // 强制刷新视图以确保数据显示
      await refreshEssayView();
    }

    isScoring.value = false;
    console.log('所有简答题评分完成:', {
      essayScores: Object.keys(essayScores.value).length,
      scoringStatus: {...scoringInProgress.value}
    });

    // 构造 payload
    const payload = quizList.value.map(quiz => {
      const baseAnswer = {
        quizid: quiz.quizesid,
        userid: userinfostore.userInfo?.userid,
        studentanswer: answers.value[quiz.quizesid] || '',
        iscorrect: !isEssayQuestion(quiz)
            ? (answers.value[quiz.quizesid]?.toString().trim() === quiz.answer?.toString().trim())
            : (essayScores.value[quiz.quizesid]?.similarity_percentage >= 60)
      };

      // 如果是简答题，附加评分信息
      if (isEssayQuestion(quiz) && essayScores.value[quiz.quizesid]) {
        const score = essayScores.value[quiz.quizesid];
        return {
          ...baseAnswer,
          similarityPercentage: score.similarity_percentage,
          reasons: score.reasons,
          keyPointsAnalysis: score.key_points_analysis,
          hasLogicalContradictions: score.has_logical_contradictions,
          contradictionDetails: score.contradiction_details,
          isPassed: score.similarity_percentage >= 60
        };
      }

      return baseAnswer;
    });

    console.log('提交答案数据:', payload);

    // 提交答案
    const response = await uploadAnswerAPI(payload);
    if (response.code === 200) {
      console.log('提交成功:', response.data);
      ElNotification.success({
        title: '提交成功',
        message: '您的答案已成功提交'
      });
    } else {
      ElNotification.error({
        title: '提交失败',
        message: response.message || '提交答案时发生错误',
        duration: 0
      });
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElNotification.error({
      title: '提交失败',
      message: `提交答案时发生错误: ${error.message}`,
      duration: 0
    });
  }
};

// 添加网络状态检测
const checkNetworkStatus = () => {
  if (!navigator.onLine) {
    ElNotification.error({
      title: '网络连接断开',
      message: '请检查网络连接后重试',
      duration: 0
    });
    return false;
  }
  return true;
};

// 修改已有函数以使用网络检测
const scoreWithNetworkCheck = async (quiz) => {
  if (!checkNetworkStatus()) {
    throw new Error('网络连接断开');
  }
  return await scoreWithRetry(quiz);
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

/* 简答题样式 */
.submitted-essay :deep(.el-input__inner) {
  color: #f56c6c;
  text-decoration: line-through;
  background-color: #fef0f0;
}

.essay-feedback {
  margin-top: 16px;
  border-left: 3px solid #409eff;
  padding-left: 12px;
}

.correct-answer {
  font-size: 14px;
  margin-bottom: 16px;
}

.scoring-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

/* 评分详情样式 */
.detail-section {
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.detail-heading {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 600;
}

.reason-list {
  padding-left: 0;
  list-style: none;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  color: #f56c6c;
}

.warning-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.keypoints-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keypoint-item {
  background: #f0f9eb;
  border-radius: 6px;
  padding: 10px;
}

.keypoint-item.missing {
  background: #fef0f0;
}

.keypoint-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.keypoint-text {
  margin-left: 8px;
  font-weight: 500;
}

.keypoint-comment {
  margin-left: 24px;
  font-size: 13px;
  color: #606266;
}

.contradiction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contradiction-item {
  display: flex;
  align-items: flex-start;
  background: #fef0f0;
  border-radius: 6px;
  padding: 10px;
}

.error-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.similarity-tag, .contradiction-tag {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
}

/* 评分结果部分 */
.score-result {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid #ebeef5;
}

/* 加载状态 */
.loading-state {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  color: #909399;
  font-style: italic;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 调试面板 */
.debug-panel {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
}

.debug-panel h3 {
  color: #606266;
  margin-top: 0;
  margin-bottom: 10px;
}

.debug-panel div {
  margin-bottom: 8px;
  font-family: monospace;
}

.retry-btn {
  margin-top: 10px;
  margin-bottom: 10px;
}

/* 优化过渡效果 */
.essay-feedback {
  transition: all 0.3s ease;
}

.detail-section {
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>