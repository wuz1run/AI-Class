<template>
  <!-- 外层容器 -->
  <div class="bg-gray-50 p-8 min-h-screen w-[1500px] mx-auto">
    <!-- 主内容容器 -->
    <div class="mx-auto w-full flex flex-col gap-8">
      <!-- 班级选择区 -->
      <div class="flex flex-col items-center gap-8">
        <div class="flex w-full flex-col items-center gap-6">
          <!-- 选择框容器 -->
          <div class="flex w-full items-center justify-center gap-4">
            <select
                v-model="selectedClass"
                @change="loadTests"
                class="select select-bordered select-lg w-full max-w-md bg-white text-lg shadow-lg hover:shadow-xl transition-all"
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

            <span v-if="membersLoading" class="text-gray-500">
              <el-icon class="animate-spin"><Loading /></el-icon>
              加载中...
            </span>
          </div>

          <!-- 加入班级按钮 -->
          <button
              class="btn w-full max-w-xs bg-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-purple-700"
              @click="dialogVisible = true"
          >
            加入班级
          </button>
        </div>

        <!-- 测试列表 -->
        <div class="w-full">
          <div v-if="selectedClass" class="mx-auto w-full max-w-3xl">
            <div class="grid grid-cols-1 gap-6">
              <div
                  v-for="member in tests"
                  :key="member.id"
                  class="member-card mx-auto w-full max-w-2xl cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:border-purple-400 hover:shadow-lg"
                  @click="selectMember(member)"
              >
                <div class="flex items-center gap-6 w-full px-4">
                  <!-- 头像 -->
                  <div
                      class="avatar w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 text-white font-bold flex items-center justify-center text-xl shadow-sm"
                  >
                    {{ String(member.id).charAt(0) }}
                  </div>
                  <!-- 测试信息 -->
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-xl">测试 {{ String(member.id) }}</div>
                    <div class="text-gray-500 text-sm mt-1">ID: {{ String(member.id) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
              v-if="!tests.length && !membersLoading"
              class="mx-auto mt-8 w-full max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500"
          >
            <el-icon class="mb-2 text-3xl text-purple-500"><User /></el-icon>
            <p class="text-sm">当前班级暂无测试</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧浮窗 -->
    <div
        v-if="selectedMember"
        class="fixed right-0 top-0 w-[400px] h-screen bg-white shadow-2xl z-50 p-8 border-l border-gray-200 transition-transform duration-500 ease-in-out"
        :style="{ transform: selectedMember ? 'translateX(0)' : 'translateX(100%)' }"
    >
      <h2 class="text-2xl font-bold text-purple-600 mb-4">测试 {{ String(selectedMember.id) }} 详情</h2>
      <p class="text-gray-700">ID: {{ String(selectedMember.id) }}</p>

      <button
          @click="closeMemberDetails"
          class="mt-6 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow transition duration-200"
      >
        关闭
      </button>
    </div>

    <!-- 加入班级弹窗 -->
    <el-dialog v-model="dialogVisible" title="输入邀请码" width="30%">
      <div class="space-y-4">
        <el-input
            v-model="inviteCode"
            placeholder="请输入邀请码"
            class="input input-bordered w-full py-2 px-4 text-lg"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <button
              @click="dialogVisible = false"
              class="btn btn-ghost px-6 py-2 text-gray-600 hover:bg-gray-100"
          >
            取消
          </button>
          <button
              @click="joinClass"
              class="btn bg-purple-600 text-white px-6 py-2 hover:bg-purple-700 transition-colors"
          >
            确认加入
          </button>
        </div>
      </template>
    </el-dialog>
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
  getStudentClassesAPI, getTestIDAPI, joinClassAPI
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
const inviteCode = ref("");
let notification = ref("")
const joinClass = async () => {
  try {
    const res = await joinClassAPI(inviteCode.value); // 你自己的 API
    if (res.code === 200) {
      ElNotification({ title: "成功", message: "加入班级成功！", type: "success" });
      dialogVisible.value = false;
    } else {
      ElNotification({ title: "失败", message: res.msg, type: "warning" });
    }
  } catch (err) {
    ElNotification({ title: "错误", message: err.toString(), type: "error" });
  }
};
</script>

<style scoped>
.member-card {
  @apply transition-colors duration-200;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 优化弹窗按钮样式 */
.el-dialog__footer button {
  @apply transition-all duration-200 ease-in-out;
}

/* 输入框聚焦样式 */
.input:focus {
  @apply ring-2 ring-purple-300 border-purple-400;
}
</style>
