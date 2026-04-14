<template>
  <div class="mushroom-kitchen-container">
    <!-- 全局加载状态 -->
    <div
      v-if="isLoading"
      class="global-loading-overlay"
    >
      <div class="loading-content">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>
    </div>
    
    <HeroSection />

    <!-- 分类浏览 -->
    <CategoryFilter 
      v-model="currentCategory"
      :loading="isLoading"
      @filter="filterByCategory" 
    />

    <!-- 导航标签 -->
    <div class="nav-tabs">
      <div class="tabs-container">
        <el-tabs
          v-model="activeTab"
          type="card"
          class="kitchen-tabs"
          @tab-change="handleTabChangeWithData"
        >
          <el-tab-pane
            label="推荐作品"
            name="recommended"
          >
            <WorksGrid
              :works="recommendedWorks"
              :loading="tabLoading.recommended"
              @upload="navigateToUpload"
              @reset-filter="resetFilter"
            />
          </el-tab-pane>
          <el-tab-pane
            label="最新上传"
            name="latest"
          >
            <WorksGrid
              :works="latestWorks"
              :loading="tabLoading.latest"
              @upload="navigateToUpload"
              @reset-filter="resetFilter"
            />
          </el-tab-pane>
          <el-tab-pane
            label="关注动态"
            name="following"
          >
            <WorksGrid
              :works="followingWorks"
              :loading="tabLoading.following"
              @upload="navigateToUpload"
              @reset-filter="resetFilter"
            />
          </el-tab-pane>
        </el-tabs>
        <el-button
          v-if="userStore.isLoggedIn"
          type="primary"
          class="my-works-button"
          @click="navigateToMyWorks"
        >
          <el-icon><Collection /></el-icon>
          我的菜肴
        </el-button>
        <el-button
          v-else
          type="primary"
          plain
          class="my-works-button"
          @click="navigateToLogin"
        >
          <el-icon><User /></el-icon>
          登录查看
        </el-button>
      </div>
    </div>

    <!-- 排行榜入口 -->
    <RankingPreview :top-works="topWorks" />
  </div>
</template>

<script setup>
import { onMounted, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loading, Collection, User } from '@element-plus/icons-vue'
import { useTabManagement } from '../composables/useTabManagement'
import { useWorkData } from '../composables/useWorkData'
import { useUserStore } from '../stores/useUserStore'

// 动态导入组件，实现代码分割
const WorksGrid = defineAsyncComponent(() => import('../components/MushroomKitchenWorksGrid.vue'))
const HeroSection = defineAsyncComponent(() => import('../components/MushroomKitchen/HeroSection.vue'))
const RankingPreview = defineAsyncComponent(() => import('../components/MushroomKitchen/RankingPreview.vue'))
const CategoryFilter = defineAsyncComponent(() => import('../components/MushroomKitchen/CategoryFilter.vue'))

const router = useRouter()
const userStore = useUserStore()

// 当前选中的分类
const currentCategory = ref('all')

// 使用标签页管理组合式函数
const { activeTab, tabLoading, handleTabChange } = useTabManagement()

// 使用作品数据管理组合式函数
const {
  recommendedWorks,
  latestWorks,
  followingWorks,
  topWorks,
  isLoading,
  loadRecommendedWorks,
  loadLatestWorks,
  loadFollowingWorks,
  filterByCategory,
  initializeData
} = useWorkData()

// 处理标签页切换
const handleTabChangeWithData = async (tabName) => {
  await handleTabChange(tabName, async (name) => {
    switch (name) {
      case 'recommended':
        await loadRecommendedWorks()
        break
      case 'latest':
        await loadLatestWorks()
        break
      case 'following':
        await loadFollowingWorks()
        break
    }
  })
}

// 导航到上传页面
const navigateToUpload = () => {
  router.push('/mushroom-kitchen/upload')
}

// 导航到个人作品页面
const navigateToMyWorks = () => {
  if (userStore.isLoggedIn && userStore.user?.id) {
    router.push(`/mushroom-kitchen/user/${userStore.user.id}`)
  } else {
    navigateToLogin()
  }
}

// 导航到登录页面
const navigateToLogin = () => {
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

// 重置过滤条件
const resetFilter = async () => {
  // 重置为全部类型
  currentCategory.value = 'all'
  await filterByCategory('all')
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    await initializeData()
    console.log('作品数据加载完成')
  } catch (error) {
    console.error('获取作品数据失败:', error)
    // 添加调试信息
    if (error.message.includes('网络错误')) {
      console.warn('网络错误，请检查后端服务是否在3002端口运行')
      console.warn('请访问 http://localhost:3002/api/test/health 测试后端服务')
    }
  }
})
</script>

<style scoped>
.mushroom-kitchen-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.nav-tabs {
  margin-bottom: 40px;
}

.tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.kitchen-tabs {
  border-bottom: 1px solid #e4e7ed;
  flex: 1;
}

.my-works-button {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .tabs-container {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .my-works-button {
    width: 100%;
    justify-content: center;
  }
}

.kitchen-tabs .el-tabs__item {
  font-size: 1rem;
  padding: 15px 20px;
}

.kitchen-tabs .el-tabs__item.is-active {
  color: #4CAF50;
  font-weight: 600;
}

.kitchen-tabs .el-tabs__active-bar {
  background-color: #4CAF50;
}

@media (max-width: 768px) {
  .nav-tabs {
    margin-bottom: 30px;
  }

  .kitchen-tabs .el-tabs__item {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
}

/* 全局加载状态 */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #4CAF50;
  animation: rotate 1s linear infinite;
}

.loading-content p {
  font-size: 16px;
  color: #2c3e50;
  margin: 0;
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