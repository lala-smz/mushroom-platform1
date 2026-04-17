<template>
  <div class="mushroom-kitchen-user-works">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button
        type="primary"
        plain
        class="back-button"
        @click="goBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>{{ userInfo?.username || '用户作品集' }}</h1>
    </div>

    <!-- 用户信息卡片 -->
    <div
      v-if="userInfo"
      class="user-info-card"
    >
      <div class="user-avatar-container">
        <div class="user-avatar">
          {{ getUserAvatarText(userInfo.username) }}
        </div>
      </div>
      <div class="user-details">
        <h2 class="user-name">
          {{ userInfo.username }}
        </h2>
        <p class="user-bio">
          {{ userInfo.bio || '该用户暂无简介' }}
        </p>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userStats.worksCount }}</span>
            <span class="stat-label">作品</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStats.totalLikes }}</span>
            <span class="stat-label">获赞</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStats.followersCount }}</span>
            <span class="stat-label">粉丝</span>
          </div>
        </div>
        <div class="user-actions">
          <el-button 
            v-if="!isCurrentUser && !isFollowing" 
            type="primary" 
            :loading="isFollowingLoading"
            @click="toggleFollow"
          >
            关注
          </el-button>
          <el-button 
            v-else-if="!isCurrentUser && isFollowing" 
            type="primary" 
            plain
            :loading="isFollowingLoading"
            @click="toggleFollow"
          >
            已关注
          </el-button>
          <el-button 
            v-if="isCurrentUser" 
            type="primary" 
            @click="navigateToUpload"
          >
            上传作品
          </el-button>
        </div>
      </div>
      <div class="user-badges">
        <el-tag
          v-for="badge in userBadges"
          :key="badge.id"
          :type="badge.type"
          effect="dark"
        >
          {{ badge.name }}
        </el-tag>
      </div>
    </div>

    <!-- 作品和收藏标签页 -->
    <el-tabs
      v-model="activeTab"
      class="works-tabs"
      @tab-click="handleTabChange"
    >
      <el-tab-pane
        label="我的作品"
        name="works"
      >
        <!-- 作品筛选和排序 -->
        <div class="works-controls">
          <div class="filter-controls">
            <span class="filter-label">筛选：</span>
            <el-select
              v-model="filterType"
              placeholder="全部"
              @change="handleFilterChange"
            >
              <el-option
                v-for="option in mushroomTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
          <div class="sort-controls">
            <span class="sort-label">排序：</span>
            <el-select
              v-model="sortType"
              placeholder="最新"
              @change="handleSortChange"
            >
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane
        v-if="isCurrentUser"
        label="收藏菜肴"
        name="favorites"
      >
        <!-- 收藏筛选和排序 -->
        <div class="works-controls">
          <div class="filter-controls">
            <span class="filter-label">筛选：</span>
            <el-select
              v-model="favoritesFilterType"
              placeholder="全部"
              @change="handleFavoritesFilterChange"
            >
              <el-option
                v-for="option in mushroomTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
          <div class="sort-controls">
            <span class="sort-label">排序：</span>
            <el-select
              v-model="sortType"
              placeholder="最新"
              @change="handleSortChange"
            >
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane
        v-if="isCurrentUser && userStore.userInfo?.role === 'admin'"
        label="浏览作品"
        name="browse"
      >
        <!-- 浏览作品筛选和排序 -->
        <div class="works-controls">
          <div class="filter-controls">
            <span class="filter-label">筛选：</span>
            <el-select
              v-model="browseFilterType"
              placeholder="全部"
              @change="handleBrowseFilterChange"
            >
              <el-option
                v-for="option in mushroomTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
          <div class="sort-controls">
            <span class="sort-label">排序：</span>
            <el-select
              v-model="sortType"
              placeholder="最新"
              @change="handleSortChange"
            >
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 错误信息显示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      class="error-message"
      :closable="false"
    />
    
    <!-- 空状态显示 -->
    <el-empty
      v-if="!isLoading && getCurrentWorks().length === 0 && !errorMessage"
      description="暂无作品"
      class="empty-state"
    >
      <template #description>
        <p>{{ getEmptyDescription() }}</p>
      </template>
      <el-button
        v-if="isCurrentUser && activeTab === 'works'"
        type="primary"
        @click="navigateToUpload"
      >
        上传作品
      </el-button>
    </el-empty>

    <!-- 作品/收藏/浏览列表 -->
    <div class="works-list-section">
      <h2>{{ getSectionTitle() }}</h2>
      <WorksGrid
        :works="getCurrentWorks()"
        :loading="isLoading"
        :show-delete="isCurrentUser && activeTab === 'works'"
        :show-edit="isCurrentUser && activeTab === 'works'"
        :show-unfavorite="isCurrentUser && activeTab === 'favorites'"
        :show-admin-delete="isCurrentUser && activeTab === 'browse' && userStore.userInfo?.role === 'admin'"
        :current-user-id="userStore.userInfo?.id"
        @delete="handleDeleteWork"
        @edit="handleEditWork"
        @unfavorite="handleUnfavoriteWork"
      />
      
      <!-- 空状态 -->
      <div
        v-if="!isLoading && getCurrentWorks().length === 0"
        class="empty-works"
      >
        <el-empty :description="getEmptyDescription()" />
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="totalPages > 1"
      class="pagination-section"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalWorks"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑作品"
      width="600px"
      :before-close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item
          label="作品标题"
          prop="title"
        >
          <el-input
            v-model="editForm.title"
            placeholder="请输入作品标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item
          label="作品描述"
          prop="description"
        >
          <div class="description-edit-section">
            <div
              v-if="originalDescription"
              class="original-description"
            >
              <h4>原有描述：</h4>
              <p>{{ originalDescription }}</p>
              <hr>
            </div>
            <el-input
              v-model="editForm.description"
              type="textarea"
              placeholder="请输入作品描述"
              maxlength="500"
              show-word-limit
              rows="6"
            />
          </div>
        </el-form-item>
        
        <el-form-item
          label="评分"
          prop="rating"
        >
          <el-rate
            v-model="editForm.rating"
            :max="5"
            show-score
            text-color="#ff9900"
            score-template="{value}星"
          />
        </el-form-item>
        
        <el-form-item
          label="菌菇类型"
          prop="mushroomType"
        >
          <el-select
            v-model="editForm.mushroomType"
            placeholder="请选择菌菇类型"
          >
            <el-option
              label="香菇"
              value="shiitake"
            />
            <el-option
              label="平菇"
              value="oyster"
            />
            <el-option
              label="金针菇"
              value="enoki"
            />
            <el-option
              label="杏鲍菇"
              value="king"
            />
            <el-option
              label="松茸"
              value="松茸"
            />
            <el-option
              label="其他"
              value="other"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="作品图片">
          <div class="image-upload-section">
            <img 
              v-if="editForm.imageUrl" 
              :src="editForm.imageUrl" 
              alt="作品图片预览"
              class="image-preview"
            >
            <div
              v-else
              class="image-placeholder"
            >
              <el-icon class="placeholder-icon">
                <Picture />
              </el-icon>
              <span>未选择图片</span>
            </div>
            <el-upload
              class="image-uploader"
              :action="uploadUrl"
              :on-success="handleImageUploadSuccess"
              :on-error="handleImageUploadError"
              :before-upload="beforeImageUpload"
              :file-list="imageFileList"
              :limit="1"
              :auto-upload="false"
              :on-change="handleImageChange"
            >
              <el-button
                type="primary"
                size="small"
              >
                <el-icon><Upload /></el-icon>
                选择图片
              </el-button>
              <template #tip>
                <div class="upload-tip">
                  请上传 JPG、PNG 格式的图片，大小不超过 2MB
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleEditDialogClose">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="submitEdit"
          >
            保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/useUserStore'
import { useWorkStore } from '../stores/useWorkStore'
import { ArrowLeft, Picture, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorksGrid from '../components/MushroomKitchenWorksGrid.vue'
import { apiClient } from '../api/index.js'
import eventBus, { EventTypes } from '../utils/eventBus.js'
import { getUploadUrl, getImageUrl } from '../utils/imageUtils.js'

const workStore = useWorkStore()
const uploadUrl = getUploadUrl()
const editFormRef = ref(null)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 用户ID
const userId = computed(() => route.params.userId)

// 状态管理 - 为三个标签页分别管理数据
const userInfo = ref(null)
const userWorks = ref([]) // 我的作品数据
const favoriteWorks = ref([]) // 收藏菜肴数据
const browseWorks = ref([]) // 浏览作品数据（管理员专用）
const userStats = ref({
  worksCount: 0,
  totalLikes: 0,
  followersCount: 0
})
const userBadges = ref([])
const isLoading = ref(true)
const isCurrentUser = ref(false)
const isFollowing = ref(false)
const isFollowingLoading = ref(false)

// 标签页管理
const activeTab = ref('works')

// 调试日志
console.log('MushroomKitchenUserWorks 组件初始化:', {
  initialActiveTab: activeTab.value,
  initialIsCurrentUser: isCurrentUser.value,
  initialUserStore: userStore
})

// 筛选和排序
const filterType = ref('all')
const favoritesFilterType = ref('all')
const browseFilterType = ref('all')
const sortType = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)
const totalWorks = ref(0)
const totalPages = computed(() => Math.ceil(totalWorks.value / pageSize.value))
const errorMessage = ref('')
const needRefreshFavorites = ref(false)

// 菌菇类型选项
const mushroomTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'shiitake', label: '香菇' },
  { value: 'oyster', label: '平菇' },
  { value: 'enoki', label: '金针菇' },
  { value: 'king', label: '杏鲍菇' },
  { value: '松茸', label: '松茸' },
  { value: 'other', label: '其他' }
]

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'mostLiked', label: '最多点赞' },
  { value: 'highestRated', label: '最高评分' }
]

// 获取用户头像文本（用户名首字母）
const getUserAvatarText = (username) => {
  return username ? username.charAt(0).toUpperCase() : 'U'
}

// 获取当前标签页的作品数据
const getCurrentWorks = () => {
  switch (activeTab.value) {
    case 'works':
      return userWorks.value
    case 'favorites':
      return favoriteWorks.value
    case 'browse':
      return browseWorks.value
    default:
      return userWorks.value
  }
}

// 获取当前标签页的空状态描述
const getEmptyDescription = () => {
  switch (activeTab.value) {
    case 'works':
      return '该用户暂无作品'
    case 'favorites':
      return '暂无收藏的菜肴'
    case 'browse':
      return '暂无作品'
    default:
      return '暂无作品'
  }
}

// 获取当前标签页的标题
const getSectionTitle = () => {
  switch (activeTab.value) {
    case 'works':
      return (userInfo.value?.username || '用户') + '的作品'
    case 'favorites':
      return '收藏菜肴'
    case 'browse':
      return '全部作品'
    default:
      return '作品'
  }
}

// 处理返回
const goBack = () => {
  router.back()
}

// 导航到上传页面
const navigateToUpload = () => {
  router.push('/mushroom-kitchen/upload')
}

// 处理关注/取消关注
const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  if (isFollowingLoading.value) {
    return // 防止重复点击
  }
  
  isFollowingLoading.value = true
  
  try {
    if (!isFollowing.value) {
      // 关注用户
      await apiClient.user.follow({ followingId: userId.value })
      isFollowing.value = true
      ElMessage.success('关注成功')
    } else {
      // 取消关注用户
      await apiClient.user.unfollow({ followingId: userId.value })
      isFollowing.value = false
      ElMessage.success('取消关注成功')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    // 恢复原状态
    isFollowing.value = !isFollowing.value
    // 显示错误信息
    let errorMessage = '操作失败，请稍后重试'
    if (error.message.includes('不能关注自己')) {
      errorMessage = '不能关注自己'
    } else if (error.message.includes('已经关注过')) {
      errorMessage = '已经关注过该用户'
    } else if (error.message.includes('还没有关注')) {
      errorMessage = '还没有关注该用户'
    } else if (error.message.includes('被关注用户不存在')) {
      errorMessage = '被关注用户不存在'
    }
    ElMessage.error(errorMessage)
  } finally {
    isFollowingLoading.value = false
  }
}

// 处理标签页切换
const handleTabChange = async () => {
  console.log('标签页切换:', {
    newActiveTab: activeTab.value,
    isCurrentUser: isCurrentUser.value,
    needRefreshFavorites: needRefreshFavorites.value
  })
  currentPage.value = 1
  if (activeTab.value === 'works') {
    fetchUserWorks()
  } else if (activeTab.value === 'favorites') {
    // 检查是否需要刷新收藏列表
    if (needRefreshFavorites.value) {
      await fetchUserFavorites()
      needRefreshFavorites.value = false
    } else {
      fetchUserFavorites()
    }
  } else if (activeTab.value === 'browse') {
    fetchBrowseWorks()
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchUserWorks()
}

// 处理收藏筛选变化
const handleFavoritesFilterChange = () => {
  console.log('收藏筛选变化:', {
    favoritesFilterType: favoritesFilterType.value,
    activeTab: activeTab.value,
    isCurrentUser: isCurrentUser.value
  })
  currentPage.value = 1
  if (activeTab.value === 'favorites' && isCurrentUser.value) {
    fetchUserFavorites()
  }
}

// 处理浏览作品筛选变化
const handleBrowseFilterChange = () => {
  console.log('浏览作品筛选变化:', {
    browseFilterType: browseFilterType.value,
    activeTab: activeTab.value
  })
  currentPage.value = 1
  if (activeTab.value === 'browse') {
    fetchBrowseWorks()
  }
}

// 处理排序变化
const handleSortChange = () => {
  console.log('排序变化:', {
    sortType: sortType.value,
    activeTab: activeTab.value,
    isCurrentUser: isCurrentUser.value
  })
  currentPage.value = 1
  if (activeTab.value === 'works') {
    fetchUserWorks()
  } else if (activeTab.value === 'favorites' && isCurrentUser.value) {
    fetchUserFavorites()
  } else if (activeTab.value === 'browse') {
    fetchBrowseWorks()
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  if (activeTab.value === 'works') {
    fetchUserWorks()
  } else if (activeTab.value === 'favorites' && isCurrentUser.value) {
    fetchUserFavorites()
  } else if (activeTab.value === 'browse') {
    fetchBrowseWorks()
  }
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  if (activeTab.value === 'works') {
    fetchUserWorks()
  } else if (activeTab.value === 'favorites' && isCurrentUser.value) {
    fetchUserFavorites()
  } else if (activeTab.value === 'browse') {
    fetchBrowseWorks()
  }
}



// 获取用户信息
const fetchUserInfo = async () => {
  try {
    if (!userId.value) {
      throw new Error('无效的用户ID')
    }

    const numericUserId = parseInt(userId.value, 10)
    if (isNaN(numericUserId) || numericUserId <= 0) {
      throw new Error('无效的用户ID')
    }

    const response = await apiClient.user.getUserById(numericUserId)
    
    if (response.success && response.data) {
      userInfo.value = {
        id: response.data.id,
        username: response.data.username,
        bio: response.data.bio,
        createdAt: response.data.createdAt
      }
      
      userStats.value = {
        worksCount: response.data.worksCount || 0,
        totalLikes: response.data.totalLikes || 0,
        followersCount: response.data.followersCount || 0
      }
    } else {
      throw new Error('获取用户信息失败')
    }
    
    isCurrentUser.value = userStore.isLoggedIn && String(userStore.userInfo?.id) === String(userId.value)
    
    if (userStore.isLoggedIn && !isCurrentUser.value) {
      try {
        const followResponse = await apiClient.user.getFollowStatus(userId.value)
        isFollowing.value = followResponse.data.isFollowing
      } catch (error) {
        console.error('获取关注状态失败:', error)
        isFollowing.value = false
      }
    } else {
      isFollowing.value = false
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败，请稍后重试')
  }
}

// 获取用户作品
const fetchUserWorks = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  // 验证用户ID
  if (!userId.value) {
    throw new Error('无效的用户ID')
  }
  const numericUserId = parseInt(userId.value, 10)
  if (isNaN(numericUserId) || numericUserId <= 0) {
    throw new Error('无效的用户ID')
  }
  
  try {
    
    // 验证分页参数
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
    if (pageSize.value < 1 || pageSize.value > 100) {
      pageSize.value = 12
    }
    
    // 显示加载提示
    ElMessage({
      message: '正在加载作品...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    // 验证API调用方法是否存在
    console.log('验证API调用方法:', {
      apiClientExists: !!apiClient,
      workExists: !!apiClient.work,
      getUserWorksExists: typeof apiClient.work?.getUserWorks === 'function'
    })
    
    if (!apiClient || !apiClient.work || typeof apiClient.work.getUserWorks !== 'function') {
      throw new Error('API调用失败：getUserWorks方法不存在')
    }
    
    // 从后端API获取用户作品
    const response = await apiClient.work.getUserWorks(numericUserId, {
      page: currentPage.value,
      pageSize: pageSize.value,
      mushroomType: filterType.value
    })
    
    // 适配不同的响应格式
    let worksData = []
    let pagination = {}
    
    // 打印响应数据以便调试
    console.log('API响应数据:', response)
    
    // 统一的数据提取逻辑
    if (response.success || response.data || response.works) {
      // 确定数据源
      const dataSource = response.data || response
      
      // 确保worksData是数组
      if (Array.isArray(dataSource.works)) {
        worksData = dataSource.works
      } else if (dataSource.works) {
        // 处理非数组格式的works数据
        worksData = [dataSource.works]
      } else {
        worksData = []
      }
      
      // 获取分页信息
      pagination = dataSource.pagination || {}
    } else {
      // 其他格式或空数据
      throw new Error('获取用户作品失败：数据格式不正确')
    }
    
    // 打印处理后的数据以便调试
    console.log('处理后的数据:', {
      worksData: worksData.length,
      pagination
    })
    
    // 转换数据格式
    userWorks.value = worksData.map(work => ({
      id: work.id,
      title: work.title,
      imageUrl: getImageUrl(work.imageUrl),
      rating: work.rating,
      authorName: work.user?.username || userInfo.value?.username || '用户',
      authorId: work.userId,
      createdAt: work.createdAt,
      mushroomType: work.mushroomType,
      likes: work.likes || 0,
      comments: work.comments || 0,
      description: work.description || ''
    }))
    
    // 更新分页信息
    totalWorks.value = pagination.total || worksData.length || 0
    
    // 更新统计数据
    userStats.value.worksCount = totalWorks.value
    
    // 显示成功提示（仅在筛选或排序时）
    if (filterType.value !== 'all' || sortType.value !== 'latest') {
      ElMessage({
        message: '作品加载成功',
        type: 'success',
        duration: 2000
      })
    }
  } catch (error) {
    // 详细的错误日志
    console.error('获取用户作品失败:', error)
    console.error('错误类型:', typeof error)
    console.error('错误堆栈:', error.stack)
    console.error('API调用参数:', {
      userId: numericUserId,
      page: currentPage.value,
      pageSize: pageSize.value,
      mushroomType: filterType.value
    })
    
    errorMessage.value = '获取用户作品失败，请稍后重试'
    
    // 处理不同类型的错误
    let errorMsg = '获取用户作品失败，请稍后重试'
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，请检查网络连接'
    } else if (error.message.includes('无效的用户ID')) {
      errorMsg = '无效的用户ID'
    } else if (error.response?.status === 404) {
      errorMsg = '用户不存在'
    } else if (error.response?.status === 403) {
      errorMsg = '您没有权限查看此用户的作品'
    } else if (error.response?.status === 500) {
      errorMsg = '服务器内部错误，请稍后重试'
    } else if (error.message) {
      errorMsg = error.message
    }
    
    console.error('最终错误信息:', errorMsg)
    ElMessage.error(errorMsg)
    
    // 清空数据，避免显示旧数据
    userWorks.value = []
    totalWorks.value = 0
  } finally {
    isLoading.value = false
    // 关闭加载提示
    setTimeout(() => {
      ElMessage.closeAll()
    }, 300)
  }
}



// 获取浏览作品（管理员专用）
const fetchBrowseWorks = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
    if (pageSize.value < 1 || pageSize.value > 100) {
      pageSize.value = 12
    }
    
    ElMessage({
      message: '正在加载作品...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    // 验证API调用方法是否存在
    console.log('验证浏览作品API调用方法:', {
      apiClientExists: !!apiClient,
      workExists: !!apiClient.work,
      getAllWorksExists: typeof apiClient.work?.getAllWorks === 'function'
    })
    
    if (!apiClient || !apiClient.work || typeof apiClient.work.getAllWorks !== 'function') {
      throw new Error('API调用失败：getAllWorks方法不存在')
    }
    
    const response = await apiClient.work.getAllWorks({
      page: currentPage.value,
      pageSize: pageSize.value,
      mushroomType: browseFilterType.value
    })
    
    let worksData = []
    let pagination = {}
    
    console.log('浏览作品API响应数据:', response)
    
    // 统一的数据提取逻辑，支持多种响应格式
    if (response.success || response.data || response.works) {
      const dataSource = response.data || response
      
      if (Array.isArray(dataSource.works)) {
        worksData = dataSource.works
      } else if (dataSource.works) {
        worksData = [dataSource.works]
      } else if (Array.isArray(dataSource)) {
        worksData = dataSource
      } else {
        worksData = []
      }
      
      pagination = dataSource.pagination || {}
    } else {
      throw new Error('获取作品失败：数据格式不正确')
    }
    
    browseWorks.value = worksData.map(work => ({
      id: work.id,
      title: work.title,
      imageUrl: getImageUrl(work.imageUrl),
      rating: work.rating,
      authorName: work.user?.username || '用户',
      authorId: work.userId,
      createdAt: work.createdAt,
      mushroomType: work.mushroomType,
      likes: work.likes || 0,
      comments: work.comments || 0,
      description: work.description || ''
    }))
    
    totalWorks.value = pagination.total || worksData.length || 0
    
    if (browseFilterType.value !== 'all' || sortType.value !== 'latest') {
      ElMessage({
        message: '作品加载成功',
        type: 'success',
        duration: 2000
      })
    }
  } catch (error) {
    // 详细的错误日志
    console.error('获取浏览作品失败:', error)
    console.error('错误类型:', typeof error)
    console.error('错误堆栈:', error.stack)
    console.error('API调用参数:', {
      page: currentPage.value,
      pageSize: pageSize.value,
      mushroomType: browseFilterType.value
    })
    
    let errorMsg = '获取作品失败，请稍后重试'
    let isServerError = false
    
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，请检查网络连接'
    } else if (error.response?.status === 403) {
      errorMsg = '您没有权限查看所有作品'
    } else if (error.response?.status === 500 || error.message.includes('服务器内部错误')) {
      errorMsg = '服务器暂时繁忙，请稍后再试'
      isServerError = true
    } else if (error.message) {
      errorMsg = error.message
    }
    
    errorMessage.value = errorMsg
    ElMessage.error(errorMsg)
    
    // 仅在非服务器内部错误时清空数据
    if (!isServerError) {
      browseWorks.value = []
      totalWorks.value = 0
    }
  } finally {
    isLoading.value = false
    setTimeout(() => {
      ElMessage.closeAll()
    }, 300)
  }
}

// 处理编辑作品
const handleEditWork = (workId) => {
  // 查找要编辑的作品
  const workToEdit = userWorks.value.find(work => work.id === workId)
  if (workToEdit) {
    // 重置图片文件列表，清除上一个商品的照片
    imageFileList.value = []
    // 保存当前编辑的作品 ID
    currentEditWorkId.value = workId
    // 保存原始描述信息
    originalDescription.value = workToEdit.description || ''
    // 填充编辑表单
    editForm.title = workToEdit.title
    editForm.description = workToEdit.description || ''
    editForm.rating = workToEdit.rating
    editForm.mushroomType = workToEdit.mushroomType
    editForm.imageUrl = workToEdit.imageUrl
    // 打开编辑对话框
    showEditDialog.value = true
  }
}

// 编辑表单数据
const editForm = reactive({
  title: '',
  description: '',
  rating: 5,
  mushroomType: 'other',
  imageUrl: ''
})

// 编辑对话框状态
const showEditDialog = ref(false)
const currentEditWorkId = ref(null)
const originalDescription = ref('')

// 图片上传状态
const imageFileList = ref([])
const isUploading = ref(false)

// 编辑表单验证规则
const editRules = reactive({
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度必须在 2-100 个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入作品描述', trigger: 'blur' },
    { min: 50, max: 500, message: '描述长度必须在 50-500 个字符之间', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分必须在 1-5 星之间', trigger: 'change' }
  ],
  mushroomType: [
    { required: true, message: '请选择菌菇类型', trigger: 'change' }
  ]
})

// 提交编辑
const submitEdit = async () => {
  try {
    // 验证表单
    await editFormRef.value.validate()
    
    // 显示加载状态
    const loadingMessage = ElMessage({
      message: '更新中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    try {
        // 验证是否有编辑的作品 ID
        if (!currentEditWorkId.value) {
          throw new Error('缺少作品 ID')
        }
        
        // 获取当前用户的userId
        const userId = userStore.userInfo?.id
        
        // 验证userId
        if (!userId || isNaN(parseInt(userId, 10)) || parseInt(userId, 10) <= 0) {
          throw new Error('用户未登录或用户信息无效')
        }
        
        // 验证editForm中的必要字段
        if (!editForm.title || !editForm.description || !editForm.rating || !editForm.mushroomType) {
          throw new Error('缺少必要的作品信息')
        }
        
        // 构建提交数据
        const submitData = {
          id: currentEditWorkId.value,
          userId: userId,
          title: editForm.title,
          description: editForm.description,
          rating: editForm.rating,
          mushroomType: editForm.mushroomType
        }
        
        // 如果有选择新图片，先上传到/api/upload
        if (imageFileList.value.length > 0 && imageFileList.value[0].raw) {
          // 先上传图片
          const formData = new FormData()
          formData.append('files', imageFileList.value[0].raw)
          
          console.log('正在上传新图片...')
          const uploadResponse = await apiClient.upload(formData)
          
          if (uploadResponse.success && uploadResponse.data && uploadResponse.data.length > 0) {
            const filePath = uploadResponse.data[0].path || uploadResponse.data[0].url
            if (filePath) {
              submitData.image = filePath
              submitData.imageUrl = filePath
              console.log('图片上传成功，URL:', filePath)
            }
          }
        } else if (editForm.imageUrl && !imageFileList.value.length) {
          // 如果没有选择新图片但有原有图片URL
          submitData.image = editForm.imageUrl
          submitData.imageUrl = editForm.imageUrl
        }
        
        // 调用API更新作品
        console.log('开始调用API更新作品，数据:', submitData)
        const updateResult = await workStore.updateWork(currentEditWorkId.value, submitData)
        console.log('更新作品结果:', updateResult)
        
        // 验证更新结果
        if (!updateResult) {
          throw new Error('更新作品失败：未返回更新结果')
        }
        
        // 立即更新本地数据，确保封面图片立即更新
        const workIndex = userWorks.value.findIndex(work => work.id === currentEditWorkId.value)
        if (workIndex !== -1) {
          userWorks.value[workIndex] = {
            ...userWorks.value[workIndex],
            ...submitData
          }
          console.log('本地作品数据已更新')
        }
        
        // 延迟重新获取作品列表，确保数据一致性
        setTimeout(async () => {
          console.log('更新成功，准备重新获取作品列表')
          await fetchUserWorks()
          console.log('重新获取作品列表完成')
        }, 500)
        
        // 关闭对话框
        showEditDialog.value = false
        
        // 显示成功消息
        ElMessage.success('作品更新成功！')
        console.log('更新流程完成')
      } catch (error) {
        console.error('更新作品失败:', error)
        // 显示详细错误信息
        let errorMessage = '更新作品失败，请稍后重试'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        console.error('最终错误信息:', errorMessage)
        ElMessage.error(errorMessage)
      } finally {
        // 关闭加载提示
        try {
          ElMessage.closeAll()
        } catch (e) {
          console.error('关闭消息失败:', e)
        }
      }
  } catch (validateError) {
    console.error('表单验证失败:', validateError)
    // 表单验证失败会自动显示错误信息
  }
}

// 处理编辑对话框关闭
const handleEditDialogClose = () => {
  showEditDialog.value = false
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  // 重置当前编辑的作品 ID
  currentEditWorkId.value = null
  // 重置原始描述信息
  originalDescription.value = ''
  // 重置图片上传状态
  imageFileList.value = []
  isUploading.value = false
}

// 处理图片选择
const handleImageChange = (file) => {
  // 清除之前的文件
  imageFileList.value = [file]
  
  // 本地预览图片
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.imageUrl = e.target.result
    }
    reader.readAsDataURL(file.raw)
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isAllowedType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isAllowedType) {
    ElMessage.error('请上传 JPG、PNG、WebP、GIF 格式的图片！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  isUploading.value = true
  return true
}

// 处理图片上传成功
const handleImageUploadSuccess = (response, file, fileList) => {
  isUploading.value = false
  if (response.success && response.data?.url) {
    editForm.imageUrl = response.data.url
    ElMessage.success('图片上传成功！')
  } else {
    ElMessage.error('图片上传失败，请稍后重试')
  }
}

// 处理图片上传失败
const handleImageUploadError = (error, file, fileList) => {
  isUploading.value = false
  ElMessage.error('图片上传失败，请稍后重试')
  console.error('图片上传错误:', error)
}

// 手动上传图片
const uploadImage = async () => {
  if (imageFileList.value.length > 0) {
    const file = imageFileList.value[0].raw
    if (file) {
      try {
        isUploading.value = true
        const formData = new FormData()
        formData.append('file', file)
        
        console.log('准备上传图片:', file.name)
        const response = await apiClient.upload(formData)
        console.log('图片上传响应:', response)
        
        if (response.success && response.data?.url) {
          editForm.imageUrl = response.data.url
          console.log('图片上传成功，URL:', response.data.url)
          ElMessage.success('图片上传成功！')
        } else if (response.success === false && response.error) {
          console.error('图片上传失败:', response.error)
          ElMessage.error(`图片上传失败: ${response.error}`)
        } else {
          console.error('图片上传失败: 响应格式不正确', response)
          ElMessage.error('图片上传失败，请稍后重试')
        }
      } catch (error) {
        console.error('图片上传错误:', error)
        let errorMessage = '图片上传失败，请稍后重试'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = `图片上传失败: ${error.response.data.error}`
        } else if (error.message) {
          errorMessage = `图片上传失败: ${error.message}`
        }
        ElMessage.error(errorMessage)
      } finally {
        isUploading.value = false
      }
    }
  }
}

// 处理删除作品
const handleDeleteWork = async (workId) => {
  try {
    // 显示加载状态
    const loadingInstance = ElMessage({
      message: '删除中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    await workStore.deleteWork(workId)
    
    // 从所有列表中移除删除的作品（乐观更新）
    userWorks.value = userWorks.value.filter(work => work.id !== workId)
    browseWorks.value = browseWorks.value.filter(work => work.id !== workId)
    favoriteWorks.value = favoriteWorks.value.filter(work => work.id !== workId)
    
    // 更新作品总数
    totalWorks.value = Math.max(0, totalWorks.value - 1)
    
    // 更新用户统计数据（如果删除的是当前用户的作品）
    const deletedWork = [...userWorks.value, ...browseWorks.value].find(w => w.id === workId)
    if (!deletedWork || deletedWork.authorId === userStore.userInfo?.id) {
      userStats.value.worksCount = Math.max(0, userStats.value.worksCount - 1)
    }
    
    // 根据当前激活的标签页刷新数据
    if (activeTab.value === 'works') {
      setTimeout(async () => {
        await fetchUserWorks()
      }, 300)
    } else if (activeTab.value === 'browse') {
      setTimeout(async () => {
        await fetchBrowseWorks()
      }, 300)
    } else if (activeTab.value === 'favorites') {
      setTimeout(async () => {
        await fetchUserFavorites()
      }, 300)
    }
    
    // 关闭加载状态
    setTimeout(() => {
      loadingInstance.close()
    }, 300)
    
    // 显示成功消息
    ElMessage.success('作品删除成功')
  } catch (error) {
    console.error('删除作品失败:', error)
    // 显示错误信息给用户
    let errorMessage = '删除作品失败，请稍后重试'
    if (error.message.includes('用户未登录')) {
      errorMessage = '请先登录后再删除作品'
    } else if (error.message.includes('您没有权限')) {
      errorMessage = '您没有权限删除此作品'
    } else if (error.message.includes('作品不存在')) {
      errorMessage = '作品不存在，可能已被删除'
    } else if (error.message.includes('网络错误')) {
      errorMessage = '网络错误，请检查网络连接后重试'
    } else if (error.message.includes('请求超时')) {
      errorMessage = '请求超时，请稍后重试'
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
  }
}

// 获取用户收藏作品
const fetchUserFavorites = async () => {
  console.log('=== 开始获取收藏作品 ===')
  console.log('参数:', {
    userId: userId.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    favoritesFilterType: favoritesFilterType.value,
    sortType: sortType.value
  })
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 显示加载提示
    ElMessage({
      message: '加载收藏作品中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    // 验证用户ID
    if (!userId.value) {
      throw new Error('无效的用户ID')
    }
    
    const numericUserId = parseInt(userId.value, 10)
    if (isNaN(numericUserId) || numericUserId <= 0) {
      throw new Error('无效的用户ID')
    }
    
    // 验证分页参数
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
    if (pageSize.value < 1 || pageSize.value > 100) {
      pageSize.value = 12
    }
    
    console.log('调用 workStore.fetchUserFavorites，参数:', {
      numericUserId,
      page: currentPage.value,
      pageSize: pageSize.value,
      mushroomType: favoritesFilterType.value
    })
    
    // 从后端API获取用户收藏作品
    const result = await workStore.fetchUserFavorites(numericUserId, currentPage.value, pageSize.value, favoritesFilterType.value)
    
    console.log('收到 workStore.fetchUserFavorites 结果:', {
      worksCount: result.works?.length,
      pagination: result.pagination
    })
    
    // 转换数据格式，与用户作品保持一致
    favoriteWorks.value = (result.works || []).map(work => ({
      id: work.id,
      title: work.title,
      imageUrl: getImageUrl(work.imageUrl),
      rating: work.rating,
      authorName: work.user?.username || '用户',
      authorId: work.userId,
      createdAt: work.createdAt,
      mushroomType: work.mushroomType,
      likes: work.likes || 0,
      comments: work.comments || 0,
      description: work.description || ''
    }))
    totalWorks.value = result.pagination.total || favoriteWorks.value.length || 0
    
    console.log('更新后的状态:', {
      favoriteWorksCount: favoriteWorks.value.length,
      totalWorks: totalWorks.value
    })
    
    // 显示成功提示
    if (favoriteWorks.value.length > 0) {
      ElMessage({
        message: `成功加载 ${favoriteWorks.value.length} 个收藏作品`,
        type: 'success',
        duration: 2000
      })
    } else if (favoriteWorks.value.length === 0 && !errorMessage.value) {
      // 收藏列表为空时显示友好提示
      ElMessage({
        message: '暂无收藏的菜肴',
        type: 'info',
        duration: 2000
      })
    }
  } catch (error) {
    console.error('获取用户收藏作品失败:', error)
    
    // 处理不同类型的错误
    let errorMsg = '获取收藏作品失败，请稍后重试'
    let isServerError = false
    
    if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error')) {
      errorMsg = '网络错误，请检查网络连接'
    } else if (error.message.includes('无效的用户ID')) {
      errorMsg = '无效的用户ID'
    } else if (error.response?.status === 404) {
      errorMsg = '用户不存在'
    } else if (error.response?.status === 403) {
      errorMsg = '您没有权限查看此用户的收藏'
    } else if (error.response?.status === 500 || error.message.includes('服务器内部错误')) {
      // 服务器内部错误，显示更友好的提示
      errorMsg = '服务器暂时繁忙，请稍后再试'
      isServerError = true
    } else if (error.message) {
      errorMsg = error.message
    }
    
    // 显示错误信息
    ElMessage.error(errorMsg)
    
    // 仅在非服务器内部错误时清空数据
    // 服务器内部错误时保持本地数据，提升用户体验
    if (!isServerError) {
      favoriteWorks.value = []
      totalWorks.value = 0
    }
    
    // 服务器内部错误时，设置错误信息但不清空数据
    if (isServerError) {
      errorMessage.value = '服务器暂时繁忙，请稍后再试'
    } else {
      errorMessage.value = errorMsg
    }
  } finally {
    isLoading.value = false
    // 关闭加载提示
    setTimeout(() => {
      ElMessage.closeAll()
    }, 300)
    console.log('=== 结束获取收藏作品 ===')
  }
}

// 处理取消收藏
const handleUnfavoriteWork = async (workId) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要取消收藏这个作品吗？',
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 显示加载状态
    const loadingInstance = ElMessage({
      message: '取消收藏中...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    try {
      // 调用取消收藏方法
      await workStore.unfavoriteWork(workId)
      
      // 优化：使用乐观更新，先从本地列表中移除
      const originalLength = favoriteWorks.value.length
      favoriteWorks.value = favoriteWorks.value.filter(work => work.id !== workId)
      const newLength = favoriteWorks.value.length
      
      // 仅在实际移除了作品时更新计数
      if (newLength < originalLength) {
        totalWorks.value = Math.max(0, totalWorks.value - 1)
      }
      
      // 显示成功消息
      ElMessage.success('取消收藏成功！')
      
      // 刷新收藏列表以确保数据同步
      setTimeout(async () => {
        await fetchUserFavorites()
      }, 300)
    } catch (error) {
      // 处理"您还没有收藏过该作品"错误，视为成功
      if (error.message && error.message.includes('您还没有收藏过')) {
        console.log('作品未收藏，视为取消收藏成功:', workId)
        // 从本地列表中移除
        const originalLength = favoriteWorks.value.length
        favoriteWorks.value = favoriteWorks.value.filter(work => work.id !== workId)
        const newLength = favoriteWorks.value.length
        
        // 仅在实际移除了作品时更新计数
        if (newLength < originalLength) {
          totalWorks.value = Math.max(0, totalWorks.value - 1)
        }
        
        // 显示成功消息
        ElMessage.success('取消收藏成功！')
        
        // 刷新收藏列表
        setTimeout(async () => {
          await fetchUserFavorites()
        }, 300)
      } else {
        throw error
      }
    }
    
    // 关闭加载状态
    setTimeout(() => {
      loadingInstance.close()
    }, 300)
  } catch (error) {
    // 处理用户取消操作
    if (error === 'cancel') {
      return
    }
    
    console.error('取消收藏失败:', error)
    // 显示错误信息给用户
    let errorMessage = '取消收藏失败，请稍后重试'
    if (error.message.includes('用户未登录')) {
      errorMessage = '请先登录后再取消收藏'
    } else if (error.message.includes('您没有权限')) {
      errorMessage = '您没有权限取消收藏此作品'
    } else if (error.message.includes('作品不存在')) {
      errorMessage = '作品不存在，可能已被删除'
    } else if (error.message.includes('网络错误')) {
      errorMessage = '网络错误，请检查网络连接后重试'
    } else if (error.message.includes('请求超时')) {
      errorMessage = '请求超时，请稍后重试'
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
  }
}



// 处理收藏事件
const handleWorkFavorited = async (data) => {
  console.log('收到作品收藏事件:', data)
  // 无论是否是当前用户，只要在收藏标签页，就刷新收藏列表
  if (activeTab.value === 'favorites') {
    await fetchUserFavorites()
  } else {
    // 如果当前不在收藏标签页，标记需要刷新
    needRefreshFavorites.value = true
  }
}

// 处理取消收藏事件
const handleWorkUnfavorited = async (data) => {
  console.log('收到作品取消收藏事件:', data)
  // 无论是否是当前用户，只要在收藏标签页，就刷新收藏列表
  if (activeTab.value === 'favorites') {
    await fetchUserFavorites()
  } else {
    // 如果当前不在收藏标签页，标记需要刷新
    needRefreshFavorites.value = true
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchUserInfo()
  if (activeTab.value === 'works') {
    await fetchUserWorks()
  } else if (activeTab.value === 'favorites') {
    await fetchUserFavorites()
  } else if (activeTab.value === 'browse') {
    await fetchBrowseWorks()
  }
  
  // 如果是当前用户，标记收藏列表需要刷新，确保从其他页面收藏后能看到最新数据
  if (isCurrentUser.value) {
    needRefreshFavorites.value = true
    console.log('标记收藏列表需要刷新')
  }
  
  // 订阅收藏事件
  eventBus.on(EventTypes.WORK_FAVORITED, handleWorkFavorited)
  eventBus.on(EventTypes.WORK_UNFAVORITED, handleWorkUnfavorited)
  // 订阅作品上传事件
  eventBus.on(EventTypes.WORK_UPLOADED, handleWorkUploaded)
})

// 处理作品上传成功事件
const handleWorkUploaded = async (data) => {
  console.log('收到作品上传成功事件:', data)
  // 如果当前页面是用户自己的作品页面，刷新作品列表
  if (isCurrentUser.value && activeTab.value === 'works') {
    console.log('刷新用户作品列表')
    await fetchUserWorks()
  }
}

// 组件卸载时取消订阅
onUnmounted(() => {
  eventBus.off(EventTypes.WORK_FAVORITED, handleWorkFavorited)
  eventBus.off(EventTypes.WORK_UNFAVORITED, handleWorkUnfavorited)
  eventBus.off(EventTypes.WORK_UPLOADED, handleWorkUploaded)
})
</script>

<style scoped>
.mushroom-kitchen-user-works {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  min-width: 100px;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.user-info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-bottom: 60px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-name {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.user-bio {
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
}

.user-stats {
  display: flex;
  gap: 40px;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.user-actions {
  display: flex;
  gap: 15px;
}

.user-badges {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.error-message {
  margin-bottom: 30px;
}

.empty-state {
  margin: 60px 0;
}

.works-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-controls,
.sort-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-label,
.sort-label {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
}

.works-list-section {
  margin-bottom: 40px;
}

.works-list-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.empty-works {
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .mushroom-kitchen-user-works {
    padding: 20px 15px;
  }

  .page-header h1 {
    font-size: 1.6rem;
  }

  .user-info-card {
    flex-direction: column;
    padding: 30px 20px;
    align-items: center;
    text-align: center;
    gap: 30px;
  }

  .user-avatar {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .user-stats {
    justify-content: center;
    gap: 30px;
  }

  .user-actions {
    justify-content: center;
  }

  .user-badges {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .works-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
  }

  .filter-controls,
  .sort-controls {
    width: 100%;
  }

  /* 编辑对话框响应式样式 */
  .el-dialog {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  .image-preview {
    max-height: 200px;
  }

  .image-placeholder {
    height: 150px;
  }
}

/* 编辑表单样式 */
.edit-form {
  max-width: 100%;
}

.image-upload-section {
  margin-bottom: 20px;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  background-color: #fafafa;
}

.placeholder-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 10px;
}

.image-uploader {
  margin-top: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.image-uploader .el-upload {
  width: 100%;
}

.image-uploader .el-button {
  width: 100%;
}

.description-edit-section {
  width: 100%;
}

.original-description {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.original-description h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.original-description p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
}

.original-description hr {
  margin: 10px 0 0 0;
  border: none;
  border-top: 1px solid #e4e7ed;
}
</style>