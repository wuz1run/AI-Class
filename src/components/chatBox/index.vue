<template>
  <div class="chat-container">
    <div id="chatBox" class="chat-messages-container">
      <div v-for="(value, index) in chatMsg" :key="index" class="message-wrapper">
        <div class="chat" :class="[chatMsg[index]['role'] === 'user' ? 'chat-end' : 'chat-start']">
          <div class="avatar-container">
            <div class="avatar-circle">
              <img
                  alt="头像"
                  :src="chatMsg[index]['role'] === 'user' ? userinfostore.userInfo.avatar : '/aichat/aiAvatar.png'" />
            </div>
          </div>
          <div
              class="message-bubble"
              :class="chatMsg[index]['role'] === 'user' ? 'user-bubble' : 'ai-bubble'">
            <span v-if="chatMsg[index]['role'] === 'user'">{{ chatMsg[index]['content'] }}</span>
            <div v-else v-html="formatMessage(chatMsg[index])" class="ai-content"></div>

            <!-- 教学设计下载按钮 -->
            <el-button
                v-if="chatMsg[index]['content'] === '教学设计已经生成并下载' && docDownloadUrl"
                type="primary"
                class="download-btn"
                @click="manualDownload">
              <i class="el-icon-download mr-1"></i> 下载教学设计
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载动画 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <textarea
            v-model="textInput"
            id="textArea"
            class="message-input"
            placeholder='请输入你想问的问题，生成教案请以"&#47;教案"为开头 例如：&#47;教案 三角函数'
            @keydown.enter.exact.prevent="messageSent"
            @keydown.shift.enter="newLine" />
        <button class="send-button" @click="messageSent" :disabled="isLoading">
          <el-icon :size="24"><Promotion /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { getAIResponseAPI, getAIResponseStreamAPI, getChatHistoryAPI, uploadChatHistoryAPI, downloadDocAPI } from "../../apis";
import { ElNotification } from 'element-plus';
import { useMainStore } from "../../stores";
import { useQuizStore } from "../../stores/quizStore";
import MarkdownIt from 'markdown-it';
import { Promotion } from "@element-plus/icons-vue";
import { onActivated } from 'vue';
import { useRoute } from 'vue-router';

const userinfostore = useMainStore().userInfoStore();
const quizStore = useQuizStore();
const md = new MarkdownIt();
const textInput = ref<string>("");
const chatMsg = ref<any[]>([]);
let lastUploadedIndex = 0;
const props = defineProps<{ topicId: number }>();
const route = useRoute();
let previousTopicId = Number(route.query.topicId);
const docDownloadUrl = ref('');
const isLoading = ref(false);

const formatMessage = (message) => {
  return message.role === 'system' ? md.render(message.content) : message.content;
};

onActivated(() => {
  chatMsg.value = [];
});

watch(() => route.fullPath, async () => {
  await uploadChatHistoryWithTopicId(previousTopicId);
  chatMsg.value = [];
  previousTopicId = Number(route.query.topicId);
  await getChatHistory();
});

const getChatHistory = async () => {
  try {
    const res = await getChatHistoryAPI({ topicid: props.topicId });
    if (res.code === 200) {
      chatMsg.value = res.data.chat_history.map((msg: any) => reactive(msg));
      lastUploadedIndex = chatMsg.value.length;

      // 滚动到最新消息
      nextTick(() => {
        const container = document.getElementById('chatBox');
        if (container) container.scrollTop = container.scrollHeight;
      });
    } else {
      ElNotification({
        title: '提示',
        message: res.msg,
        type: 'warning',
        position: 'top-right'
      });
    }
  } catch (err: any) {
    ElNotification({
      title: '错误',
      message: err.toString(),
      type: 'error',
      position: 'top-right'
    });
  }
};

function manualDownload() {
  if (docDownloadUrl.value) {
    window.open(docDownloadUrl.value, "_blank");
  } else {
    ElNotification({
      title: '提示',
      message: '当前暂无可下载内容',
      type: 'warning',
      position: 'top-right'
    });
  }
}

const uploadChatHistory = async () => {
  const newMessages = chatMsg.value.slice(lastUploadedIndex);
  if (newMessages.length === 0) return;
  try {
    const res = await uploadChatHistoryAPI({
      topicid: props.topicId,
      chatHistory: newMessages
    });
    if (res.code === 200) {
      lastUploadedIndex = chatMsg.value.length;
    } else {
      ElNotification({
        title: '提示',
        message: res.msg,
        type: 'warning',
        position: 'top-right'
      });
    }
  } catch (err: any) {
    ElNotification({
      title: '错误',
      message: err.toString(),
      type: 'error',
      position: 'top-right'
    });
  }
};

const uploadChatHistoryWithTopicId = async (topicId: number) => {
  const newMessages = chatMsg.value.slice(lastUploadedIndex);
  if (newMessages.length === 0) return;
  try {
    const res = await uploadChatHistoryAPI({
      topicid: topicId,
      chatHistory: newMessages
    });
    if (res.code === 200) {
      lastUploadedIndex = chatMsg.value.length;
    } else {
      ElNotification({
        title: '提示',
        message: res.msg,
        type: 'warning',
        position: 'top-right'
      });
    }
  } catch (err: any) {
    ElNotification({
      title: '错误',
      message: err.toString(),
      type: 'error',
      position: 'top-right'
    });
  }
};

onMounted(() => {
  chatMsg.value = [];
  getChatHistory();

  const observe = (element, event, handler) => {
    element.addEventListener(event, handler, false);
  };

  const textArea = document.getElementById('textArea') as HTMLTextAreaElement;
  function resize() {
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
    textArea.style.overflow = textArea.scrollHeight >= 210 ? 'visible' : 'hidden';
  }
  function delayedResize() {
    setTimeout(resize, 0);
  }

  observe(textArea, 'change', resize);
  observe(textArea, 'cut', delayedResize);
  observe(textArea, 'paste', delayedResize);
  observe(textArea, 'drop', delayedResize);
  observe(textArea, 'keydown', delayedResize);
  resize();
});

onUnmounted(() => {
  uploadChatHistory();
});

async function messageSent() {
  let userMessage = textInput.value.trim();
  if (!userMessage || isLoading.value) return;

  const timestamp = new Date().toISOString();

  if (userMessage.includes('/教案')) {
    isLoading.value = true;
    userMessage = userMessage.replace('/教案', '').trim();
    const originalQuestion = userMessage;
    const fullPrompt = `${docPrompt}知识点是：${originalQuestion}`;
    chatMsg.value.push({ role: 'user', content: originalQuestion, timestamp });
    textInput.value = '';

    try {
      chatMsg.value.push({
        role: 'system',
        content: "教学设计生成中，请稍等...",
        timestamp: new Date().toISOString()
      });

      await nextTick(() => {
        const container = document.getElementById('chatBox');
        if (container) container.scrollTop = container.scrollHeight;
      });

      const AIResponse = await getAIResponseAPI(chatMsg.value.concat([{ role: 'user', content: fullPrompt }]));

      // 更新最后一条消息
      const lastMessageIndex = chatMsg.value.length - 1;
      chatMsg.value[lastMessageIndex].content = "教学设计已经生成并下载";

      let payload = AIResponse.replace(/`/g, "").replace('json', "");
      await nextTick(() => {
        const container = document.getElementById('chatBox');
        if (container) container.scrollTop = container.scrollHeight;
      });

      const response = await downloadDocAPI(payload);
      const fileUrl = response.download_url;
      if (fileUrl) {
        docDownloadUrl.value = fileUrl;
        ElNotification({
          title: '生成成功',
          message: '教学设计已生成，点击下方按钮下载',
          type: 'success',
          duration: 5000,
          position: 'top-right'
        });
      } else {
        ElNotification({
          title: '提示',
          message: '文件未找到，请重试',
          type: 'warning',
          position: 'top-right'
        });
      }
    } catch (error) {
      ElNotification({
        title: '错误',
        message: '教学设计生成失败，请重试',
        type: 'error',
        position: 'top-right'
      });
    } finally {
      isLoading.value = false;
    }
  } else {
    chatMsg.value.push({ role: 'user', content: userMessage, timestamp });
    textInput.value = '';

    const aiMsg = reactive({
      role: 'system',
      content: '',
      timestamp: new Date().toISOString()
    });

    chatMsg.value.push(aiMsg);

    try {
      for await (const partial of getAIResponseStreamAPI(chatMsg.value)) {
        aiMsg.content = partial;
        await nextTick(() => {
          const container = document.getElementById('chatBox');
          if (container) container.scrollTop = container.scrollHeight;
        });
      }
    } catch (err: any) {
      ElNotification({
        title: '出错了',
        message: err.toString(),
        type: 'error',
        position: 'top-right'
      });
    }
  }
}

function newLine(e: KeyboardEvent) {
  if (e.shiftKey) {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    textInput.value = textInput.value.slice(0, startPos) + '\n' + textInput.value.slice(endPos);
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + 1;
    });
  }
}

const docPrompt = `
你是一位专业的课程设计专家，擅长面向高等教育的教学设计。请根据我提供的课程主题和对象，输出一份完整、结构清晰、排版规范的**Markdown格式教学设计**。输出请遵循以下结构规范，并**至少包含3个具体的课堂互动环节**以提升学生参与度和学习效果。

输出格式请为 **JSON**，其中每个字段的键为课程设计的结构部分，总字数至少2000字（如 "title"、"课程基本信息"、"学习目标与能力培养"、"课程内容"、"课后研究与拓展"），值为该部分对应的 Markdown 格式内容（**值中可以使用 ##、### 等多级标题，但不要再使用 # 一级标题**）。

JSON结构如下：要加上

{
  "ttle": "请填写课程标题，例如：人工智能导论",
  "课程基本信息": "## 课程详情\\n- **授课日期**：...\\n- **授课教师**：...\\n- **授课对象**：...\\n- **课程类型**：...\\n\\n## 课程定位\\n> 这里是课程目标定位说明...",
  "学习目标与能力培养": "## 知识目标\\n1. ...\\n2. ...\\n\\n## 能力目标\\n- ...\\n- ...\\n\\n## 素质目标\\n- ...",
  "课程内容": "## 1. 理论基础\\n\\n### 1.1 概念定义\\n- **核心概念**：...\\n- **历史演进**：...\\n\\n### 1.2 数学模型\\n\\\`\\\`\\\`python\\ndef example_model():\\n    pass\\n\\\`\\\`\\\`\\n\\n## 2. 研究方法论\\n### 2.1 实验技术\\n...\\n\\n## 3. 前沿研究进展\\n...\\n\\n## 课堂互动设计\\n- 环节一：...\\n- 环节二：...\\n- 环节三：...\\n\\n## 参i考文献与术语\\n...",
  "课后研究与拓展": "## 研究性作业\\n1. ...\\n\\n## 学术交流\\n- ...\\n\\n## 拓展资源\\n- ..."
}
`;
</script>

<style scoped lang="scss">
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.chat-messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 80px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;

    &:hover {
      background: #909399;
    }
  }
}

.message-wrapper {
  margin-bottom: 18px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat {
  display: flex;

  &.chat-end {
    flex-direction: row-reverse;
  }

  &.chat-start {
    flex-direction: row;
  }
}

.avatar-container {
  margin: 0 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  word-break: break-word;

  &.user-bubble {
    background: linear-gradient(135deg, #4a89dc, #5d9cec);
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.ai-bubble {
    background: white;
    color: #333;
    border-bottom-left-radius: 4px;
  }
}

.ai-content {
  line-height: 1.6;
}

.download-btn {
  margin-top: 12px;
  background-color: #4a89dc;
  border-color: #4a89dc;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 8px 16px;

  &:hover {
    background-color: #3a78cc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1));
  backdrop-filter: blur(10px);
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  max-width: 900px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  resize: none;
  max-height: 210px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  outline: none;

  &:focus {
    border-color: #4a89dc;
    box-shadow: 0 0 0 2px rgba(74, 137, 220, 0.2);
  }

  &::placeholder {
    color: #9aa6b8;
  }
}

.send-button {
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(74, 137, 220, 0.3);

  &:hover {
    background-color: #3a78cc;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #c0c4cc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.loading-dots {
  display: flex;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #4a89dc;
  border-radius: 50%;
  margin: 0 4px;
  animation: bounce 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

:deep(.chat-bubble) {
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin: 10px 0;
    color: #2c3e50;
  }

  pre {
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid #e9ecef;
    margin: 12px 0;
  }

  code {
    font-family: 'Source Code Pro', Menlo, monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.9em;
  }

  a {
    color: #4a89dc;
    text-decoration: none;
    border-bottom: 1px solid #4a89dc;
    transition: all 0.2s ease;

    &:hover {
      color: #3a78cc;
    }
  }

  blockquote {
    border-left: 4px solid #4a89dc;
    padding: 8px 16px;
    margin: 12px 0;
    background-color: rgba(74, 137, 220, 0.05);
    color: #5c6b7f;
  }

  ul, ol {
    padding-left: 24px;
    margin: 8px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;

    th, td {
      border: 1px solid #e9ecef;
      padding: 8px 12px;
    }

    th {
      background-color: #f8f9fa;
    }
  }
}
</style>