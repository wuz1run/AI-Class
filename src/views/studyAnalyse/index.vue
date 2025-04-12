<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Ref } from 'vue';
import { DateTime } from 'luxon';

export interface PredictedScore {
  subject: string;
  score: number;
}

export interface PredictedWeakness {
  question_type: string;
  accuracy: number;
}

export interface StudentPrediction {
  student_id: string;
  class_id: string;
  exam_id: number;
  predicted_scores: Record<string, number>;
  predicted_weaknesses: Record<string, number>;
}

export interface SubjectError {
  predicted_score: number;
  actual_score: number;
  absolute_error: number;
  squared_error: number;
}

export interface StudentPredictionError {
  student_id: string;
  subject_errors: Record<string, SubjectError>;
}

export interface PredictionResponse {
  prediction_id: string;
  created_at: string; // ISO日期字符串
  student_predictions: StudentPrediction[];
  class_predictions: Record<string, Record<string, number>>;
  prediction_errors?: StudentPredictionError[];
}

export interface PredictionRequest {
  use_cached_data: boolean;
  data_source: string; // 'api' 或 'local'
  model_type: string | null; // 可以指定使用哪种模型
  force_retrain: boolean; // 是否强制重新训练模型
}

// 状态管理
const predictions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const selectedPrediction = ref<PredictionResponse | null>(null);
const selectedStudentData = ref<any | null>(null);
const selectedClassData = ref<any | null>(null);

// 输入绑定
const studentId = ref('');
const classId = ref('');
const predictionId = ref('');
const newPredictionRequest = ref<PredictionRequest>({
  use_cached_data: false,
  data_source: 'api',
  model_type: null,
  force_retrain: false
});

// 加载所有预测历史
const loadPredictions = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get('/api1/v1/predictions/');
    predictions.value = response.data;
  } catch (err: any) {
    error.value = `加载预测历史失败: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// 创建新预测
const createPrediction = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.post('/api1/v1/predictions/', newPredictionRequest.value);
    selectedPrediction.value = response.data;
    await loadPredictions(); // 重新加载预测列表
    return response.data;
  } catch (err: any) {
    error.value = `创建预测失败: ${err.message}`;
    return null;
  } finally {
    loading.value = false;
  }
};

// 查看特定预测详情
const viewPrediction = async (id: string) => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get(`/api1/v1/predictions/${id}`);
    selectedPrediction.value = response.data;
    predictionId.value = id;
    // 清空学生和班级数据
    selectedStudentData.value = null;
    selectedClassData.value = null;
  } catch (err: any) {
    error.value = `加载预测详情失败: ${err.message}`;
    selectedPrediction.value = null;
  } finally {
    loading.value = false;
  }
};

// 查看学生预测结果
const viewStudentPrediction = async () => {
  if (!predictionId.value || !studentId.value) {
    error.value = '请输入预测ID和学生ID';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get(`/api1/v1/predictions/${predictionId.value}/student/${studentId.value}`);
    selectedStudentData.value = response.data;
    // 清空班级数据
    selectedClassData.value = null;
  } catch (err: any) {
    error.value = `加载学生预测失败: ${err.message}`;
    selectedStudentData.value = null;
  } finally {
    loading.value = false;
  }
};

// 查看班级预测结果
const viewClassPrediction = async () => {
  if (!predictionId.value || !classId.value) {
    error.value = '请输入预测ID和班级ID';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get(`/api1/v1/predictions/${predictionId.value}/class/${classId.value}`);
    selectedClassData.value = response.data;
    // 清空学生数据
    selectedStudentData.value = null;
  } catch (err: any) {
    error.value = `加载班级预测失败: ${err.message}`;
    selectedClassData.value = null;
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时加载数据
onMounted(() => {
  loadPredictions();
});
</script>

<template>
  <div class="prediction-system">
    <h1>学生成绩预测系统</h1>

    <!-- 错误信息显示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading">
      正在加载数据，请稍候...
    </div>

    <!-- 创建新预测 -->
    <div class="section create-prediction">
      <h2>创建新预测</h2>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="newPredictionRequest.use_cached_data">
          使用缓存数据
        </label>
      </div>
      <div class="form-group">
        <label>数据源:</label>
        <select v-model="newPredictionRequest.data_source">
          <option value="api">API</option>
          <option value="local">本地</option>
        </select>
      </div>
      <div class="form-group">
        <label>模型类型:</label>
        <input type="text" v-model="newPredictionRequest.model_type" placeholder="可选">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="newPredictionRequest.force_retrain">
          强制重新训练模型
        </label>
      </div>
      <button @click="createPrediction" :disabled="loading">创建新预测</button>
    </div>

    <!-- 预测历史列表 -->
    <div class="section prediction-history">
      <h2>预测历史</h2>
      <div v-if="predictions.length === 0 && !loading">
        暂无预测历史记录
      </div>
      <table v-else class="prediction-table">
        <thead>
        <tr>
          <th>编号</th>
          <th>预测ID</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(prediction, index) in predictions" :key="prediction.prediction_id">
          <td>{{ index + 1 }}</td>
          <td>{{ prediction.prediction_id }}</td>
          <td>{{ formatDate(prediction.created_at) }}</td>
          <td>
            <button @click="viewPrediction(prediction.prediction_id)">查看详情</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 查询特定学生或班级 -->
    <div class="section query-section">
      <h2>查询预测结果</h2>
      <div class="form-group">
        <label>预测ID:</label>
        <input type="text" v-model="predictionId" placeholder="输入预测ID">
      </div>

      <!-- 学生查询 -->
      <div class="query-student">
        <h3>学生成绩查询</h3>
        <div class="form-group">
          <label>学生ID:</label>
          <input type="text" v-model="studentId" placeholder="输入学生ID">
        </div>
        <button @click="viewStudentPrediction" :disabled="loading">查询学生成绩</button>
      </div>

      <!-- 班级查询 -->
      <div class="query-class">
        <h3>班级成绩查询</h3>
        <div class="form-group">
          <label>班级ID:</label>
          <input type="text" v-model="classId" placeholder="输入班级ID">
        </div>
        <button @click="viewClassPrediction" :disabled="loading">查询班级成绩</button>
      </div>
    </div>

    <!-- 显示选定的预测详情 -->
    <div v-if="selectedPrediction" class="section prediction-details">
      <h2>预测详情</h2>
      <div class="detail-item">
        <strong>预测ID:</strong> {{ selectedPrediction.prediction_id }}
      </div>
      <div class="detail-item">
        <strong>创建时间:</strong> {{ formatDate(selectedPrediction.created_at) }}
      </div>
      <div class="detail-item">
        <strong>预测学生数量:</strong> {{ selectedPrediction.student_predictions?.length || 0 }}
      </div>
    </div>

    <!-- 显示学生预测结果 -->
    <div v-if="selectedStudentData" class="section student-results">
      <h2>学生预测结果</h2>
      <div class="detail-item">
        <strong>学生ID:</strong> {{ selectedStudentData.student_id }}
      </div>

      <!-- 预测分数 -->
      <div class="student-scores">
        <h3>预测成绩</h3>
        <table class="result-table">
          <thead>
          <tr>
            <th>科目</th>
            <th>预测分数</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(score, subject) in selectedStudentData.predicted_scores" :key="subject">
            <td>{{ subject }}</td>
            <td>{{ score.toFixed(1) }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 薄弱点 -->
      <div class="student-weaknesses">
        <h3>薄弱点分析</h3>
        <table class="result-table">
          <thead>
          <tr>
            <th>题型</th>
            <th>正确率</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(accuracy, questionType) in selectedStudentData.predicted_weaknesses" :key="questionType">
            <td>{{ questionType }}</td>
            <td>{{ (accuracy * 100).toFixed(1) }}%</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 显示班级预测结果 -->
    <div v-if="selectedClassData" class="section class-results">
      <h2>班级预测结果</h2>
      <div class="detail-item">
        <strong>班级ID:</strong> {{ classId }}
      </div>

      <!-- 班级平均分 -->
      <div class="class-scores">
        <h3>班级平均分</h3>
        <table class="result-table">
          <thead>
          <tr>
            <th>科目</th>
            <th>平均分</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(score, subject) in selectedClassData" :key="subject">
            <td>{{ subject }}</td>
            <td>{{ score.toFixed(1) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prediction-system {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-top: 30px;
}

h3 {
  color: #3498db;
  margin-top: 20px;
}

.section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #7f8c8d;
}

.prediction-table,
.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.prediction-table th,
.prediction-table td,
.result-table th,
.result-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.prediction-table th,
.result-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.prediction-table tr:hover,
.result-table tr:hover {
  background-color: #f9f9f9;
}

.detail-item {
  margin-bottom: 10px;
}

.query-student,
.query-class {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prediction-system {
    padding: 10px;
  }

  .prediction-table th,
  .prediction-table td,
  .result-table th,
  .result-table td {
    padding: 8px;
    font-size: 14px;
  }
}
</style>