<template>
  <div class="admin-dashboard">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-title">
          管理后台
        </h1>
        <p class="sidebar-subtitle">
          智能食谱应用
        </p>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409eff"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/admin/dashboard">
          <template #title>
            <i class="el-icon-s-home" />
            <span>仪表盘</span>
          </template>
        </el-menu-item>
        
        <el-sub-menu index="boxes">
          <template #title>
            <i class="el-icon-box" />
            <span>盲盒管理</span>
          </template>
          <el-menu-item index="/admin/boxes">
            盲盒列表
          </el-menu-item>
          <el-menu-item index="/admin/boxes/create">
            创建盲盒
          </el-menu-item>
          <el-menu-item index="/admin/boxes/items">
            盲盒内容管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="recipes">
          <template #title>
            <i class="el-icon-dish" />
            <span>菜谱管理</span>
          </template>
          <el-menu-item index="/admin/recipes">
            菜谱列表
          </el-menu-item>
          <el-menu-item index="/admin/recipes/create">
            创建菜谱
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="videos">
          <template #title>
            <i class="el-icon-video-camera" />
            <span>视频管理</span>
          </template>
          <el-menu-item index="/admin/videos">
            视频列表
          </el-menu-item>
          <el-menu-item index="/admin/videos/upload">
            上传视频
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="mushrooms">
          <template #title>
            <i class="el-icon-tree" />
            <span>蘑菇管理</span>
          </template>
          <el-menu-item index="/admin/mushrooms">
            蘑菇列表
          </el-menu-item>
          <el-menu-item index="/admin/mushrooms/create">
            创建蘑菇
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="users">
          <template #title>
            <i class="el-icon-user" />
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            用户列表
          </el-menu-item>
          <el-menu-item index="/admin/users/roles">
            角色管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/settings">
          <template #title>
            <i class="el-icon-setting" />
            <span>系统设置</span>
          </template>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button
          type="danger"
          size="small"
          @click="handleLogout"
        >
          <i class="el-icon-switch-button" /> 退出登录
        </el-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="nav-left">
          <el-button
            type="text"
            class="sidebar-toggle"
            @click="toggleSidebar"
          >
            <i class="el-icon-menu" />
          </el-button>
          <h2 class="page-title">
            {{ pageTitle }}
          </h2>
        </div>
        
        <div class="nav-right">
          <el-dropdown>
            <span class="user-info">
              <img
                src="/images/placeholder-avatar-40.svg"
                alt="用户头像"
                class="user-avatar"
              >
              <span class="user-name">管理员</span>
              <i class="el-icon-arrow-down" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <i class="el-icon-user" /> 个人中心
                </el-dropdown-item>
                <el-dropdown-item>
                  <i class="el-icon-setting" /> 账号设置
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  @click="handleLogout"
                >
                  <i class="el-icon-switch-button" /> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition
            name="fade"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  return route.path
})

const pageTitle = computed(() => {
  const path = route.path
  const titleMap = {
    '/admin/dashboard': '仪表盘',
    '/admin/boxes': '盲盒列表',
    '/admin/boxes/create': '创建盲盒',
    '/admin/boxes/items': '盲盒内容管理',
    '/admin/recipes': '菜谱列表',
    '/admin/recipes/create': '创建菜谱',
    '/admin/videos': '视频列表',
    '/admin/videos/upload': '上传视频',
    '/admin/mushrooms': '蘑菇列表',
    '/admin/mushrooms/create': '创建蘑菇',
    '/admin/users': '用户列表',
    '/admin/users/roles': '角色管理',
    '/admin/settings': '系统设置'
  }
  return titleMap[path] || '管理后台'
})

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleMenuSelect = (key) => {
  router.push(key)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 侧边栏 */
.sidebar {
  width: 250px;
  background-color: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid #002140;
}

.sidebar-title {
  font-size: 1.5rem;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.sidebar-subtitle {
  font-size: 0.9rem;
  color: #a0a0a0;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  margin: 20px 0;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #002140;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.top-nav {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  font-size: 18px;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: 500;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .sidebar-title {
    font-size: 1.2rem;
  }
  
  .page-title {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content {
    width: 100%;
  }
  
  .top-nav {
    padding: 0 15px;
  }
  
  .content-wrapper {
    padding: 15px;
  }
}
</style>