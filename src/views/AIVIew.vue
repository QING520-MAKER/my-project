<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ChatDotRound, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 对话消息列表
const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: '你好！我是你的AI助手，有什么可以帮助你的吗？',
    timestamp: new Date().toLocaleString()
  }
])

// 输入框内容
const inputMessage = ref('')

// 对话区域引用
const chatContainer = ref(null)

// 是否正在生成回复
const isGenerating = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim() || isGenerating.value) {
    return
  }

  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date().toLocaleString()
  }
  messages.value.push(userMessage)

  // 清空输入框
  inputMessage.value = ''

  // 开始生成回复
  isGenerating.value = true

  // 模拟AI回复生成
  setTimeout(() => {
    const reply = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '这是AI生成的回复：' + userMessage.content,
      timestamp: new Date().toLocaleString()
    }
    messages.value.push(reply)
    isGenerating.value = false
    scrollToBottom()
  }, 1500)
}

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-container">
    <!-- 聊天区域 -->
    <div class="chat-messages" ref="chatContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'message-item',
          message.role === 'assistant' ? 'ai-message' : 'user-message'
        ]"
      >
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        placeholder="请输入消息..."
        @keyup.enter="sendMessage"
        :disabled="isGenerating"
        type="textarea"
        :rows="3"
        resize="none"
      />
      <el-button
        type="primary"
        @click="sendMessage"
        :disabled="isGenerating || !inputMessage.trim()"
        :icon="isGenerating ? Refresh : ChatDotRound"
      >
        {{ isGenerating ? '生成中...' : '发送' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fafafa;
}

.message-item {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: fadeIn 0.3s ease-in;
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

.ai-message {
  justify-content: flex-start;
}

.user-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.ai-message .message-content {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background-color: #0284c7;
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.input-area {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
}

.input-area :deep(.el-textarea__inner) {
  border-radius: 12px;
  border-color: #e8e8e8;
  resize: none;
  font-size: 15px;
}

.input-area :deep(.el-button) {
  margin-top: 12px;
  border-radius: 12px;
  padding: 8px 24px;
  font-size: 15px;
  background-color: #0284c7;
  border: none;
}

.input-area :deep(.el-button:hover) {
  background-color: #0ea5e9;
}

.input-area :deep(.el-button.is-disabled) {
  background-color: #93c5fd;
  cursor: not-allowed;
}
</style>