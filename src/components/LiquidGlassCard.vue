<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Liquid Glass'
  },
  content: {
    type: String,
    default: '这是一个使用 CSS Backdrop Filter 和 动画实现的液态玻璃拟态组件。'
  }
})
</script>

<template>
  <div class="liquid-container">
    <!-- 背景流体球 -->
    <div class="blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 玻璃卡片 -->
    <div class="glass-card">
      <div class="card-content">
        <h3>{{ title }}</h3>
        <p>{{ content }}</p>
        <button class="glass-btn">Learn More</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.liquid-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #0f172a;
  /* 深色背景更能衬托玻璃效果 */
  border-radius: 20px;
}

/* 流体球动画 */
.blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(40px);
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  animation: move 10s infinite alternate;
}

.blob-1 {
  top: 10%;
  left: 10%;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #ff00cc, #333399);
  animation-duration: 8s;
}

.blob-2 {
  bottom: 20%;
  right: 10%;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  animation-duration: 12s;
  animation-delay: -2s;
}

.blob-3 {
  top: 40%;
  left: 40%;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  animation-duration: 6s;
  animation-delay: -4s;
}

@keyframes move {
  0% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0, 0) scale(1);
  }
}

/* 玻璃卡片 */
.glass-card {
  position: relative;
  z-index: 2;
  width: 300px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: transform 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-content h3 {
  margin-top: 0;
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 20px;
}

.glass-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}
</style>
