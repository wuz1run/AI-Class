<!-- 父组件 ChatView.vue -->
<template>
  <div class="flex h-screen w-full bg-base-200 relative">
    <!-- 侧边栏话题列表 -->
    <div class="card bg-base-100 w-[300px] shadow-md">
      <div class="card-body">
        <div class="flex justify-between items-center mb-2">
          <h2 class="card-title">会话列表</h2>
          <button
              class="btn btn-circle btn-sm"
              @click="openCreateDialog"
          >
            <el-icon><Plus /></el-icon>
          </button>
        </div>
        <div class="divider my-1"></div>
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

    <!-- 主内容区域 -->
    <div class="flex-1 relative">
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
      <div class="modal-box">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTopicListAPI, createTopicAPI, deleteTopicAPI } from '../../apis'
import chatBox from '../../components/chatBox/index.vue'
import {MoreFilled} from "@element-plus/icons-vue";

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

// 初始化加载
onMounted(async () => {
  await loadTopics()
  syncRouteWithState()
})

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
  let code=ref(0)
    const res = await createTopicAPI({ topic: newTopicTitle.value })

    if (res['code'] === 200) {
      await loadTopics()

      closeCreateDialog()
      ElMessage.success('创建成功')
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

.modal-box {
  @apply w-96;
}
</style>