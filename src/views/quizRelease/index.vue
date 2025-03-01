<template>
<quizMenu></quizMenu>
  <chat-box></chat-box>

</template>


<script setup>
import { ref } from 'vue';
import {chatBox} from "../../components";
import {quizMenu} from "../../components";
const userInput = ref('');
const chatHistory = ref([]);
const aiSuggestion = ref({
  text: "这里是AI生成的建议示例...",
  sources: ["教材第3章", "历年真题2022", "知识点：三角函数"]
});


const sendMessage = () => {
  if (!userInput.value.trim()) return;

  // 添加用户消息
  chatHistory.value.push({
    content: userInput.value,
    isAI: false,
    timestamp: new Date().toLocaleTimeString()
  });

  // 模拟AI回复
  setTimeout(() => {
    chatHistory.value.push({
      content: "这是AI的回复示例...",
      isAI: true,
      timestamp: new Date().toLocaleTimeString()
    });
  }, 1000);

  userInput.value = '';
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
