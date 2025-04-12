<template>
  <div class="ml-6 mt-5">
    <div id="chatBox" class="w-[78%] h-[77%] overflow-auto absolute bg-base-200">
      <div v-for="(value, index) in chatMsg" class="mt-2">
        <div class="chat" :class="[chatMsg[index]['role'] === 'user' ? 'chat-end' : 'chat-start']">
          <div class="chat-image avatar">
            <div class="w-14 rounded-full">
              <img
                  alt="Failed"
                  :src="chatMsg[index]['role'] === 'user' ? userinfostore.userInfo.avatar : '/aichat/aiAvatar.png'" />
            </div>
          </div>
          <div
              class="chat-bubble"
              :class="[chatMsg[index]['role'] === 'user' ? 'bg-blue-700 text-base-100' : 'bg-base-100 text-base-content']">
            <span v-if="chatMsg[index]['role'] === 'user'">{{ chatMsg[index]['content'] }}</span>
            <div v-else v-html="formatMessage(chatMsg[index])"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="textarea textarea-bordered absolute bottom-0 left-0 right-0 flex justify-center w-full bg-white">
      <div class="w-[78%] flex items-end pb-4">
        <textarea
            v-model="textInput"
            id="textArea"
            class="outline-none text-lg w-full max-h-[210px] resize-none border rounded-lg p-3"
            placeholder="请输入你想问的问题,生成教案请以“/教案”为开头 例如：/教案 三角函数"
            @keydown.enter.exact.prevent="messageSent"
            @keydown.shift.enter="newLine" />
        <el-icon :size="33" class="ml-4 mb-2 hover:bg-base-300 cursor-pointer" @click="messageSent">
          <Promotion />
        </el-icon>
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
    } else {
      ElNotification({ title: 'Warning', message: res.msg, type: 'warning' });
    }
  } catch (err: any) {
    ElNotification({ title: 'Error', message: err.toString(), type: 'error' });
  }
};

const uploadChatHistory = async () => {
  const newMessages = chatMsg.value.slice(lastUploadedIndex);
  if (newMessages.length === 0) return;
  try {
    const res = await uploadChatHistoryAPI({
      topicid: props.topicId,
      chatHistory: newMessages
    });
    if (res.code === 200) {
      ElNotification({ title: 'OK', message: res.msg, type: 'success' });
      lastUploadedIndex = chatMsg.value.length;
    } else {
      ElNotification({ title: 'Warning', message: res.msg, type: 'warning' });
    }
  } catch (err: any) {
    ElNotification({ title: 'Error', message: err.toString(), type: 'error' });
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
      ElNotification({ title: 'OK', message: res.msg, type: 'success' });
      lastUploadedIndex = chatMsg.value.length;
    } else {
      ElNotification({ title: 'Warning', message: res.msg, type: 'warning' });
    }
  } catch (err: any) {
    ElNotification({ title: 'Error', message: err.toString(), type: 'error' });
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

const isLoading = ref(false);

async function messageSent() {
  let userMessage = textInput.value.trim();
  if (!userMessage) return;

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

      const AIResponse = await getAIResponseAPI(chatMsg.value.concat([{ role: 'user', content: fullPrompt }]));
      chatMsg.value.push({
        role: 'system',
        content: "教学设计已经生成并下载",
        timestamp: new Date().toISOString()
      });

      let payload = AIResponse.replace(/`/g, "").replace('json', "");
      await nextTick(() => {
        const container = document.getElementById('chatBox');
        if (container) container.scrollTop = container.scrollHeight;
      });

      const response = await downloadDocAPI(payload);
      const fileUrl = response.download_url;
      if (fileUrl) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = "教学设计.docx";
        document.body.appendChild(link);
        link.click();
      } else {
        console.error("文件未找到");
      }
    } catch (error) {
      console.error("文件下载失败", error);
    }
    isLoading.value = false;
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
      ElNotification({ title: '出错啦', message: err.toString(), type: 'error' });
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

const docPrompt = `你是一位专业的课程设计专家，...`; // 此处略去，保持原始内容
</script>

<style scoped lang="scss">
#chatBox {
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
    &:hover { background: #555; }
  }
}

:deep(.chat-bubble) {
  h1, h2, h3, h4, h5, h6 { font-weight: bold; margin: 8px 0; }
  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }
  code {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
  }
  a { color: #0366d6; }
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin-left: 0;
    color: #666;
  }
  ul, ol { padding-left: 24px; }
}
</style>
