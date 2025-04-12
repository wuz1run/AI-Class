<template>
  <div class="flex flex-col mt-4 gap-5">
    <!-- 班级选择 -->
    <div class="flex items-center gap-4">
      <select
          v-model="selectedClass"
          @change="loadTests"
          class="select select-bordered select-sm w-64"
          :disabled="!classes.length"
      >
        <option disabled value="">请选择班级</option>
        <option
            v-for="cls in classes"
            :key="cls.classid"
            :value="cls.classid"
        >
          {{ cls.classname }}
        </option>
      </select>

      <span v-if="membersLoading" class="text-sm text-gray-500">
        <el-icon class="animate-spin"><Loading /></el-icon>
        加载中...
      </span>
    </div>

    <!-- 成员列表 -->
    <div v-if="selectedClass" class="member-list">
      <div class="grid grid-cols-1 gap-4">
        <div
            v-for="member in tests"
            :key="member.id"
            class="member-card bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow min-h-[120px] flex items-center w-full"
            @click="selectMember(member)"
        >
          <div class="flex items-center gap-6 w-full px-4">
            <!-- 头像 -->
            <div class="avatar w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
              {{ String(member.id) }}
            </div>
            <!-- 成员信息 -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xl">{{ String(member.id) }}</div>
              <div class="text-gray-500 text-sm mt-1">ID: {{ String(member.id) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!tests.length && !membersLoading" class="empty-state text-center py-8 text-gray-400">
      <el-icon class="text-2xl mb-2"><User /></el-icon>
      <p>该班级暂无成员</p>
    </div>
  </div>

  <!-- 右侧浮窗展示 -->
  <div
      v-if="selectedMember"
      class="fixed right-0 top-0 w-1/3 h-screen bg-white shadow-lg z-50 p-6 transition-transform duration-500 ease-out"
      :style="{ transform: selectedMember ? 'translateX(0)' : 'translateX(100%)' }"
  >
    <h2 class="text-xl font-bold">{{ String(selectedMember.id)}} 的详细信息</h2>
    <p>ID: {{String( selectedMember.id) }}</p>
    <!-- 其他详细信息可以在这里添加 -->

    <!-- 关闭浮窗按钮 -->
    <button
        @click="closeMemberDetails"
        class="mt-4 text-white bg-red-500 p-2 rounded-lg"
    >
      关闭
    </button>
  </div>

</template>

<script setup lang="ts">
import {ref, onMounted, reactive, toRaw} from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { Loading, User } from '@element-plus/icons-vue';
import { useRequest } from "vue-hooks-plus";
import {useRouter} from "vue-router";
import {
  getClassesAPI,
  getClassMembersAPI,
  createClassAPI,
  getChatHistoryAPI,
  getTopicListAPI,
  getStudentClassesAPI, getTestIDAPI
} from "../../apis";

// 类型定义
interface ClassInfo {
  classid: number;
  classname:string
}

interface Test {
  id:number
}

const classForm = reactive({
  className: ''
});
const formRef = ref();
const isSubmitting = ref(false);
// 状态管理
const classes = ref<ClassInfo[]>([]);
const tests = ref<Test[]>([]);
const selectedClass = ref('');
const membersLoading = ref(false);
const dialogVisible = ref(false);
const selectedMember = ref<Test | null>(null);
const router = useRouter();
const selectMember = (member: Test) => {
  router.push({ name: 'studentTestView', params: { id: member.id } });
};

const closeMemberDetails = () => {
  selectedMember.value = null; // 关闭浮窗
};

const openDialog = () => {
  dialogVisible.value = true;
  console.log(dialogVisible.value);
};

const handleClose = () => {
  dialogVisible.value = false;
};


const loadClasses = async () => {
  try {
    const res = await getStudentClassesAPI();
    if (res.code === 200) {
      classes.value = res.data; // 接口返回的是数组
    }
  } catch (error) {
    ElMessage.error('获取班级失败');
  }
};

onMounted(() => {
  loadClasses(); // 初始化加载班级列表
});

// 加载班级成员
const loadTests = async () => {
  if (!selectedClass.value) return;
  membersLoading.value = true;
  try {
    const res = await getTestIDAPI({ classid: Number(selectedClass.value) });
    if (res.code === 200) {
      tests.value = res.data.map((id: number) => ({ id }));
    } else {
      ElMessage.error('成员加载失败');
    }
  } catch (error) {
    ElMessage.error('请求失败');
  } finally {
    membersLoading.value = false;
  }
};
</script>

<style scoped>
.member-list {
  @apply bg-base-100 p-4 rounded-lg border;
}

.avatar {
  @apply font-medium text-purple-600;
}

.member-card {
  @apply transition-colors duration-200 hover:border-purple-200;
}

.empty-state {
  @apply bg-base-200 rounded-lg;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
