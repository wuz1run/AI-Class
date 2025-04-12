<template>
  <div class="ml-6 mt-5">
    <div id="chatBox" class="w-[88%] h-[63%] overflow-auto absolute bg-base-200">
      <div v-for="(value,index) in chatMsg" class="mt-2">
        <div class="chat" :class="[chatMsg[index]['role'] === 'user' ? 'chat-end' : 'chat-start']">
          <div class="chat-image avatar">
            <div class="w-14 rounded-full">
              <img
                  alt="Failed"
                  :src="chatMsg[index]['role'] === 'user' ? userinfostore.userInfo.avatar : '/aichat/aiAvatar.png'" />
            </div>
          </div>
          <div class="chat-bubble" :class="[chatMsg[index]['role'] === 'user' ? 'bg-blue-700 text-base-100' : 'bg-base-100 text-base-content']">
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
    placeholder="请输入你想生成的习题的知识点，以“/习题”开头，例如：“/习题 三角函数”"
    @keydown.enter.exact.prevent="messageSent"
    @keydown.shift.enter="newLine">
    </textarea>
        <el-icon :size="33" class="ml-4 mb-2 hover:bg-base-300 cursor-pointer" @click="messageSent">
          <Promotion />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive,} from "vue";
import { useRequest } from "vue-hooks-plus";
import { getChatHistoryAPI ,uploadQuizAPI} from "../../apis";
import { ElNotification } from 'element-plus';
import { useMainStore } from "../../stores";
import {getAIResponseAPI} from "../../apis";
import MarkdownIt from 'markdown-it';
import {useQuizStore} from "../../stores/quizStore";
import { nextTick } from 'vue'
import {Promotion} from "@element-plus/icons-vue";

// 在 messageSent 方法最后添加

const userinfostore = useMainStore().userInfoStore();
const md = new MarkdownIt();
const textInput = ref<string>("");
const quizStore = useQuizStore();
const formatMessage = (message) => {
  if (message.role === 'ai') {
    return md.render(message.content);
  }
  return message.content;
};
const chatMsg = ref([]);

const props = defineProps(['id']);  // 接收父组件传来的会话id

const getChatHistory = () => {
  useRequest(()=>getChatHistoryAPI({topicid:props.id}),{
    onSuccess(res){
      if(res['code']===200){
        for(let i=0;i<res['data']['chat_history'].length;i++){
          chatMsg.value.push(reactive(res['data']['chat_history'][i]));
        }
      }else{
        ElNotification({title: 'Warning', message: res['msg'], type: 'warning',})
      }
    },
    onError(err){
      ElNotification({title: 'Error', message: err.toString(), type: 'error',})
    }
  })
}
const getAIResponse = () => {
  getAIResponseAPI(chatMsg.value).then((res) => {
    return res;
  })
}
onMounted(()=>{

  const  observe = (element, event, handler) => {
    element.addEventListener(event, handler, false);
  };

  let textArea = document.getElementById('textArea');
  function resize(){
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
    if(textArea.scrollHeight >= 210){
      textArea.style.overflow = 'visible';
    }else{
      textArea.style.overflow = 'hidden';
    }
  }
  function delayedResize(){
    setTimeout(()=>{
      resize();
    },0)
  }
  observe(textArea,'change',resize);
  observe(textArea, 'cut',     delayedResize);
  observe(textArea, 'paste',   delayedResize);
  observe(textArea, 'drop',    delayedResize);
  observe(textArea, 'keydown', delayedResize);

  resize();
})
async function messageSent() {
  // 1. 添加用户消息并清空输入框
  let userMessage = textInput.value.trim();
  if (!userMessage) return; // 防止空消息

  console.log('用户发送:', userMessage);
  if(userMessage.includes('/习题')){
    userMessage=userMessage.replace('/习题','');
    let oldUserMessage = userMessage;
    let newUserMessage="生成下列知识点的习题，要求用JSON格式呈现，不允许输出Markdown格式的其他字符，只能输出标准的以[开头一]结尾的json数组。包括习题的题目（question），答案（answer），选项（options），知识点标签（tag），题目类型（choice，cloze,short_answer）其中简答题没有选项。知识点是："+userMessage
    console.log(userMessage)
    chatMsg.value.push({
      role: 'user',
      content: oldUserMessage,
    });
    textInput.value = '';
    let AIResponse = await getAIResponseAPI(chatMsg.value.concat([{role: 'user',content: newUserMessage}])); // 根据 API 返回字段调整
    chatMsg.value.push({
      role: 'ai',
      content: "习题已经生成，请到“习题预览”模块查看" // 根据 API 返回字段调整
    })
    console.log(AIResponse)
    let newQuestion = AIResponse.replace(/`/g,"").replace('json',"")
    quizStore.addQuestion(newQuestion);
    console.log(newQuestion)
  }
  else{
    chatMsg.value.push({
      role: 'user',
      content: userMessage
    });
    textInput.value = '';
    let AIResponse = await getAIResponseAPI(chatMsg.value);
    chatMsg.value.push({
      role: 'ai',
      content: AIResponse // 根据 API 返回字段调整
    })}
  await nextTick(() => {
    const container = document.getElementById('chatBox')
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    else {
      console.log('container not found')
    }
  })
}
function newLine(e: KeyboardEvent) {
  if (e.shiftKey) {
    e.preventDefault();
    // 获取当前光标位置
    const textarea = e.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // 插入换行符
    textInput.value =
        textInput.value.slice(0, startPos) +
        '\n' +
        textInput.value.slice(endPos);

    // 更新光标位置
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + 1;
    });
  }
}
// 添加用户消息（假设 chatMsg.value 是响应式数组）
//TODO 添加上传习题逻辑
</script>

<style scoped lang="scss">
#chatBox{
  scroll-behavior: smooth; /* 启用平滑滚动 */
}

/* Deep selector to style markdown content */
:deep(.chat-bubble) {
  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
    margin: 8px 0;
  }

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

  a {
    color: #0366d6;
  }

  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin-left: 0;
    color: #666;
  }

  ul, ol {
    padding-left: 24px;
  }
}
#chatBox {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #555;
    }
  }
}
</style>