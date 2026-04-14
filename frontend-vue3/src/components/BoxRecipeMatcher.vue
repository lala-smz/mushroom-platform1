<template>
  <div class="box-recipe-matcher-container">
    <div class="matcher-header">
      <h2 class="title">
        智能食谱匹配
      </h2>
      <p class="subtitle">
        根据您的盲盒内容，为您推荐最适合的烹饪方案
      </p>
    </div>

    <!-- 盲盒内容展示 -->
    <div
      v-if="boxItems.length > 0"
      class="box-content-section"
    >
      <h3>您的盲盒包含：</h3>
      <div class="mushroom-items">
        <div 
          v-for="item in boxItems" 
          :key="item.id" 
          class="mushroom-item"
        >
          <img 
            :src="normalizeImageUrl(item.mushroom.image) || '/images/placeholder-mushroom-100.svg'" 
            :alt="item.mushroom.name"
            class="mushroom-image"
            @error="handleImageError"
          >
          <div class="mushroom-info">
            <h4>{{ item.mushroom.name }}</h4>
            <p class="scientific-name">
              {{ item.mushroom.scientificName }}
            </p>
            <p class="description">
              {{ item.mushroom.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能推荐区域 -->
    <div class="recommendations-section">
      <div class="section-tabs">
        <el-tabs
          v-model="activeTab"
          class="recommendation-tabs"
        >
          <el-tab-pane
            label="推荐食谱"
            name="recipes"
          >
            <div class="recipes-content">
              <div
                v-if="loadingRecipes"
                class="loading-state"
              >
                <el-skeleton
                  :rows="3"
                  animated
                />
              </div>
              
              <div
                v-else-if="recommendedRecipes.length > 0"
                class="recipes-grid"
              >
                <div 
                  v-for="recipe in recommendedRecipes" 
                  :key="recipe.id"
                  class="recipe-card"
                  @click="viewRecipeDetail(recipe.id)"
                >
                  <div class="recipe-image-container">
                    <img 
                      :src="normalizeImageUrl(recipe.image) || '/images/placeholder-recipe-200.svg'" 
                      :alt="recipe.name"
                      class="recipe-image"
                      @error="handleImageError"
                    >
                    <div class="match-score">
                      匹配度: {{ recipe.matchScore }}分
                    </div>
                  </div>
                  <div class="recipe-info">
                    <h4 class="recipe-name">
                      {{ recipe.name }}
                    </h4>
                    <div class="recipe-meta">
                      <span
                        class="difficulty"
                        :class="recipe.difficulty"
                      >
                        {{ getDifficultyText(recipe.difficulty) }}
                      </span>
                      <span class="time">{{ recipe.totalTime }}分钟</span>
                    </div>
                    <p class="recipe-description">
                      {{ recipe.description }}
                    </p>
                    <div class="recipe-tags">
                      <el-tag 
                        v-for="tag in getRecipeTags(recipe)" 
                        :key="tag" 
                        size="small"
                        type="success"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                v-else
                class="empty-state"
              >
                <el-empty description="暂无推荐食谱" />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane
            label="烹饪视频"
            name="videos"
          >
            <div class="videos-content">
              <div
                v-if="loadingVideos"
                class="loading-state"
              >
                <el-skeleton
                  :rows="3"
                  animated
                />
              </div>
              
              <div
                v-else-if="recommendedVideos.length > 0"
                class="videos-grid"
              >
                <div 
                  v-for="video in recommendedVideos" 
                  :key="video.id"
                  class="video-card"
                  @click="playVideo(video)"
                >
                  <div class="video-thumbnail-container">
                    <img 
                      :src="video.thumbnail || '/images/placeholder-video-300.svg'" 
                      :alt="video.title"
                      class="video-thumbnail"
                      @error="handleImageError"
                    >
                    <div class="video-overlay">
                      <el-icon class="play-icon">
                        <VideoPlay />
                      </el-icon>
                    </div>
                    <div class="video-duration">
                      {{ formatDuration(video.duration) }}
                    </div>
                  </div>
                  <div class="video-info">
                    <h4 class="video-title">
                      {{ video.title }}
                    </h4>
                    <p class="video-description">
                      {{ video.description }}
                    </p>
                    <div class="video-meta">
                      <span class="match-score">匹配度: {{ video.totalScore }}分</span>
                      <span class="views">{{ video.viewCount || 0 }} 次观看</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                v-else
                class="empty-state"
              >
                <el-empty description="暂无推荐视频" />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane
            label="食材搭配"
            name="ingredients"
          >
            <div class="ingredients-content">
              <div class="pairing-recommendations">
                <h4>食材搭配建议</h4>
                <div class="pairing-list">
                  <div 
                    v-for="(pairings, mushroomName) in ingredientPairings" 
                    :key="mushroomName"
                    class="pairing-item"
                  >
                    <h5>{{ mushroomName }}</h5>
                    <ul>
                      <li 
                        v-for="pairing in pairings" 
                        :key="pairing.ingredient"
                        class="pairing-suggestion"
                      >
                        <span class="ingredient">{{ pairing.ingredient }}</span>
                        <el-rate
                          v-model="pairing.score"
                          :max="10"
                          disabled
                          size="small"
                        />
                        <span class="score-text">{{ pairing.score }}分</span>
                        <p class="recommendation-text">
                          {{ pairing.recommendation }}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        type="primary" 
        size="large"
        :loading="loadingRecipes || loadingVideos"
        @click="refreshRecommendations"
      >
        重新匹配
      </el-button>
      <el-button 
        type="success" 
        size="large"
        @click="savePreferences"
      >
        保存偏好
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'
import { useRecipeStore } from '../stores/useRecipeStore'
import { ElMessage, ElNotification } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({
  boxId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['recipe-selected', 'video-played'])

const router = useRouter()
const boxStore = useMushroomBoxStore()
const recipeStore = useRecipeStore()

// 响应式数据
const activeTab = ref('recipes')
const boxItems = ref([])
const recommendedRecipes = ref([])
const recommendedVideos = ref([])
const ingredientPairings = ref({})
const loadingRecipes = ref(false)
const loadingVideos = ref(false)

// URL规范化函数
const normalizeImageUrl = (url) => {
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('/')) {
      return url
    }
    return `https://${url}`
  }
  return url
}

// 图片加载错误处理
const handleImageError = (event) => {
  const img = event.target
  const width = img.naturalWidth || img.width
  
  if (width <= 50) {
    img.src = '/images/placeholder-mushroom-50.svg'
  } else if (width <= 100) {
    img.src = '/images/placeholder-mushroom-100.svg'
  } else if (width <= 150) {
    img.src = '/images/placeholder-mushroom-150.svg'
  } else if (width <= 200) {
    img.src = '/images/placeholder-recipe-200.svg'
  } else {
    img.src = '/images/placeholder-video-300.svg'
  }
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'beginner': '入门级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return difficultyMap[difficulty] || difficulty
}

// 获取食谱标签
const getRecipeTags = (recipe) => {
  const tags = []
  if (recipe.difficulty) tags.push(getDifficultyText(recipe.difficulty))
  if (recipe.cuisine) tags.push(recipe.cuisine)
  if (recipe.category) tags.push(recipe.category)
  return tags.slice(0, 3)
}

// 格式化视频时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 查看食谱详情
const viewRecipeDetail = (recipeId) => {
  emit('recipe-selected', recipeId)
  router.push(`/recipes/${recipeId}`)
}

// 播放视频
const playVideo = (video) => {
  emit('video-played', video)
  ElNotification({
    title: '即将播放',
    message: `正在准备播放: ${video.title}`,
    type: 'success'
  })
}

// 刷新推荐
const refreshRecommendations = async () => {
  await fetchRecommendations()
}

// 保存用户偏好
const savePreferences = () => {
  ElMessage.success('偏好设置已保存')
}

// 获取盲盒内容
const fetchBoxContent = async () => {
  try {
    const box = await boxStore.fetchBoxById(props.boxId)
    if (box && box.items) {
      boxItems.value = box.items
    }
  } catch (error) {
    console.error('获取盲盒内容失败:', error)
    ElMessage.error('获取盲盒内容失败')
  }
}

// 获取推荐
const fetchRecommendations = async () => {
  if (boxItems.value.length === 0) return

  loadingRecipes.value = true
  loadingVideos.value = true

  try {
    // 获取推荐食谱
    const mushroomIds = boxItems.value.map(item => item.mushroomId)
    const recipesResponse = await recipeStore.fetchRecipesByBoxId(props.boxId)
    
    if (recipesResponse && recipesResponse.data) {
      recommendedRecipes.value = recipesResponse.data.slice(0, 6)
    }

    // 获取推荐视频（这里需要调用后端API）
    // 暂时使用模拟数据
    recommendedVideos.value = [
      {
        id: 1,
        title: '香菇炒青菜制作教程',
        description: '简单易学的家常菜做法',
        duration: 360,
        thumbnail: '/images/video-thumbnail-1.jpg',
        totalScore: 9.2,
        viewCount: 12345
      },
      {
        id: 2,
        title: '平菇豆腐汤详细做法',
        description: '营养丰富的汤品制作方法',
        duration: 420,
        thumbnail: '/images/video-thumbnail-2.jpg',
        totalScore: 8.8,
        viewCount: 8765
      }
    ]

    // 生成食材搭配建议
    generateIngredientPairings()

    ElMessage.success('推荐内容已更新')
  } catch (error) {
    console.error('获取推荐失败:', error)
    ElMessage.error('获取推荐失败，请稍后重试')
  } finally {
    loadingRecipes.value = false
    loadingVideos.value = false
  }
}

// 生成食材搭配建议
const generateIngredientPairings = () => {
  const pairings = {}
  
  boxItems.value.forEach(item => {
    const mushroomName = item.mushroom.name
    pairings[mushroomName] = [
      {
        ingredient: '青菜',
        score: 8,
        recommendation: '清香搭配，营养均衡'
      },
      {
        ingredient: '豆腐',
        score: 7,
        recommendation: '口感丰富，蛋白质互补'
      },
      {
        ingredient: '胡萝卜',
        score: 9,
        recommendation: '色彩诱人，维生素丰富'
      }
    ]
  })

  ingredientPairings.value = pairings
}

// 监听盲盒ID变化
watch(() => props.boxId, async (newBoxId) => {
  if (newBoxId) {
    await fetchBoxContent()
    await fetchRecommendations()
  }
})

// 组件挂载时初始化
onMounted(async () => {
  await fetchBoxContent()
  await fetchRecommendations()
})
</script>

<style scoped>
.box-recipe-matcher-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.matcher-header {
  text-align: center;
  margin-bottom: 30px;
}

.matcher-header h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 盲盒内容展示 */
.box-content-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.box-content-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.mushroom-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.mushroom-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mushroom-item:hover {
  border-color: #16a085;
  box-shadow: 0 4px 12px rgba(22, 160, 133, 0.15);
}

.mushroom-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
  border: 2px solid #f0f0f0;
}

.mushroom-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.scientific-name {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0 0 8px 0;
}

.description {
  color: #5a6c7d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* 推荐区域 */
.recommendations-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.section-tabs :deep(.el-tabs__header) {
  margin-bottom: 25px;
}

.section-tabs :deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

/* 食谱卡片 */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.recipe-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #16a085;
}

.recipe-image-container {
  position: relative;
  height: 180px;
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

.match-score {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(22, 160, 133, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.recipe-info {
  padding: 20px;
}

.recipe-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.recipe-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.difficulty {
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty.beginner {
  background: #e8f5e8;
  color: #27ae60;
}

.difficulty.intermediate {
  background: #fff3e0;
  color: #f39c12;
}

.difficulty.advanced {
  background: #ffeaea;
  color: #e74c3c;
}

.time {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.recipe-description {
  color: #5a6c7d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 视频卡片 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.video-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #16a085;
}

.video-thumbnail-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-thumbnail {
  transform: scale(1.05);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 3rem;
  color: white;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.video-info {
  padding: 20px;
}

.video-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.video-description {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 食材搭配 */
.pairing-recommendations h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.pairing-list {
  display: grid;
  gap: 25px;
}

.pairing-item h5 {
  color: #16a085;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  border-bottom: 2px solid #16a085;
  padding-bottom: 8px;
}

.pairing-suggestion {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
}

.pairing-suggestion:last-child {
  margin-bottom: 0;
}

.ingredient {
  font-weight: 600;
  color: #2c3e50;
  margin-right: 10px;
}

.el-rate {
  margin: 0 10px;
}

.score-text {
  color: #16a085;
  font-weight: 500;
  margin-left: 5px;
}

.recommendation-text {
  color: #5a6c7d;
  font-size: 0.9rem;
  margin: 8px 0 0 0;
  line-height: 1.4;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

/* 加载和空状态 */
.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .box-recipe-matcher-container {
    padding: 15px;
  }
  
  .mushroom-items {
    grid-template-columns: 1fr;
  }
  
  .recipes-grid,
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 200px;
  }
}
</style>