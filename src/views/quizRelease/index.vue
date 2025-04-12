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
</style>
