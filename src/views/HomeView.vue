<script setup>
import LiquidGlassCard from '../components/LiquidGlassCard.vue'
</script>

<template>
  <div class="home-container">
    <h2>欢迎来到Vue Todo应用</h2>
    <p>这是一个集成了路由、状态管理和Element Plus的Vue 3应用</p>
    <p>请使用左侧菜单导航到不同功能页面</p>

    <div class="demo-section">
      <h3>UI Skills 展示: 液态玻璃拟态 (Liquid Glass)</h3>
      <div class="demo-card">
        <LiquidGlassCard 
          title="UI/UX Pro Max" 
          content="基于 skills 智能生成的液态玻璃效果组件。具有流体背景动画、磨砂玻璃质感和 iridescent 渐变色彩。" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
  text-align: center;
}

.demo-section {
  margin-top: 40px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.demo-section h3 {
  margin-bottom: 30px;
  color: #333;
}

.demo-card {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
