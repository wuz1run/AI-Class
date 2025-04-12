<template>
    <!-- 导航栏主体 -->
    <div class="navbar bg-base-100 shadow-md h-[50px]">
      <!-- 左侧导航项 -->
      <div class="flex-1">
        <ul class="menu menu-horizontal px-1 font-bold gap-2">
          <template v-for="item in visibleNavItems" :key="item.path">
            <li>
              <router-link
                  :to="item.path"
                  class="[&.router-link-active]:text-primary hover:bg-base-200 px-3 py-2 rounded"
              >
                {{ item.name }}
              </router-link>
            </li>
          </template>
        </ul>
      </div>

      <!-- 右侧用户菜单 -->
      <div class="flex-none gap-4">

        <div class="dropdown dropdown-end mr-4">
          <div class="avatar" tabindex="0" role="button">
            <div class="w-[40px] rounded-full">
              <img :src="userStore.userInfo.avatar" />
            </div>
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">

            <li><a @click="gotouserinfo">用户信息</a></li>
            <li><a @click="logout" style="color:red">退出登录</a></li>
          </ul>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { navItems,type UserRole } from '../../stores/navConfig'
import { useMainStore } from '../../stores'
import userInfoStore from "../../stores/Server/userInfoStore";

const router = useRouter()
const mainStore = useMainStore()
const userStore = mainStore.userInfoStore()
const loginStore = mainStore.loginStore()

// 用户信息简写
const userInfo = computed(() => userStore.userInfo)
const currentRole = computed(() => userInfo.value.character as UserRole || 'student')

// 导航项过滤逻辑
const visibleNavItems = computed(() => {
  return navItems.filter(item =>
      item.roles.includes('*') ||
      item.roles.includes(currentRole.value)
  ).filter(item =>
      item.requireAuth ? loginStore.loginSession : true
  )
})

// 管理员专属导航项
const adminNavItems = computed(() => {
  return navItems.filter(item =>
      item.roles.includes('admin') &&
      item.roles.includes(currentRole.value)
  )
})

// 是否显示顶部图片
const showTopImage = computed(() => !router.currentRoute.value.meta.hideTopImage)

const logout = () => {
  localStorage.removeItem("token");
  loginStore.setLogin(false);
  userStore.clearInfo();
  router.push('/login');
}
function gotouserinfo() {
  router.push('/userInfo')
}
const navigateToProfile = () => {
  router.push(`/home`)
}
</script>