<script setup>
import { useRoute } from 'vue-router'
// 导入Element Plus图标
import {
  HomeFilled,
  List,
  Document,
  Setting,
  ChatRound
} from '@element-plus/icons-vue'

const route = useRoute()
</script>

<template>
  <div class="app-container">
    <!-- 使用Element Plus的Container布局组件 -->
    <el-container v-if="!route.meta.hideLayout" style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px" style="background-color: white; border-right: 1px solid #e6e6e6;">
        <!-- 系统标题 -->
        <div class="logo-container">
          <h1 class="logo-text">元聊校园</h1>
        </div>

        <!-- 使用Element Plus的Menu组件实现导航菜单 -->
        <el-menu default-active="/" class="sidebar-menu" background-color="white" text-color="#64748B"
          active-text-color="#0EA5E9" router>
          <el-menu-item index="/home">
            <template #title>
              <el-icon>
                <HomeFilled />
              </el-icon>
              <span>首页</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/todo">
            <template #title>
              <el-icon>
                <List />
              </el-icon>
              <span>待办列表</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/about">
            <template #title>
              <el-icon>
                <Document />
              </el-icon>
              <span>关于系统</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/ai">
            <template #title>
              <el-icon>
                <ChatRound />
              </el-icon>
              <span>AI对话</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header
          style="background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; padding: 0 20px;">
          <!-- 左侧占位元素 -->
          <div style="flex: 1;"></div>

          <!-- 标题居中 -->
          <h2>小卿前端练习</h2>

          <!-- 右侧占位元素 -->
          <div style="flex: 1;"></div>

          <!-- 恢复系统设置下拉菜单 -->
          <div class="user-info">
            <el-dropdown>
              <span class="el-dropdown-link">
                <el-icon class="el-icon--right">
                  <Setting />
                </el-icon>
                系统设置
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 路由视图区域 -->
        <el-main style="padding: 20px;">
          <!-- 使用RouterView组件显示当前路由对应的组件 -->
          <router-view />
        </el-main>
      </el-container>
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
  font-family: Arial, sans-serif;
}

.app-container {
  height: 100%;
}

/* 侧边栏样式 */
.logo-container {
  padding: 0;
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  background-color: white;
}

.logo-text {
  color: #0EA5E9;
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  border-right: none;
}

/* 顶部导航栏样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 主内容区域样式 */
.el-main {
  background-color: #f5f7fa;
}
</style>

<style scoped>
/* 组件特定样式 */
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
