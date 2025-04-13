<template>
  <div class="profile-container">
    <!-- 背景动画元素 -->
    <div class="animated-bg">
      <div v-for="n in 10" :key="n" class="floating-circle"></div>
    </div>

    <div class="profile-card">
      <div class="card-header">
        <div class="avatar-container">
          <el-upload
              :auto-upload="false"
              class="avatar-uploader"
              :show-file-list="false"
              :on-change="avatarChange"
          >
            <div class="avatar-wrapper">
              <img
                  :src="imgBase64 || userInfo.avatar"
                  class="avatar"
                  alt="用户头像"
              />
              <div class="avatar-overlay">
                <i class="el-icon-camera"></i>
                <span>点击更换</span>
              </div>
            </div>
          </el-upload>
        </div>

        <div class="username-container">
          <dClickEdit @overModify="overModify" :data="userInfo.username" />
          <div class="edit-hint">点击修改昵称</div>
        </div>
      </div>

      <div class="divider">
        <span class="divider-text">个人信息</span>
      </div>

      <div class="user-info">
        <div class="info-row">
          <div class="info-label">
            <i class="el-icon-message"></i>
            <span>邮箱</span>
          </div>
          <div class="info-value">{{ userInfo.email }}</div>
        </div>

        <div class="info-row">
          <div class="info-label">
            <i class="el-icon-time"></i>
            <span>注册时间</span>
          </div>
          <div class="info-value">{{ formatDate(userInfo.created_at) }}</div>
        </div>
      </div>

      <div class="card-footer">
        <div class="welcome-text">欢迎回来，{{ userInfo.username }}！</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMainStore } from "../../stores";
import { dClickEdit } from "../../components";
import { useRequest } from "vue-hooks-plus";
import { changeUserInfoAPI, userUploadAPI, getUserInfoAPI } from "../../apis";
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
        ElNotification({title: "警告", message: res.msg, type: "warning"});
      }
    },
    onError(err) {
      ElNotification({title: "错误", message: err.toString(), type: "error"});
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
          ElNotification({ title: "警告", message: res.msg, type: "warning" });
        }
      },
      onError(err) {
        ElNotification({ title: "错误", message: err.toString(), type: "error" });
      },
    }
);

// dClickEdit 修改完成回调
const overModify = (newName) => {
  userInfo.username = newName;
  run();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};
</script>

<style scoped>
.profile-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #3a6186, #89253e);
  overflow: hidden;
}

/* 背景动画 */
.animated-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.floating-circle {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  animation: float 15s infinite ease-in-out;
}

.floating-circle:nth-child(1) { width: 80px; height: 80px; top: 10%; left: 10%; animation-delay: 0s; }
.floating-circle:nth-child(2) { width: 120px; height: 120px; top: 20%; left: 75%; animation-delay: 1s; }
.floating-circle:nth-child(3) { width: 100px; height: 100px; top: 60%; left: 15%; animation-delay: 2s; }
.floating-circle:nth-child(4) { width: 150px; height: 150px; top: 70%; left: 80%; animation-delay: 3s; }
.floating-circle:nth-child(5) { width: 90px; height: 90px; top: 40%; left: 40%; animation-delay: 4s; }
.floating-circle:nth-child(6) { width: 70px; height: 70px; top: 30%; left: 60%; animation-delay: 5s; }
.floating-circle:nth-child(7) { width: 110px; height: 110px; top: 80%; left: 35%; animation-delay: 6s; }
.floating-circle:nth-child(8) { width: 130px; height: 130px; top: 15%; left: 25%; animation-delay: 7s; }
.floating-circle:nth-child(9) { width: 85px; height: 85px; top: 50%; left: 85%; animation-delay: 8s; }
.floating-circle:nth-child(10) { width: 75px; height: 75px; top: 65%; left: 65%; animation-delay: 9s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-15px) translateX(10px);
  }
  50% {
    transform: translateY(5px) translateX(-5px);
  }
  75% {
    transform: translateY(10px) translateX(15px);
  }
}

/* 个人信息卡片 */
.profile-card {
  position: relative;
  width: 450px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 30px;
  transition: all 0.3s ease;
  animation: cardAppear 0.8s ease-out;
  overflow: hidden;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.avatar-container {
  flex-shrink: 0;
  margin-right: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-overlay span {
  font-size: 12px;
}

.username-container {
  flex-grow: 1;
}

.username-container :deep(.editable) {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.username-container :deep(.editable):hover {
  color: #2c82c9;
}

.edit-hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.username-container:hover .edit-hint {
  opacity: 1;
}

/* 分隔线 */
.divider {
  position: relative;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-text {
  position: absolute;
  background: white;
  padding: 0 10px;
  font-size: 14px;
  color: #666;
}

/* 用户信息 */
.user-info {
  margin: 25px 0;
  animation: fadeIn 0.5s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-row {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.info-row:hover {
  transform: translateX(5px);
}

.info-label {
  width: 100px;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #555;
}

.info-label i {
  margin-right: 5px;
  font-size: 18px;
  color: #2c82c9;
}

.info-value {
  flex-grow: 1;
  padding-left: 10px;
  font-size: 15px;
  color: #333;
}

/* 卡片底部 */
.card-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.welcome-text {
  font-size: 16px;
  color: #2c82c9;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>