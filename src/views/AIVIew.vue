<script>
export default {
  name: 'AIView'
}
</script>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { Refresh, Microphone, Mute, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AudioRecorder } from '../utils/audio-recorder'
import { IatWebsocket } from '../utils/iat'
import logoImg from '../assets/logo.png'

// 语音听写配置
const IAT_CONFIG = {
  appId: '8d81f5ce',
  apiSecret: 'OGJkZDJhMWQ5ZWE1YzRkYjFkZTg1ZWI0',
  apiKey: '3ae52f7a84e315722cc9ca015d40bb36'
}

// 状态定义
const messages = ref([])
const inputMessage = ref('')
const chatContainer = ref(null)
const isGenerating = ref(false)
const isRecording = ref(false)
const recorder = ref(null)
const iatWs = ref(null)
let abortController = null

// 是否显示欢迎页（无消息时显示）
const showWelcome = computed(() => messages.value.length === 0)

// 监听全局新建对话事件（来自Sidebar）
onMounted(() => {
  window.addEventListener('trigger-new-chat', startNewChat)
  scrollToBottom()
})

onUnmounted(() => {
  window.removeEventListener('trigger-new-chat', startNewChat)
  if (abortController) abortController.abort()
  stopRecording()
})

// 开启新对话
const startNewChat = () => {
  if (isGenerating.value) return
  messages.value = [] // 清空消息，触发显示Welcome页
  ElMessage.success('已开启新对话')
}

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
  if (!inputMessage.value.trim() || isGenerating.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''
  isGenerating.value = true

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: content,
    timestamp: new Date().toLocaleString()
  })
  scrollToBottom()

  // 准备AI回复占位
  const aiReply = {
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    timestamp: new Date().toLocaleString()
  }
  messages.value.push(aiReply)

  // 准备发送给后端的上下文
  const context = messages.value
    .slice(0, -1)
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({ role: msg.role, content: msg.content }))

  try {
    abortController = new AbortController()
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: context }),
      signal: abortController.signal
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') {
            isGenerating.value = false
            return
          }
          try {
            const data = JSON.parse(dataStr)
            if (data.content) {
              aiReply.content += data.content
              messages.value = [...messages.value]
              scrollToBottom()
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Fetch Error:', error)
      ElMessage.error('连接发生错误')
      aiReply.content += '\n[连接发生错误]'
    }
  } finally {
    isGenerating.value = false
    abortController = null
  }
}

// 录音功能
const toggleRecording = async () => {
  if (isRecording.value) stopRecording()
  else startRecording()
}

const startRecording = async () => {
  try {
    isRecording.value = true
    recorder.value = new AudioRecorder()
    iatWs.value = new IatWebsocket(IAT_CONFIG)
    iatWs.value.connect()

    let isFirstFrame = true
    iatWs.value.onTextChange = (text) => {
      inputMessage.value += text
    }

    await recorder.value.start()
    recorder.value.onDataAvailable = (buffer) => {
      if (iatWs.value?.socket?.readyState === WebSocket.OPEN) {
        iatWs.value.sendAudio(buffer, isFirstFrame ? 0 : 1)
        isFirstFrame = false
      }
    }
    ElMessage.success('开始录音...')
  } catch (e) {
    console.error(e)
    ElMessage.error('无法启动录音')
    isRecording.value = false
  }
}

const stopRecording = () => {
  if (!isRecording.value) return
  isRecording.value = false
  if (iatWs.value) {
    iatWs.value.sendAudio(new Int16Array(0), 2)
    setTimeout(() => iatWs.value?.close(), 1000)
  }
  recorder.value?.stop()
}
</script>

<template>
  <div class="doubao-container">
    <!-- 欢迎页 (空状态) -->
    <div v-if="showWelcome" class="welcome-screen">
      <h1 class="welcome-title">有什么我能帮你的吗？</h1>
    </div>

    <!-- 聊天记录区域 -->
    <div v-else class="chat-flow" ref="chatContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message-row', message.role]">
        <!-- 头像 -->
        <div class="avatar-col">
          <div v-if="message.role === 'assistant'" class="ai-avatar">
            <img :src="logoImg" alt="AI" />
          </div>
          <div v-else class="user-avatar">
            <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="Me" />
          </div>
        </div>

        <!-- 消息气泡 -->
        <div class="content-col">
          <div class="bubble">
            <div class="markdown-body">{{ message.content }}</div>
            <span
              v-if="message.role === 'assistant' && isGenerating && index === messages.length - 1 && !message.content"
              class="cursor">|</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部悬浮输入框 -->
    <div class="input-wrapper">
      <div class="input-card">
        <!-- 输入框 -->
        <textarea v-model="inputMessage" class="custom-textarea" placeholder="发消息"
          @keydown.enter.prevent="sendMessage"></textarea>

        <!-- 底部右侧按钮 -->
        <div class="toolbar-right">
          <div class="send-actions">
            <div class="icon-btn voice-btn" :class="{ recording: isRecording }" @click="toggleRecording">
              <el-icon>
                <Microphone />
              </el-icon>
            </div>
            <div class="icon-btn send-btn" :class="{ active: inputMessage.trim() }" @click="sendMessage">
              <el-icon v-if="!isGenerating">
                <Promotion />
              </el-icon>
              <el-icon v-else class="spinning">
                <Refresh />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-tip">AI 生成的内容可能不准确，请核对重要信息</div>
    </div>
  </div>
</template>

<style scoped>
.doubao-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: #fff;
}

/* 欢迎页样式 */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 120px;
  /* 给底部输入框留空间 */
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 40px;
}

/* 聊天流样式 */
.chat-flow {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 140px 20px;
  /* 底部padding避开输入框 */
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.message-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar-col img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.content-col {
  max-width: 80%;
}

.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
}

.user .bubble {
  background-color: #e8f3ff;
  /* 浅蓝底 */
  color: #1f2937;
  border-radius: 12px 12px 2px 12px;
}

.assistant .bubble {
  background-color: transparent;
  color: #1f2937;
  padding-left: 0;
}

/* 底部输入框样式 */
.input-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 20%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.input-card {
  width: 100%;
  max-width: 800px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
  position: relative;
  transition: box-shadow 0.2s;
}

.input-card:focus-within {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

.custom-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  height: 50px;
  font-size: 15px;
  font-family: inherit;
  margin: 8px 0;
  padding: 0;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
}

.send-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.send-btn.active {
  background: #000;
  color: #fff;
}

.voice-btn.recording {
  background: #fee2e2;
  color: #ef4444;
  animation: pulse 1.5s infinite;
}

.footer-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #000;
  animation: blink 1s infinite;
  vertical-align: middle;
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

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.spinning {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
