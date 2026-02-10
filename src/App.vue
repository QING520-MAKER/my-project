<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  List,
  Document,
  Setting,
  ChatRound,
  Plus
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const handleNewChat = () => {
  // 如果当前不在AI页面，跳转过去
  if (route.path !== '/ai') {
    router.push('/ai')
  }
  window.dispatchEvent(new Event('trigger-new-chat'))
}
</script>

<template>
  <div class="app-container">
    <!-- 使用Element Plus的Container布局组件 -->
    <el-container v-if="!route.meta.hideLayout" style="height: 100vh;">

      <!-- 一级全局导航 (Global Sidebar) -->
      <el-aside width="64px" class="global-sidebar">
        <div class="global-nav-item" :class="{ active: route.path === '/home' }" @click="router.push('/home')">
          <el-icon>
            <HomeFilled />
          </el-icon>
        </div>
        <div class="global-nav-item" :class="{ active: route.path === '/todo' }" @click="router.push('/todo')">
          <el-icon>
            <List />
          </el-icon>
        </div>
        <div class="global-nav-item" :class="{ active: route.path === '/ai' }" @click="router.push('/ai')">
          <el-icon>
            <ChatRound />
          </el-icon>
        </div>
        <div class="global-nav-item" :class="{ active: route.path === '/about' }" @click="router.push('/about')">
          <el-icon>
            <Document />
          </el-icon>
        </div>
        <div style="flex: 1"></div>
        <div class="global-nav-item">
          <el-icon>
            <Setting />
          </el-icon>
        </div>
      </el-aside>

      <!-- 二级侧边栏 (AI页面专属，仿豆包) -->
      <el-aside v-if="route.path === '/ai'" width="240px" class="doubao-sidebar">
        <!-- 顶部Logo与新对话 -->
        <div class="sidebar-header">
          <div class="user-profile">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">爱吃碳水</span>
          </div>

          <el-button class="new-chat-btn" @click="handleNewChat">
            <el-icon>
              <Plus />
            </el-icon>
            <span>新对话</span>
          </el-button>
        </div>

        <!-- 导航菜单 -->
        <div class="nav-section">
          <div class="nav-item active">
            <el-icon>
              <ChatRound />
            </el-icon>
            <span>AI 创作</span>
          </div>
          <div class="nav-item">
            <el-icon>
              <Document />
            </el-icon>
            <span>云盘</span>
          </div>
        </div>

        <!-- 历史对话 (Mock) -->
        <div class="history-section">
          <div class="section-title">历史对话</div>
          <div class="history-list">
            <div class="history-item">手机版对话</div>
            <div class="history-item">UI/UX Pro Max Guide</div>
            <div class="history-item">Vue 中表单翻页重置</div>
            <div class="history-item">接口报错原因及解决</div>
            <div class="history-item">前端权限控制实现</div>
          </div>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 使用RouterView组件显示当前路由对应的组件，并使用KeepAlive缓存AIView -->
        <router-view v-slot="{ Component }">
          <keep-alive include="AIView">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>

    <!-- 全屏布局（用于登录页） -->
    <router-view v-else />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #fff;
  color: #1f2937;
}

.app-container {
  height: 100%;
}

/* 一级全局侧边栏 */
.global-sidebar {
  background-color: #f0f0f0;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  z-index: 20;
}

.global-nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.global-nav-item:hover {
  background-color: #e0e0e0;
  color: #333;
}

.global-nav-item.active {
  background-color: #fff;
  color: #0ea5e9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.global-nav-item .el-icon {
  font-size: 20px;
}

/* 侧边栏样式仿豆包 */
.doubao-sidebar {
  background-color: #f9f9f9;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  padding: 16px;
  transition: width 0.3s;
}

.sidebar-header {
  margin-bottom: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.new-chat-btn {
  width: 100%;
  background-color: #e8f3ff;
  color: #0ea5e9;
  border: none;
  border-radius: 8px;
  padding: 18px;
  justify-content: flex-start;
  font-weight: 600;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background-color: #dbeafe;
  color: #0284c7;
}

.new-chat-btn .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 导航项 */
.nav-section {
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item.active {
  background-color: #eef2ff;
  /* 极淡的蓝 */
  color: #0ea5e9;
  font-weight: 500;
}

/* 历史记录 */
.history-section {
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
  padding-left: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item:hover {
  background-color: #f3f4f6;
}

/* 主内容区 */
.main-content {
  padding: 0 !important;
  /* 移除默认padding，由内部组件控制 */
  background-color: #fff;
}
</style>
