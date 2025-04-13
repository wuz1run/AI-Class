<template>
  <div
      class="flex w-full h-screen overflow-hidden bg-[url('/login/bg.jpg')] bg-no-repeat bg-center bg-cover">

    <div class="flex-1 flex flex-col items-center justify-center relative">
      <h2 class="text-6xl font-bold text-center mb-4 absolute top-[5%] left-[53%] -translate-x-1/2">
        AI驱动的备课系统
      </h2>
    </div>

    <div class="w-96 shadow-xl bg-white/20 backdrop-blur-lg border border-white/10 mr-20 py-4">
      <div class="card-body px-6">
        <h1 class="card-title text-4xl justify-center">登录</h1>
        <div class="mt-2 text-center text-sm text-white">
          <p>已有账号，输入邮箱+密码即可</p>
          <p>没有账号，先去注册</p>
        </div>

        <label class="input input-bordered flex items-center gap-2 mt-4">
          <!-- 邮箱图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input v-model="email" type="text" class="grow" placeholder="Email" />
        </label>

        <label class="input input-bordered flex items-center gap-2 mt-4">
          <!-- 密码图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" />
          </svg>
          <input v-model="password" type="password" class="grow" placeholder="Password" />
        </label>

        <div class="mt-3 text-sm text-center">
          <router-link to="/login/findPassword" class="text-blue-700 cursor-pointer hover:underline">忘记密码？</router-link>
        </div>

        <div class="mt-1 text-sm text-center">
          <router-link to="/register" class="text-blue-700 cursor-pointer hover:underline">没有账号？先去注册</router-link>
        </div>

        <div @click="login" class="relative h-[30px] cursor-pointer mt-4">
          <img src="/btn%20watch.png">
          <div class="absolute top-[30%] left-[40%] text-base-100">点击登录</div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-4 left-4 group cursor-pointer z-50">
      <p>
        扫码下载配套APP
      </p>
      <!-- 图标（你可以换成任何 SVG 或图片） -->
      <img src="/R.png" class="w-20 h-20" alt="微信" />

      <!-- 二维码容器 -->
      <div
          class="absolute bottom-12 left-0 w-40 p-2 bg-white rounded shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
        <img src="/QRCode.png" class="w-full h-auto" alt="二维码" />
        <p class="text-xs text-center mt-1">扫码下载贝壳精灵任务助手APP</p>
      </div>
    </div>
  </div>>
</template>


<script setup lang="ts">
import { ref } from "vue";
import { useRequest } from "vue-hooks-plus";
import { loginAPI, getUserInfoAPI } from "../../apis"
import { ElNotification } from 'element-plus'
import { useMainStore } from "../../stores";
import router from "../../router";
import {nextTick} from "vue";
const loginstore = useMainStore().loginStore();
const userinfostore = useMainStore().userInfoStore();

const email = ref<string>();
const password = ref<string>();

const login = async () => {
  try {
    const loginRes = await loginAPI({
      email: email.value,
      password: password.value,
    }
    )
    ;

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

    // 跳转到目标页面
    const targetRoute = role === "teacher" ? "/chat" : "/studentQuizView";
    router.push({
      path: targetRoute,
    });

  } catch (error) {
    // 处理错误信息
    const message = error.message || "未知错误，请重试";
    ElNotification.error(message);

    // 清理登录状态（可选）
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
/* 防止 body 默认滚动条出现 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

</style>