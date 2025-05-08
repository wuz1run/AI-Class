<template>
  <div class="quiz-container">
    <quizMenu class="quiz-menu-wrapper"></quizMenu>
    <quizchat-box class="quizchat-box-wrapper"></quizchat-box>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { quizchatBox } from "../../components";
import { quizMenu } from "../../components";

const userInput = ref('');
const chatHistory = ref([]);

const sendMessage = () => {
  if (!userInput.value.trim()) return;

  // 添加用户消息
  chatHistory.value.push({
    content: userInput.value,
    isAI: false,
    timestamp: new Date().toLocaleTimeString()
  });
};
</script>

<style scoped>
.quiz-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafc;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  overflow: hidden;
}

.quiz-menu-wrapper {
  border-bottom: 1px solid rgba(230, 232, 236, 0.8);
}

.quizchat-box-wrapper {
  flex: 1;
  overflow: hidden;
}

/* 自定义滚动条 - 更现代化的设计 */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.5);
  border-radius: 10px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(136, 136, 136, 0.8);
}

/* 美化习题预览按钮 - 更精致的渐变和动效 */
:deep(.quiz-preview-btn) {
  background: linear-gradient(145deg, #4a90e2, #3974c0);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

:deep(.quiz-preview-btn:hover) {
  background: linear-gradient(145deg, #3f7fd6, #3065af);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.35);
}

:deep(.quiz-preview-btn:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

:deep(.quiz-preview-btn::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  transition: width 0.3s ease;
}

:deep(.quiz-preview-btn:hover::after) {
  width: 100%;
}

/* 美化字体显示 - 更专业的排版与间距 */
:deep(.quiz-title) {
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 8px;
}

:deep(.quiz-title::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #4a90e2, #6ab0ff);
  border-radius: 3px;
}

:deep(.quiz-content) {
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #34495e;
  letter-spacing: 0.3px;
  margin-bottom: 20px;
}

:deep(.quiz-option) {
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  font-size: 15px;
  color: #4a5568;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 8px 0;
  transition: all 0.25s ease;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 232, 236, 0.8);
  display: flex;
  align-items: center;
}

:deep(.quiz-option:hover) {
  background-color: #f7faff;
  box-shadow: 0 3px 6px rgba(74, 144, 226, 0.1);
  transform: translateY(-1px);
}

:deep(.quiz-option.selected) {
  background-color: #edf2fd;
  border-left: 3px solid #4a90e2;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
}

:deep(.quiz-option.selected::before) {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4a90e2;
  margin-right: 10px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(74, 144, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
  }
}
</style>