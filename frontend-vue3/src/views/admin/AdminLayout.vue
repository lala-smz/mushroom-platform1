<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="admin-sidebar"
    >
      <div class="sidebar-header">
        <h2 v-if="!isCollapse">
          {{ userStore.isAdmin ? '管理后台' : '卖家中心' }}
        </h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
      >
        <!-- 控制台 - 所有角色都可见 -->
        <el-menu-item index="/admin/dashboard">
          <el-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><rect
              width="20"
              height="8"
              x="2"
              y="2"
              rx="2"
              ry="2"
            /><rect
              width="20"
              height="8"
              x="2"
              y="14"
              rx="2"
              ry="2"
            /><line
              x1="6"
              x2="6.01"
              y1="6"
              y2="6"
            /><line
              x1="6"
              x2="6.01"
              y1="18"
              y2="18"
            /></svg>
          </el-icon>
          <span v-if="!isCollapse">{{ userStore.isAdmin ? '控制台' : '数据概览' }}</span>
        </el-menu-item>
        
        <!-- 商品管理 - 管理员和卖家都可见 -->
        <el-menu-item index="/admin/products">
          <el-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><circle
              cx="9"
              cy="21"
              r="1"
            /><circle
              cx="20"
              cy="21"
              r="1"
            /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </el-icon>
          <span v-if="!isCollapse">商品管理</span>
        </el-menu-item>
        
        <!-- 商品上传 - 管理员和卖家都可见 -->
        <el-menu-item index="/admin/product/upload">
          <el-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line
              x1="12"
              x2="12"
              y1="15"
              y2="3"
            /></svg>
          </el-icon>
          <span v-if="!isCollapse">商品上传</span>
        </el-menu-item>
        
        <!-- 订单管理 - 管理员和卖家都可见 -->
        <el-menu-item index="/admin/orders">
          <el-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            /></svg>
          </el-icon>
          <span v-if="!isCollapse">订单管理</span>
        </el-menu-item>
        
        <!-- 以下菜单仅管理员可见 -->
        <template v-if="userStore.isAdmin">
          <el-menu-item index="/admin/users">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle
                cx="9"
                cy="7"
                r="4"
              /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </el-icon>
            <span v-if="!isCollapse">用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/score-config">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
            </el-icon>
            <span v-if="!isCollapse">评分权重配置</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/recipes">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line
                x1="6"
                x2="6"
                y1="1"
                y2="4"
              /><line
                x1="10"
                x2="10"
                y1="1"
                y2="4"
              /><line
                x1="14"
                x2="14"
                y1="1"
                y2="4"
              /></svg>
            </el-icon>
            <span v-if="!isCollapse">食谱管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/boxes">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line
                x1="12"
                x2="12"
                y1="22.08"
                y2="12"
              /></svg>
            </el-icon>
            <span v-if="!isCollapse">盲盒管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/videos">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M23 7l-7 5 7 5V7z" /><rect
                x="1"
                y="5"
                width="15"
                height="14"
                rx="2"
              /></svg>
            </el-icon>
            <span v-if="!isCollapse">视频管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/product-categories">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line
                x1="16"
                x2="8"
                y1="13"
                y2="13"
              /><line
                x1="16"
                x2="8"
                y1="17"
                y2="17"
              /><polyline points="10 9 9 9 8 9" /></svg>
            </el-icon>
            <span v-if="!isCollapse">商品分类管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container :class="['admin-main', { 'collapsed': isCollapse }]">
      <!-- 顶部导航 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon>
              <MenuIcon v-if="isCollapse" />
              <CloseIcon v-else />
            </el-icon>
          </el-button>
          <h3>{{ pageTitle }}</h3>
        </div>
        <div class="header-right">
          <!-- 主题切换按钮 -->
          <el-button
            type="text"
            class="theme-toggle"
            title="切换主题"
            @click="toggleTheme"
          >
            <el-icon>
              <Sunny v-if="themeStore.currentTheme === 'dark'" />
              <Moon v-else />
            </el-icon>
          </el-button>
          <span class="welcome">欢迎，{{ userStore.userInfo.username }}</span>
          <el-button
            type="text"
            class="logout-btn"
            @click="userStore.logout"
          >
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
                x1="21"
                x2="9"
                y1="12"
                y2="12"
              /></svg>
            </el-icon>
            退出登录
          </el-button>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="admin-content">
        <ErrorBoundary>
          <router-view v-slot="{ Component, route }">
            <transition
              name="fade"
              mode="out-in"
            >
              <keep-alive>
                <component
                  :is="Component"
                  :key="route.path"
                />
              </keep-alive>
            </transition>
          </router-view>
        </ErrorBoundary>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/useUserStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { Menu as MenuIcon, Close as CloseIcon, Sunny, Moon } from '@element-plus/icons-vue'
import ErrorBoundary from '../../components/ErrorBoundary.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const isCollapse = ref(false)

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

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 获取页面标题
const pageTitle = computed(() => {
  const adminTitleMap = {
    '/admin/dashboard': '控制台',
    '/admin/products': '商品管理',
    '/admin/product/upload': '商品上传',
    '/admin/users': '用户管理',
    '/admin/orders': '订单管理',
    '/admin/score-config': '评分权重配置',
    '/admin/recipes': '食谱管理',
    '/admin/boxes': '盲盒管理',
    '/admin/videos': '视频管理',
    '/admin/product-categories': '商品分类管理'
  };
  
  const sellerTitleMap = {
    '/admin/dashboard': '数据概览',
    '/admin/products': '商品管理',
    '/admin/product/upload': '商品上传',
    '/admin/orders': '订单管理'
  };
  
  const titleMap = userStore.isAdmin ? adminTitleMap : sellerTitleMap;
  return titleMap[route.path] || (userStore.isAdmin ? '管理后台' : '卖家中心');
})

// 获取当前激活的菜单
const activeMenu = computed(() => {
  const adminMenuPaths = ['/admin/dashboard', '/admin/products', '/admin/product/upload', '/admin/users', '/admin/orders', '/admin/score-config', '/admin/recipes', '/admin/boxes', '/admin/videos', '/admin/product-categories'];
  const sellerMenuPaths = ['/admin/dashboard', '/admin/products', '/admin/product/upload', '/admin/orders'];
  
  const menuPaths = userStore.isAdmin ? adminMenuPaths : sellerMenuPaths;
  
  // 找到最长匹配的菜单路径
  const activePath = menuPaths.find(path => {
    return route.path === path || route.path.startsWith(`${path}/`)
  }) || route.path;
  
  return activePath;
})

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  
  // 检查是否已登录且有权限
  if (!userStore.isLoggedIn || (!userStore.isAdmin && !userStore.isSeller)) {
    router.push('/login')
    return
  }
})

onBeforeUnmount(() => {
  // 清理可能的DOM引用和事件监听器
  // 防止组件卸载后仍进行DOM操作导致的错误
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--theme-backgroundColor);
}

/* 侧边栏 */
.admin-sidebar {
  background-color: var(--theme-secondaryBackgroundColor);
  color: var(--theme-textColor);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  border-right: 1px solid var(--theme-borderColor);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid var(--theme-borderColor);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-header h2 {
  color: var(--theme-textColor);
  font-size: 18px;
  margin: 0;
  transition: all 0.3s ease;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  margin-top: 0;
}

.sidebar-menu {
  background-color: transparent !important;
  border: none !important;
}

.sidebar-menu .el-menu-item {
  color: var(--theme-secondaryTextColor);
  height: 56px;
  line-height: 56px;
  margin: 0 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: transparent !important;
}

.sidebar-menu .el-menu-item:hover {
  background-color: var(--theme-hoverColor) !important;
  color: var(--theme-textColor);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: var(--theme-primaryColor) !important;
  color: #fff;
}

/* 修复侧边栏折叠状态下的样式 */
.admin-sidebar .el-menu-item {
  justify-content: flex-start;
}

.admin-sidebar.collapsed .el-menu-item {
  justify-content: center;
}

/* 主内容区 */
.admin-main {
  flex: 1;
  margin-left: 200px;
  transition: all 0.3s ease;
  min-height: 100vh;
}

/* 折叠状态 */
.admin-main.collapsed {
  margin-left: 64px;
}

/* 顶部导航 */
.admin-header {
  background-color: var(--theme-secondaryBackgroundColor);
  box-shadow: var(--theme-boxShadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 99;
  border-bottom: 1px solid var(--theme-borderColor);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 20px;
  color: var(--theme-secondaryTextColor);
}

.collapse-btn:hover {
  color: var(--theme-textColor);
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  color: var(--theme-textColor);
  transition: all 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 14px;
  color: var(--theme-secondaryTextColor);
}

/* 主题切换按钮 */
.theme-toggle {
  color: var(--theme-secondaryTextColor);
  font-size: 18px;
  transition: all 0.3s ease;
  border-radius: 50%;
  padding: 6px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  color: var(--theme-primaryColor);
  transform: scale(1.1);
  background-color: var(--theme-primaryColor);
  color: #fff;
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

.logout-btn {
  color: var(--theme-secondaryTextColor);
}

.logout-btn:hover {
  color: #f56c6c;
}

/* 内容区 */
.admin-content {
  padding: 20px;
  min-height: calc(100vh - 64px);
  background-color: var(--theme-backgroundColor);
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
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: var(--theme-scrollbarTrackColor);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: var(--theme-scrollbarThumbColor);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: var(--theme-scrollbarThumbColor);
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 64px;
  }
  
  .admin-main {
    margin-left: 64px;
  }
  
  .sidebar-header h2 {
    display: none;
  }
  
  .sidebar-menu .el-menu-item span {
    display: none;
  }
  
  .header-left h3 {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 0 10px;
  }
  
  .header-left h3 {
    display: none;
  }
  
  .header-right {
    gap: 10px;
  }
  
  .welcome {
    display: none;
  }
  
  .admin-content {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .admin-header {
    height: 56px;
  }
  
  .admin-content {
    min-height: calc(100vh - 56px);
  }
  
  .admin-header .el-button {
    padding: 0;
  }
}
</style>