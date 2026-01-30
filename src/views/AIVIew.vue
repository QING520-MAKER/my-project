<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { ChatDotRound, Refresh, Microphone, Mute } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { SparkWebsocket } from '../utils/spark'
import { AudioRecorder } from '../utils/audio-recorder'
import { IatWebsocket } from '../utils/iat'

// 配置信息 - 请在此处填入您的API信息
const SPARK_CONFIG = {
  appId: '8d81f5ce',
  apiSecret: 'OGJkZDJhMWQ5ZWE1YzRkYjFkZTg1ZWI0',
  apiKey: '3ae52f7a84e315722cc9ca015d40bb36',
  url: 'wss://sparkcube-api.xf-yun.com/v1/customize'
}

// 语音听写配置 (使用相同的凭证)
const IAT_CONFIG = {
  appId: SPARK_CONFIG.appId,
  apiSecret: SPARK_CONFIG.apiSecret,
  apiKey: SPARK_CONFIG.apiKey
}

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
// Spark WebSocket 实例
let sparkWs = null

// 语音相关状态
const isRecording = ref(false)
const recorder = ref(null)
const iatWs = ref(null)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isGenerating.value) {
    return
  }

  // 检查配置是否已填写
  if (SPARK_CONFIG.appId === 'YOUR_APP_ID') {
    ElMessage.warning('请先在代码中配置 APPID, APISecret 和 APIKey')
    return
  }

  const content = inputMessage.value.trim()
  inputMessage.value = ''
  isGenerating.value = true

  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: content,
    timestamp: new Date().toLocaleString()
  }
  messages.value.push(userMessage)
  scrollToBottom()

  // 准备AI回复占位
  const aiReply = {
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    timestamp: new Date().toLocaleString()
  }
  messages.value.push(aiReply)

  // 初始化并连接WebSocket
  sparkWs = new SparkWebsocket(SPARK_CONFIG)

  sparkWs.onOpen = () => {
    // 构建历史消息上下文 (Spark API 格式)
    const context = messages.value
      .slice(0, -1) // 排除掉刚刚添加的空回复
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    sparkWs.send(context)
  }

  sparkWs.onMessage = (response) => {
    // 处理响应
    if (response.header.code !== 0) {
      ElMessage.error(`API Error: ${response.header.message}`)
      isGenerating.value = false
      sparkWs.close()
      return
    }

    if (response.payload && response.payload.choices && response.payload.choices.text) {
      const text = response.payload.choices.text[0].content
      aiReply.content += text

      // 强制更新视图
      messages.value = [...messages.value]
      scrollToBottom()
    }

    // 检查是否结束
    if (response.header.status === 2) {
      isGenerating.value = false
      sparkWs.close()
    }
  }

  sparkWs.onError = (error) => {
    console.error('WebSocket Error:', error)
    ElMessage.error('连接发生错误，请检查网络或配置')
    isGenerating.value = false
    aiReply.content += '\n[连接发生错误]'
  }

  sparkWs.onClose = () => {
    if (isGenerating.value) {
      // 异常关闭
      isGenerating.value = false
    }
  }

  sparkWs.connect()
}

// 开始/停止录音
const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  try {
    isRecording.value = true
    recorder.value = new AudioRecorder()
    iatWs.value = new IatWebsocket(IAT_CONFIG)

    // 连接 WebSocket
    iatWs.value.connect()

    let isFirstFrame = true

    // 设置回调
    iatWs.value.onTextChange = (text, isLast) => {
      // 将识别结果追加到输入框
      inputMessage.value += text
      if (isLast) {
        // 自动发送（可选，这里只填充不自动发送）
        // sendMessage()
      }
    }

    iatWs.value.onError = (err) => {
      console.error('IAT Error:', err)
      ElMessage.error('语音识别出错')
      stopRecording()
    }

    // 启动录音
    await recorder.value.start()

    recorder.value.onDataAvailable = (buffer) => {
      if (iatWs.value && iatWs.value.socket && iatWs.value.socket.readyState === WebSocket.OPEN) {
        const status = isFirstFrame ? 0 : 1
        iatWs.value.sendAudio(buffer, status)
        isFirstFrame = false
      }
    }

    ElMessage.success('开始录音，请说话...')
  } catch (e) {
    console.error('Start recording failed:', e)
    ElMessage.error('无法启动录音，请检查麦克风权限')
    isRecording.value = false
  }
}

const stopRecording = () => {
  if (!isRecording.value) return

  isRecording.value = false

  // 发送最后一帧（空数据，status=2）
  if (iatWs.value) {
    iatWs.value.sendAudio(new Int16Array(0), 2)
    // 延迟关闭连接，等待最后的结果
    setTimeout(() => {
      if (iatWs.value) iatWs.value.close()
      iatWs.value = null
    }, 1000)
  }

  if (recorder.value) {
    recorder.value.stop()
    recorder.value = null
  }
}

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 组件卸载时断开连接
onUnmounted(() => {
  if (sparkWs) {
    sparkWs.close()
  }
  stopRecording()
})
</script>

<template>
  <div class="chat-container">
    <!-- 聊天区域 -->
    <div class="chat-messages" ref="chatContainer">
      <div v-for="(message, index) in messages" :key="index" :class="[
        'message-item',
        message.role === 'assistant' ? 'ai-message' : 'user-message'
      ]">
        <!-- 头像 -->
        <div class="avatar" :class="message.role">
          {{ message.role === 'assistant' ? 'AI' : 'Me' }}
        </div>

        <div class="message-content">
          {{ message.content }}
          <span v-if="message.role === 'assistant' && isGenerating && index === messages.length - 1 && !message.content"
            class="cursor">|</span>
        </div>
      </div>

      <!-- 正在输入指示器 (连接建立中) -->
      <div v-if="isGenerating && messages[messages.length - 1].content === ''" class="message-item ai-message">
        <div class="avatar assistant">AI</div>
        <div class="message-content generating">
          <span class="typing-text">正在思考...</span>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input v-model="inputMessage" placeholder="请输入消息..." @keyup.enter="sendMessage" :disabled="isGenerating"
        type="textarea" :rows="3" resize="none" />
      <div class="input-actions">
        <div class="left-actions">
          <!-- 语音按钮 -->
          <el-button :type="isRecording ? 'danger' : 'default'" circle :icon="isRecording ? Mute : Microphone"
            @click="toggleRecording" :title="isRecording ? '停止录音' : '开始录音'" />
          <span v-if="isRecording" class="recording-tip">正在听...</span>
          <span v-else class="tip">按 Enter 发送</span>
        </div>

        <el-button type="primary" @click="sendMessage" :disabled="isGenerating || !inputMessage.trim()"
          :icon="isGenerating ? Refresh : ChatDotRound" :loading="isGenerating">
          {{ isGenerating ? '生成中...' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
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
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.avatar.assistant {
  background-color: #0ea5e9;
  color: white;
}

.avatar.user {
  background-color: #f97316;
  color: white;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  position: relative;
}

.ai-message .message-content {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 4px;
  color: #1e293b;
}

.user-message .message-content {
  background-color: #0ea5e9;
  color: white;
  border-top-right-radius: 4px;
}

.cursor {
  display: inline-block;
  width: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.input-area {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tip {
  font-size: 12px;
  color: #94a3b8;
}

.recording-tip {
  font-size: 12px;
  color: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.input-area :deep(.el-textarea__inner) {
  border-radius: 8px;
  border-color: #e2e8f0;
  padding: 12px;
}

.input-area :deep(.el-textarea__inner:focus) {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 1px #0ea5e9;
}
</style>
