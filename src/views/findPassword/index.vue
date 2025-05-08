<template>
  <div class="password-recovery-container">
    <div class="floating-elements">
      <div class="float-item" v-for="n in 5" :key="n"></div>
    </div>
    <div class="card-container">
      <div class="card">
        <div class="card-header">
          <div class="lock-icon">
            <i class="fas fa-lock"></i>
          </div>
          <h2 class="card-title">找回密码</h2>
        </div>
        <div class="card-body">
          <label class="form-control">
            <div class="label">
              <span class="label-text">您的邮箱地址</span>
            </div>
            <div class="input-group">
              <input v-model="info.email" type="text" placeholder="请输入邮箱" class="input" />
              <button @click="visible = true" :disabled="isSendingCode || countdown > 0" class="send-btn">
                <span class="btn-text">{{ countdown > 0 ? `重新发送(${countdown})` : "发送验证码" }}</span>
                <span class="btn-icon"><i class="fas fa-paper-plane"></i></span>
              </button>
            </div>
            <div v-if="visible" class="verification-container">
              <slide-verify
                  ref="block"
                  slider-text="拖动滑块完成拼图"
                  :imgs="images"
                  accuracy="5"
                  @again="onAgain"
                  @success="onSuccess"
                  @fail="onFail"
              ></slide-verify>
            </div>
          </label>

          <div class="verification-code">
            <label class="form-control">
              <div class="label">
                <span class="label-text">验证码</span>
              </div>
              <input v-model="info.code" type="text" placeholder="请输入验证码" class="input code-input" />
            </label>
          </div>

          <label class="form-control">
            <div class="label">
              <span class="label-text">请输入新密码</span>
            </div>
            <div class="password-input-wrapper">
              <input v-model="info.pass1" :type="showPassword1 ? 'text' : 'password'" placeholder="新密码" class="input" />
              <span class="password-toggle" @click="showPassword1 = !showPassword1">
                <i :class="showPassword1 ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </label>

          <label class="form-control">
            <div class="label">
              <span class="label-text">请再次输入新密码</span>
            </div>
            <div class="password-input-wrapper">
              <input v-model="info.pass2" :type="showPassword2 ? 'text' : 'password'" placeholder="确认新密码" class="input" />
              <span class="password-toggle" @click="showPassword2 = !showPassword2">
                <i :class="showPassword2 ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
          </label>

          <div v-if="!isEqual" role="alert" class="alert">
            <i class="fas fa-exclamation-triangle alert-icon"></i>
            <span>警告：两次密码不一致</span>
          </div>

          <button @click="findPass" class="submit-btn">
            <span class="btn-text">重置密码</span>
            <span class="btn-icon"><i class="fas fa-key"></i></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import SlideVerify, { SlideVerifyInstance } from "vue3-slide-verify";
import "vue3-slide-verify/dist/style.css";
import { useRequest } from "vue-hooks-plus";
import { findPasswordAPI, sendVerificationCodeAPI } from "../../apis";
import { ElNotification } from 'element-plus';
import router from "../../router";

const info = reactive({
  email: "",
  code: "",
  pass1: "",
  pass2: "",
});

const isEqual = ref(true);
const showPassword1 = ref(false);
const showPassword2 = ref(false);
const visible = ref(false);  // 拼图显示标识
const images = reactive([
  'https://t7.baidu.com/it/u=2609096218,1652764947&fm=193&f=GIF',
  'https://t7.baidu.com/it/u=2541348729,1193227634&fm=193&f=GIF',
  'https://t7.baidu.com/it/u=2673836711,2234057813&fm=193&f=GIF',
]);
const block = ref<SlideVerifyInstance>();

// 初始化浮动元素动画
onMounted(() => {
  initFloatingElements();
});

const initFloatingElements = () => {
  const elements = document.querySelectorAll('.float-item');
  elements.forEach((el, index) => {
    const element = el as HTMLElement;
    element.style.animationDelay = `${index * 0.5}s`;
    element.style.left = `${Math.random() * 80 + 10}%`;
    element.style.top = `${Math.random() * 80 + 10}%`;
  });
};

const onAgain = () => { // 检测非人为操作的回调
  block.value?.refresh();
};

const onSuccess = (times: number) => { // 拼图验证成功的回调
  setTimeout(() => {
    visible.value = false;
    sendVerificationCode();
  }, 1500);
};

const onFail = () => {
  // 验证失败的处理
  ElNotification({
    title: '提示',
    message: '验证失败，请重试',
    type: 'warning',
  });
};

const isSendingCode = ref(false);
const countdown = ref<number>(0);

const sendVerificationCode = () => {
  isSendingCode.value = true;
  countdown.value = 60; // 改为60秒倒计时，更符合实际应用

  useRequest(() => sendVerificationCodeAPI(info.email), {
    onSuccess(res) {
      if (res.code === 200) {
        ElNotification({
          title: '成功',
          message: "验证码发送成功，请查收邮件",
          type: 'success',
        });
      } else {
        ElNotification({
          title: '警告',
          message: res.msg,
          type: 'warning',
        });
      }
    },
    onError(err) {
      ElNotification({
        title: '错误',
        message: err,
        type: 'error',
      });
    }
  });

  const countInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countInterval);
      isSendingCode.value = false;
    }
  }, 1000);
};

const findPass = () => {
  if (info.email === "" || info.code === "" || info.pass1 === "" || info.pass2 === "") {
    ElNotification({
      title: '警告',
      message: '所有字段不能为空！',
      type: 'warning',
    });
    return;
  }

  if (!isEqual.value) {
    ElNotification({
      title: '警告',
      message: '两次密码不一致！',
      type: 'warning',
    });
    return;
  }

  useRequest(() => findPasswordAPI({
    email: info.email,
    code: info.code,
    new_password: info.pass1,
  }), {
    onSuccess(res) {
      if (res.code === 200) {
        ElNotification({
          title: '成功',
          message: "即将跳转到登录界面",
          type: 'success',
          duration: 2000
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        ElNotification({
          title: '警告',
          message: res.msg,
          type: 'warning',
        });
      }
    },
    onError(err) {
      ElNotification({
        title: '错误',
        message: err,
        type: 'error',
      });
    }
  });
};

watch([() => info.pass1, () => info.pass2], ([new1, new2], [old1, old2]) => {
  if (info.pass1 !== info.pass2 && info.pass2 !== "") {
    isEqual.value = false;
  } else {
    isEqual.value = true;
  }
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.password-recovery-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #8bc6ec 0%, #9599e2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* 浮动元素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.float-item {
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float 15s infinite linear;
}

.float-item:nth-child(odd) {
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
}

.float-item:nth-child(3n) {
  background: rgba(255, 255, 255, 0.1);
  width: 120px;
  height: 120px;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.5;
  }
  25% {
    transform: translateY(-40px) rotate(90deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-80px) rotate(180deg);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-40px) rotate(270deg);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 0.5;
  }
}

/* 卡片容器 */
.card-container {
  z-index: 10;
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
}

.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
  transition: transform 0.6s, box-shadow 0.6s;
  animation: cardAppear 0.6s forwards;
  transform-style: preserve-3d;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.card:hover {
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.3);
  transform: translateY(-5px);
}

.card-header {
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lock-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 5px 15px rgba(106, 17, 203, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 5px 15px rgba(106, 17, 203, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 5px 25px rgba(106, 17, 203, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 5px 15px rgba(106, 17, 203, 0.2);
  }
}

.lock-icon i {
  color: white;
  font-size: 28px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.card-body {
  padding: 24px;
}

/* 表单控件 */
.form-control {
  margin-bottom: 20px;
  width: 100%;
}

.label {
  margin-bottom: 8px;
}

.label-text {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 15px;
}

.input:focus {
  border-color: #2575fc;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 117, 252, 0.1);
  outline: none;
}

.input::placeholder {
  color: #aaa;
}

.input-group {
  display: flex;
  gap: 12px;
}

.send-btn {
  height: 48px;
  padding: 0 16px;
  background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.send-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 154, 158, 0.3);
}

.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 验证码输入 */
.verification-container {
  margin-top: 16px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.verification-code {
  margin-top: 16px;
}

.code-input {
  letter-spacing: 4px;
  font-weight: 600;
  text-align: center;
}

/* 密码输入框 */
.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #555;
}

/* 警告提示 */
.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(254, 226, 226, 0.8);
  border-radius: 8px;
  color: #ef4444;
  margin: 16px 0;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.alert-icon {
  margin-right: 12px;
  font-size: 18px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 50px;
  margin-top: 24px;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
  );
  transition: 0.5s;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(106, 17, 203, 0.3);
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:active {
  transform: translateY(0);
}

/* 响应式设计 - 移动设备适配 */
@media (max-width: 768px) {
  .card {
    width: 100%;
  }

  .card-body {
    padding: 16px;
  }

  .card-header {
    padding: 16px 16px 0;
  }

  .lock-icon {
    width: 60px;
    height: 60px;
  }

  .lock-icon i {
    font-size: 24px;
  }

  .card-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .input-group {
    flex-direction: column;
    gap: 8px;
  }

  .send-btn {
    width: 100%;
    justify-content: center;
  }

  .input {
    height: 44px;
    font-size: 14px;
  }

  .code-input {
    letter-spacing: 2px;
  }
}

/* 小型移动设备 */
@media (max-width: 480px) {
  .float-item:nth-child(3n) {
    width: 80px;
    height: 80px;
  }

  .lock-icon {
    width: 50px;
    height: 50px;
  }

  .lock-icon i {
    font-size: 20px;
  }

  .card-title {
    font-size: 18px;
  }

  .btn-text {
    font-size: 14px;
  }

  .label-text {
    font-size: 13px;
  }

  .submit-btn {
    height: 46px;
    font-size: 15px;
  }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .card {
    width: 90%;
    max-width: 500px;
  }

  .card-body {
    padding: 20px;
  }
}
</style>