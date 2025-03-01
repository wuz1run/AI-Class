<template>
<div class="navbar bg-base-100 shadow-md h-[50px]">
  <div class="flex-1 ">
    <ul v-if="loginstore.loginSession" class="menu menu-horizontal px-1 font-bold">
    <li><router-link to ="/home">首页</router-link> </li>
    </ul>
  </div>
  <div class="flex-none">
    <ul v-if="!loginstore.loginSession" class="menu menu-horizontal px-1 font-bold">
      <li><router-link to="/login">登录</router-link></li>
      <li><router-link to="/register">注册</router-link></li>
    </ul>
    <ul v-else class="menu menu-horizontal px-1 flex items-center font-bold">

      <li><router-link to="/chat">AI教案设计</router-link></li>
      <li><router-link to="/myResources">我的资源</router-link></li>
      <li><router-link to="/quizRelease">习题发布</router-link> </li>
      <li><router-link to="/classManagement">我的班级</router-link></li>
      <div class="dropdown dropdown-end mr-4">
        <div class="avatar" tabindex="0" role="button">
          <div class="w-[40px] rounded-full">
            <img :src="userinfostore.userInfo.avatar" />
          </div>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li><a @click="loginOut">退出登录</a></li>
          <li><a>To be filled</a></li>
        </ul>
      </div>
    </ul>
  </div>
</div>
</template>

<script setup lang="ts">
import { useMainStore } from "../../stores";
import router from "../../router";

const loginstore = useMainStore().loginStore();
const userinfostore = useMainStore().userInfoStore();

const loginOut = () => {
  localStorage.removeItem("token");
  loginstore.setLogin(false);
  userinfostore.clearInfo();
  router.push('/login');
}
</script>

<style scoped>
.main{
  display: flex;
  justify-content: left;
  left: 600px;
}
</style>