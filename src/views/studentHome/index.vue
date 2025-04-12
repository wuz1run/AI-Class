
<template>
  <div class="h-[600px]">
    <el-button type="primary" @click="dialogVisible = true">加入班级</el-button>
  </div>
  <homeNotification>{{ notification }}</homeNotification>

  <el-dialog v-model="dialogVisible" title="输入邀请码" width="30%">
    <el-input v-model="inviteCode" placeholder="请输入邀请码" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="joinClass">确认加入</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {homeNotification} from "../../components"
import {onMounted, reactive, watch} from "vue"
import {useRequest} from "vue-hooks-plus";
import {getNotificationAPI} from "../../apis";
import {ElNotification} from "element-plus";
import {ref} from "vue"
import userInfoStore from "../../stores/Server/userInfoStore";
import {joinClassAPI} from "../../apis";
const dialogVisible = ref(false);
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

onMounted(() => {
  useRequest(() => getNotificationAPI(), {
    onSuccess(res) {
      if (res.code === 200) {
        notification.value = res.data.notification;
      } else {
        ElNotification({ title: "Warning", message: res.msg, type: "warning" });
        notification.value = "Unable to get notification";
      }
    },
    onError(err) {
      ElNotification({ title: "Error", message: err.toString(), type: "error" });
      notification.value = "Unable to get notification";
    },
  });
});

</script>


<style scoped>

</style>