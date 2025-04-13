<template>
  <!-- 外层容器 - 使用了渐变背景和动态效果 -->
  <div class="main-container">
    <!-- 动态背景元素 -->
    <div class="animated-bg">
      <div v-for="n in 10" :key="n" class="floating-shape"></div>
    </div>

    <!-- 页面标题 -->
    <div class="page-title">
      <h1 class="text-3xl font-bold text-center text-gradient">在线测试中心</h1>
      <p class="text-center text-gray-600 mt-2">选择班级或加入新班级开始测试</p>
    </div>

    <!-- 主内容容器 -->
    <div class="content-container">
      <!-- 班级选择区 -->
      <div class="selection-area">
        <div class="selection-inner">
          <!-- 选择框容器 -->
          <div class="select-container">
            <div class="relative w-full">
              <select
                  v-model="selectedClass"
                  @change="loadTests"
                  class="class-select"
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
              <div class="select-arrow">
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <div v-if="membersLoading" class="loading-indicator">
              <div class="spinner"></div>
              <span>加载中...</span>
            </div>
          </div>

          <!-- 加入班级按钮 -->
          <button
              class="join-button"
              @click="dialogVisible = true"
          >
            <span class="button-text">加入班级</span>
            <span class="button-icon">+</span>
          </button>
        </div>

        <!-- 测试列表容器 -->
        <transition-group name="test-list" tag="div" class="tests-container">
          <div v-if="selectedClass && !membersLoading" class="selected-class-content" key="test-list">
            <div class="tests-grid">
              <div
                  v-for="member in tests"
                  :key="member.id"
                  class="test-card"
                  @click="selectMember(member)"
              >
                <div class="test-card-inner">
                  <!-- 测试图标 -->
                  <div class="test-avatar">
                    {{ String(member.id).charAt(0) }}
                  </div>
                  <!-- 测试信息 -->
                  <div class="test-info">
                    <div class="test-title">测试 {{ String(member.id) }}</div>
                    <div class="test-id">ID: {{ String(member.id) }}</div>
                  </div>
                  <!-- 箭头指示器 -->
                  <div class="test-arrow">
                    <i class="fas fa-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
              v-if="!tests.length && !membersLoading && selectedClass"
              class="empty-state"
              key="empty-state"
          >
            <div class="empty-icon">
              <i class="far fa-clipboard"></i>
            </div>
            <p class="empty-text">当前班级暂无测试</p>
            <p class="empty-subtext">请稍后再查看或联系老师</p>
          </div>

          <!-- 未选择班级状态 -->
          <div
              v-if="!selectedClass && !membersLoading"
              class="welcome-state"
              key="welcome-state"
          >
            <div class="welcome-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <p class="welcome-text">请从上方选择一个班级</p>
            <p class="welcome-subtext">或使用邀请码加入新班级</p>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 右侧浮窗 -->
    <transition name="slide-in">
      <div
          v-if="selectedMember"
          class="member-details-panel"
      >
        <div class="panel-header">
          <h2 class="panel-title">测试 {{ String(selectedMember.id) }} 详情</h2>
          <button @click="closeMemberDetails" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="panel-content">
          <div class="detail-item">
            <span class="detail-label">测试ID:</span>
            <span class="detail-value">{{ String(selectedMember.id) }}</span>
          </div>
          <!-- 可以添加更多测试详情 -->
        </div>

        <div class="panel-footer">
          <button
              @click="closeMemberDetails"
              class="close-details-button"
          >
            关闭
          </button>
        </div>
      </div>
    </transition>

    <!-- 加入班级弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        title="加入新班级"
        width="400px"
        custom-class="custom-dialog"
        :show-close="false"
    >
      <div class="dialog-content">
        <div class="dialog-icon">
          <i class="fas fa-key"></i>
        </div>
        <h3 class="dialog-subtitle">请输入教师提供的邀请码</h3>

        <el-input
            v-model="inviteCode"
            placeholder="请输入邀请码"
            class="invite-input"
            maxlength="10"
            :prefix-icon="InputKey"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button
              @click="dialogVisible = false"
              class="cancel-button"
          >
            取消
          </button>
          <button
              @click="joinClass"
              class="confirm-button"
          >
            <span>确认加入</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { Loading, User, Key as InputKey } from '@element-plus/icons-vue';
import { useRouter } from "vue-router";
import {
  getStudentClassesAPI,
  getTestIDAPI,
  joinClassAPI
} from "../../apis";

// 类型定义
interface ClassInfo {
  classid: number;
  classname: string;
}

interface Test {
  id: number;
}

const classForm = reactive({
  className: ''
});
const formRef = ref();
const isSubmitting = ref(false);
// 状态管理
const classes = ref<ClassInfo[]>([]);
const tests = ref<Test[]>([]);
const selectedClass = ref('');
const membersLoading = ref(false);
const dialogVisible = ref(false);
const selectedMember = ref<Test | null>(null);
const router = useRouter();

const selectMember = (member: Test) => {
  router.push({ name: 'studentTestView', params: { id: member.id } });
};

const closeMemberDetails = () => {
  selectedMember.value = null; // 关闭浮窗
};

const openDialog = () => {
  dialogVisible.value = true;
  inviteCode.value = ""; // 清空邀请码
};

const handleClose = () => {
  dialogVisible.value = false;
};

const loadClasses = async () => {
  try {
    const res = await getStudentClassesAPI();
    if (res.code === 200) {
      classes.value = res.data; // 接口返回的是数组
      // 添加动画延迟
      setTimeout(() => {
        if (classes.value.length > 0 && !selectedClass.value) {
          // 自动选择第一个班级
          selectedClass.value = String(classes.value[0].classid);
          loadTests();
        }
      }, 500);
    }
  } catch (error) {
    ElMessage.error({
      message: '获取班级失败',
      duration: 3000,
      showClose: true,
      grouping: true
    });
  }
};

onMounted(() => {
  loadClasses(); // 初始化加载班级列表

  // 初始化背景动画
  initBackgroundAnimation();
});

// 加载班级成员
const loadTests = async () => {
  if (!selectedClass.value) return;
  membersLoading.value = true;
  tests.value = []; // 清空之前的测试列表

  try {
    const res = await getTestIDAPI({ classid: Number(selectedClass.value) });

    // 添加小延迟模拟加载
    setTimeout(() => {
      if (res.code === 200) {
        tests.value = res.data.map((id: number) => ({ id }));
      } else {
        ElMessage.error({
          message: '测试加载失败',
          type: 'error',
          duration: 3000
        });
      }
      membersLoading.value = false;
    }, 600);

  } catch (error) {
    setTimeout(() => {
      ElMessage.error({
        message: '请求失败，请检查网络连接',
        type: 'error',
        duration: 3000
      });
      membersLoading.value = false;
    }, 600);
  }
};

const inviteCode = ref("");

const joinClass = async () => {
  if (!inviteCode.value.trim()) {
    ElMessage.warning({
      message: '请输入邀请码',
      type: 'warning',
      duration: 2000
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await joinClassAPI(inviteCode.value);
    if (res.code === 200) {
      ElNotification({
        title: "加入成功",
        message: "已成功加入班级！",
        type: "success",
        duration: 3000,
        position: 'top-right'
      });
      dialogVisible.value = false;

      // 重新加载班级列表
      await loadClasses();
    } else {
      ElNotification({
        title: "加入失败",
        message: res.msg || "邀请码无效或已过期",
        type: "warning",
        duration: 3000
      });
    }
  } catch (err) {
    ElNotification({
      title: "系统错误",
      message: "请稍后再试或联系管理员",
      type: "error",
      duration: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 背景动画初始化
const initBackgroundAnimation = () => {
  const shapes = document.querySelectorAll('.floating-shape');

  shapes.forEach((shape, index) => {
    const element = shape as HTMLElement;
    // 随机初始位置
    element.style.left = `${Math.random() * 100}%`;
    element.style.top = `${Math.random() * 100}%`;

    // 随机大小
    const size = 20 + Math.random() * 40;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    // 随机透明度
    element.style.opacity = `${0.1 + Math.random() * 0.2}`;

    // 随机动画延迟
    element.style.animationDelay = `${Math.random() * 5}s`;

    // 随机动画时长
    element.style.animationDuration = `${10 + Math.random() * 20}s`;
  });
};
</script>

<style scoped>
/* 全局样式 */
.main-container {
  @apply bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen w-full py-10 px-4 sm:px-6 relative overflow-hidden;
}

/* 动态背景 */
.animated-bg {
  @apply absolute inset-0 overflow-hidden pointer-events-none z-0;
}

.floating-shape {
  @apply absolute rounded-full bg-gradient-to-r from-purple-300/20 to-indigo-300/20 transform rotate-45;
  animation: float 15s linear infinite;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(10px, 10px) rotate(90deg) scale(1.1);
  }
  50% {
    transform: translate(20px, 20px) rotate(180deg) scale(1);
  }
  75% {
    transform: translate(10px, 30px) rotate(270deg) scale(0.9);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

/* 页面标题 */
.page-title {
  @apply mb-8 relative z-10;
}

.text-gradient {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text pb-1;
}

/* 内容容器 */
.content-container {
  @apply relative z-10 max-w-6xl mx-auto;
}

/* 选择区域 */
.selection-area {
  @apply rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl p-6 transition-all duration-300 border border-purple-100 mb-8;
}

.selection-inner {
  @apply flex flex-col items-center gap-6;
}

.select-container {
  @apply flex w-full items-center justify-center gap-4;
}

.class-select {
  @apply block w-full max-w-md py-4 px-6 bg-white/90 text-lg text-gray-700 rounded-xl border border-purple-200 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 appearance-none transition-all cursor-pointer;
}

.select-arrow {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500 pointer-events-none;
}

.loading-indicator {
  @apply flex items-center text-purple-500 gap-2;
}

.spinner {
  @apply w-5 h-5 border-2 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin;
}

/* 加入班级按钮 */
.join-button {
  @apply relative w-full max-w-xs rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2;
}

.button-text {
  @apply transition-all;
}

.button-icon {
  @apply ml-2 text-lg font-bold;
}

/* 测试列表容器 */
.tests-container {
  @apply w-full mt-6 min-h-[400px];
}

.tests-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}

.test-card {
  @apply mx-auto w-full rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md transition-all duration-300 hover:border-purple-400 hover:shadow-lg cursor-pointer transform hover:-translate-y-1;
}

.test-card-inner {
  @apply flex items-center gap-4 w-full px-2 relative;
}

.test-avatar {
  @apply flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-bold flex items-center justify-center text-xl shadow-sm;
}

.test-info {
  @apply flex-1 min-w-0;
}

.test-title {
  @apply font-medium text-lg text-gray-800;
}

.test-id {
  @apply text-gray-500 text-sm mt-1;
}

.test-arrow {
  @apply text-purple-400 opacity-0 transition-opacity duration-300;
}

.test-card:hover .test-arrow {
  @apply opacity-100;
}

/* 空状态 */
.empty-state {
  @apply mx-auto mt-8 w-full max-w-xl rounded-xl border border-dashed border-gray-300 bg-white/60 p-10 text-center text-gray-500 transition-all duration-300;
}

.empty-icon {
  @apply mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-purple-400;
}

.empty-text {
  @apply text-lg font-medium text-gray-600;
}

.empty-subtext {
  @apply text-sm text-gray-500 mt-2;
}

/* 欢迎状态 */
.welcome-state {
  @apply mx-auto mt-8 w-full max-w-xl rounded-xl border border-dashed border-purple-200 bg-white/60 p-10 text-center text-gray-500 transition-all duration-300;
}

.welcome-icon {
  @apply mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-3xl text-purple-500;
}

.welcome-text {
  @apply text-xl font-medium text-gray-700;
}

.welcome-subtext {
  @apply text-sm text-gray-500 mt-2;
}

/* 右侧详情面板 */
.member-details-panel {
  @apply fixed right-0 top-0 w-80 h-screen bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col;
}

.panel-header {
  @apply p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white;
}

.panel-title {
  @apply text-xl font-bold;
}

.close-button {
  @apply w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors;
}

.panel-content {
  @apply p-6 flex-grow overflow-y-auto;
}

.detail-item {
  @apply mb-4 pb-3 border-b border-gray-100;
}

.detail-label {
  @apply block text-sm text-gray-500 mb-1;
}

.detail-value {
  @apply text-lg font-medium text-gray-700;
}

.panel-footer {
  @apply p-6 border-t border-gray-100;
}

.close-details-button {
  @apply w-full py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors;
}

/* 自定义弹窗 */
:deep(.custom-dialog) {
  @apply rounded-2xl overflow-hidden border border-purple-100 shadow-2xl;
}

:deep(.el-dialog__header) {
  @apply bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 mb-0;
}

:deep(.el-dialog__title) {
  @apply text-white text-xl font-bold;
}

:deep(.el-dialog__body) {
  @apply p-6;
}

.dialog-content {
  @apply flex flex-col items-center py-4;
}

.dialog-icon {
  @apply w-16 h-16 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-2xl mb-4;
}

.dialog-subtitle {
  @apply text-gray-600 text-base mb-6 text-center;
}

.invite-input {
  @apply w-full text-center text-lg;
}

:deep(.el-dialog__footer) {
  @apply p-6 pt-0;
}

.dialog-footer {
  @apply flex justify-end gap-4;
}

.cancel-button {
  @apply px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors;
}

.confirm-button {
  @apply px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center;
}

/* 过渡动画 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.5s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
}

.test-list-enter-active,
.test-list-leave-active {
  transition: all 0.5s ease;
}

.test-list-enter-from,
.test-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.test-list-move {
  transition: transform 0.5s ease;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tests-grid {
    @apply grid-cols-1;
  }

  .member-details-panel {
    @apply w-full;
  }
}
</style>