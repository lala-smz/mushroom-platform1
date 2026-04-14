<template>
  <div class="app">
    <ErrorBoundary>
      <!-- 全局通知组件 -->
      <GlobalNotification />
      
      <!-- 导航栏 -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <router-link to="/">
                蘑菇网
              </router-link>
            </div>
            <nav class="nav">
              <router-link
                to="/"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/' }"
              >
                首页
              </router-link>
              <router-link
                to="/products"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/products' }"
              >
                商品列表
              </router-link>
              <router-link
                to="/mushroom-boxes"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/mushroom-boxes' }"
              >
                时令菌菇盲盒
              </router-link>
              <router-link
                to="/mushroom-kitchen"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/mushroom-kitchen' || $route.path.startsWith('/mushroom-kitchen/') }"
              >
                我的菌菇厨房
              </router-link>
              <router-link
                v-if="userStore.isLoggedIn"
                to="/cart"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/cart' }"
              >
                购物车
              </router-link>
              <div
                v-if="userStore.isLoggedIn"
                class="nav-item"
              >
                <MessageIcon />
              </div>
              <router-link
                v-if="userStore.isAdmin || userStore.isSeller"
                to="/admin"
                class="nav-item"
                :class="{ 'is-active': $route.path === '/admin' || $route.path.startsWith('/admin/') }"
              >
                管理后台
              </router-link>
            </nav>
            <div class="user-info">
              <!-- 主题切换按钮 -->
              <button
                class="btn btn-outline theme-toggle"
                title="切换主题"
                @click="toggleTheme"
              >
                <el-icon>
                  <Sunny v-if="themeStore.currentTheme === 'dark'" />
                  <Moon v-else />
                </el-icon>
              </button>
              
              <template v-if="userStore.isLoggedIn && userStore.userInfo">
                <span class="welcome">欢迎，{{ userStore.userInfo.username }}</span>
                <router-link
                  to="/user"
                  class="nav-item"
                  :class="{ 'is-active': $route.path === '/user' || $route.path.startsWith('/user/') }"
                >
                  个人中心
                </router-link>
                <button
                  class="btn btn-outline"
                  @click="userStore.logout"
                >
                  退出登录
                </button>
              </template>
              <template v-else>
                <router-link
                  to="/login"
                  class="nav-item"
                  :class="{ 'is-active': $route.path === '/login' }"
                >
                  登录
                </router-link>
                <router-link
                  to="/register"
                  class="nav-item"
                  :class="{ 'is-active': $route.path === '/register' }"
                >
                  注册
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="main">
        <router-view v-slot="{ Component, route }">
          <transition
            name="fade"
            mode="out-in"
          >
            <component
              :is="Component"
              :key="route.path"
            />
          </transition>
        </router-view>
      </main>

      <!-- 页脚 -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>关于我们</h3>
              <p>蘑菇网是专业的蘑菇交易平台，提供优质的蘑菇产品和服务。</p>
            </div>
            <div class="footer-section">
              <h3>联系我们</h3>
              <p>邮箱：contact@mushroom.com</p>
              <p>电话：400-123-4567</p>
            </div>
            <div class="footer-section">
              <h3>快速链接</h3>
              <ul>
                <li>
                  <router-link to="/">
                    首页
                  </router-link>
                </li>
                <li>
                  <router-link to="/products">
                    商品列表
                  </router-link>
                </li>
                <li>
                  <router-link to="/mushroom-kitchen">
                    我的菌菇厨房
                  </router-link>
                </li>
                <li>
                  <router-link to="/about">
                    关于我们
                  </router-link>
                </li>
                <li>
                  <router-link to="/contact">
                    联系我们
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; {{ new Date().getFullYear() }} 蘑菇网 版权所有</p>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/useUserStore'
import { useMessageStore } from './stores/useMessageStore'
import { useThemeStore } from './stores/useThemeStore'
import ErrorBoundary from './components/ErrorBoundary.vue'
import GlobalNotification from './components/GlobalNotification.vue'
import MessageIcon from './components/MessageIcon.vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const userStore = useUserStore()
const messageStore = useMessageStore()
const themeStore = useThemeStore()

// 获取未读消息数量
const loadUnreadCount = async () => {
  if (userStore.isLoggedIn) {
    try {
      await messageStore.getUnreadCount()
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
    }
  }
}

// 切换主题
const toggleTheme = () => {
  // 获取主题切换按钮元素
  const themeToggleBtn = document.querySelector('.theme-toggle')
  if (themeToggleBtn) {
    // 添加动画类
    themeToggleBtn.classList.add('theme-changing')
    
    // 动画结束后移除类
    setTimeout(() => {
      themeToggleBtn.classList.remove('theme-changing')
    }, 600)
  }
  
  // 执行主题切换
  themeStore.toggleTheme()
}

onMounted(() => {
  // 初始化用户状态
  userStore.init()
  // 初始化主题
  themeStore.initTheme()
  // 加载未读消息
  loadUnreadCount()
})
</script>

<style>
/* 全局CSS变量，用于主题切换 */
:root {
  /* 默认亮色主题 */
  --theme-primaryColor: #409eff;
  --theme-backgroundColor: #f5f7fa;
  --theme-secondaryBackgroundColor: #fff;
  --theme-textColor: #303133;
  --theme-secondaryTextColor: #606266;
  --theme-borderColor: #e4e7ed;
  --theme-hoverColor: #f5f7fa;
  --theme-activeColor: #ecf5ff;
  --theme-inputBackgroundColor: #fff;
  --theme-inputBorderColor: #dcdfe6;
  --theme-scrollbarTrackColor: #f1f1f1;
  --theme-scrollbarThumbColor: #c1c1c1;
  --theme-boxShadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 暗色主题变量 */
.dark-theme {
  --theme-primaryColor: #1890ff;
  --theme-backgroundColor: #001529;
  --theme-secondaryBackgroundColor: #001529;
  --theme-textColor: #fff;
  --theme-secondaryTextColor: rgba(255, 255, 255, 0.7);
  --theme-borderColor: #002140;
  --theme-hoverColor: rgba(255, 255, 255, 0.05);
  --theme-activeColor: rgba(24, 144, 255, 0.15);
  --theme-inputBackgroundColor: rgba(255, 255, 255, 0.1);
  --theme-inputBorderColor: rgba(255, 255, 255, 0.2);
  --theme-scrollbarTrackColor: rgba(255, 255, 255, 0.05);
  --theme-scrollbarThumbColor: rgba(255, 255, 255, 0.2);
  --theme-boxShadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

/* 平滑过渡效果 */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
}

/* 主题切换动画 */
.theme-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动条过渡效果 */
::-webkit-scrollbar-track,
::-webkit-scrollbar-thumb {
  transition: background-color 0.3s ease;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--theme-backgroundColor);
  color: var(--theme-textColor);
}

.header {
  background-color: var(--theme-secondaryBackgroundColor);
  box-shadow: var(--theme-boxShadow);
  padding: 0 20px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--theme-borderColor);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  color: var(--theme-primaryColor);
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo a:hover {
  color: var(--theme-primaryColor);
  opacity: 0.8;
}

.nav {
  display: flex;
  gap: 15px;
}

.nav-item {
  color: var(--theme-secondaryTextColor);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  height: 40px;
}

.nav-item:hover {
  color: var(--theme-primaryColor);
  background-color: var(--theme-hoverColor);
}

.nav-item.is-active {
  color: var(--theme-textColor);
  background-color: var(--theme-primaryColor);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  color: var(--theme-secondaryTextColor);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--theme-inputBorderColor);
  color: var(--theme-primaryColor);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-outline:hover {
  background-color: var(--theme-primaryColor);
  color: #fff;
  border-color: var(--theme-primaryColor);
}

/* 主题切换按钮 */
.theme-toggle {
  padding: 8px;
  min-width: 36px;
  justify-content: center;
  font-size: 18px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.theme-toggle:hover {
  transform: scale(1.1);
  background-color: var(--theme-primaryColor);
  color: #fff;
  border-color: var(--theme-primaryColor);
}

/* 主题切换动画 */
.theme-toggle.theme-changing {
  animation: themeToggleRotate 0.6s ease-in-out;
}

@keyframes themeToggleRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* 未读消息徽章 */
.unread-badge {
  display: inline-block;
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 5px;
  min-width: 18px;
  text-align: center;
  font-weight: bold;
}

.main {
  flex: 1;
  padding: 20px 0;
  background-color: var(--theme-backgroundColor);
}

.footer {
  background-color: var(--theme-secondaryBackgroundColor);
  padding: 30px 20px;
  margin-top: auto;
  border-top: 1px solid var(--theme-borderColor);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.footer-section h3 {
  margin-bottom: 15px;
  color: var(--theme-textColor);
}

.footer-section p {
  color: var(--theme-secondaryTextColor);
  margin-bottom: 10px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: var(--theme-secondaryTextColor);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: var(--theme-primaryColor);
}

.footer-bottom {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--theme-borderColor);
  text-align: center;
  color: var(--theme-secondaryTextColor);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--theme-scrollbarTrackColor);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--theme-scrollbarThumbColor);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--theme-scrollbarThumbColor);
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header {
    padding: 0 15px;
  }
  
  .nav {
    gap: 10px;
  }
  
  .nav-item {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  .welcome {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header {
    height: auto;
    padding: 10px 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 10px;
    height: auto;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: 100%;
  }

  .nav-item {
    flex: 1;
    min-width: 80px;
    justify-content: center;
    text-align: center;
  }

  .user-info {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: 100%;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
  }

  .footer-section {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 20px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 5px 8px;
    min-width: 70px;
  }
  
  .btn-outline {
    padding: 4px 10px;
    font-size: 13px;
  }
  
  .welcome {
    font-size: 13px;
  }
  
  .footer {
    padding: 20px 10px;
  }
}
</style>