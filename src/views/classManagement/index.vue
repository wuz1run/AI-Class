<template>
  <div class="dashboard-container">
    <!-- 动态背景元素 -->
    <div class="animated-background">
      <div class="shape circle"></div>
      <div class="shape square"></div>
      <div class="shape triangle"></div>
      <div class="shape rectangle"></div>
      <div class="shape pentagon"></div>
      <div class="light-effect"></div>
    </div>

    <!-- 侧边菜单切换按钮 (已下移) -->
    <div class="menu-toggle" @click="toggleMenu">
      <div class="menu-icon" :class="{ 'active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 侧边菜单 -->
    <div class="side-menu" :class="{ 'menu-opened': isMenuOpen }">
      <div class="menu-header">
        <div class="logo-container">
          <div class="logo-icon">
            <span class="icon-pulse"></span>
          </div>
          <h2 class="logo-text">管理系统</h2>
        </div>
      </div>

      <div class="menu-items">
        <div
            class="menu-item active"
        >
          <span class="menu-icon user-icon"></span>
          <span class="menu-text">用户管理</span>
        </div>
      </div>

      <div class="menu-footer">
        <!-- 菜单收起按钮 -->
        <div class="close-menu-btn" @click="toggleMenu">
          <div class="close-icon">
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <span class="close-text">收起菜单</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'menu-opened': isMenuOpen }">
      <div class="content-header">
        <h1 class="page-title">用户管理中心</h1>
        <div class="header-actions">
          <div class="notification-bell">
            <span class="notification-dot"></span>
          </div>
        </div>
      </div>

      <div class="content-body">
        <transition name="fade" mode="out-in">
          <classUserManagement />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { myMenu, classUserManagement } from "../../components"

// 状态管理
const isMenuOpen = ref<boolean>(true);

// 菜单相关方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 动态背景元素生成
const initAnimatedBackground = () => {
  // 这部分可以在实际项目中使用onMounted钩子实现
  // 此处省略实现，样式中已包含动画效果
};
</script>

<style scoped>
/* 全局容器 */
.dashboard-container {
  @apply relative h-screen w-screen overflow-hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 动态背景元素 */
.animated-background {
  @apply absolute inset-0 overflow-hidden pointer-events-none opacity-30;
  z-index: 0;
}

.shape {
  @apply absolute opacity-20;
  animation-duration: 15s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4263eb, #4dabf7);
  left: 10%;
  top: 20%;
  animation-name: float-circle;
}

.square {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #f03e3e, #ff6b6b);
  right: 20%;
  top: 15%;
  transform: rotate(45deg);
  animation-name: float-square;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 60px solid transparent;
  border-right: 60px solid transparent;
  border-bottom: 120px solid rgba(52, 199, 89, 0.7);
  left: 25%;
  bottom: 20%;
  animation-name: float-triangle;
}

.rectangle {
  width: 200px;
  height: 80px;
  background: linear-gradient(45deg, #cc5de8, #da77f2);
  right: 15%;
  bottom: 25%;
  animation-name: float-rectangle;
}

.pentagon {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #f59f00, #ffd43b);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  right: 30%;
  top: 60%;
  animation-name: float-pentagon;
}

.light-effect {
  @apply absolute rounded-full opacity-20;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  top: -300px;
  right: -300px;
  animation: pulse 10s infinite alternate;
}

@keyframes float-circle {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, 20px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

@keyframes float-square {
  0% { transform: translate(0, 0) rotate(45deg); }
  50% { transform: translate(-20px, 30px) rotate(90deg); }
  100% { transform: translate(0, 0) rotate(45deg); }
}

@keyframes float-triangle {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, -20px) rotate(15deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes float-rectangle {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-30px, -10px) rotate(-10deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes float-pentagon {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(15deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes pulse {
  0% { opacity: 0.1; }
  50% { opacity: 0.3; }
  100% { opacity: 0.1; }
}

/* 侧边菜单 */
.side-menu {
  @apply fixed top-10 left-0 h-5/6 bg-white flex flex-col transition-all duration-300 ease-in-out z-20;
  width: 260px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  transform: translateX(-260px);
  margin-top: 40px;
  border-radius: 0 15px 15px 0;
}

.side-menu.menu-opened {
  transform: translateX(0);
}

.menu-header {
  @apply p-6 border-b border-gray-100;
}

.logo-container {
  @apply flex items-center;
}

.logo-icon {
  @apply flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 mr-3 relative;
}

.icon-pulse {
  @apply absolute w-6 h-6 rounded-lg bg-blue-500;
  animation: logo-pulse 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.logo-text {
  @apply text-xl font-bold text-gray-800;
  background: linear-gradient(45deg, #4263eb, #74c0fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.menu-items {
  @apply flex-1 py-4 overflow-y-auto;
}

.menu-item {
  @apply flex items-center py-3 px-6 cursor-pointer transition-all duration-200;
}

.menu-item:hover {
  @apply bg-blue-50;
}

.menu-item.active {
  @apply bg-blue-50 border-l-4 border-blue-500;
}

.menu-icon {
  @apply w-5 h-5 mr-3 bg-no-repeat bg-center bg-contain;
}

.user-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234263eb'%3E%3Cpath d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.67 0-11 2.45-11 7v1c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-1c0-4.55-5.33-7-11-7z'/%3E%3C/svg%3E");
}

.course-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234263eb'%3E%3Cpath d='M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'/%3E%3C/svg%3E");
}

.menu-text {
  @apply text-gray-700 font-medium;
}

.menu-item.active .menu-text {
  @apply text-blue-600 font-semibold;
}

.menu-footer {
  @apply p-4 border-t border-gray-100;
}

.close-menu-btn {
  @apply flex items-center py-2 px-4 bg-blue-50 rounded-lg cursor-pointer transition-all hover:bg-blue-100;
}

.close-icon {
  @apply mr-2 text-blue-500;
}

.close-text {
  @apply text-sm text-blue-600 font-medium;
}

/* 菜单切换按钮 */
.menu-toggle {
  @apply fixed bottom-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer z-30 shadow-md transition-all hover:shadow-lg;
}

.menu-icon {
  @apply relative w-5 h-5;
}

.menu-icon span {
  @apply absolute left-0 w-5 h-0.5 bg-blue-500 transition-all duration-300;
}

.menu-icon span:nth-child(1) {
  top: 0;
}

.menu-icon span:nth-child(2) {
  top: 2px;
  transform: translateY(3px);
}

.menu-icon span:nth-child(3) {
  top: 4px;
  transform: translateY(6px);
}

.menu-icon.active span:nth-child(1) {
  transform: translateY(3px) rotate(45deg);
}

.menu-icon.active span:nth-child(2) {
  opacity: 0;
}

.menu-icon.active span:nth-child(3) {
  transform: translateY(3px) rotate(-45deg);
}

/* 主内容区 */
.main-content {
  @apply relative transition-all duration-300 min-h-screen flex flex-col z-10;
  margin-left: 0;
  margin-top: 0;
}

.main-content.menu-opened {
  margin-left: 260px;
}

/* 或者如果只想保留文字，可以更彻底地设置 */
.content-header {
  @apply sticky top-0 z-10 py-4 px-6 flex justify-between items-center;
  background: transparent; /* 完全透明背景 */
  box-shadow: none; /* 移除阴影 */
}

.page-title {
  @apply text-2xl font-bold text-gray-800;
  background: linear-gradient(45deg, #212529, #495057);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  @apply flex items-center space-x-4;
}

.search-box {
  @apply relative;
}

.search-box input {
  @apply pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm transition-all w-48;
}

.search-box input:focus {
  @apply outline-none border-blue-300 w-64;
  box-shadow: none;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23adb5bd'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
}

.notification-bell {
  @apply relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200;
}

.notification-bell:after {
  content: "";
  @apply absolute w-4 h-4 bg-no-repeat bg-center bg-contain;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23495057'%3E%3Cpath d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/%3E%3C/svg%3E");
}

.notification-dot {
  @apply absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500;
  animation: notification-pulse 2s infinite;
}

@keyframes notification-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.content-body {
  @apply flex-1 p-6 transition-all duration-300;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

/* 媒体查询 - 响应式适配 */
@media (max-width: 768px) {
  .side-menu {
    width: 240px;
    transform: translateX(-240px);
  }

  .main-content.menu-opened {
    margin-left: 0;
  }

  .side-menu.menu-opened {
    transform: translateX(0);
  }

  .side-menu.menu-opened + .main-content {
    transform: translateX(240px);
  }
}
</style>