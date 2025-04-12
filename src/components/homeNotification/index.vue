<template>
  <div class="notification-board" :style="{ right: visible ? '20px' : '-420px' }" v-if="isVisible">
    <div class="header">
      <span class="title">{{ title }}</span>
      <el-icon class="close-btn" @click="handleClose">
        <Close />
      </el-icon>
    </div>

    <el-scrollbar class="content-scroll">
      <div class="content">
        <!-- 支持多种内容格式 -->
        <slot v-if="$slots.default"></slot>
        <template v-else>
          <div v-if="typeof content === 'string'" v-html="content"></div>
          <component v-else :is="content" />
        </template>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, onMounted, ref} from 'vue'
import { Close } from '@element-plus/icons-vue'
import {useRequest} from "vue-hooks-plus";
import {getNotificationAPI} from "../../apis";
import {ElNotification} from "element-plus";
let isVisible = ref(true)

const props = defineProps({
  title: {
    type: String,
    default: '公告栏'
  },
  content: {
    type: [String, Object],
    default: ""
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'close'])
const handleClose = () => {
  isVisible.value = false
}

</script>

<style lang="scss" scoped>
.notification-board {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 450px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  border-radius: 4px;
  transition: right 0.3s ease;
  z-index: 0;
  display: flex;
  flex-direction: column;

  .header {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .close-btn {
      cursor: pointer;
      color: #909399;
      &:hover {
        color: #409eff;
      }
    }
  }

  .content-scroll {
    flex: 1;
    padding: 15px;

    .content {
      line-height: 1.6;
      font-size: 14px;
      color: #606266;

      :deep(h3) {
        color: #303133;
        margin: 10px 0;
      }

      :deep(p) {
        margin: 8px 0;
      }
    }
  }
}
</style>