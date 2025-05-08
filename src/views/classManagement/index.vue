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

    <!-- 侧边菜单切换按钮 -->
    <div class="menu-toggle" @click.stop="toggleMenu">
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
        <div class="close-menu-btn" @click.stop="toggleMenu">
          <div class="close-icon">
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <span class="close-text">收起菜单</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'menu-opened': isMenuOpen && !isMobile }">
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { myMenu, classUserManagement } from "../../components"

// 状态管理
const isMenuOpen = ref(false); // 在移动端默认收起菜单
const isMobile = ref(window.innerWidth <= 768);
const isTablet = ref(window.innerWidth > 768 && window.innerWidth <= 1024);

// 菜单相关方法
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;

  // 在移动端打开菜单时禁止body滚动
  if (isMobile.value) {
    if (isMenuOpen.value) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');

      // 添加延迟，确保过渡动画完成后才移除类
      setTimeout(() => {
        document.body.classList.remove('menu-open');
      }, 300);
    }
  }
};

// 监听窗口大小变化
const handleResize = () => {
  const oldIsMobile = isMobile.value;
  const oldIsTablet = isTablet.value;

  isMobile.value = window.innerWidth <= 768;
  isTablet.value = window.innerWidth > 768 && window.innerWidth <= 1024;

  // 如果从移动端变为桌面端，确保body不再被禁止滚动
  if (oldIsMobile && !isMobile.value) {
    document.body.classList.remove('menu-open');
  }

  // 在小屏幕上默认收起菜单
  if (!oldIsMobile && isMobile.value && isMenuOpen.value) {
    isMenuOpen.value = false;
  }

  // 如果从移动设备变为桌面，且菜单处于关闭状态，自动打开菜单
  if ((oldIsMobile || oldIsTablet) && !isMobile.value && !isTablet.value && !isMenuOpen.value) {
    isMenuOpen.value = true;
  }
};

// 点击遮罩层关闭菜单的处理函数
const handleOutsideClick = (event) => {
  if (isMobile.value && isMenuOpen.value) {
    // 检查点击是否在菜单外部
    const sideMenu = document.querySelector('.side-menu');
    const menuToggle = document.querySelector('.menu-toggle');

    if (sideMenu && !sideMenu.contains(event.target) &&
        menuToggle && !menuToggle.contains(event.target)) {
      isMenuOpen.value = false;

      // 添加延迟，确保过渡动画完成后才移除类
      setTimeout(() => {
        document.body.classList.remove('menu-open');
      }, 300);
    }
  }
};

// 处理触摸事件（优化移动端体验）
const handleTouchStart = (event) => {
  // 获取触摸起始点
  const touchStartX = event.touches[0].clientX;

  // 如果触摸起始点在屏幕左侧边缘附近，可以考虑滑动打开菜单
  if (isMobile.value && !isMenuOpen.value && touchStartX < 30) {
    const handleTouchMove = (moveEvent) => {
      const touchMoveX = moveEvent.touches[0].clientX;
      const diffX = touchMoveX - touchStartX;

      // 如果右滑距离超过50px，打开菜单
      if (diffX > 50) {
        isMenuOpen.value = true;
        document.body.classList.add('menu-open');

        // 移除事件监听器
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };

    const handleTouchEnd = () => {
      // 移除事件监听器
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    // 添加临时事件监听器
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  // 如果菜单已打开，监听从右向左滑动关闭菜单
  if (isMobile.value && isMenuOpen.value) {
    const sideMenu = document.querySelector('.side-menu');

    // 如果触摸点不在菜单内，不处理
    if (sideMenu && !sideMenu.contains(event.target)) {
      const handleTouchMove = (moveEvent) => {
        const touchMoveX = moveEvent.touches[0].clientX;
        const diffX = touchStartX - touchMoveX;

        // 如果左滑距离超过50px，关闭菜单
        if (diffX > 50) {
          isMenuOpen.value = false;

          // 添加延迟，确保过渡动画完成后才移除类
          setTimeout(() => {
            document.body.classList.remove('menu-open');
          }, 300);

          // 移除事件监听器
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        }
      };

      const handleTouchEnd = () => {
        // 移除事件监听器
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      // 添加临时事件监听器
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化时检查设备类型
  handleResize();

  // 添加窗口调整大小和点击事件监听器
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });

  // 在桌面端自动打开菜单，移动端默认收起
  isMenuOpen.value = !isMobile.value;

  // 设置viewport meta标签确保移动端正确显示
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  } else {
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
});

onBeforeUnmount(() => {
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('touchstart', handleTouchStart);

  // 确保在组件卸载时移除body上的class
  document.body.classList.remove('menu-open');
});
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
/* 媒体查询 - 响应式适配 */
/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .side-menu {
    width: 220px;
    transform: translateX(-220px);
  }

  .main-content.menu-opened {
    margin-left: 220px;
  }

  .page-title {
    @apply text-xl;
  }

  .content-body {
    @apply p-4;
  }
}

/* 手机设备 (小于768px) */
@media (max-width: 768px) {
  .side-menu {
    width: 240px;
    transform: translateX(-240px);
    top: 0;
    height: 100vh;
    margin-top: 0;
  }

  .main-content {
    width: 100%;
  }

  .main-content.menu-opened {
    margin-left: 0;
    overflow: hidden;
  }

  /* 手机端菜单打开时添加遮罩层 */
  .side-menu.menu-opened:after {
    content: "";
    position: fixed;
    top: 0;
    left: 240px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
  }

  /* 调整页面标题和头部布局 */
  .content-header {
    @apply py-3 px-4;
  }

  .page-title {
    @apply text-lg;
  }
}

/* 小屏手机设备 (小于480px) */
@media (max-width: 480px) {
  .side-menu {
    width: 85%;
    max-width: 280px;
  }

  .menu-toggle {
    @apply bottom-4 left-4 w-9 h-9;
  }

  .page-title {
    @apply text-base;
  }

  /* 动态背景元素调整 */
  .shape {
    transform: scale(0.7);
  }

  .content-body {
    @apply p-3;
  }

  /* 菜单项文字大小调整 */
  .menu-text {
    @apply text-sm;
  }
}
/* 添加到已有的CSS中 */
/* 手机端菜单覆盖模式 */
@media (max-width: 768px) {
  /* 菜单打开时的主内容固定 */
  body.menu-open {
    overflow: hidden;
  }

  /* 侧边菜单全屏覆盖 */
  .side-menu.menu-opened + .main-content {
    transform: translateX(0);
    filter: blur(2px);
    pointer-events: none;
  }
}

/* 平板设备优化 (768px - 1024px) */
@media (max-width: 1024px) {
  .side-menu {
    width: 220px;
    transform: translateX(-220px);
  }

  .main-content.menu-opened {
    margin-left: 220px;
  }

  .page-title {
    @apply text-xl;
  }

  .content-body {
    @apply p-4;
  }

  /* 提高平板上的触摸区域大小 */
  .menu-item {
    @apply py-4;
  }

  /* 调整平板上的动态背景元素 */
  .shape {
    opacity: 0.15;
    transform: scale(0.85);
  }
}

/* 手机设备优化 (小于768px) */
@media (max-width: 768px) {
  /* 基础设置 */
  .side-menu {
    width: 270px;
    transform: translateX(-270px);
    top: 0;
    height: 100vh;
    margin-top: 0;
    z-index: 50;
  }

  .main-content {
    width: 100%;
    margin-left: 0 !important; /* 确保手机上不会有左边距 */
  }

  /* 菜单打开时添加遮罩和效果 */
  .side-menu.menu-opened {
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
  }

  /* 添加遮罩层 */
  .side-menu.menu-opened:after {
    content: "";
    position: fixed;
    top: 0;
    left: 270px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* 手机端菜单打开时锁定主内容滚动 */
  .side-menu.menu-opened ~ .main-content {
    position: fixed;
    width: 100%;
  }

  /* 调整页面标题和头部布局 */
  .content-header {
    @apply py-3 px-4 flex-wrap;
  }

  .page-title {
    @apply text-lg;
  }

  /* 优化通知图标在手机上的展示 */
  .notification-bell {
    @apply w-9 h-9;
  }

  /* 调整菜单项在手机上的大小 */
  .menu-item {
    @apply py-4 px-5;
  }

  /* 优化菜单切换按钮的位置和样式 */
  .menu-toggle {
    @apply bottom-5 left-5 w-12 h-12 shadow-lg;
    z-index: 60; /* 确保在遮罩层之上 */
  }

  /* 动态背景元素调整 */
  .animated-background {
    opacity: 0.2;
  }

  .shape {
    opacity: 0.1;
  }
}

/* 小屏手机设备优化 (小于480px) */
@media (max-width: 480px) {
  .side-menu {
    width: 85%;
    max-width: 280px;
  }

  .side-menu.menu-opened:after {
    left: 85%;
    max-left: 280px;
  }

  .menu-toggle {
    @apply bottom-4 left-4 w-10 h-10;
  }

  .page-title {
    @apply text-base mb-2 w-full;
  }

  .header-actions {
    @apply mt-1 w-full justify-end;
  }

  /* 动态背景元素微调 */
  .shape {
    transform: scale(0.6);
  }

  .content-body {
    @apply p-3;
  }

  /* 菜单项文字大小调整 */
  .menu-text {
    @apply text-sm;
  }

  /* 增强小屏上的触摸区域 */
  .menu-item {
    @apply py-4;
  }

  .close-menu-btn {
    @apply py-3;
  }

  /* 优化动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 250ms;
  }
}

/* 横屏模式优化 */
@media (max-height: 480px) and (orientation: landscape) {
  .side-menu {
    overflow-y: auto;
  }

  .menu-items {
    max-height: 70vh;
    overflow-y: auto;
  }

  .menu-item {
    @apply py-2;
  }

  .menu-header {
    @apply py-3 px-4;
  }

  .menu-footer {
    @apply py-2;
  }

  /* 调整菜单切换按钮位置 */
  .menu-toggle {
    @apply bottom-3 left-3;
  }
}

/* 安全区域适配 (适应各种刘海屏、打孔屏) */
@supports (padding-top: env(safe-area-inset-top)) {
  .side-menu {
    padding-top: env(safe-area-inset-top);
    height: calc(100vh - env(safe-area-inset-bottom));
  }

  .content-header {
    padding-top: max(env(safe-area-inset-top), 1rem);
  }

  .menu-toggle {
    bottom: max(1.5rem, env(safe-area-inset-bottom));
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .dashboard-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .side-menu {
    @apply bg-gray-900;
  }

  .menu-header, .menu-footer {
    @apply border-gray-800;
  }

  .menu-text {
    @apply text-gray-300;
  }

  .menu-item:hover {
    @apply bg-gray-800;
  }

  .menu-item.active {
    @apply bg-gray-800 border-blue-500;
  }

  .page-title {
    background: linear-gradient(45deg, #e9ecef, #ffffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .notification-bell {
    @apply bg-gray-800;
  }

  .menu-toggle {
    @apply bg-gray-900;
  }
}
/* 全局响应式调整 */
@media (max-width: 1024px) {
  .side-menu {
    width: 240px;
    transform: translateX(-240px);
  }

  .main-content.menu-opened {
    margin-left: 240px;
  }

  /* 减小内容区域内边距 */
  .content-body {
    padding: 1rem;
  }

  /* 减小动态背景元素的大小 */
  .shape {
    transform: scale(0.85);
    opacity: 0.15;
  }
}

/* 平板设备优化 (768px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 增大按钮和交互元素的触摸区域 */
  .menu-item {
    padding-top: 0.875rem;
    padding-bottom: 0.875rem;
  }

  .close-menu-btn {
    padding: 0.625rem 1rem;
  }

  /* 调整标题大小 */
  .page-title {
    font-size: 1.5rem;
  }

  /* 优化布局空间 */
  .menu-header {
    padding: 1.25rem;
  }
}

/* 手机设备优化 (小于768px) */
@media (max-width: 768px) {
  /* 基础设置 */
  .side-menu {
    width: 280px;
    transform: translateX(-280px);
    top: 0;
    height: 100vh;
    margin-top: 0;
    z-index: 50;
    box-shadow: none;
  }

  .main-content {
    width: 100%;
    margin-left: 0 !important; /* 确保手机上不会有左边距 */
  }

  /* 菜单展开时的效果 */
  .side-menu.menu-opened {
    transform: translateX(0);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
  }

  /* 菜单展开时添加遮罩层 */
  .side-menu.menu-opened::after {
    content: "";
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* 菜单展开时固定主内容区，防止滚动 */
  body.menu-open {
    overflow: hidden;
  }

  /* 优化页面头部 */
  .content-header {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }

  .page-title {
    font-size: 1.25rem;
  }

  /* 优化菜单交互元素 */
  .menu-toggle {
    bottom: 1.25rem;
    left: 1.25rem;
    width: 3rem;
    height: 3rem;
    z-index: 60; /* 确保在遮罩层之上 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .menu-item {
    padding: 0.875rem 1.25rem;
  }

  /* 减弱动态背景元素 */
  .animated-background {
    opacity: 0.15;
  }

  .shape {
    opacity: 0.1;
    transform: scale(0.7);
  }

  /* 优化动画效果 */
  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 250ms;
  }
}

/* 小屏手机设备优化 (小于480px) */
@media (max-width: 480px) {
  .side-menu {
    width: 85%;
    max-width: 300px;
  }

  .side-menu.menu-opened::after {
    left: 85%;
    max-left: 300px;
  }

  /* 调整菜单切换按钮 */
  .menu-toggle {
    bottom: 1rem;
    left: 1rem;
    width: 2.75rem;
    height: 2.75rem;
  }

  /* 调整页面标题 */
  .page-title {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .header-actions {
    margin-top: 0.25rem;
    width: 100%;
    justify-content: flex-end;
  }

  /* 减小内容区域内边距 */
  .content-body {
    padding: 0.75rem;
  }

  /* 调整菜单文字大小 */
  .menu-text {
    font-size: 0.875rem;
  }

  /* 增强小屏上的触摸区域 */
  .menu-item {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .close-menu-btn {
    padding: 0.75rem;
  }
}

/* 横屏模式优化 */
@media (max-height: 480px) and (orientation: landscape) {
  .side-menu {
    overflow-y: auto;
  }

  .menu-items {
    max-height: 65vh;
    overflow-y: auto;
  }

  .menu-item {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .menu-header {
    padding: 0.75rem 1rem;
  }

  .menu-footer {
    padding: 0.5rem 1rem;
  }

  /* 调整菜单切换按钮位置 */
  .menu-toggle {
    bottom: 0.75rem;
    left: 0.75rem;
  }
}

/* 安全区域适配 (适应各种刘海屏、打孔屏) */
@supports (padding-top: env(safe-area-inset-top)) {
  .side-menu {
    padding-top: env(safe-area-inset-top);
    height: calc(100vh - env(safe-area-inset-bottom));
  }

  .content-header {
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }

  .menu-toggle {
    bottom: max(1.25rem, env(safe-area-inset-bottom));
    left: max(1.25rem, env(safe-area-inset-left));
  }

  .content-body {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}
</style>