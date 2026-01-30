<template>
  <div class="login-page">
    <div class="split-container">
      <!-- 左侧：营销/SaaS 风格展示区 -->
      <div class="marketing-side">
        <div class="marketing-content">
          <div class="logo">元聊校园</div>
          <h1 class="headline">连接校园，<br>创造无限可能</h1>
          <p class="subheadline">
            加入我们，体验新一代校园社交与协作平台。
            高效沟通，即刻开始。
          </p>

          <div class="features-preview">
            <div class="feature-item">
              <span class="icon">🚀</span>
              <div class="text">
                <h3>极速协作</h3>
                <p>实时消息，文件共享，让团队协作更轻松。</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="icon">🛡️</span>
              <div class="text">
                <h3>安全可靠</h3>
                <p>企业级加密，保障您的数据安全。</p>
              </div>
            </div>
          </div>

          <div class="social-proof">
            <p>已被 50+ 高校社团信赖</p>
            <div class="avatars">
              <div class="avatar-group">
                <span class="avatar">A</span>
                <span class="avatar">B</span>
                <span class="avatar">C</span>
                <span class="avatar-more">+500</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 背景装饰 -->
        <div class="bg-decoration"></div>
      </div>

      <!-- 右侧：登录表单区 -->
      <div class="form-side">
        <div class="form-container">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账户以继续</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">学号 / 职工号</label>
              <input type="text" id="username" v-model="form.username" placeholder="请输入您的学号" required>
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" v-model="form.password" placeholder="请输入密码" required>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="form.remember">
                <span class="checkmark"></span>
                记住我
              </label>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <div class="form-footer">
            <p>还没有账号？ <a href="#">立即注册</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const handleLogin = async () => {
  loading.value = true
  // 模拟登录延迟
  setTimeout(() => {
    loading.value = false
    console.log('登录信息:', form)
    // 登录成功后跳转到首页或其他页面
    router.push('/home')
  }, 1500)
}
</script>

<style scoped>
/* 
  设计系统变量 - 沿用 SaaS 风格
  Primary: #0EA5E9 (Sky Blue)
  Secondary: #38BDF8
  CTA: #F97316 (Orange)
  Background: #F0F9FF (Pale Blue)
  Text: #0C4A6E (Dark Blue)
*/
:root {
  --primary: #0EA5E9;
  --primary-hover: #0284C7;
  --text-main: #0C4A6E;
  --text-light: #64748B;
  --bg-light: #F0F9FF;
  --white: #ffffff;
  --orange: #F97316;
}

.login-page {
  min-height: 100vh;
  font-family: 'Nunito Sans', 'Rubik', sans-serif;
  background-color: white;
  overflow: hidden;
}

.split-container {
  display: flex;
  min-height: 100vh;
}

/* 左侧营销区 */
.marketing-side {
  flex: 1;
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
  color: white;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.marketing-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo::before {
  content: '';
  display: block;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 6px;
}

.headline {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.subheadline {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 480px;
}

.features-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-item .icon {
  font-size: 1.5rem;
}

.feature-item h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.feature-item p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.social-proof p {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 0.75rem;
}

.avatar-group {
  display: flex;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #0EA5E9;
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0EA5E9;
  font-weight: 700;
  font-size: 0.8rem;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar-more {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F97316;
  border: 2px solid #0EA5E9;
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
}

.bg-decoration {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* 右侧表单区 */
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: white;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.form-header h2 {
  font-size: 2rem;
  color: #0C4A6E;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #64748B;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0C4A6E;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  color: #0C4A6E;
}

.form-group input:focus {
  outline: none;
  border-color: #0EA5E9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748B;
}

.checkbox-container input {
  margin-right: 0.5rem;
}

.forgot-password {
  font-size: 0.9rem;
  color: #0EA5E9;
  text-decoration: none;
  font-weight: 600;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background-color: #0EA5E9;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

.btn-primary:hover {
  background-color: #0284C7;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #64748B;
}

.form-footer a {
  color: #0EA5E9;
  text-decoration: none;
  font-weight: 700;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .headline {
    font-size: 2.5rem;
  }

  .marketing-side {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
  }

  .marketing-side {
    display: none;
  }

  /* 在移动端隐藏营销区，或简化显示 */
  .form-side {
    padding: 4rem 2rem;
  }
}
</style>
