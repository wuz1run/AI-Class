<template>
  <quizMenu></quizMenu>
  <quizchat-box></quizchat-box>
</template>


<script setup>
import { ref } from 'vue';
import {quizchatBox} from "../../components";
import {quizMenu} from "../../components";
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
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

/* 美化习题预览按钮 */
:deep(.quiz-preview-btn) {
  background: linear-gradient(145deg, #4a90e2, #3f7fd6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
}

:deep(.quiz-preview-btn:hover) {
  background: linear-gradient(145deg, #3f7fd6, #3672c2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.4);
}

:deep(.quiz-preview-btn:active) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(74, 144, 226, 0.3);
}

/* 美化字体显示 */
:deep(.quiz-title) {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

:deep(.quiz-content) {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  letter-spacing: 0.3px;
}

:deep(.quiz-option) {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 15px;
  color: #555;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 6px 0;
  transition: background-color 0.2s ease;
}

:deep(.quiz-option:hover) {
  background-color: #f5f9ff;
}

:deep(.quiz-option.selected) {
  background-color: #e6f0ff;
  border-left: 3px solid #4a90e2;
  font-weight: 500;
}
</style>