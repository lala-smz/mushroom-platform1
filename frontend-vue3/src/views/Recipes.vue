<template>
  <div class="recipes-container">
    <div class="page-header">
      <h1>智能食谱推荐</h1>
      <p class="subtitle">
        基于您的口味偏好、饮食禁忌和烹饪能力，为您推荐专属食谱
      </p>
    </div>

    <!-- 食谱筛选 -->
    <div class="recipe-filters">
      <div class="filter-header">
        <h3 class="filter-title">
          筛选条件
        </h3>
      </div>
      <div class="filter-form">
        <div class="filter-groups">
          <div class="filter-group">
            <span class="filter-label">烹饪难度</span>
            <el-select
              v-model="filters.difficulty"
              placeholder="请选择难度"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in DIFFICULTY_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">菜系类型</span>
            <el-select
              v-model="filters.cuisineType"
              placeholder="请选择菜系"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in CUISINE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">餐点类型</span>
            <el-select
              v-model="filters.mealType"
              placeholder="请选择餐点"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in MEAL_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">口味</span>
            <el-select
              v-model="filters.flavorProfile"
              placeholder="请选择口味"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in FLAVOR_PROFILE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">辣度</span>
            <el-select
              v-model="filters.spiciness"
              placeholder="请选择辣度"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in SPICINESS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">烹饪方式</span>
            <el-select
              v-model="filters.cookingMethod"
              placeholder="请选择烹饪方式"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="option in COOKING_METHOD_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
        
        <div class="search-section">
          <div class="search-group">
            <span class="filter-label">搜索</span>
            <el-input
              v-model="filters.search"
              placeholder="搜索菜谱名称、描述或食材"
              class="search-input"
              prefix-icon="Search"
              clearable
              @keyup.enter="applyFilters"
            />
          </div>
          
          <div class="filter-actions">
            <el-button
              type="primary"
              class="filter-btn primary"
              :loading="recipeStore.loading"
              @click="applyFilters"
            >
              <el-icon><Search /></el-icon>
              筛选食谱
            </el-button>
            <el-button
              type="default"
              class="filter-btn reset"
              @click="resetFilters"
            >
              <el-icon><Refresh /></el-icon>
              重置筛选
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃的筛选标签 -->
    <div
      v-if="activeFilterTags.length > 0"
      class="active-filters"
    >
      <span class="filters-label">当前筛选:</span>
      <el-tag
        v-for="tag in activeFilterTags"
        :key="tag.key"
        closable
        class="filter-tag"
        @close="removeFilter(tag.key)"
      >
        {{ tag.label }}
      </el-tag>
      <el-button
        type="text"
        size="small"
        @click="resetFilters"
      >
        清除全部
      </el-button>
    </div>

    <!-- 视频搜索区域 -->
    <div class="video-search-section">
      <div class="video-search-header">
        <h3>🍳 烹饪视频搜索</h3>
        <p>搜索相关烹饪视频，学习更多美味做法</p>
      </div>
      <div class="video-search-form">
        <el-input
          v-model="videoSearchKeyword"
          placeholder="输入食材或菜谱名称搜索视频"
          class="video-search-input"
          style="width: 400px;"
          prefix-icon="Search"
        />
        <el-button
          type="primary"
          class="video-search-btn"
          :loading="isSearchingVideos"
          @click="searchVideos"
        >
          搜索视频
        </el-button>
      </div>

      <!-- 视频搜索结果 -->
      <div
        v-if="showVideoSearchResults"
        class="video-search-results"
      >
        <div class="results-header">
          <h4>搜索结果: {{ videoSearchKeyword }}</h4>
          <el-button
            type="text"
            @click="closeVideoSearchResults"
          >
            关闭
          </el-button>
        </div>
        <div class="video-results-grid">
          <div
            v-for="video in videoSearchResults"
            :key="video.id"
            class="video-result-card"
          >
            <div class="video-thumbnail">
              <img
                :src="video.thumbnail"
                :alt="video.title"
                class="thumbnail-image"
              >
              <div class="video-duration">
                {{ formatVideoDuration(video.duration) }}
              </div>
            </div>
            <div class="video-info">
              <h5 class="video-title">
                {{ video.title }}
              </h5>
              <p class="video-description">
                {{ video.description }}
              </p>
              <div class="video-meta">
                <span class="cuisine">{{ video.cuisine }}</span>
                <span class="difficulty">{{ video.difficulty }}</span>
                <span class="views">{{ video.viewCount }}次观看</span>
              </div>
            </div>
          </div>
          <div
            v-if="videoSearchResults.length === 0 && !isSearchingVideos"
            class="no-video-results"
          >
            <el-empty description="未找到相关视频" />
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化推荐区域 -->
    <div class="recommended-section">
      <div class="section-header">
        <h2>为您推荐</h2>
        <el-button
          type="text"
          @click="fetchRecommendedRecipes"
        >
          刷新推荐
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      
      <!-- 智能推荐食谱 -->
      <div
        v-if="recipeStore.recommendedRecipes.length > 0"
        class="recommended-content"
      >
        <div class="recommendation-type">
          <el-tag
            type="primary"
            effect="light"
          >
            智能推荐
          </el-tag>
          <p>基于您的口味偏好、饮食禁忌和烹饪能力</p>
        </div>
        <div class="recipes-grid recommended-grid">
          <div 
            v-for="recipe in recipeStore.recommendedRecipes" 
            :key="recipe.id" 
            class="recipe-card recommended-card"
            @click="navigateToRecipeDetail(recipe.id)"
          >
            <div class="recipe-image-container">
              <img
                :src="getImageUrl(recipe.image)"
                :alt="recipe.name"
                class="recipe-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <div
                v-if="recipe.videoUrl"
                class="video-indicator"
              >
                <el-icon><VideoCamera /></el-icon>
              </div>
              <div class="recommended-badge">
                <el-icon><StarFilled /></el-icon>
                推荐
              </div>
            </div>
            <div class="recipe-content">
              <h3 class="recipe-name">
                {{ recipe.name }}
              </h3>
              <div class="recipe-meta">
                <span
                  class="difficulty"
                  :class="recipe.difficulty"
                >{{ getDifficultyText(recipe.difficulty) }}</span>
                <span class="time">{{ recipe.prepTime + recipe.cookTime }}分钟</span>
                <span
                  v-if="recipe.cuisineType"
                  class="cuisine"
                >{{ getCuisineText(recipe.cuisineType) }}</span>
              </div>
              <p class="recipe-description">
                {{ recipe.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 所有食谱列表 -->
    <div class="all-recipes-section">
      <div class="section-header">
        <h2>所有食谱</h2>
        <span class="recipe-count">{{ recipeStore.total }} 个食谱</span>
      </div>

      <!-- 加载状态 -->
      <el-skeleton
        v-if="recipeStore.loading && recipeStore.recipes.length === 0"
        :rows="3"
        animated
      />

      <!-- 食谱网格 -->
      <div
        v-else
        class="recipes-grid"
      >
        <div 
          v-for="recipe in recipeStore.recipes" 
          :key="recipe.id" 
          class="recipe-card"
          @click="navigateToRecipeDetail(recipe.id)"
        >
          <div class="recipe-image-container">
            <img
              :src="getImageUrl(recipe.image)"
              :alt="recipe.name"
              class="recipe-image"
              @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
            >
            <div
              v-if="recipe.videoUrl"
              class="video-indicator"
            >
              <el-icon><VideoCamera /></el-icon>
            </div>
          </div>
          <div class="recipe-content">
            <h3 class="recipe-name">
              {{ recipe.name }}
            </h3>
            <div class="recipe-meta">
              <span
                class="difficulty"
                :class="recipe.difficulty"
              >{{ getDifficultyText(recipe.difficulty) }}</span>
              <span class="time">{{ recipe.prepTime + recipe.cookTime }}分钟</span>
              <span
                v-if="recipe.cuisineType"
                class="cuisine"
              >{{ getCuisineText(recipe.cuisineType) }}</span>
            </div>
            <p class="recipe-description">
              {{ recipe.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!recipeStore.loading && recipeStore.recipes.length === 0"
        class="empty-state"
      >
        <el-empty description="暂无食谱" />
      </div>

      <!-- 分页 -->
      <div
        v-if="recipeStore.total > recipeStore.pageSize"
        class="pagination"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="recipeStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/useRecipeStore'
import { Refresh, VideoCamera, StarFilled, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../utils/imageUtils'
import {
  DIFFICULTY_OPTIONS,
  CUISINE_OPTIONS,
  MEAL_TYPE_OPTIONS,
  FLAVOR_PROFILE_OPTIONS,
  SPICINESS_OPTIONS,
  COOKING_METHOD_OPTIONS,
  getDifficultyText,
  getCuisineText,
  getMealTypeText
} from '../utils/recipeOptions'

const router = useRouter()
const recipeStore = useRecipeStore()

// 筛选条件
const filters = reactive({
  difficulty: '',
  cuisineType: '',
  mealType: '',
  flavorProfile: '',
  spiciness: '',
  cookingMethod: '',
  search: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(12)

// 活跃的筛选标签
const activeFilterTags = computed(() => {
  const tags = []
  
  if (filters.difficulty) {
    const option = DIFFICULTY_OPTIONS.find(o => o.value === filters.difficulty)
    tags.push({ key: 'difficulty', label: `难度: ${option?.label || filters.difficulty}` })
  }
  
  if (filters.cuisineType) {
    const option = CUISINE_OPTIONS.find(o => o.value === filters.cuisineType)
    tags.push({ key: 'cuisineType', label: `菜系: ${option?.label || filters.cuisineType}` })
  }
  
  if (filters.mealType) {
    const option = MEAL_TYPE_OPTIONS.find(o => o.value === filters.mealType)
    tags.push({ key: 'mealType', label: `餐点: ${option?.label || filters.mealType}` })
  }
  
  if (filters.flavorProfile) {
    const option = FLAVOR_PROFILE_OPTIONS.find(o => o.value === filters.flavorProfile)
    tags.push({ key: 'flavorProfile', label: `口味: ${option?.label || filters.flavorProfile}` })
  }
  
  if (filters.spiciness) {
    const option = SPICINESS_OPTIONS.find(o => o.value === filters.spiciness)
    tags.push({ key: 'spiciness', label: `辣度: ${option?.label || filters.spiciness}` })
  }
  
  if (filters.cookingMethod) {
    const option = COOKING_METHOD_OPTIONS.find(o => o.value === filters.cookingMethod)
    tags.push({ key: 'cookingMethod', label: `烹饪方式: ${option?.label || filters.cookingMethod}` })
  }
  
  if (filters.search) {
    tags.push({ key: 'search', label: `搜索: ${filters.search}` })
  }
  
  return tags
})

// 视频搜索相关
const videoSearchKeyword = ref('')
const videoSearchResults = ref([])
const isSearchingVideos = ref(false)
const showVideoSearchResults = ref(false)

// 导航到食谱详情
const navigateToRecipeDetail = (recipeId) => {
  router.push(`/recipes/${recipeId}`)
}

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1
  const filterParams = {}
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      filterParams[key] = filters[key]
    }
  })
  
  filterParams.page = currentPage.value
  filterParams.limit = pageSize.value
  
  recipeStore.fetchRecipes(filterParams)
}

// 移除单个筛选条件
const removeFilter = (key) => {
  if (key === 'search') {
    filters.search = ''
  } else {
    filters[key] = ''
  }
  applyFilters()
}

// 重置筛选条件
const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  currentPage.value = 1
  recipeStore.fetchRecipes({ page: 1, limit: pageSize.value })
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  applyFilters()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  applyFilters()
}

// 获取推荐食谱
const fetchRecommendedRecipes = async () => {
  await recipeStore.fetchRecommendedRecipes()
}

// 搜索视频
const searchVideos = async () => {
  if (!videoSearchKeyword.value.trim()) {
    ElMessage.warning('请输入视频搜索关键词')
    return
  }

  try {
    isSearchingVideos.value = true
    showVideoSearchResults.value = true

    const mockResults = getMockVideoSearchResults(videoSearchKeyword.value)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    videoSearchResults.value = mockResults
  } catch (error) {
    console.error('视频搜索失败:', error)
    ElMessage.error('视频搜索失败，请稍后重试')
  } finally {
    isSearchingVideos.value = false
  }
}

// 模拟视频搜索结果
const getMockVideoSearchResults = (keyword) => {
  const baseVideos = [
    {
      id: 'video_1',
      title: `${keyword}的家常做法`,
      description: `教你如何使用${keyword}制作美味的家常菜，简单易学`,
      url: 'https://example-videos.com/mushroom-recipe-1.mp4',
      thumbnail: `https://placehold.co/300x200?text=${keyword}做法`,
      duration: 360,
      cuisine: '中式',
      difficulty: 'beginner',
      viewCount: 10000
    },
    {
      id: 'video_2',
      title: `${keyword}的高级烹饪技巧`,
      description: `掌握这些高级技巧，让你的${keyword}料理更上一层楼`,
      url: 'https://example-videos.com/mushroom-recipe-2.mp4',
      thumbnail: `https://placehold.co/300x200?text=${keyword}技巧`,
      duration: 480,
      cuisine: '西式',
      difficulty: 'advanced',
      viewCount: 8500
    },
    {
      id: 'video_3',
      title: `${keyword}的创意料理`,
      description: `用${keyword}制作创意料理，给家人朋友一个惊喜`,
      url: 'https://example-videos.com/mushroom-recipe-3.mp4',
      thumbnail: `https://placehold.co/300x200?text=${keyword}创意`,
      duration: 420,
      cuisine: '融合',
      difficulty: 'intermediate',
      viewCount: 9500
    }
  ]
  return baseVideos
}

// 关闭视频搜索结果
const closeVideoSearchResults = () => {
  showVideoSearchResults.value = false
}

// 格式化视频时长
const formatVideoDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchRecommendedRecipes()
  await recipeStore.fetchRecipes({ page: 1, limit: pageSize.value })
})
</script>

<style scoped>
.recipes-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 筛选栏 */
.recipe-filters {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.filter-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-select {
  width: 100%;
}

.search-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  max-width: 450px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.filter-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.filter-btn.primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filter-btn.reset:hover {
  border-color: #909399;
  color: #909399;
  transform: translateY(-2px);
}

/* 活跃筛选标签 */
.active-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filters-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-tag {
  margin: 0;
}

/* 活跃筛选标签 */
.active-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filters-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-tag {
  margin: 0;
}

/* 推荐食谱区域 */
.recommended-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.recipe-count {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 推荐内容样式 */
.recommended-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.recommendation-type {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.recommendation-type p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 推荐食谱网格 */
.recommended-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recommended-card {
  border: 1px solid #e8f5e8;
  transition: all 0.3s ease;
}

.recommended-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 推荐徽章 */
.recommended-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.recommended-badge .el-icon {
  font-size: 0.9rem;
}

/* 所有食谱 */
.all-recipes-section {
  margin-top: 40px;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.recipe-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.video-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #e74c3c;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.recipe-content {
  padding: 20px;
}

.recipe-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.recipe-card .difficulty {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-card .difficulty.beginner {
  background: #e8f5e8;
  color: #4caf50;
}

.recipe-card .difficulty.intermediate {
  background: #fff3e0;
  color: #ff9800;
}

.recipe-card .difficulty.advanced {
  background: #ffebee;
  color: #f44336;
}

.recipe-card .time {
  font-size: 0.85rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 5px;
}

.recipe-card .cuisine {
  font-size: 0.8rem;
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 10px;
}

.recipe-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 视频搜索区域 */
.video-search-section {
  margin: 30px 0;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.video-search-header {
  text-align: center;
  margin-bottom: 25px;
}

.video-search-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.video-search-header p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.video-search-form {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.video-search-input {
  min-width: 300px;
}

.video-search-btn {
  white-space: nowrap;
}

/* 视频搜索结果 */
.video-search-results {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  animation: fadeIn 0.5s ease-in-out;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h4 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 500;
}

.video-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.video-result-card {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.video-result-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.video-result-card:hover .thumbnail-image {
  transform: scale(1.1);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.video-result-card:hover .video-duration {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.video-info {
  padding: 15px;
}

.video-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.4;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.video-meta span {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.video-meta .cuisine {
  background: #e3f2fd;
  color: #1976d2;
}

.video-meta .difficulty {
  background: #fff3e0;
  color: #ff9800;
}

.video-meta .views {
  background: #f3e5f5;
  color: #7b1fa2;
}

.no-video-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: #95a5a6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .recipe-filters {
    padding: 15px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .search-input {
    max-width: none;
  }
  
  .filter-btn {
    width: 100%;
  }
  
  .video-search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .video-search-input {
    width: 100% !important;
    min-width: auto;
  }
  
  .video-search-btn {
    width: 100%;
  }
  
  .video-results-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .video-search-header h3 {
    font-size: 1.3rem;
  }
}
</style>