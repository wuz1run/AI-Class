<script setup lang="ts">
import { useQuizStore } from "../../stores/quizStore";
import { storeToRefs } from 'pinia';
import { ElCard, ElTag, ElEmpty, ElNotification, ElCheckbox, ElMessage, ElTabs, ElTabPane } from "element-plus";
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { getClassesAPI, getQuizAPI } from "../../apis";
import { useRequest } from "vue-hooks-plus";
import { releaseQuizAPI } from '../../apis';
import { type QuizData } from "../../stores/quizStore";
import { Loading } from "@element-plus/icons-vue";

const quizStore = useQuizStore();
const { jsonData } = storeToRefs(quizStore);
const quizGroups = ref<Array<any>>([]); // 用于存储按生成批次分组的习题
const currentGroupIndex = ref(0); // 当前选择的习题组索引
const currentGroup = ref<any>(null); // 当前选择的习题组
const quizList = ref<Array<any>>([]); // 当前显示的习题列表
const isReleasing = ref(false);
const selectAll = ref(false);
const isDeleting = ref(false);
const showDetailView = ref(false); // 控制是否显示详细习题视图

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
        // 获取并按批次分组习题
        const allQuizzes = (res['data'] || []).map(item => ({
          ...item,
          selected: false
        }));

        // 假设API没有返回批次信息，我们按照知识点标签来分组
        const groupedQuizzes = groupQuizzesByTag(allQuizzes);
        quizGroups.value = groupedQuizzes;

        if (groupedQuizzes.length > 0) {
          currentGroupIndex.value = 0;
          currentGroup.value = groupedQuizzes[0];
          quizList.value = groupedQuizzes[0].quizzes;
        }
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

// 从store获取习题
const fetchQuizFromStore = () => {
  // 监听store中的jsonData变化
  watch(() => jsonData.value, (newValue) => {
    if (newValue && typeof newValue === 'string') {
      try {
        // 解析JSON数据
        const parsedData = JSON.parse(newValue);

        // 将新生成的习题添加到组中
        const timestamp = new Date().toLocaleString();
        const newGroup = {
          id: Date.now(),
          title: `习题组 - ${timestamp}`,
          tag: extractMainTag(parsedData),
          timestamp: timestamp,
          quizzes: parsedData.map(item => ({
            ...item,
            selected: false
          })),
          count: parsedData.length
        };

        quizGroups.value.unshift(newGroup);
        currentGroupIndex.value = 0;
        currentGroup.value = newGroup;
        quizList.value = newGroup.quizzes;

        ElNotification({
          title: '成功',
          message: `成功生成${parsedData.length}道习题`,
          type: 'success',
        });
      } catch (error) {
        ElNotification({
          title: '错误',
          message: '解析习题数据失败',
          type: 'error',
        });
      }
    }
  }, { immediate: true });
}

// 提取主要知识点标签作为组标题
const extractMainTag = (quizzes) => {
  if (!quizzes || !quizzes.length) return '未知知识点';

  // 统计标签出现次数
  const tagCounts = {};
  quizzes.forEach(quiz => {
    if (quiz.tag) {
      tagCounts[quiz.tag] = (tagCounts[quiz.tag] || 0) + 1;
    }
  });

  // 找出出现最多的标签
  let mainTag = '未知知识点';
  let maxCount = 0;

  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mainTag = tag;
    }
  }

  return mainTag;
}

// 按标签分组习题
const groupQuizzesByTag = (quizzes) => {
  const groups = [];
  const tagMap = {};

  quizzes.forEach(quiz => {
    const tag = quiz.tag || '未分类';
    if (!tagMap[tag]) {
      const newGroup = {
        id: Date.now() + Math.random(),
        title: `${tag}`,
        tag: tag,
        timestamp: new Date().toLocaleString(),
        quizzes: [quiz],
        count: 1
      };
      groups.push(newGroup);
      tagMap[tag] = newGroup;
    } else {
      tagMap[tag].quizzes.push(quiz);
      tagMap[tag].count++;
    }
  });

  return groups;
}

// 选择习题组
const selectQuizGroup = (group) => {
  currentGroup.value = group;
  quizList.value = group.quizzes;
  selectAll.value = false;
  showDetailView.value = true;
}

// 返回到便签视图
const backToOverview = () => {
  showDetailView.value = false;
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

// 删除选中习题
const deleteSelectedQuiz = () => {
  const selectedQuestions = quizList.value.filter(item => item.selected);

  if (selectedCount.value === 0) {
    ElNotification({
      title: '警告',
      message: '请至少选择一个题目进行删除',
      type: 'warning',
    });
    return;
  }

  isDeleting.value = true;
  setTimeout(() => {
    // 从当前组中移除选中的习题
    quizList.value = quizList.value.filter(item => !item.selected);
    currentGroup.value.quizzes = quizList.value;
    currentGroup.value.count = quizList.value.length;

    // 如果当前组的习题全部被删除，则返回便签视图
    if (quizList.value.length === 0) {
      quizGroups.value = quizGroups.value.filter(group => group.id !== currentGroup.value.id);
      showDetailView.value = false;
    }

    selectAll.value = false;

    ElNotification({
      title: 'Success',
      message: '习题删除成功',
      type: 'success',
    });

    isDeleting.value = false;
  }, 800);
}

// 删除整个习题组
const deleteQuizGroup = (group, event) => {
  event.stopPropagation(); // 阻止事件冒泡

  quizGroups.value = quizGroups.value.filter(g => g.id !== group.id);

  ElNotification({
    title: 'Success',
    message: '习题组删除成功',
    type: 'success',
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
      <h1>{{ showDetailView ? '习题详情' : '习题预览' }}</h1>

      <!-- 详细视图的返回按钮 -->
      <div v-if="showDetailView" class="back-button">
        <el-button @click="backToOverview" type="text" icon="el-icon-back">
          返回便签视图
        </el-button>
      </div>

      <!-- 详细视图的统计信息 -->
      <div v-if="showDetailView">
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
    </div>

    <!-- 习题便签视图 -->
    <div v-if="!showDetailView" class="quiz-notes-container">
      <div v-if="quizGroups.length === 0" class="empty-wrapper">
        <el-empty description="暂无习题，请先生成习题" />
      </div>

      <div v-else class="quiz-notes-grid">
        <el-card
            v-for="(group, index) in quizGroups"
            :key="group.id"
            class="quiz-note-card"
            shadow="hover"
            @click="selectQuizGroup(group)"
        >
          <div class="note-header">
            <h3>{{ group.title }}</h3>
            <el-button
                class="delete-btn"
                type="danger"
                size="small"
                circle
                @click="deleteQuizGroup(group, $event)"
            >
              X
            </el-button>
          </div>

          <div class="note-content">
            <p class="note-info">
              <el-tag size="small" type="info">{{ group.timestamp }}</el-tag>
            </p>
            <p class="note-info">
              <el-tag size="small" type="primary">习题数量: {{ group.count }}</el-tag>
            </p>
            <div class="note-stats">
              <el-tag size="small" type="success">
                选择题: {{ group.quizzes.filter(q => q.type === 'choice').length }}
              </el-tag>
              <el-tag size="small" type="warning">
                填空题: {{ group.quizzes.filter(q => q.type === 'cloze').length }}
              </el-tag>
              <el-tag size="small" type="danger">
                简答题: {{ group.quizzes.filter(q => q.type === 'short_answer').length }}
              </el-tag>
            </div>
          </div>

          <div class="note-footer">
            <span>点击查看详情</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 详细习题视图 -->
    <div v-if="showDetailView" class="quiz-list">
      <div v-if="questionCount === 0" class="empty-wrapper">
        <el-empty description="此组中没有习题" />
      </div>

      <el-card
          v-else
          v-for="(quiz, index) in quizList"
          :key="index"
          class="quiz-item"
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
                :type="quiz.type === 'choice' ? 'success' :
                    quiz.type === 'cloze' ? 'warning' : 'danger'"
                size="small"
            >
              {{ quiz.type === 'choice' ? '选择题' :
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

      <div v-if="questionCount > 0" class="class-selection">
        <select
            v-model="selectedClass"
            class="select select-bordered"
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

        <span v-if="membersLoading" class="loading-text">
          <el-icon class="animate-spin"><Loading /></el-icon>
          加载中...
        </span>
      </div>

      <div v-if="questionCount > 0" class="action-buttons">
        <el-button
            @click="releaseQuiz"
            :loading="isReleasing"
            type="primary"
            :disabled="selectedCount === 0"
        >
          发布选中习题 ({{ selectedCount }})
        </el-button>
        <el-button
            @click="deleteSelectedQuiz"
            :loading="isDeleting"
            type="danger"
            :disabled="selectedCount === 0"
        >
          删除选中习题 ({{ selectedCount }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-header {
  margin-bottom: 30px;
  text-align: center;
}

.back-button {
  margin-bottom: 20px;
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
  flex-wrap: wrap;
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

/* 习题便签视图样式 */
.quiz-notes-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quiz-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.quiz-note-card {
  height: 220px;
  transition: all 0.3s ease;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.quiz-note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.note-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  font-size: 12px;
  padding: 2px;
  min-height: 24px;
  width: 24px;
  height: 24px;
}

.note-content {
  flex-grow: 1;
}

.note-info {
  margin: 8px 0;
}

.note-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.note-footer {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

/* 详细习题视图样式 */
.quiz-list {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.quiz-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 100%;
}

.quiz-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.quiz-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  flex-shrink: 0;
}

.option-text {
  word-break: break-word;
}

.answer-area {
  margin-top: 20px;
  padding: 12px;
  background: #f3f8ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.answer-text {
  font-family: monospace;
  font-size: 16px;
  color: #2c3e50;
  word-break: break-word;
}

.class-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto 20px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
}

.select {
  width: 100%;
  max-width: 1024px;
  height: 42px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin: 20px auto;
  gap: 15px;
  width: 100%;
}

.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .preview-container {
    padding: 15px 10px;
  }

  .quiz-notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .selection-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .stats {
    flex-direction: column;
    align-items: center;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media screen and (max-width: 480px) {
  .preview-container {
    padding: 10px 5px;
  }

  .quiz-notes-grid {
    grid-template-columns: 1fr;
  }

  .quiz-meta {
    width: 100%;
    margin-top: 8px;
  }

  .question-text {
    font-size: 15px;
  }

  .option-item {
    padding: 8px;
  }

  .answer-area {
    padding: 8px;
  }
}
</style>