<template>
  <div class="recipe-detail-page">
    <div class="recipe-detail-container">
      <div class="back-button-container">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          size="large"
          class="back-button"
          @click="goBack"
        >
          返回上一页
        </el-button>
      </div>
      
      <el-skeleton
        v-if="recipeStore.loading"
        :rows="8"
        animated
        class="skeleton-loader"
      />
      
      <div
        v-else-if="recipeStore.currentRecipe"
        class="recipe-detail-content"
      >
        <div class="hero-section">
          <div class="hero-image-wrapper">
            <img
              :src="getImageUrl(recipeStore.currentRecipe.image)"
              :alt="recipeStore.currentRecipe.name"
              class="hero-image"
              @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
            >
            <div class="hero-overlay">
              <div class="hero-info">
                <h1 class="recipe-title">
                  {{ recipeStore.currentRecipe.name }}
                </h1>
                <div class="recipe-tags">
                  <el-tag
                    type="success"
                    size="large"
                  >
                    {{ getDifficultyText(recipeStore.currentRecipe.difficulty) }}
                  </el-tag>
                  <el-tag
                    type="info"
                    size="large"
                  >
                    {{ recipeStore.currentRecipe.cuisineType || recipeStore.currentRecipe.cuisine || '家常菜' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-wrapper">
          <div class="main-content">
            <div class="action-bar">
              <div class="recipe-meta">
                <div class="meta-item">
                  <el-icon><Timer /></el-icon>
                  <span>准备 {{ recipeStore.currentRecipe.prepTime || 0 }} 分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>烹饪 {{ recipeStore.currentRecipe.cookTime || 0 }} 分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ recipeStore.currentRecipe.servings || 2 }} 人份</span>
                </div>
              </div>
              <div class="action-buttons">
                <el-button
                  :type="isFavorited ? 'warning' : 'default'"
                  :icon="isFavorited ? StarFilled : Star"
                  size="large"
                  @click="toggleFavorite"
                >
                  {{ isFavorited ? '已收藏' : '收藏' }}
                </el-button>
                <el-button
                  type="primary"
                  :icon="Share"
                  size="large"
                  @click="shareRecipe"
                >
                  分享
                </el-button>
              </div>
            </div>

            <div class="description-section">
              <h2 class="section-title">
                <el-icon><Document /></el-icon>
                食谱简介
              </h2>
              <p class="recipe-description">
                {{ recipeStore.currentRecipe.description || '暂无简介' }}
              </p>
            </div>

            <div
              v-if="recipeStore.currentRecipe.videoUrl"
              class="video-section"
            >
              <h2 class="section-title">
                <el-icon><VideoCamera /></el-icon>
                烹饪视频
              </h2>
              <div class="video-container">
                <VideoPlayer
                  :video="recipeVideoData"
                  :auto-play="false"
                />
              </div>
            </div>

            <el-tabs
              v-model="activeTab"
              class="recipe-tabs"
              type="border-card"
            >
              <el-tab-pane
                label="食材配料"
                name="ingredients"
              >
                <template #label>
                  <el-icon><Van /></el-icon>
                  食材配料
                </template>
                <div class="ingredients-section">
                  <div class="ingredients-grid">
                    <div 
                      v-for="(ingredient, index) in (recipeStore.currentRecipe.ingredients || [])" 
                      :key="ingredient.id || index" 
                      class="ingredient-card"
                    >
                      <div class="ingredient-icon">
                        <el-icon><CircleCheck /></el-icon>
                      </div>
                      <div class="ingredient-details">
                        <span class="ingredient-name">
                          {{ ingredient.mushroom?.name || ingredient.ingredientName || ingredient.name }}
                        </span>
                        <span class="ingredient-quantity">
                          {{ ingredient.quantity }} {{ ingredient.unit }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="(recipeStore.currentRecipe.ingredients || []).length === 0"
                    class="empty-state"
                  >
                    <el-empty description="暂无食材信息" />
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane
                label="烹饪步骤"
                name="steps"
              >
                <template #label>
                  <el-icon><List /></el-icon>
                  烹饪步骤
                </template>
                <div class="steps-section">
                  <div class="steps-list">
                    <div 
                      v-for="(step, index) in (recipeStore.currentRecipe.steps || [])" 
                      :key="step.id || index" 
                      class="step-card"
                    >
                      <div class="step-number-badge">
                        <span>{{ step.stepNumber || index + 1 }}</span>
                      </div>
                      <div class="step-content">
                        <div 
                          v-if="step.image || step.imageUrl"
                          class="step-image-container"
                        >
                          <img
                            :src="getImageUrl(step.image || step.imageUrl)"
                            :alt="`步骤 ${index + 1}`"
                            class="step-image"
                            @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
                          >
                        </div>
                        <p class="step-description">
                          {{ step.description }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="(recipeStore.currentRecipe.steps || []).length === 0"
                    class="empty-state"
                  >
                    <el-empty description="暂无步骤信息" />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="sidebar">
            <div class="related-section">
              <h3 class="sidebar-title">
                <el-icon><Connection /></el-icon>
                相关推荐
              </h3>
              <div class="related-list">
                <div 
                  v-for="recipe in relatedRecipes" 
                  :key="recipe.id" 
                  class="related-item"
                  @click="navigateToRecipeDetail(recipe.id)"
                >
                  <img
                    :src="getImageUrl(recipe.image)"
                    :alt="recipe.name"
                    class="related-image"
                    @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
                  >
                  <div class="related-info">
                    <h4 class="related-name">
                      {{ recipe.name }}
                    </h4>
                    <div class="related-meta">
                      <el-tag
                        size="small"
                        type="info"
                      >
                        {{ getDifficultyText(recipe.difficulty) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <div
                  v-if="relatedRecipes.length === 0"
                  class="empty-related"
                >
                  <el-empty
                    description="暂无相关推荐"
                    :image-size="80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!recipeStore.currentRecipe && !recipeStore.loading"
        class="error-section"
      >
        <el-empty description="食谱不存在" />
        <el-button
          type="primary"
          @click="goBack"
        >
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/useRecipeStore'
import { ElMessage } from 'element-plus'
import { 
  Star,
  StarFilled,
  Share,
  Timer,
  Clock,
  User,
  Document,
  VideoCamera,
  Van,
  List,
  CircleCheck,
  Connection,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../utils/imageUtils'
import VideoPlayer from '../components/VideoPlayer.vue'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()

const activeTab = ref('ingredients')
const relatedRecipes = ref([])
const isFavorited = ref(false)
const videoRef = ref(null)

// 食谱视频数据 - 转换为 VideoPlayer 组件需要的格式
const recipeVideoData = computed(() => {
  return {
    id: recipeStore.currentRecipe?.id || '',
    title: recipeStore.currentRecipe?.name || '食谱视频',
    description: recipeStore.currentRecipe?.description || '',
    videoUrl: recipeStore.currentRecipe?.videoUrl || '',
    thumbnailUrl: getImageUrl(recipeStore.currentRecipe?.image) || '',
    duration: 0,
    viewCount: 0,
    category: 'cooking'
  }
})

const getDifficultyText = (difficulty) => {
  const map = {
    'beginner': '简单',
    'intermediate': '中等',
    'advanced': '困难'
  }
  return map[difficulty] || '简单'
}

const fetchRecipeDetail = async (id) => {
  try {
    const recipe = await recipeStore.fetchRecipeById(id)
    if (recipe) {
      console.log('获取到的食谱详情:', recipe)
      console.log('食谱图片:', recipe.image)
      console.log('处理后的图片URL:', getImageUrl(recipe.image))
      console.log('食谱步骤:', recipe.steps)
      await fetchRelatedRecipes(recipe)
    }
  } catch (error) {
    console.error('获取食谱详情失败:', error)
    ElMessage.error('获取食谱详情失败，请稍后重试')
  }
}

const navigateToRecipeDetail = (recipeId) => {
  router.push(`/recipes/${recipeId}`)
}

const goBack = () => {
  router.back()
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecipeDetail(newId)
  }
})

const fetchRelatedRecipes = async (currentRecipe) => {
  try {
    await recipeStore.loadRecipes({ status: 'active', limit: 10 })
    relatedRecipes.value = recipeStore.recipes
      .filter(recipe => recipe.id !== currentRecipe.id)
      .slice(0, 4)
  } catch (error) {
    console.error('获取相关推荐失败:', error)
    relatedRecipes.value = []
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '食谱收藏成功！' : '已取消收藏！')
}

const shareRecipe = () => {
  ElMessage.info('分享功能开发中')
}

onMounted(() => {
  if (route.params.id) {
    fetchRecipeDetail(route.params.id)
  }
})
</script>

<style scoped>
.recipe-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
}

.recipe-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 40px 0;
}

.back-button-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px 40px 0;
}

.back-button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.skeleton-loader {
  padding: 40px;
}

.hero-section {
  position: relative;
  height: 400px;
  overflow: hidden;
  margin-bottom: -80px;
}

.hero-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  padding: 80px 40px 40px;
}

.hero-info {
  max-width: 1200px;
  margin: 0 auto;
}

.recipe-title {
  font-size: 2.5rem;
  color: white;
  margin: 0 0 16px 0;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.recipe-tags {
  display: flex;
  gap: 12px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
  padding: 0 40px;
  max-width: 1320px;
  margin: 0 auto;
}

.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  background: #fafbfc;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 20px;
}

.recipe-meta {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  font-size: 0.95rem;
}

.meta-item .el-icon {
  color: #3498db;
  font-size: 1.2rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.description-section {
  padding: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.section-title .el-icon {
  color: #3498db;
}

.recipe-description {
  color: #5a6c7d;
  font-size: 1.05rem;
  line-height: 1.8;
  margin: 0;
}

.video-section {
  padding: 0 30px 30px;
}

.video-container {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.recipe-video {
  width: 100%;
  max-height: 500px;
}

.recipe-tabs {
  margin: 0;
}

.recipe-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 30px;
  background: #f8f9fa;
}

.ingredients-section,
.steps-section {
  padding: 30px;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.ingredient-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.ingredient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.ingredient-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.ingredient-icon .el-icon {
  font-size: 1.5rem;
}

.ingredient-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.ingredient-name {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.ingredient-quantity {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #3498db;
  transition: all 0.3s ease;
}

.step-card:hover {
  background: #e9ecef;
}

.step-number-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-image-container {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.step-description {
  font-size: 1.05rem;
  color: #2c3e50;
  line-height: 1.8;
  margin: 0;
}

.empty-state {
  padding: 40px 0;
}

.sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.related-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.sidebar-title .el-icon {
  color: #3498db;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.related-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.related-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.related-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.related-name {
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 8px;
}

.empty-related {
  padding: 20px 0;
}

.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .back-button-container {
    padding: 15px 20px 0;
  }

  .back-button {
    width: 100%;
  }

  .hero-section {
    height: 300px;
    margin-bottom: -60px;
  }

  .hero-overlay {
    padding: 60px 20px 20px;
  }

  .recipe-title {
    font-size: 1.8rem;
  }

  .content-wrapper {
    padding: 0 20px;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons .el-button {
    flex: 1;
  }

  .ingredients-grid {
    grid-template-columns: 1fr;
  }
}
</style>
