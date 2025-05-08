<template>
  <div class="login-container">
    <!-- 背景图片 -->
    <div class="bg-image"></div>
    <div class="floating-elements" ref="floatingElements"></div>

    <div class="flex-1 flex flex-col items-center justify-center relative">
      <h2 class="main-title">
        <span>贝</span><span>壳</span><span>精</span><span>灵</span><span>——</span><span>备</span><span>课</span><span>无</span><span>忧</span>
      </h2>
    </div>

    <div class="login-card">
      <div class="card-body">
        <h1 class="card-title">登录</h1>
        <div class="info-text">
          <p>已有账号，输入邮箱+密码即可</p>
          <p>没有账号，先去注册</p>
        </div>

        <label class="input-group">
          <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input v-model="email" type="text" class="input-field" placeholder="邮箱" />
        </label>

        <label class="input-group">
          <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" />
          </svg>
          <input v-model="password" type="password" class="input-field" placeholder="密码" />
        </label>

        <div class="links-container">
          <router-link to="/login/findPassword" class="link-text">忘记密码？</router-link>
          <router-link to="/register" class="link-text">没有账号？先去注册</router-link>
        </div>

        <button @click="login" class="login-btn" :class="{ 'btn-loading': loading }">
          <span class="btn-text">点击登录</span>
        </button>
      </div>
    </div>

    <div class="app-download">
      <p class="download-text">扫码下载配套APP</p>
      <img src="/R.png" class="app-icon" alt="微信" />

      <div class="qrcode-container">
        <img src="/QRCode.png" class="qrcode" alt="二维码" />
        <p class="qrcode-text">扫码下载贝壳精灵任务助手APP</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRequest } from "vue-hooks-plus";
import { loginAPI, getUserInfoAPI } from "../../apis"
import { ElNotification } from 'element-plus'
import { useMainStore } from "../../stores";
import router from "../../router";

const loginstore = useMainStore().loginStore();
const userinfostore = useMainStore().userInfoStore();

const email = ref<string>("");
const password = ref<string>("");
const loading = ref<boolean>(false);
const floatingElements = ref(null);

onMounted(() => {
  createFloatingElements();
  animateTitle();
});

const createFloatingElements = () => {
  if (!floatingElements.value) return;

  const container = floatingElements.value;
  const elementCount = 15;
  const elements = ['⚙️', '🔍', '📊', '📝', '🎓', '📚', '💡', '🖥️'];

  for (let i = 0; i < elementCount; i++) {
    const element = document.createElement('div');
    element.classList.add('floating-element');

    // 随机选择元素
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    element.textContent = randomElement;

    // 随机位置和大小
    const size = Math.random() * 24 + 16;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 30 + 20;

    element.style.fontSize = `${size}px`;
    element.style.left = `${posX}%`;
    element.style.top = `${posY}%`;
    element.style.animationDelay = `${delay}s`;
    element.style.animationDuration = `${duration}s`;

    container.appendChild(element);
  }
};

const animateTitle = () => {
  const titleChars = document.querySelectorAll('.main-title span');
  titleChars.forEach((char, index) => {
    char.style.animationDelay = `${0.1 * index}s`;
  });
};

const login = async () => {
  if (!email.value || !password.value) {
    ElNotification.warning("请输入邮箱和密码");
    return;
  }

  loading.value = true;

  try {
    const loginRes = await loginAPI({
      email: email.value,
      password: password.value,
    });

    // 处理 loginAPI 的非 200 响应
    if (loginRes.code !== 200) {
      throw new Error(loginRes.msg || "登录失败，请检查邮箱和密码");
    }

    // 安全存储 Token（需结合环境配置）
    localStorage.setItem("token", loginRes.data.token);
    console.log("Token:", localStorage.getItem("token"));
    loginstore.setLogin(true);

    // 获取用户信息
    const userRes = await getUserInfoAPI();
    if (userRes.code !== 200) {
      throw new Error(userRes.msg || "获取用户信息失败");
    }

    userinfostore.setInfo(userRes.data);

    // 确保用户角色存在
    const role = userinfostore.userInfo?.character;
    if (!role) {
      ElNotification.warning("未获取到用户角色，请联系管理员");
      loginstore.setLogin(false); // 重置登录状态
      localStorage.removeItem("token");
      return;
    }

    // 添加成功动画
    ElNotification.success({
      title: "登录成功",
      message: `欢迎回来，${userinfostore.userInfo?.name || '用户'}`,
      duration: 2000
    });

    // 延迟跳转，展示成功动画
    setTimeout(() => {
      // 跳转到目标页面
      const targetRoute = role === "teacher" ? "/chat" : "/studentQuizView";
      router.push({
        path: targetRoute,
      });
    }, 800);

  } catch (error) {
    // 处理错误信息
    const message = error.message || "未知错误，请重试";
    ElNotification.error(message);
  } finally {
    loading.value = false;
  }
};

const getUserInfo = () => {
  useRequest(()=>getUserInfoAPI(),{
    onSuccess(res){
      if(res['code']===200){
        userinfostore.setInfo(res['data']);
      }else{
        ElNotification({title: 'Warning', message: res['msg'], type: 'warning',})
      }
    },
    onError(err){
      ElNotification({title: 'Error', message: err.toString(), type: 'error',})
    }
  })
}
</script>

<style scoped>
/* 基础样式重置 */
/* 基础样式重置 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 容器 */
.login-container {
  position: relative;
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  color: #333;
}

/* 背景 */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/background.png') center/cover no-repeat;
  opacity: 1;
  z-index: 0; /* 关键修改 */
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  opacity: 0.3;
  animation: float 30s linear infinite;
  color: #333;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

/* 主标题 */
.main-title {
  position: absolute;
  top: 5%;
  left: 53%;
  transform: translateX(-50%);
  font-size: 3.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  text-shadow: 2px 2px 3px rgba(150, 150, 150, 0.3);
  letter-spacing: 0.1em;
}

.main-title span {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

/* 登录卡片 */
.login-card {
  position: relative;
  width: 400px;
  margin-right: 5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  align-self: center;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: bold;
  animation: fadeIn 1s ease;
}

.info-text {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #5a6c7d;
  animation: fadeIn 1.2s ease;
}

/* 输入框组 */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
  animation: fadeIn 1.4s ease;
}

.input-icon {
  position: absolute;
  left: 12px;
  height: 1.2rem;
  width: 1.2rem;
  opacity: 0.6;
  color: #4b6584;
  z-index: 1;
}

.input-field {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: #97a2b0;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* 链接容器 */
.links-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
  animation: fadeIn 1.6s ease;
}

.link-text {
  color: #3498db;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link-text:hover {
  color: #2980b9;
  text-decoration: underline;
  transform: translateY(-2px);
}

/* 登录按钮 */
.login-btn {
  position: relative;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeIn 1.8s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.2);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.5rem;
  height: 1.5rem;
  margin: -0.75rem 0 0 -0.75rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-loading .btn-text {
  opacity: 0;
}

/* APP下载部分 */
.app-download {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-text {
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.app-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.app-download:hover .app-icon {
  transform: scale(1.05);
}

.qrcode-container {
  position: absolute;
  bottom: 6rem;
  left: 0;
  width: 10rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition: all 0.3s ease;
  pointer-events: none;
}

.app-download:hover .qrcode-container {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.qrcode {
  width: 100%;
  height: auto;
}

.qrcode-text {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
  color: #333;
}

/* 动画 */
@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式布局 - 平板设备 */
@media screen and (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }

  .main-title {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    font-size: 3rem;
    margin: 2rem auto;
  }

  .login-card {
    width: 70%;
    margin: 0 auto;
    align-self: center;
  }

  .app-download {
    position: static;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .qrcode-container {
    position: relative;
    bottom: auto;
    left: auto;
    margin-top: 1rem;
    width: 8rem;
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
}

/* 响应式布局 - 手机设备 */
@media screen and (max-width: 768px) {
  body {
    overflow-y: auto;
  }

  .login-container {
    height: auto;
    min-height: 100vh;
    padding: 1rem 0;
  }

  .main-title {
    font-size: 2rem;
    margin: 1.5rem auto;
  }

  .login-card {
    width: 85%;
    padding: 1.5rem;
    margin: 0 auto;
  }

  .card-title {
    font-size: 2rem;
  }

  .app-download {
    margin-top: 2rem;
  }

  .app-icon {
    width: 4rem;
    height: 4rem;
  }

  .floating-element {
    font-size: 12px !important;
  }
}

/* 超小屏幕设备 */
@media screen and (max-width: 480px) {
  .main-title {
    font-size: 1.7rem;
  }

  .login-card {
    width: 90%;
    padding: 1rem;
  }

  .card-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .info-text {
    font-size: 0.8rem;
  }

  .input-field {
    font-size: 0.9rem;
  }

  .link-text {
    font-size: 0.8rem;
  }

  .login-btn {
    padding: 0.6rem;
  }

  .download-text {
    font-size: 0.8rem;
  }

  .app-icon {
    width: 3.5rem;
    height: 3.5rem;
  }

  .qrcode-container {
    width: 7rem;
  }

  .qrcode-text {
    font-size: 0.7rem;
  }
}

/* 处理横屏模式 */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .login-container {
    flex-direction: row;
    justify-content: center;
    overflow-y: auto;
  }

  .main-title {
    display: none;
  }

  .login-card {
    margin: 0 1rem;
    width: 60%;
    max-width: 350px;
  }

  .app-download {
    position: static;
    margin: 0;
    align-self: center;
  }

  .floating-element {
    display: none;
  }
}
</style>