<!-- 父组件 ChatView.vue -->
<template>
  <div class="flex flex-col md:flex-row h-screen w-full bg-base-200 relative">
    <!-- 侧边栏话题列表 - 在移动端变为顶部可折叠区域 -->
    <div class="card bg-base-100 w-full md:w-[300px] shadow-md" :class="{ 'h-auto': isMobile, 'overflow-y-auto': !isMobile }">
      <div class="card-body p-2 md:p-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="card-title text-lg">会话列表</h2>
          <div class="flex items-center">
            <button
                class="btn btn-circle btn-sm"
                @click="openCreateDialog"
            >
              <el-icon><Plus /></el-icon>
            </button>
            <!-- 移动端显示的折叠按钮 -->
            <button
                class="btn btn-ghost btn-sm ml-2 md:hidden"
                @click="toggleSidebar"
            >
              <el-icon><ArrowDown v-if="!sidebarCollapsed" /><ArrowUp v-else /></el-icon>
            </button>
          </div>
        </div>
        <div class="divider my-1"></div>
        <!-- 移动端可折叠部分 -->
        <div :class="{ 'hidden': isMobile && sidebarCollapsed }">
          <div
              v-for="topic in topics"
              :key="topic.topicid"
              class="topic-item"
              :class="{ 'bg-base-300': currentTopicId === topic.topicid }"
              @click="selectTopic(topic.topicid)"
          >
            <div class="flex justify-between items-center">
              <span class="truncate">{{ topic.title }}</span>
              <div class="dropdown dropdown-end">
                <button
                    tabindex="0"
                    class="btn btn-xs btn-ghost"
                    @click.stop="openActionMenu(topic.topicid)"
                >
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                  <li @click="deleteTopic(topic.topicid)">
                    <a class="text-error">删除</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 relative overflow-y-auto">
      <template v-if="currentTopicId">
        <chat-box
            :topic-id="currentTopicId"
            @close="currentTopicId = 0"
        />
      </template>
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <div class="text-gray-500">请选择或创建会话</div>
      </div>
    </div>

    <!-- 创建会话弹窗 -->
    <dialog ref="createDialog" class="modal">
      <div class="modal-box w-11/12 max-w-md">
        <h3 class="font-bold text-lg mb-4">新建会话</h3>
        <input
            v-model="newTopicTitle"
            type="text"
            placeholder="输入会话标题"
            class="input input-bordered w-full"
            @keyup.enter="createTopic"
        />
        <div class="modal-action">
          <button class="btn" @click="closeCreateDialog">取消</button>
          <button class="btn btn-primary" @click="createTopic">创建</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTopicListAPI, createTopicAPI, deleteTopicAPI } from '../../apis'
import chatBox from '../../components/chatBox/index.vue'
import { MoreFilled, ArrowDown, ArrowUp, Plus } from "@element-plus/icons-vue"

interface Topic {
  topicid: number
  title: string
  created_at: string
  updated_at: string
}

// 状态管理
const topics = ref<Topic[]>([])
const currentTopicId = ref(0)
const newTopicTitle = ref('')
const createDialog = ref<HTMLDialogElement>()
const router = useRouter()
const sidebarCollapsed = ref(false)
const windowWidth = ref(window.innerWidth)

// 响应式设计相关
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 判断是否为移动设备
const isMobile = computed(() => {
  return windowWidth.value < 768 // md断点为768px
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 初始化加载
onMounted(async () => {
  await loadTopics()
  syncRouteWithState()

  // 添加窗口大小变化监听
  window.addEventListener('resize', updateWindowWidth)

  // 在移动设备上，默认折叠侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
})

// 组件卸载时移除事件监听
const onUnmounted = () => {
  window.removeEventListener('resize', updateWindowWidth)
}

// 加载话题列表
const loadTopics = async () => {
  try {
    const res = await getTopicListAPI()
    if (res.code === 200) {
      topics.value = res.data
      autoSelectFirstTopic()
    }
  } catch (error) {
    ElMessage.error('加载会话列表失败')
  }
}

// 自动选择第一个话题
const autoSelectFirstTopic = () => {
  if (topics.value.length > 0) {
    currentTopicId.value = topics.value[0].topicid
  }
}

// 路由状态同步
const syncRouteWithState = () => {
  router.replace({
    query: { topicId: currentTopicId.value }
  })
}

// 话题操作
const selectTopic = (id: number) => {
  currentTopicId.value = id
  syncRouteWithState()

  // 在移动设备上，选择话题后自动折叠侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const openActionMenu = (id: number) => {
  currentTopicId.value = id
}

// 删除话题
const deleteTopic = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该会话吗？', '警告')
    await deleteTopicAPI({id})
    await loadTopics()
    if (currentTopicId.value === id) {
      currentTopicId.value = 0
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 创建新话题
const openCreateDialog = () => {
  createDialog.value?.showModal()
}

const closeCreateDialog = () => {
  createDialog.value?.close()
  newTopicTitle.value = ''
}

const createTopic = async () => {
  if (!newTopicTitle.value.trim()) {
    return ElMessage.warning('请输入会话标题')
  }

  try {
    const res = await createTopicAPI({ topic: newTopicTitle.value })

    if (res['code'] === 200) {
      await loadTopics()
      closeCreateDialog()
      ElMessage.success('创建成功')
    }
  } catch (error) {
    ElMessage.error('创建失败')
  }
}
</script>

<style scoped>
.topic-item {
  @apply p-2 rounded-lg mb-1 cursor-pointer transition-colors;
  &:hover {
    @apply bg-base-300;
  }
}

@media (max-width: 768px) {
  .modal-box {
    width: 90% !important;
    max-width: 360px;
  }
}
</style>