<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import QuizView from "../../components/quizView/index.vue";
</script>

<template>
  <div class="quiz-view-page">
    <QuizView class="quiz-view-scrollable" />
  </div>
</template>

<style scoped>
.quiz-view-page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f7fa;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 保持页面不滚动 */
  display: flex;
}

.quiz-view-scrollable {
  width: 100%;
  height: 100%;
  overflow-y: auto; /* 开启垂直滚动 */
}
</style>

