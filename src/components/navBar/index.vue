<template>
  <!-- 导航栏主体 -->
  <div class="navbar bg-base-100 shadow-md h-[50px]">
    <!-- 汉堡菜单按钮（仅在移动端显示） -->
    <div class="flex-none md:hidden">
      <button class="btn btn-square btn-ghost" @click="toggleMobileMenu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- 左侧导航项 - 在移动端隐藏，在桌面端显示 -->
    <div class="flex-1 hidden md:block">
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

    <!-- Logo或网站名称 - 在移动端居中显示 -->
    <div class="flex-1 justify-center md:hidden">
      <a class="text-xl font-bold" @click="navigateToProfile">贝壳精灵</a>
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

  <!-- 移动端菜单 - 条件渲染 -->
  <div v-if="showMobileMenu" class="md:hidden bg-base-100 shadow-md">
    <ul class="menu menu-vertical px-1 py-2 font-bold">
      <template v-for="item in visibleNavItems" :key="item.path">
        <li>
          <router-link
              :to="item.path"
              class="[&.router-link-active]:text-primary hover:bg-base-200 px-3 py-2 rounded"
              @click="showMobileMenu = false"
          >
            {{ item.name }}
          </router-link>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { navItems, type UserRole } from '../../stores/navConfig'
import { useMainStore } from '../../stores'
import userInfoStore from "../../stores/Server/userInfoStore";

const router = useRouter()
const mainStore = useMainStore()
const userStore = mainStore.userInfoStore()
const loginStore = mainStore.loginStore()

// 移动端菜单状态
const showMobileMenu = ref(false)

// 切换移动端菜单的显示/隐藏
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

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
  // 移动端自动关闭菜单
  showMobileMenu.value = false
}

const navigateToProfile = () => {
  router.push(`/home`)
  // 移动端自动关闭菜单
  showMobileMenu.value = false
}
</script>

<style scoped>
/* 可以在这里添加额外的样式，如果需要 */
@media (max-width: 768px) {
  /* 移动端特定样式 */
  .navbar {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>