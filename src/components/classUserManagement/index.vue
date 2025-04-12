<template>
  <div class="flex flex-col mx-auto mt-8 max-w-4xl gap-6 px-4">
    <!-- 标题 -->
    <h1 class="text-2xl font-bold text-gray-800">班级管理</h1>

    <!-- 班级选择区域 -->
    <div>
      <h2 class="text-lg font-semibold text-gray-700 mb-2">选择班级</h2>
      <div class="flex items-center gap-4">
        <select
            v-model="selectedClass"
            @change="loadClassMembers"
            class="select select-bordered select-sm w-96 bg-white text-gray-800 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-400 transition text-center"
            :disabled="!classes.length"
        >
          <option disabled value="">请选择班级</option>
          <option v-for="cls in classes" :key="cls.classid" :value="cls.classid">
            {{ cls.classname }}
          </option>
        </select>

        <span v-if="membersLoading" class="text-sm text-gray-500 flex items-center gap-1">
          <el-icon class="animate-spin"><Loading /></el-icon>
          加载中...
        </span>
      </div>
    </div>

    <!-- 成员列表 -->
    <div v-if="selectedClass" class="member-list max-h-[500px] overflow-y-auto">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">成员列表</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
            v-for="member in members"
            :key="member.userid"
            class="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg hover:border-purple-400 transform hover:scale-[1.02] transition-all cursor-pointer"
            @click="selectMember(member)"
        >
          <div class="flex items-center gap-6 w-full px-2">
            <!-- 头像 -->
            <div
                class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 text-white font-bold flex items-center justify-center text-xl shadow-sm"
            >
              {{ member.username.charAt(0).toUpperCase() }}
            </div>
            <!-- 信息 -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xl">{{ member.username }}</div>
              <div class="text-gray-500 text-sm mt-1">ID: {{ member.userid }}</div>
              <div class="text-gray-400 text-sm mt-1">
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

    <!-- 空状态 -->
    <div
        v-if="!members.length && !membersLoading"
        class="flex flex-col items-center justify-center text-center text-gray-500 p-6 bg-white rounded-xl border border-dashed border-gray-300 mt-6"
    >
      <el-icon class="text-3xl text-purple-500 mb-2"><User /></el-icon>
      <p class="text-sm">
        当前班级暂无成员，邀请学生使用邀请码：
        <span
            class="text-purple-600 font-semibold cursor-pointer hover:underline select-none"
            @click="copyInviteCode"
        >
          {{ inviteCode }}
        </span>
        加入
      </p>
    </div>

    <!-- 邀请码 -->
    <div v-else class="text-sm text-gray-600 mt-6">
      邀请学生输入邀请码：
      <span
          class="text-purple-600 font-bold cursor-pointer hover:underline select-none"
          @click="copyInviteCode"
      >
        {{ inviteCode }}
      </span>
      加入班级
    </div>

    <!-- 创建班级按钮 -->
    <button
        class="self-start btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl shadow-md transition duration-200 mt-4"
        @click="openDialog"
    >
      创建班级
    </button>

    <!-- 成员浮窗 -->
    <div
        v-if="selectedMember"
        class="fixed right-0 top-0 w-[400px] h-screen bg-white shadow-2xl z-50 p-8 border-l border-gray-200 transition-transform duration-500 ease-in-out"
        :style="{ transform: selectedMember ? 'translateX(0)' : 'translateX(100%)' }"
    >
      <h2 class="text-2xl font-bold text-purple-600 mb-4">
        {{ selectedMember.username }} 的详细信息
      </h2>
      <p class="text-gray-700">ID: {{ selectedMember.userid }}</p>
      <p class="text-gray-700 mt-1">
        角色:
        <span v-if="selectedMember.character === 0">学生</span>
        <span v-else-if="selectedMember.character === 1">教师</span>
        <span v-else>未知</span>
      </p>
      <button
          @click="closeMemberDetails"
          class="mt-4 text-white bg-red-500 p-2 rounded-lg"
      >
        关闭
      </button>
    </div>

    <!-- 创建班级弹窗 -->
    <el-dialog v-model="dialogVisible" title="🆕 创建班级" width="30%">
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
  </div>
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
</style>

