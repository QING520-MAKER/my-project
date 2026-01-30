// 导入路由模块
import { createRouter, createWebHistory } from 'vue-router'

// 导入视图组件
import HomeView from '../views/HomeView.vue'
import TodoView from '../views/TodoView.vue'
import AboutView from '../views/AboutView.vue'
import AIVIew from '../views/AIVIew.vue'
import LoginView from '../views/LoginView.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { hideLayout: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/todo',
    name: 'todo',
    component: TodoView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/ai',
    name: 'ai',
    component: AIVIew
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
