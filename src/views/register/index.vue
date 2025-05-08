<template>
  <div class="registration-container">
    <!-- 背景动画元素 -->
    <div class="animated-bg">
      <div v-for="n in 10" :key="n" class="floating-shape"></div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧装饰 -->
      <div class="decoration-column left-decoration">
        <el-image src="/login/left.png" class="decoration-image" />
        <div class="decoration-line"></div>
      </div>

      <!-- 注册卡片 -->
      <div class="registration-card">
        <div class="card-header">
          <h2 class="card-title">注册新用户</h2>
          <div class="title-underline"></div>
        </div>

        <div class="card-body">
          <!-- 用户名输入 -->
          <div class="input-group">
            <label class="input-label">用户名</label>
            <div class="input-wrapper">
              <i class="input-icon fa fa-user"></i>
              <input v-model="info.username" type="text" class="custom-input" placeholder="请输入用户名" />
            </div>
          </div>

          <!-- 身份选择 -->
          <div class="input-group">
            <label class="input-label">身份</label>
            <div class="input-wrapper">
              <i class="input-icon fa fa-id-card"></i>
              <select v-model="info.role" class="custom-input">
                <option disabled value="">请选择身份</option>
                <option>老师</option>
                <option>学生</option>
              </select>
            </div>
          </div>

          <!-- 邮箱输入 -->
          <div class="input-group">
            <label class="input-label">邮箱</label>
            <div class="input-wrapper">
              <i class="input-icon fa fa-envelope"></i>
              <input v-model="info.email" type="text" class="custom-input" placeholder="请输入邮箱" />
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <label class="input-label">密码</label>
            <div class="input-wrapper">
              <i class="input-icon fa fa-lock"></i>
              <input v-model="info.pass1" type="password" class="custom-input" placeholder="请输入密码" />
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="input-group">
            <label class="input-label">确认密码</label>
            <div class="input-wrapper">
              <i class="input-icon fa fa-lock"></i>
              <input v-model="info.pass2" type="password" class="custom-input" placeholder="请再次输入密码" />
            </div>
          </div>

          <!-- 密码不一致警告 -->
          <div v-if="!isEqual" class="alert-warning">
            <i class="fa fa-exclamation-triangle"></i>
            <span>两次密码不一致</span>
          </div>

          <!-- 注册按钮 -->
          <div class="register-btn-wrapper">
            <button @click="register" class="register-btn pulse">
              <span>点击注册</span>
              <i class="fa fa-arrow-right"></i>
            </button>
          </div>

          <!-- 已有账号跳转登录 -->
          <div class="login-link">
            已有账号？<a href="/login">立即登录</a>
          </div>
        </div>
      </div>

      <!-- 右侧装饰 -->
      <div class="decoration-column right-decoration">
        <el-image src="/login/right.png" class="decoration-image" />
        <div class="decoration-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useRequest } from "vue-hooks-plus";
import { registerAPI } from "../../apis";
import { ElNotification } from "element-plus";
import router from "../../router";

// 注册信息
const info = ref({
  username: "",
  email: "",
  pass1: "",
  pass2: "",
  role: ""
});

// 密码一致性检查
const isEqual = ref<boolean>(true);

// 监听密码变化，检查一致性
watch([() => info.value.pass1, () => info.value.pass2], ([new1, new2], [old1, old2]) => {
  if (info.value.pass1 !== info.value.pass2 && info.value.pass2 !== "") {
    isEqual.value = false;
  } else {
    isEqual.value = true;
  }
}, { deep: true });

// 动画效果初始化
onMounted(() => {
  initFloatingShapes();
});

// 初始化浮动形状的动画
const initFloatingShapes = () => {
  const shapes = document.querySelectorAll('.floating-shape');
  shapes.forEach((shape, index) => {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomSize = 20 + Math.random() * 60;
    const randomSpeed = 10 + Math.random() * 30;
    const randomDelay = Math.random() * 5;
    const randomOpacity = 0.1 + Math.random() * 0.3;

    const shapeEl = shape as HTMLElement;
    shapeEl.style.left = `${randomX}%`;
    shapeEl.style.top = `${randomY}%`;
    shapeEl.style.width = `${randomSize}px`;
    shapeEl.style.height = `${randomSize}px`;
    shapeEl.style.animationDuration = `${randomSpeed}s`;
    shapeEl.style.animationDelay = `${randomDelay}s`;
    shapeEl.style.opacity = `${randomOpacity}`;
    shapeEl.style.backgroundColor = index % 2 === 0 ? 'var(--shape-color-1)' : 'var(--shape-color-2)';
  });
};

// 注册逻辑
const register = () => {
  // 表单验证
  if (info.value.username === "" || info.value.email === "" || info.value.pass1 === "") {
    ElNotification({
      title: '提示',
      message: '请填写完整的表单信息！',
      type: 'warning',
      duration: 3000
    });
    return;
  }

  if (isEqual.value === false) {
    ElNotification({
      title: '提示',
      message: '两次密码不一致！',
      type: 'warning',
      duration: 3000
    });
    return;
  }

  // 显示加载动画
  const btn = document.querySelector('.register-btn');
  if (btn) btn.classList.add('loading');

  // 发送注册请求
  useRequest(() => registerAPI({
    username: info.value.username,
    email: info.value.email,
    password: info.value.pass1,
    character: computed(() => {
      if (info.value.role === "老师") {
        return 0;
      } else {
        return 1;
      }
    }).value
  }), {
    onSuccess(res) {
      // 移除加载动画
      if (btn) btn.classList.remove('loading');

      if (res['code'] === 200) {
        ElNotification({
          title: '成功',
          message: "注册成功，即将跳转到登录页面",
          type: 'success',
          duration: 2000
        });

        // 显示成功动画，然后跳转
        if (btn) btn.classList.add('success');
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        ElNotification({
          title: '警告',
          message: res['msg'] || '注册失败，请稍后重试',
          type: 'warning',
          duration: 3000
        });
      }
    },
    onError(err) {
      // 移除加载动画
      if (btn) btn.classList.remove('loading');

      ElNotification({
        title: '错误',
        message: err || '网络错误，请稍后重试',
        type: 'error',
        duration: 3000
      });
    },
  });
};
</script>

<style scoped>
/* 颜色变量 */
:root {
  --primary-color: #4a69bd;
  --primary-light: #6a89cc;
  --primary-dark: #1e3799;
  --secondary-color: #f6b93b;
  --error-color: #e55039;
  --success-color: #78e08f;
  --bg-color: #f5f6fa;
  --card-bg: #ffffff;
  --text-color: #2c3e50;
  --text-light: #7f8c8d;
  --shape-color-1: rgba(106, 137, 204, 0.2);
  --shape-color-2: rgba(246, 185, 59, 0.2);
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* 整体容器 */
.registration-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 背景动画 */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  animation: float linear infinite;
  z-index: 1;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

/* 内容包装器 */
.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  z-index: 10;
  margin: 40px 0;
  padding: 0 20px;
}

/* 装饰列 */
.decoration-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.decoration-column:hover {
  opacity: 1;
  transform: translateY(-5px);
}

.left-decoration {
  animation: sway 8s ease-in-out infinite;
}

.right-decoration {
  animation: sway 8s ease-in-out infinite reverse;
}

@keyframes sway {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.decoration-image {
  width: 400px;
  max-width: 100%;
  filter: drop-shadow(0 10px 15px var(--shadow-color));
}

.decoration-line {
  width: 80%;
  height: 3px;
  margin-top: 20px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  border-radius: 3px;
}

/* 注册卡片 */
.registration-card {
  width: 400px;
  background-color: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 15px 30px var(--shadow-color);
  overflow: hidden;
  transform: translateY(0);
  transition: all 0.3s ease;
  animation: cardAppear 0.6s ease-out;
}

.registration-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  padding: 30px 0 15px;
  text-align: center;
}

.card-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
  position: relative;
  display: inline-block;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-light), var(--secondary-color));
  margin: 10px auto 0;
  border-radius: 3px;
  animation: expand 1s ease-out;
}

@keyframes expand {
  0% {
    width: 0;
  }
  100% {
    width: 80px;
  }
}

/* 卡片内容 */
.card-body {
  padding: 20px 30px 30px;
}

/* 输入组 */
.input-group {
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
}

.input-group:nth-child(1) { animation-delay: 0.1s; }
.input-group:nth-child(2) { animation-delay: 0.2s; }
.input-group:nth-child(3) { animation-delay: 0.3s; }
.input-group:nth-child(4) { animation-delay: 0.4s; }
.input-group:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.custom-input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-color);
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.custom-input:focus {
  border-color: var(--primary-color);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(74, 105, 189, 0.1);
  outline: none;
}

.input-wrapper:focus-within .input-icon {
  color: var(--primary-color);
}

/* 警告提示 */
.alert-warning {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(229, 80, 57, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-out;
}

.alert-warning i {
  color: var(--error-color);
  margin-right: 8px;
}

.alert-warning span {
  color: var(--error-color);
  font-size: 14px;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 注册按钮 */
.register-btn-wrapper {
  margin-top: 30px;
  text-align: center;
}

.register-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(74, 105, 189, 0.3);
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  transform: skewX(-25deg);
  transition: all 0.5s ease;
}

.register-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px rgba(74, 105, 189, 0.4);
}

.register-btn:hover::before {
  animation: shine 1.5s infinite;
}

.register-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(74, 105, 189, 0.4);
}

.register-btn i {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.register-btn:hover i {
  transform: translateX(5px);
}

@keyframes shine {
  0% {
    left: -100%;
  }
  20% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

/* 脉冲效果 */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 105, 189, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(74, 105, 189, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 105, 189, 0);
  }
}

/* 加载动画 */
.register-btn.loading {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  pointer-events: none;
}

.register-btn.loading::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

.register-btn.success {
  background: linear-gradient(135deg, var(--success-color), #39c67a);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 登录链接 */
.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .decoration-image {
    width: 350px;
  }
}

@media (max-width: 991px) {
  .decoration-column {
    display: none;
  }

  .registration-card {
    width: 450px;
  }
}

@media (max-width: 576px) {
  .registration-card {
    width: 100%;
    max-width: 400px;
  }

  .card-body {
    padding: 20px 20px 30px;
  }
}
/* 平板适配 (768px - 991px) */
@media (max-width: 991px) {
  .decoration-column {
    display: none;
  }

  .registration-card {
    width: 450px;
    max-width: 90%;
  }
}

/* 大型手机适配 (576px - 767px) */
@media (max-width: 767px) {
  .registration-card {
    width: 100%;
    max-width: 450px;
    margin: 20px;
  }

  .card-header {
    padding: 25px 0 12px;
  }

  .card-title {
    font-size: 24px;
  }

  .card-body {
    padding: 15px 20px 25px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .custom-input {
    padding: 10px 10px 10px 34px;
    font-size: 14px;
  }

  .register-btn {
    padding: 10px 30px;
    font-size: 15px;
  }

  /* 减少动画元素数量，提高性能 */
  .floating-shape:nth-child(n+6) {
    display: none;
  }
}

/* 小型手机适配 (小于576px) */
@media (max-width: 576px) {
  .registration-container {
    padding: 10px;
  }

  .registration-card {
    width: 100%;
    max-width: 100%;
    margin: 10px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 22px;
  }

  .title-underline {
    width: 60px;
  }

  @keyframes expand {
    0% {
      width: 0;
    }
    100% {
      width: 60px;
    }
  }

  .input-label {
    font-size: 13px;
  }

  .custom-input {
    padding: 10px 10px 10px 32px;
    font-size: 13px;
    border-radius: 6px;
  }

  .input-icon {
    left: 10px;
    font-size: 14px;
  }

  .register-btn {
    padding: 10px 25px;
    font-size: 14px;
  }

  .login-link {
    font-size: 13px;
  }

  /* 进一步减少动画元素 */
  .floating-shape:nth-child(n+4) {
    display: none;
  }
}

/* 极小屏幕适配 (小于375px) */
@media (max-width: 375px) {
  .card-body {
    padding: 12px 15px 20px;
  }

  .input-group {
    margin-bottom: 14px;
  }

  .card-title {
    font-size: 20px;
  }

  .register-btn-wrapper {
    margin-top: 20px;
  }

  /* 确保按钮不会太小，影响用户体验 */
  .register-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 保持竖屏和横屏时的一致体验 */
@media (max-height: 600px) and (orientation: landscape) {
  .registration-container {
    padding: 10px 0;
  }

  .content-wrapper {
    margin: 10px 0;
  }

  .registration-card {
    transform: scale(0.9);
    margin: 0;
  }

  .input-group {
    margin-bottom: 12px;
  }
}
</style>