<template>
  <div class="h-screen w-screen bg-base-200 flex gap-1">
    <div class="card bg-base-100 w-[30%] h-[500px] shadow-xl">
      <div class="card-body">
        <div class="flex items-center">
          <div class="flex flex-col">
            <el-upload
                :auto-upload="false"
                class="avatar-uploader"
                :show-file-list="false"
                :on-change="avatarChange"
            >
              <img
                  :src="imgBase64 || userInfo.avatar"
                  class="avatar size-20 rounded-full cursor-pointer"
              />
            </el-upload>
          </div>
          <div class="text-lg ml-8">
            <dClickEdit @overModify="overModify" :data="userInfo.username" />
          </div>
        </div>
        <div class="overflow-x-auto mt-4">
          <table class="table text-lg">
            <tbody>
            <tr>
              <td>邮箱</td>
              <td>{{ userInfo.email }}</td>
            </tr>
            <tr>
              <td>用户注册时间</td>
              <td>{{ userInfo.created_at }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMainStore } from "../../stores";
import { dClickEdit } from "../../components";
import { useRequest } from "vue-hooks-plus";
import { changeUserInfoAPI, userUploadAPI,getUserInfoAPI } from "../../apis";
import { ElNotification, ElMessage } from "element-plus";

// 初始化用户信息
const userinfostore = useMainStore().userInfoStore();
const userInfo = reactive({ ...userinfostore.userInfo });

const imgBase64 = ref<string | undefined>();

// 上传头像
const avatarChange = async (e) => {
  const file = e.raw;

  // 限制大小：10MB
  if (file.size > 10 * 1024 * 1024) {
    ElMessage({message: "头像文件不能大于10MB", type: "warning"});
    return;
  }

  // 限制格式
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
  ];
  if (!validTypes.includes(file.type)) {
    ElMessage({message: "文件的格式必须为图片！", type: "warning"});
    return;
  }

  // base64 预览
  const reader = new FileReader();
  reader.onload = () => {
    imgBase64.value = reader.result as string;
  };
  reader.readAsDataURL(file);

  // 构造 FormData 进行上传
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "1");

  useRequest(() => userUploadAPI(formData), {
    onSuccess(res) {
      if (res.code === 200) {
        ElMessage({message: "上传成功", type: "success"});
        userInfo.avatar = res.data;
        run(); // 提交修改
      } else {
        ElNotification({title: "Warning", message: res.msg, type: "warning"});
      }
    },
    onError(err) {
      ElNotification({title: "Error", message: err.toString(), type: "error"});
    },
  });
  await getUserInfoAPI();
};

// 修改用户名和头像信息
const { run } = useRequest(
    () =>
        changeUserInfoAPI({
          username: userInfo.username,
          avatar: userInfo.avatar,
        }),
    {
      manual: true,
      onSuccess(res) {
        if (res.code === 200) {
          ElMessage({ message: "修改成功", type: "success" });
          userinfostore.changeInfo("username", userInfo.username);
          userinfostore.changeInfo("avatar", userInfo.avatar);
        } else {
          ElNotification({ title: "Warning", message: res.msg, type: "warning" });
        }
      },
      onError(err) {
        ElNotification({ title: "Error", message: err.toString(), type: "error" });
      },
    }
);

// dClickEdit 修改完成回调
const overModify = (newName) => {
  userInfo.username = newName;
  run();
};
</script>

<style scoped>
.avatar-uploader .avatar {
  transition: 0.3s;
}
.avatar-uploader .avatar:hover {
  opacity: 0.8;
}
</style>
