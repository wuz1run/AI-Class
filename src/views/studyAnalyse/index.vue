<template>
  <div class="prediction-system">
    <div class="header">
      <div class="logo">
        <i class="fas fa-chart-line"></i>
        <h1>智能学情分析系统</h1>
      </div>
    </div>

    <!-- 错误信息显示 -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading">
      <div class="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>正在加载数据，请稍候...</p>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div class="sidebar-tabs">
          <div
              :class="['tab', { active: activeTab === 'create' }]"
              @click="activeTab = 'create'"
          >
            <i class="fas fa-plus-circle"></i>
            <span>创建预测</span>
          </div>
          <div
              :class="['tab', { active: activeTab === 'history' }]"
              @click="activeTab = 'history'"
          >
            <i class="fas fa-history"></i>
            <span>预测历史</span>
          </div>
          <div
              :class="['tab', { active: activeTab === 'query' }]"
              @click="activeTab = 'query'"
          >
            <i class="fas fa-search"></i>
            <span>查询结果</span>
          </div>
        </div>

        <div class="sidebar-content">
          <!-- 创建新预测 -->
          <div v-if="activeTab === 'create'" class="create-prediction">
            <h2><i class="fas fa-magic"></i> 创建新预测</h2>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="newPredictionRequest.use_cached_data">
                <span>使用缓存数据</span>
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="newPredictionRequest.force_retrain">
                <span>强制重新训练模型</span>
              </label>
            </div>
            <button class="primary-button" @click="createPrediction" :disabled="loading">
              <i class="fas fa-bolt"></i> 创建新预测
            </button>
            <div class="form-group">
              <input
                  type="file"
                  ref="fileInput"
                  hidden
                  accept=".xlsx,.xls"
                  @change="uploadStudentData"
              >
              <button
                  class="primary-button"
                  @click="$refs.fileInput.click()"
                  :disabled="loading"
                  style="margin-top: 12px;"
              >
                <i class="fas fa-file-excel"></i> 上传学生数据
              </button>
            </div>
          </div>

          <!-- 预测历史列表 -->
          <div v-if="activeTab === 'history'" class="prediction-history">
            <h2><i class="fas fa-history"></i> 预测历史</h2>
            <div v-if="predictions.length === 0 && !loading" class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>暂无预测历史记录</p>
            </div>
            <ul class="history-list" v-else>
              <li v-for="(prediction, index) in predictions" :key="prediction.prediction_id"
                  @click="viewPrediction(prediction.prediction_id)"
                  :class="{ active: predictionId === prediction.prediction_id }">
                <div class="prediction-item">
                  <div class="prediction-number">{{ index + 1 }}</div>
                  <div class="prediction-info">
                    <div class="prediction-id">{{ prediction.prediction_id.substring(0, 8) }}...</div>
                    <div class="prediction-date">{{ formatDate(prediction.created_at) }}</div>
                  </div>
                  <i class="fas fa-chevron-right"></i>
                </div>
              </li>
            </ul>
          </div>

          <!-- 查询特定学生或班级 -->
          <div v-if="activeTab === 'query'" class="query-section">
            <h2><i class="fas fa-search"></i> 查询预测结果</h2>
            <div class="form-group">
              <label>预测ID:</label>
              <div class="input-with-icon">
                <i class="fas fa-fingerprint"></i>
                <input type="text" v-model="predictionId" placeholder="输入预测ID">
              </div>
            </div>

            <!-- 学生查询 -->
            <div class="query-student">
              <h3><i class="fas fa-user-graduate"></i> 学生预测成绩查询</h3>
              <div class="form-group">
                <label>学生ID:</label>
                <div class="input-with-icon">
                  <i class="fas fa-id-card"></i>
                  <input type="text" v-model="studentId" placeholder="输入学生ID">
                </div>
              </div>
              <button class="primary-button" @click="viewStudentPrediction" :disabled="loading">
                <i class="fas fa-search"></i> 查询预测学生成绩
              </button>
            </div>

            <!-- 班级查询 -->
            <div class="query-class">
              <h3><i class="fas fa-users"></i> 班级预测成绩查询</h3>
              <div class="form-group">
                <label>班级ID:</label>
                <div class="input-with-icon">
                  <i class="fas fa-school"></i>
                  <input type="text" v-model="classId" placeholder="输入班级ID">
                </div>
              </div>
              <button class="primary-button" @click="viewClassPrediction" :disabled="loading">
                <i class="fas fa-search"></i> 查询预测班级成绩
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <!-- 欢迎页面 -->
        <div v-if="!selectedPrediction && !selectedStudentData && !selectedClassData" class="welcome-panel">
          <div class="welcome-content">
            <i class="fas fa-chart-bar welcome-icon"></i>
            <h2>欢迎使用智能学情分析系统</h2>
            <p>通过左侧面板预测学生下一次考试成绩并分析</p>
          </div>
        </div>

        <!-- 显示选定的预测详情 -->
        <div v-if="selectedPrediction && !selectedStudentData && !selectedClassData" class="prediction-info-panel">
          <div class="card">
            <h2><i class="fas fa-info-circle"></i> 预测基本信息</h2>
            <div class="info-grid">
              <div class="info-item">
                <i class="fas fa-fingerprint"></i>
                <div>
                  <h4>预测ID</h4>
                  <p>{{ selectedPrediction.prediction_id }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <h4>创建时间</h4>
                  <p>{{ formatDate(selectedPrediction.created_at) }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-user-graduate"></i>
                <div>
                  <h4>预测学生数量</h4>
                  <p>{{ selectedPrediction.student_predictions?.length || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 修改后的学生预测结果部分 -->
        <div v-if="selectedStudentData" class="student-results">
          <div class="student-header">
            <h2><i class="fas fa-user-graduate"></i> 学生预测分析</h2>
            <div class="student-id">
              <span>学生ID:</span> {{ selectedStudentData.student_id }}
            </div>
          </div>

          <div class="student-results-container">
            <!-- 预测成绩数据卡片 -->
            <div class="chart-card">
              <h3><i class="fas fa-award"></i> 预测成绩数据</h3>
              <div class="score-cards">
                <div v-for="(score, subject) in selectedStudentData.predicted_scores"
                     :key="subject" class="score-card">
                  <div class="score-value">{{ score.toFixed(1) }}</div>
                  <div class="score-subject">{{ subject }}</div>
                </div>
              </div>
            </div>
            <!-- 添加三个图表容器 -->
            <div class="charts-container">
              <!-- 饼图 -->
              <div class="chart-card">
                <h3><i class="fas fa-chart-pie"></i> 预测成绩分布</h3>
                <div ref="pieChartRef" class="chart-inner"></div>
              </div>

              <!-- 折线图 -->
              <div class="chart-card">
                <h3><i class="fas fa-chart-line"></i> 预测成绩横向对比</h3>
                <div ref="lineChartRef" class="chart-inner"></div>
              </div>

              <!-- 雷达图 -->
              <div class="chart-card">
                <h3><i class="fas fa-chart-radar"></i> 学科能力分布</h3>
                <div ref="radarChartRef" class="chart-inner"></div>
              </div>
            </div>
            <!-- 薄弱点详细分析 -->
            <div class="weakness-analysis card">
              <h3><i class="fas fa-exclamation-triangle"></i> 薄弱点详细分析</h3>
              <div
                  v-if="
    selectedStudentData?.predicted_weaknesses &&
    Object.keys(selectedStudentData.predicted_weaknesses).length > 0
  "
                  class="weakness-bars"
              >
                <div v-for="(accuracy, questionType) in selectedStudentData.predicted_weaknesses"
                     :key="questionType" class="weakness-bar">
                  <div class="weakness-label">{{ questionType }}</div>
                  <div class="progress-container">
                    <div class="progress-bar" :style="{ width: `${accuracy * 100}%` }"></div>
                    <div class="progress-text">{{ (accuracy * 100).toFixed(1) }}%</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>该学生无明显薄弱点</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 优化后的班级预测结果部分 -->
        <div v-if="selectedClassData" class="class-results">
          <div class="class-header">
            <h2><i class="fas fa-users"></i> 班级成绩分析</h2>
            <div class="class-id">
              <span>班级ID:</span> {{ classId }}
            </div>
          </div>

          <div class="class-results-container">
            <!-- 核心科目仪表盘 - 放在顶部，占据整行 -->
            <div class="chart-card gauge-chart-wrapper">
              <h3><i class="fas fa-tachometer-alt"></i> 核心科目达标情况</h3>
              <div ref="gaugeChartRef" class="chart-inner">
                <!-- 当加载时显示的加载指示器 -->
                <div v-if="loading" class="chart-loading">
                  <div class="chart-loading-spinner"></div>
                </div>
              </div>
            </div>

            <!-- 两栏布局图表区域 -->
            <div class="two-column-charts">
              <!-- 横向柱状图 -->
              <div class="chart-card">
                <h3><i class="fas fa-chart-bar"></i> 各科平均分对比</h3>
                <div ref="barChartRef" class="chart-inner"></div>
              </div>

              <!-- 班级雷达图 -->
              <div class="chart-card">
                <h3><i class="fas fa-chart-radar"></i> 学科均衡性分析</h3>
                <div ref="classRadarChartRef" class="chart-inner"></div>
              </div>
            </div>

            <!-- 班级数据卡片区域 -->
            <div class="chart-card">
              <h3><i class="fas fa-graduation-cap"></i> 班级下次预测各科平均分</h3>
              <div class="class-data-grid">
                <div v-for="(score, subject) in selectedClassData" :key="subject"
                     class="class-data-card">
                  <div class="subject-name">{{ subject }}</div>
                  <div class="average-score">{{ score.toFixed(1) }}</div>
                  <div class="subject-icon">
                    <i :class="{
              '语文': 'fas fa-book',
              '数学': 'fas fa-calculator',
              '英语': 'fas fa-language',
              '物理': 'fas fa-atom',
              '化学': 'fas fa-flask'
            }[subject] || 'fas fa-graduation-cap'"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref, onMounted, computed, watch, onUnmounted} from 'vue';
import axios from 'axios';
import * as echarts from 'echarts'; // 导入ECharts

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
  historical_scores?: Record<string, number[]>;
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
  created_at: string;
  student_predictions: StudentPrediction[];
  class_predictions: Record<string, Record<string, number>>;
  prediction_errors?: StudentPredictionError[];
}

export interface PredictionRequest {
  use_cached_data: boolean;
  force_retrain: boolean;
}

// 状态管理
const predictions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const selectedPrediction = ref<PredictionResponse | null>(null);
const selectedStudentData = ref<any | null>(null);
const selectedClassData = ref<any | null>(null);
const activeTab = ref('create');
// 在原有状态管理下方添加图表引用
const pieChartRef = ref(null);
const lineChartRef = ref(null);
const radarChartRef = ref(null);
let pieChart = null;
let lineChart = null;
let radarChart = null;
const barChartRef = ref(null);
const classRadarChartRef = ref(null);
const gaugeChartRef = ref(null);
let barChart: echarts.ECharts | null = null;
let classRadarChart: echarts.ECharts | null = null;
let gaugeChart: echarts.ECharts | null = null;

// 输入绑定
const studentId = ref('');
const classId = ref('');
const predictionId = ref('');
const newPredictionRequest = ref<PredictionRequest>({
  use_cached_data: false,
  force_retrain: false
});

// 加载所有预测历史
const loadPredictions = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get('http://106.55.62.201:8000/api1/v1/predictions/');
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
    const response = await axios.post('http://106.55.62.201:8000/api1/v1/predictions/', {
      ...newPredictionRequest.value,
      data_source: 'api',
      model_type: null
    });
    selectedPrediction.value = response.data;
    await loadPredictions();
    activeTab.value = 'query'; // 自动切换到查询标签
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
    const response = await axios.get(`http://106.55.62.201:8000/api1/v1/predictions/${id}`);
    selectedPrediction.value = response.data;
    predictionId.value = id;
    selectedStudentData.value = null;
    selectedClassData.value = null;
    // 添加这行
    setTimeout(() => {
      initClassCharts();
    }, 300);
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
    const response = await axios.get(`http://106.55.62.201:8000/api1/v1/predictions/${predictionId.value}/student/${studentId.value}`);
    console.log('API响应数据：', response.data);
    selectedStudentData.value = response.data;
    console.log('预测分数：', selectedStudentData.value.predicted_scores);
    selectedClassData.value = null;
    // 添加此行：在数据加载完成后初始化图表
    setTimeout(() => {
      initCharts();
    }, 300);
  } catch (err: any) {
    error.value = `加载学生预测失败: ${err.message}`;
    selectedStudentData.value = null;
  } finally {
    loading.value = false;
  }
};
const fileInput = ref(null);

const uploadStudentData = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  loading.value = true;
  error.value = '';

  const formData = new FormData();
  formData.append('file', input.files[0]);

  try {
    const response = await axios.post(
        'http://106.55.62.201:8000/api1/v1/excel/upload-excel',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
    );
    // 上传成功后刷新预测数据
    await loadPredictions();
    error.value = '文件上传成功！';
  } catch (err: any) {
    error.value = `上传失败: ${err.response?.data?.message || err.message}`;
  } finally {
    loading.value = false;
    // 清空文件选择
    input.value = '';
  }
};
// 添加图表初始化和更新的函数
const initCharts = () => {
  if (!selectedStudentData.value || !selectedStudentData.value.predicted_scores) return;

  // 准备数据
  const subjects = Object.keys(selectedStudentData.value.predicted_scores);
  const scores = subjects.map(subject => selectedStudentData.value.predicted_scores[subject]);

  // 初始化饼图
  initPieChart(subjects, scores);

  // 初始化折线图
  initLineChart(subjects, scores);

  // 初始化雷达图
  initRadarChart(subjects, scores);

  // 处理窗口大小变化时的图表自适应
  window.addEventListener('resize', () => {
    pieChart?.resize();
    lineChart?.resize();
    radarChart?.resize();
  });
};
// 初始化饼图
const initPieChart = (subjects, scores) => {
  // 如果已存在图表实例则销毁
  if (pieChart) pieChart.dispose();

  // 获取DOM元素
  const chartDom = pieChartRef.value;
  if (!chartDom) return;

  // 创建图表实例
  pieChart = echarts.init(chartDom);

  // 设置图表配置项
  const option = {
    title: {
      text: '预测成绩分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: subjects
    },
    series: [
      {
        name: '预测分数',
        type: 'pie',
        radius: '60%',
        center: ['50%', '60%'],
        data: subjects.map((subject, index) => ({
          name: subject,
          value: scores[index]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 使用配置项显示图表
  pieChart.setOption(option);
};
// 初始化折线图
const initLineChart = (subjects, scores) => {
  // 如果已存在图表实例则销毁
  if (lineChart) lineChart.dispose();

  // 获取DOM元素
  const chartDom = lineChartRef.value;
  if (!chartDom) return;

  // 创建图表实例
  lineChart = echarts.init(chartDom);

  // 设置图表配置项
  const option = {
    title: {
      text: '预测成绩横向对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: subjects
    },
    yAxis: {
      type: 'value',
      min: function(value) {
        return Math.max(0, Math.floor(value.min) - 10);
      }
    },
    series: [
      {
        name: '预测分数',
        type: 'line',
        data: scores,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: '平均分' }]
        }
      }
    ]
  };

  // 使用配置项显示图表
  lineChart.setOption(option);
};

// 初始化雷达图
const initRadarChart = (subjects, scores) => {
  // 如果已存在图表实例则销毁
  if (radarChart) radarChart.dispose();

  // 获取DOM元素
  const chartDom = radarChartRef.value;
  if (!chartDom) return;

  // 创建图表实例
  radarChart = echarts.init(chartDom);

  // 设置图表配置项
  const option = {
    title: {
      text: '学科能力分布',
      left: 'center'
    },
    tooltip: {},
    radar: {
      indicator: subjects.map(subject => ({ name: subject, max: 100 }))
    },
    series: [
      {
        name: '预测成绩',
        type: 'radar',
        data: [
          {
            value: scores,
            name: '学科能力',
            areaStyle: {
              opacity: 0.3
            }
          }
        ]
      }
    ]
  };

  // 使用配置项显示图表
  radarChart.setOption(option);
};
// 监听数据变化，更新图表
watch(
    () => selectedStudentData.value,
    (newVal) => {
      if (newVal) {
        setTimeout(() => {
          initCharts();
        }, 300);
      }
    }
);
// 组件卸载时清除图表实例
onUnmounted(() => {
  if (pieChart) pieChart.dispose();
  if (lineChart) lineChart.dispose();
  if (radarChart) radarChart.dispose();
  window.removeEventListener('resize', () => {});
});

// 查看班级预测结果
const viewClassPrediction = async () => {
  if (!predictionId.value || !classId.value) {
    error.value = '请输入预测ID和班级ID';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get(`http://106.55.62.201:8000/api1/v1/predictions/${predictionId.value}/class/${classId.value}`);
    selectedClassData.value = response.data;
    selectedStudentData.value = null;
  } catch (err: any) {
    error.value = `加载班级预测失败: ${err.message}`;
    selectedClassData.value = null;
  } finally {
    loading.value = false;
  }
};
// 班级图表初始化主函数
const initClassCharts = () => {
  if (!selectedClassData.value) return;
  // 检查DOM元素是否存在
  if (!barChartRef.value || !classRadarChartRef.value || !gaugeChartRef.value) {
    console.error('图表容器元素未找到');
    // 可能是DOM尚未更新，再次尝试
    setTimeout(() => initClassCharts(), 100);
    return;
  }

  const subjects = Object.keys(selectedClassData.value);
  const scores = subjects.map(subject => selectedClassData.value[subject]);

  initBarChart(subjects, scores);
  initClassRadarChart(subjects, scores);
  initGaugeChart(subjects, scores);
};

// 横向柱状图
const initBarChart = (subjects: string[], scores: number[]) => {
  if (barChart) barChart.dispose();

  const chartDom = barChartRef.value;
  if (!chartDom) return;

  barChart = echarts.init(chartDom);

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'value',
      max: 100,
      name: '平均分',
      axisLabel: { formatter: '{value} 分' }
    },
    yAxis: {
      type: 'category',
      data: subjects,
      axisLabel: {
        rotate: 30,
        formatter: (value: string) => value.substring(0, 4) // 缩略科目名称
      }
    },
    series: [{
      type: 'bar',
      data: scores,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#36a3eb' },
          { offset: 1, color: '#9bcdff' }
        ])
      }
    }]
  };

  barChart.setOption(option);
};

// 班级雷达图
const initClassRadarChart = (subjects: string[], scores: number[]) => {
  if (classRadarChart) classRadarChart.dispose();

  const chartDom = classRadarChartRef.value;
  if (!chartDom) return;

  classRadarChart = echarts.init(chartDom);

  const option = {
    radar: {
      indicator: subjects.map(subject => ({
        name: subject,
        max: Math.ceil(Math.max(...scores) + 5)
      })),
      shape: 'polygon',
      splitArea: { show: false }
    },
    series: [{
      type: 'radar',
      data: [{
        value: scores,
        areaStyle: {
          color: 'rgba(255,153,0,0.3)',
          opacity: 0.3
        },
        lineStyle: { width: 2 }
      }]
    }]
  };

  classRadarChart.setOption(option);
};

// 在initGaugeChart函数中添加设备检测逻辑
const initGaugeChart = (subjects, scores) => {
  if (gaugeChart) gaugeChart.dispose();

  const chartDom = gaugeChartRef.value;
  if (!chartDom) return;

  gaugeChart = echarts.init(chartDom);

  // 只显示前三核心科目
  const coreSubjects = subjects.slice(0, 3);

  // 检测是否为移动设备
  const isMobile = window.innerWidth <= 768;

  // 根据设备类型调整布局
  const option = {
    grid: {
      top: '5%',
      left: '5%',
      right: '5%',
      bottom: '5%',
      containLabel: true
    },
    series: coreSubjects.map((subject, index) => ({
      type: 'gauge',
      // 在移动端垂直排列，桌面端水平排列
      center: isMobile
          ? ['50%', `${25 + index * 30}%`]  // 移动端垂直排列
          : [`${25 + index * 25}%`, '55%'], // 桌面端水平排列
      radius: isMobile ? '60%' : '70%',
      min: 0,
      max: 100,
      splitNumber: 10,
      progress: { show: true, width: 12 },
      axisLine: { lineStyle: { width: 12 } },
      axisTick: { show: false },
      splitLine: { length: 15 },
      axisLabel: {
        distance: 25,
        color: '#666',
        fontSize: isMobile ? 8 : 10, // 移动端更小的字体
      },
      title: {
        show: true,
        offsetCenter: [0, '30%'],
        fontSize: isMobile ? 12 : 14,
        color: '#333'
      },
      detail: {
        valueAnimation: true,
        fontSize: isMobile ? 16 : 18,
        offsetCenter: [0, '-10%'],
        formatter: '{value}分',
        color: '#409EFF'
      },
      data: [{
        value: scores[index],
        name: subject
      }]
    }))
  };

  gaugeChart.setOption(option);

  // 强制重新计算和渲染
  setTimeout(() => {
    gaugeChart.resize();
  }, 200);
};
// 监听班级数据变化
watch(
    () => selectedClassData.value,
    (newVal) => {
      if (newVal) {
        setTimeout(() => {
          initClassCharts();
        }, 300);
      }
    }
);

// 窗口大小变化处理
window.addEventListener('resize', () => {
  barChart?.resize();
  classRadarChart?.resize();
  gaugeChart?.resize();
});

// 组件卸载时清理
onUnmounted(() => {
  barChart?.dispose();
  classRadarChart?.dispose();
  gaugeChart?.dispose();
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时加载数据
onMounted(() => {
  loadPredictions();

  // 为了演示，模拟一些数据
  setTimeout(() => {
    if (predictions.value.length > 0) {
      predictionId.value = predictions.value[0].prediction_id;
    }
  }, 1000);
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #4361ee;
  --primary-light: #4895ef;
  --primary-dark: #3a0ca3;
  --secondary-color: #f72585;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --grey-color: #6c757d;
  --grey-light: #e9ecef;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  background-color: #f5f7fb;
  color: #333;
}

.prediction-system {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 顶部导航 */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 1rem 2rem;
  box-shadow: var(--shadow);
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo i {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

/* 调整主内容区域 */
.main-content {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 300px 1fr;
}

/* 侧边栏 */
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--grey-light);
}

.tab {
  flex: 1;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 3px solid transparent;
  color: var(--grey-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tab i {
  font-size: 1.2rem;
}

.tab.active {
  color: var(--primary-color);
  border-bottom: 3px solid var(--primary-color);
  background-color: rgba(67, 97, 238, 0.05);
}

.tab:hover:not(.active) {
  background-color: var(--grey-light);
}

.sidebar-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* 内容区域 */
.content {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #f5f7fb;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark-color);
}

input[type="text"],
select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: var(--radius);
  font-size: 0.9rem;
  transition: var(--transition);
}

input[type="text"]:focus,
select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  outline: none;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--grey-color);
}

.input-with-icon input {
  padding-left: 2.5rem;
}

/* 按钮样式 */
.primary-button {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.primary-button:disabled {
  background: var(--grey-color);
  cursor: not-allowed;
}

/* 错误和加载状态 */
.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--danger-color);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 新的加载动画 - 三点脉冲 */
.loading-dots {
  display: flex;
  align-items: center;
}

.loading-dots div {
  width: 12px;
  height: 12px;
  margin: 0 6px;
  background-color: var(--primary-color);
  border-radius: 50%;
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

/* 为每个点设置动画延迟，产生依次脉冲效果 */
.loading-dots div:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots div:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots div:nth-child(3) {
  animation-delay: 0s;
}

/* 定义脉冲动画 */
@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.8;
  }
  40% {
    transform: scale(1.0);
    opacity: 1;
  }
}

/* (可选) 如果你希望加载文字也显示 */
.loading p {
  margin-top: 1rem;
  color: var(--dark-color);
  font-weight: 600;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.4rem;
  color: var(--dark-color);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h3 {
  font-size: 1.1rem;
  color: var(--dark-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 预测历史列表 */
.history-list {
  list-style: none;
}

.prediction-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  border-left: 3px solid transparent;
}

.prediction-item:hover {
  background-color: rgba(67, 97, 238, 0.05);
}

.prediction-item.active {
  background-color: rgba(67, 97, 238, 0.1);
  border-left: 3px solid var(--primary-color);
}

.prediction-number {
  width: 30px;
  height: 30px;
  background-color: var(--primary-light);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.prediction-info {
  flex: 1;
}

.prediction-id {
  font-weight: 600;
  color: var(--dark-color);
}

.prediction-date {
  font-size: 0.8rem;
  color: var(--grey-color);
}

/* 学生预测结果 */
.student-header, .class-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.student-id, .class-id {
  background-color: var(--light-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark-color);
}

.student-id span, .class-id span {
  font-weight: normal;
  color: var(--grey-color);
  margin-right: 0.5rem;
}

/* 学生结果新布局样式 */
.student-results-container {
  margin-bottom: 1.5rem;
}

/* 图表卡片样式 */
.chart-card {
  background-color: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  border: 1px solid var(--grey-light);
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.chart-card h3 {
  margin-bottom: 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--grey-light);
  padding-bottom: 0.8rem;
}

.chart-card h3 i {
  color: var(--primary-light);
}

/* 成绩综合展示卡片（小卡片） */
.score-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.score-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: var(--transition);
}

.score-card:hover {
  transform: translateY(-3px);
  box-shadow: 0.3;
};

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.2rem;
}

.score-subject {
  font-size: 0.85rem;
  color: var(--grey-color);
  font-weight: 600;
}

/* 薄弱点分析样式 */
.weakness-analysis.card { /* 继承 card 样式 */
  margin-top: 1.5rem; /* 与上方图表网格的间距 */
}

.weakness-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 每个条目间距 */
}

.weakness-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weakness-label {
  width: 120px; /* 固定标签宽度 */
  font-size: 0.9rem;
  color: var(--dark-color);
  text-align: right;
  flex-shrink: 0; /* 防止标签宽度被压缩 */
  white-space: nowrap; /* 防止标签换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超长时显示省略号 */
  cursor: default; /* 防止文本选择 */
}

.progress-container {
  flex-grow: 1;
  background-color: var(--grey-light);
  border-radius: 20px; /* 圆角 */
  height: 20px; /* 进度条高度 */
  position: relative; /* 用于定位文字 */
  overflow: hidden; /* 隐藏超出部分的进度条 */
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color); /* 默认颜色 */
  border-radius: 20px;
  transition: width 0.5s ease-in-out; /* 宽度变化动画 */
  position: absolute;
  left: 0;
  top: 0;
}

/* 可以根据准确率给进度条不同颜色 (示例) */
.progress-bar.low { /* 例如低于60% */
  background-color: var(--warning-color);
}
.progress-bar.medium { /* 例如60%-80% */
  background-color: var(--primary-light);
}
/* 高于80% 使用默认 primary-color */


.progress-text {
  position: absolute;
  right: 10px; /* 距离右侧距离 */
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: white; /* 白色文字 */
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2); /* 文字阴影增加可读性 */
}

/* 调整班级结果布局 */
.class-results-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左右两栏布局 */
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.class-chart-container,
.class-data-container {
  display: flex;
  flex-direction: column;
}

.full-height {
  height: 100%; /* 使图表卡片占满容器高度 */
}

/* 调整班级数据网格样式，使其在卡片内垂直居中 */
.class-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  height: 100%;
  align-content: center; /* 垂直居中数据卡片 */
}

.class-data-card {
  min-height: 120px; /* 给定最小高度 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 内容垂直居中 */
}

/* 班级数据网格 */
.class-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* 班级卡片可以稍宽 */
  gap: 1rem;
  margin-top: 1rem; /* 与图表或其他内容的间距 */
}

.class-data-card {
  background-color: var(--light-color);
  border-radius: var(--radius);
  padding: 1.5rem 0.5rem 1rem 0.5rem; /* 顶部留出更多空间给图标 */
  text-align: center;
  border: 1px solid var(--grey-light);
  position: relative; /* 用于图标定位 */
  transition: var(--transition);
}
.class-data-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}


.subject-name {
  font-size: 0.9rem;
  color: var(--dark-color);
  font-weight: 600;
  margin-bottom: 0.5rem; /* 与分数间距 */
}

.average-score {
  font-size: 1.6rem; /* 班级平均分可以更大 */
  font-weight: 700;
  color: var(--primary-dark);
}

.subject-icon {
  position: absolute;
  top: 1rem; /* 图标位置 */
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem; /* 图标大小 */
  color: var(--primary-color);
  opacity: 0.8;
}

/* 修改欢迎面板样式 */
.welcome-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px); /* 视口高度减去一些空间 */
  text-align: center;
  color: var(--grey-color);
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.05), rgba(58, 12, 163, 0.03));
  border-radius: var(--radius);
}

.welcome-content {
  max-width: 500px;
  padding: 2rem;
  background-color: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.welcome-icon {
  font-size: 5rem; /* 更大的图标 */
  color: var(--primary-light);
  margin-bottom: 2rem;
}
.welcome-content h2 {
  font-size: 1.5rem;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  border-bottom: none; /* 移除标题下的线 */
  justify-content: center; /* 居中标题和图标 */
}
.welcome-content p {
  font-size: 1rem;
}

/* 预测基本信息面板 */
.prediction-info-panel .card {
  background-color: var(--primary-light); /* 使用浅蓝色背景 */
  color: white;
}
.prediction-info-panel h2,
.prediction-info-panel h4 {
  color: white; /* 内部文字改为白色 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.3); /* 浅色分隔线 */
}
.prediction-info-panel h2 i,
.prediction-info-panel .info-item i {
  color: white; /* 图标也改为白色 */
}

.prediction-info-panel .info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 响应式网格 */
  gap: 1.5rem;
  margin-top: 1rem; /* 调整与标题间距 */
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.1); /* 半透明背景 */
  padding: 1rem;
  border-radius: var(--radius);
}
.info-item i {
  font-size: 1.5rem;
  opacity: 0.8;
}
.info-item h4 {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
  opacity: 0.9;
  border-bottom: none; /* 移除小标题下的线 */
}
.info-item p {
  font-size: 1rem;
  font-weight: 600;
  word-break: break-all; /* 长ID换行 */
}


/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--grey-color);
  opacity: 0.7;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.empty-state p {
  font-size: 1rem;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .student-results-container,
  .class-results-container {
    grid-template-columns: 1fr; /* 转为单列 */
  }

  .chart-card {
    height: auto; /* 自适应高度 */
    min-height: 300px; /* 设置最小高度 */
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr; /* 在小屏幕上侧边栏和内容区域垂直排列 */
  }

  .sidebar {
    height: auto;
    min-height: 300px;
    max-height: 40vh; /* 最大高度为视口高度的40% */
  }

  .chart-card {
    min-height: 250px; /* 较小的最小高度 */
  }

  .class-data-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* 更窄的卡片 */
  }
}
.chart-container {
  position: relative;
  height: 400px; /* 固定图表容器高度 */
  width: 100%;
}

.score-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.score-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.score-subject {
  font-size: 0.9rem;
  color: #6c757d;
}

.weakness-bars {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.weakness-bar {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 1rem;
}

.progress-container {
  position: relative;
  height: 30px;
  background: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%);
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}
/* 图表容器布局 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 右侧数据容器 */
.class-data-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 确保图表有足够的高度 */
.chart-inner {
  width: 100%;
  height: 300px; /* 保持足够的高度 */
  min-height: 300px;
}

/* 为图表添加卡片样式 */
.chart-card {
  background-color: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: var(--transition);
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .charts-container {
    grid-template-columns: 1fr; /* 在小屏幕上单列显示 */
  }

  .chart-inner {
    height: 250px; /* 调整小屏幕上的图表高度 */
  }
}

/* 调整雷达图标签间距 */
.radar-chart .echarts-radar-axis-name {
  padding: 2px 5px !important;
}

/* 班级结果容器布局 - 修改为更宽的油表图 */
.class-results-container {
  display: grid;
  grid-template-columns: 1fr; /* 改成单列布局 */
  gap: 1.5rem;
}

/* 为油表图单独设置样式 */
.chart-card:has(div[ref="gaugeChartRef"]) {
  width: 100%;
  grid-column: 1 / -1; /* 让仪表盘占据整行 */
  margin-bottom: 2rem;
  height: auto;
  min-height: 400px; /* 增加最小高度 */
}
/* 修改油表图的宽度和位置 */
.gauge-chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
/* 修改仪表盘图表宽度 */
.gaugeChartRef,
div[ref="gaugeChartRef"] {
  width: 100%;
  min-width: 100%;
  height: 300px;
}

/* 确保仪表盘图表卡片有足够的宽度 */
.chart-card:has(div[ref="gaugeChartRef"]) {
  width: 20%;
  grid-column: 1 / -1; /* 让仪表盘占据整行 */
  margin-bottom: 2rem;
}
/* 增加仪表盘图表容器的高度 */
.chart-card:has(div[ref="gaugeChartRef"]) .chart-inner {
  height: 400px;
  min-height: 400px;
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.gauge-item {
  position: absolute;
  width: 33.3%;
  height: 100%;
  display: flex;
  justify-content: center;
}

@media (min-width: 992px) {
  .class-results-container {
    grid-template-columns: 1fr 1fr;
  }

  .chart-card:has(div[ref="gaugeChartRef"]) {
    grid-column: 1 / -1;
  }
}
.chart-card h3 {
  margin-bottom: 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--grey-light);
  padding-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-card h3 i {
  color: var(--primary-light);
}

.chart-inner {
  width: 100%;
  height: 300px;
  min-height: 300px;
  flex-grow: 1;
}

/* ------------ 班级结果容器布局 ------------ */
.class-results-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 两栏布局容器 */
.two-column-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* ------------ 仪表盘特殊样式 ------------ */
/* 仪表盘包装器 */
.gauge-chart-wrapper {
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}

/* 仪表盘卡片特殊样式 */
.chart-card:has(div[ref="gaugeChartRef"]),
.chart-card.gauge-chart-wrapper {
  width: 100%;
  grid-column: 1 / -1; /* 让仪表盘占据整行 */
  margin-bottom: 2rem;
  height: auto;
  min-height: 400px; /* 增加最小高度 */
  padding-bottom: 2rem;
}

/* 仪表盘图表容器 */
.chart-card:has(div[ref="gaugeChartRef"]) .chart-inner,
.gauge-chart-wrapper .chart-inner {
  height: 400px;
  min-height: 400px;
  width: 100%;
  display: flex;
  justify-content: space-around;
}

/* 仪表盘DOM元素 */
div[ref="gaugeChartRef"] {
  width: 100%;
  height: 400px;
}

/* 仪表盘标题特殊样式 */
.gauge-chart-wrapper h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--primary-dark);
  text-align: center;
  border-bottom: 2px solid var(--primary-light);
  padding-bottom: 0.8rem;
}


/* ------------ 班级数据卡片 ------------ */
/* 班级数据网格 */
.class-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem 0.5rem;
}

.class-data-card {
  background-color: var(--light-color);
  border-radius: var(--radius);
  padding: 1.5rem 0.5rem 1rem 0.5rem;
  text-align: center;
  border: 1px solid var(--grey-light);
  position: relative;
  transition: var(--transition);
}

.class-data-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.subject-name {
  font-size: 0.9rem;
  color: var(--dark-color);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.average-score {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.subject-icon {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  color: var(--primary-color);
  opacity: 0.8;
}

/* ------------ 响应式调整 ------------ */
/* 常规桌面屏幕 */
@media (min-width: 1200px) {
  .chart-card:has(div[ref="gaugeChartRef"]),
  .gauge-chart-wrapper {
    min-height: 450px;
  }

  .chart-card:has(div[ref="gaugeChartRef"]) .chart-inner,
  .gauge-chart-wrapper .chart-inner,
  div[ref="gaugeChartRef"] {
    height: 450px;
  }
}

/* 平板和中等屏幕 */
@media (max-width: 992px) {
  .two-column-charts {
    grid-template-columns: 1fr; /* 平板设备上转为单列 */
  }

  .chart-card:has(div[ref="gaugeChartRef"]),
  .gauge-chart-wrapper {
    min-height: 350px;
  }

  .chart-card:has(div[ref="gaugeChartRef"]) .chart-inner,
  .gauge-chart-wrapper .chart-inner,
  div[ref="gaugeChartRef"] {
    height: 350px;
  }
}

/* 手机屏幕 */
@media (max-width: 768px) {
  .chart-card:has(div[ref="gaugeChartRef"]),
  .gauge-chart-wrapper {
    min-height: 300px;
  }

  .chart-card:has(div[ref="gaugeChartRef"]) .chart-inner,
  .gauge-chart-wrapper .chart-inner,
  div[ref="gaugeChartRef"] {
    height: 300px;
  }

  .class-data-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

/* 确保小屏幕上的图表清晰可见 */
@media (max-width: 576px) {
  .chart-card:has(div[ref="gaugeChartRef"]),
  .gauge-chart-wrapper {
    min-height: 250px;
    padding: 1rem 0.5rem;
  }

  .chart-card:has(div[ref="gaugeChartRef"]) .chart-inner,
  .gauge-chart-wrapper .chart-inner,
  div[ref="gaugeChartRef"] {
    height: 250px;
  }

  .gauge-chart-wrapper h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

/* ------------ 图表刷新和动画 ------------ */
/* 确保图表在窗口大小变化时平滑调整 */
.chart-inner * {
  transition: all 0.3s ease;
}

/* 图表加载中动画 */

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* 油表图在不同设备上的响应式调整 */
@media (max-width: 768px) {
  .gauge-chart-wrapper {
    min-height: 450px; /* 增加移动端高度，让图表有更多垂直空间 */
  }

  .gauge-chart-wrapper .chart-inner {
    height: 400px;
    flex-direction: column; /* 垂直排列仪表盘 */
    align-items: center;
  }

  /* 修改ECharts图表容器的样式 */
  #gaugeChartRef {
    height: 450px !important;
  }
}

/* 确保仪表盘在小屏幕上垂直排列 */
@media (max-width: 480px) {
  .gauge-chart-wrapper {
    min-height: 600px; /* 进一步增加高度适应垂直排列 */
  }

  .gauge-chart-wrapper .chart-inner {
    height: 550px;
  }
}
/* 侧边栏移动端优化 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr; /* 在小屏幕上转为单列布局 */
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    height: auto; /* 自适应高度 */
    max-height: 70vh; /* 限制最大高度 */
    overflow-y: auto; /* 允许滚动 */
  }

  .sidebar-tabs {
    position: sticky; /* 保持选项卡固定 */
    top: 0;
    background: white;
    z-index: 10;
  }

  .content {
    height: auto; /* 自适应高度 */
    max-height: none;
  }
}
/* 学生预测结果部分响应式优化 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr; /* 单列显示所有图表 */
  }

  .chart-inner {
    height: 250px; /* 减小图表高度 */
    min-height: 250px;
  }

  .score-cards {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); /* 更小的卡片 */
  }

  .score-value {
    font-size: 1.2rem; /* 减小字体大小 */
  }

  .score-subject {
    font-size: 0.75rem;
  }
}
/* 班级数据卡片响应式优化 */
@media (max-width: 768px) {
  .class-data-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); /* 更小的卡片 */
    gap: 0.5rem; /* 减小间距 */
  }

  .class-data-card {
    padding: 1rem 0.25rem 0.75rem 0.25rem; /* 减小内边距 */
  }

  .subject-name {
    font-size: 0.8rem;
  }

  .average-score {
    font-size: 1.2rem;
  }

  .subject-icon {
    font-size: 1.1rem;
  }
}
/* 移动端查询面板优化 */
@media (max-width: 768px) {
  /* 侧边栏改为可折叠样式 */
  .sidebar {
    position: relative;
    max-height: 20vh; /* 限制最大高度为视口的50% */
    overflow-y: auto;
    transition: max-height 0.3s ease;
  }

  /* 添加折叠控制按钮 */
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: var(--primary-light);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  /* 折叠时的样式 */
  .sidebar.collapsed {
    max-height: 50px;
    overflow: hidden;
  }

  /* 确保内容区域在折叠时不受影响 */
  .content {
    flex: 1;
    overflow-y: auto;
    height: auto;
  }

  /* 修改查询区域布局 */
  .query-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* 学生和班级查询部分紧凑显示 */
  .query-student, .query-class {
    padding: 0.75rem;
    background-color: rgba(67, 97, 238, 0.05);
    border-radius: var(--radius);
    border: 1px solid var(--grey-light);
  }

  /* 查询输入框和按钮更紧凑 */
  .query-section .form-group {
    margin-bottom: 0.5rem;
  }

  .query-section h3 {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .query-section .primary-button {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  /* 优化内容显示，确保学生/班级数据正确显示 */
  .student-results, .class-results {
    margin-top: 1rem;
    height: auto;
    overflow-y: visible;
  }

  /* 确保图表完整显示 */
  .chart-inner {
    width: 100%;
    height: 250px;
    min-height: 0; /* 移除最小高度限制 */
  }
}


</style>
<style scoped>
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

