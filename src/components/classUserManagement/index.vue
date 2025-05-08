<template>
  <!-- 外层容器 - 调整为响应式宽度 -->
  <div class="bg-gray-50 p-4 sm:p-6 md:p-8 min-h-screen w-full mx-auto">
    <!-- 主内容容器 -->
    <div class="mx-auto w-full max-w-[1500px]">
      <!-- 班级选择区 -->
      <div class="mb-8 md:mb-12 flex flex-col items-center gap-4 md:gap-8">
        <div class="flex w-full flex-col items-center gap-4 md:gap-6">
          <!-- 选择框容器 -->
          <div class="flex w-full flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <select
                v-model="selectedClass"
                @change="loadClassMembers"
                class="select select-bordered select-lg w-full max-w-md bg-white text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
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

            <span v-if="membersLoading" class="text-gray-500 mt-2 sm:mt-0">
              <el-icon class="animate-spin"><Loading /></el-icon>
              加载中...
            </span>
          </div>

          <!-- 创建班级按钮 -->
          <button
              class="btn w-full sm:max-w-xs bg-purple-600 px-4 sm:px-8 py-2 sm:py-3 text-base md:text-lg font-semibold text-white shadow-lg transition-all hover:bg-purple-700"
              @click="openDialog"
          >
            创建班级
          </button>
        </div>

        <!-- 成员列表 -->
        <div class="w-full">
          <div v-if="selectedClass" class="mx-auto w-full max-w-3xl">
            <div class="grid grid-cols-1 gap-4 md:gap-6">
              <div
                  v-for="member in members"
                  :key="member.userid"
                  class="member-card mx-auto w-full max-w-2xl cursor-pointer rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 md:p-6 shadow-md transition-all hover:border-purple-400 hover:shadow-lg"
                  @click="selectMember(member)"
              >
                <div class="flex items-center gap-3 sm:gap-6 w-full px-2 sm:px-4">
                  <!-- 头像 -->
                  <div
                      class="avatar w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 text-white font-bold flex items-center justify-center text-lg sm:text-xl shadow-sm"
                  >
                    {{ member.username.charAt(0).toUpperCase() }}
                  </div>
                  <!-- 成员信息 -->
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-lg sm:text-xl">{{ member.username }}</div>
                    <div class="text-gray-500 text-xs sm:text-sm mt-1">ID: {{ member.userid }}</div>
                    <div class="text-gray-400 text-xs sm:text-sm mt-1">
                      角色:
                      <span v-if="member.character === 0">学生</span>
                      <span v-else-if="member.character === 1">教师</span>
                      <span v-else>未知</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
            v-if="!members.length && !membersLoading"
            class="mx-auto mt-4 sm:mt-8 w-full max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 sm:p-6 text-center text-gray-500"
        >
          <el-icon class="mb-2 text-2xl sm:text-3xl text-purple-500"><User /></el-icon>
          <p class="text-xs sm:text-sm">
            当前班级暂无成员，邀请学生使用邀请码：
            <span
                class="select-none font-semibold text-purple-600 cursor-pointer hover:underline"
                @click="copyInviteCode"
            >
              {{ inviteCode }}
            </span>
            加入
          </p>
        </div>

        <!-- 邀请码提示 -->
        <div
            v-else
            class="mx-auto mt-4 sm:mt-8 w-full max-w-xl text-center text-xs sm:text-sm text-gray-600"
        >
          邀请学生输入邀请码：
          <span
              class="select-none font-bold text-purple-600 cursor-pointer hover:underline"
              @click="copyInviteCode"
          >
            {{ inviteCode }}
          </span>
          加入班级
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧浮窗（移动端全屏显示） -->
  <div
      v-if="selectedMember"
      class="fixed inset-0 sm:right-0 sm:top-0 sm:left-auto sm:w-[300px] md:w-[400px] sm:h-screen bg-white shadow-2xl z-50 p-4 sm:p-6 md:p-8 border-l border-gray-200 transition-transform duration-500 ease-in-out"
      :style="{ transform: selectedMember ? 'translateX(0)' : 'translateX(100%)' }"
  >
    <h2 class="text-xl sm:text-2xl font-bold text-purple-600 mb-4">{{ selectedMember.username }} 的详细信息</h2>
    <p class="text-gray-700">ID: {{ selectedMember.userid }}</p>
    <p class="text-gray-700 mt-1">
      角色:
      <span v-if="selectedMember.character === 0">学生</span>
      <span v-else-if="selectedMember.character === 1">教师</span>
      <span v-else>未知</span>
    </p>

    <button
        @click="closeMemberDetails"
        class="mt-6 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow transition duration-200"
    >
      关闭
    </button>
  </div>

  <!-- 创建班级弹窗（移动端适配） -->
  <el-dialog v-model="dialogVisible" title="创建班级" width="90%" :max-width="500">
    <el-form :model="classForm" ref="formRef" label-width="80px" label-position="top">
      <el-form-item
          label="班级名称"
          prop="className"
          :rules="[
          { required: true, message: '请输入班级名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ]"
      >
        <el-input
            v-model="classForm.className"
            placeholder="请输入班级名称"
            clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleConfirm">
          确认创建
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { Loading, User } from '@element-plus/icons-vue';
import { useRequest } from "vue-hooks-plus";
import { getClassesAPI, getClassMembersAPI, createClassAPI, getChatHistoryAPI, getTopicListAPI } from "../../apis";

// 类型定义
interface ClassInfo {
  classid: number;
  classname: string;
  invitecode: string
}

interface Member {
  userid: number;
  username: string;
  email?: string;
  avatar?: string | null;
  character: number;
}

const classForm = reactive({
  className: ''
});
const formRef = ref();
const isSubmitting = ref(false);
// 状态管理
const classes = ref<ClassInfo[]>([]);
const members = ref<Member[]>([]);
const selectedClass = ref('');
const membersLoading = ref(false);
const dialogVisible = ref(false);
const selectedMember = ref<Member | null>(null);
const inviteCode = ref('')
const copyInviteCode = async () => {
  if (!inviteCode.value) return;
  try {
    await navigator.clipboard.writeText(inviteCode.value);
    ElMessage.success('邀请码已复制到剪贴板');
  } catch (e) {
    ElMessage.error('复制失败，请手动复制');
  }
};
const selectMember = (member: Member) => {
  selectedMember.value = member;
  console.log(`Selected member: ${member.username}`);
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

const handleConfirm = async () => {
  isSubmitting.value = true;
  try {
    const res = await createClassAPI(classForm.className);
    if (res.code === 200) {
      ElNotification({ title: 'OK', message: res.msg, type: 'success' });
      dialogVisible.value = false;
      classForm.className = '';
      await loadClasses(); // 重新加载班级列表
    } else {
      ElNotification({ title: 'Warning', message: res.msg, type: 'warning' });
    }
  } catch (err: any) {
    ElNotification({ title: 'Error', message: err.toString(), type: 'error' });
  } finally {
    isSubmitting.value = false;
  }
};

const loadClasses = async () => {
  try {
    const res = await getClassesAPI();
    if (res.code === 200) {
      classes.value = res['data']; // 接口返回的是数组
      console.log(classes.value);

    }
  } catch (error) {
    ElMessage.error('获取班级失败');

  }
};

onMounted(() => {
  loadClasses(); // 初始化加载班级列表
});

// 加载班级成员
const loadClassMembers = async () => {
  if (!selectedClass.value) return;

  // 找到当前选中的班级对象
  const cls = classes.value.find(c => c.classid === Number(selectedClass.value));
  if (cls) {
    inviteCode.value = cls.invitecode; // 设置邀请码
  }

  membersLoading.value = true;
  try {
    const res = await getClassMembersAPI({ classid: selectedClass.value });
    if (res.code === 200) {
      members.value = res.data;
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
.member-list::-webkit-scrollbar {
  width: 8px;
}
.member-list::-webkit-scrollbar-thumb {
  background-color: #c084fc;
  border-radius: 4px;
}
.member-list {
  @apply bg-base-100 p-4 rounded-lg border;
}

.avatar {
  @apply font-medium;
}

.member-card {
  @apply transition-colors duration-200;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 添加媒体查询样式 */
@media (max-width: 640px) {
  .el-dialog {
    width: 95% !important;
    margin: 10px auto !important;
  }

  .dialog-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dialog-footer button {
    width: 100%;
  }
}
</style>