<template>
  <div class="smart-match-results-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>🍄 智能食谱匹配结果</h1>
      <p class="subtitle">
        根据您的口味偏好和蘑菇种类，为您推荐最匹配的烹饪视频
      </p>
    </div>

    <!-- 加载状态 -->
    <el-skeleton
      v-if="recipeStore.loading"
      :rows="15"
      animated
    />

    <!-- 错误状态 -->
    <div
      v-else-if="recipeStore.error"
      class="error-state"
    >
      <el-alert
        :title="recipeStore.error"
        type="error"
        show-icon
        :closable="false"
      />
      <div class="error-actions">
        <el-button
          type="primary"
          @click="fetchSmartMatchResults"
        >
          重试
        </el-button>
        <el-button
          @click="goBack"
        >
          返回
        </el-button>
      </div>
    </div>

    <!-- 无结果状态 -->
    <div
      v-else-if="!recipeStore.smartMatchResults || recipeStore.smartMatchResults.length === 0"
      class="empty-state"
    >
      <el-empty
        description="暂无匹配的烹饪视频"
        image-size="200"
      >
        <div class="empty-actions">
          <el-button
            type="primary"
            @click="fetchSmartMatchResults"
          >
            重新匹配
          </el-button>
          <el-button
            @click="goToPreferenceSettings"
          >
            修改偏好设置
          </el-button>
        </div>
      </el-empty>
    </div>

    <div
      v-else
      class="match-results"
    >
      <!-- 蘑菇信息卡片 -->
      <div class="mushroom-info-card">
        <div class="mushroom-image">
          <img
            :src="recipeStore.currentMushroom?.imageUrl || '/images/placeholder-mushroom-300.svg'"
            :alt="recipeStore.currentMushroom?.name"
            class="mushroom-img"
          >
        </div>
        <div class="mushroom-details">
          <h2 class="mushroom-name">
            {{ recipeStore.currentMushroom?.name || '未知蘑菇' }}
          </h2>
          <p class="mushroom-description">
            {{ recipeStore.currentMushroom?.description || '暂无描述' }}
          </p>
          <div class="mushroom-attributes">
            <div class="attribute-item">
              <span class="attribute-label">种类：</span>
              <span class="attribute-value">{{ recipeStore.currentMushroom?.type || '未知' }}</span>
            </div>
            <div class="attribute-item">
              <span class="attribute-label">产期：</span>
              <span class="attribute-value">{{ recipeStore.currentMushroom?.season || '全年' }}</span>
            </div>
            <div class="attribute-item">
              <span class="attribute-label">特性：</span>
              <span class="attribute-value">{{ recipeStore.currentMushroom?.characteristics || '暂无' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐视频列表 -->
      <div class="video-recommendations">
        <h2 class="section-title">
          📺 为您推荐的烹饪视频
        </h2>
        <p class="section-description">
          根据您的口味偏好和蘑菇特性，我们精选了以下烹饪视频
        </p>
        
        <div class="video-grid">
          <div
            v-for="(video, index) in recipeStore.smartMatchResults"
            :key="video.id"
            class="video-card"
          >
            <!-- 视频缩略图 -->
            <div class="video-thumbnail">
              <img
                :src="video.thumbnailUrl"
                :alt="video.title"
                class="thumbnail-img"
              >
              <div class="video-duration">
                {{ formatDuration(video.duration) }}
              </div>
              <div
                class="video-play-btn"
                @click="playVideo(video)"
              >
                <i class="el-icon-video-camera" />
              </div>
            </div>

            <!-- 视频信息 -->
            <div class="video-info">
              <h3 class="video-title">
                {{ video.title }}
              </h3>
              
              <!-- 视频标签 -->
              <div class="video-tags">
                <span class="tag difficulty">{{ getDifficultyLabel(video.difficulty) }}</span>
                <span class="tag time">{{ video.cookingTime }}分钟</span>
                <span class="tag spiciness">{{ getSpicinessLabel(video.spiciness) }}</span>
              </div>
              
              <!-- 视频描述 -->
              <p class="video-description">
                {{ video.description }}
              </p>
              
              <!-- 食材标签 -->
              <div class="ingredient-tags">
                <span
                  v-for="ingredient in video.ingredients.slice(0, 3)"
                  :key="ingredient"
                  class="ingredient-tag"
                >
                  {{ ingredient }}
                </span>
                <span
                  v-if="video.ingredients.length > 3"
                  class="ingredient-tag more"
                >
                  +{{ video.ingredients.length - 3 }}种
                </span>
              </div>
              
              <!-- 用户反馈操作 -->
              <div class="video-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="playVideo(video)"
                >
                  <i class="el-icon-video-camera" /> 观看视频
                </el-button>
                <el-button
                  size="small"
                  :type="isFavorite(video.id) ? 'success' : 'default'"
                  @click="toggleFavorite(video.id)"
                >
                  <i :class="isFavorite(video.id) ? 'el-icon-star-on' : 'el-icon-star-off'" /> 
                  {{ isFavorite(video.id) ? '已收藏' : '收藏' }}
                </el-button>
                <el-rate
                  v-model="videoRatings[video.id]"
                  :max="5"
                  size="small"
                  show-score
                  @change="rateVideo(video.id, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          @click="fetchSmartMatchResults"
        >
          <i class="el-icon-refresh" /> 重新匹配
        </el-button>
        <el-button
          size="large"
          @click="goToPreferenceSettings"
        >
          <i class="el-icon-setting" /> 修改偏好
        </el-button>
        <el-button
          size="large"
          @click="goBack"
        >
          <i class="el-icon-back" /> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 视频播放对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="selectedVideo?.title"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <div class="video-player-container">
        <VideoPlayer
          v-if="dialogVideoData"
          :video="dialogVideoData"
          :auto-play="true"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">关闭</el-button>
          <el-button
            type="primary"
            @click="shareVideo(selectedVideo)"
          >
            分享视频
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog
      v-model="shareDialogVisible"
      title="分享烹饪视频"
      width="500px"
    >
      <div class="share-container">
        <div class="share-info">
          <h3>{{ selectedVideo?.title }}</h3>
          <p class="share-description">
            {{ selectedVideo?.description }}
          </p>
        </div>
        <div class="share-options">
          <h4>分享到：</h4>
          <div class="share-buttons">
            <el-button
              type="primary"
              :icon="'el-icon-chat-dot-round'"
              @click="shareTo('wechat')"
            >
              微信
            </el-button>
            <el-button
              type="success"
              :icon="'el-icon-s-finance'"
              @click="shareTo('weibo')"
            >
              微博
            </el-button>
            <el-button
              type="info"
              :icon="'el-icon-message'"
              @click="shareTo('qq')"
            >
              QQ
            </el-button>
            <el-button
              type="warning"
              :icon="'el-icon-document-copy'"
              @click="copyLink"
            >
              复制链接
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shareDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRecipeStore } from '../stores/useRecipeStore'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VideoPlayer from '../components/VideoPlayer.vue'

const recipeStore = useRecipeStore()
const router = useRouter()
const route = useRoute()

// 视频播放状态
const videoDialogVisible = ref(false)
const selectedVideo = ref(null)

// 视频数据转换为 VideoPlayer 组件格式
const dialogVideoData = computed(() => {
  if (!selectedVideo.value) return null
  return {
    id: selectedVideo.value.id,
    title: selectedVideo.value.title,
    description: selectedVideo.value.description,
    videoUrl: selectedVideo.value.videoUrl,
    thumbnailUrl: selectedVideo.value.thumbnailUrl,
    duration: selectedVideo.value.duration || 0,
    viewCount: 0,
    category: 'cooking'
  }
})

// 分享对话框状态
const shareDialogVisible = ref(false)

// 用户反馈数据
const videoRatings = reactive({})
const favoriteVideos = ref(new Set())

// 格式化视频时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取难度标签
const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || '未知'
}

// 获取辣度标签
const getSpicinessLabel = (spiciness) => {
  const labels = {
    none: '不辣',
    mild: '微辣',
    medium: '中辣',
    hot: '特辣',
    extreme: '变态辣'
  }
  return labels[spiciness] || '未知'
}

// 播放视频
const playVideo = (video) => {
  selectedVideo.value = video
  videoDialogVisible.value = true
  // 记录视频点击行为
  recipeStore.submitUserFeedback({
    videoId: video.id,
    action: 'click',
    timestamp: new Date().toISOString()
  })
}

// 切换收藏状态
const toggleFavorite = (videoId) => {
  if (favoriteVideos.value.has(videoId)) {
    favoriteVideos.value.delete(videoId)
    ElMessage.info('已取消收藏')
  } else {
    favoriteVideos.value.add(videoId)
    ElMessage.success('收藏成功！')
  }
  // 记录收藏行为
  recipeStore.submitUserFeedback({
    videoId: videoId,
    action: favoriteVideos.value.has(videoId) ? 'favorite' : 'unfavorite',
    timestamp: new Date().toISOString()
  })
}

// 检查是否已收藏
const isFavorite = (videoId) => {
  return favoriteVideos.value.has(videoId)
}

// 评分视频
const rateVideo = (videoId, score) => {
  videoRatings[videoId] = score
  ElMessage.success(`评分成功：${score}星`)
  // 记录评分行为
  recipeStore.submitUserFeedback({
    videoId: videoId,
    action: 'rate',
    score: score,
    timestamp: new Date().toISOString()
  })
}

// 分享视频
const shareVideo = (video) => {
  if (video) {
    selectedVideo.value = video
    shareDialogVisible.value = true
  }
}

// 分享到社交平台
const shareTo = (platform) => {
  ElMessage.success(`分享到${platform}成功！`)
  // 记录分享行为
  recipeStore.submitUserFeedback({
    videoId: selectedVideo.value?.id,
    action: 'share',
    platform: platform,
    timestamp: new Date().toISOString()
  })
  shareDialogVisible.value = false
}

// 复制链接
const copyLink = () => {
  const link = `${window.location.origin}/video/${selectedVideo.value?.id}`
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('链接复制成功！')
  }).catch(() => {
    ElMessage.error('链接复制失败，请手动复制')
  })
}

// 获取智能匹配结果
const fetchSmartMatchResults = async () => {
  try {
    // 从路由参数中获取 mushroomId 和 boxId
    const mushroomId = route.params.mushroomId || 1 // 默认值为 1
    const boxId = route.params.boxId || 1 // 默认值为 1
    
    await recipeStore.performSmartMatching(mushroomId, boxId)
  } catch (error) {
    console.error('获取智能匹配结果失败:', error)
    ElMessage.error('获取推荐视频失败，请重试')
  }
}

// 前往偏好设置页面
const goToPreferenceSettings = () => {
  router.push('/preference-settings')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 页面加载时获取智能匹配结果
onMounted(async () => {
  await fetchSmartMatchResults()
})
</script>

<style scoped>
/* 主容器样式 */
.smart-match-results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

/* 错误状态 */
.error-state {
  padding: 60px 0;
  text-align: center;
}

.error-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 空状态 */
.empty-state {
  padding: 80px 0;
  text-align: center;
}

.empty-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 匹配结果 */
.match-results {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 30px;
  overflow: hidden;
}

/* 蘑菇信息卡片 */
.mushroom-info-card {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 25px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mushroom-image {
  flex-shrink: 0;
  width: 300px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mushroom-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mushroom-img:hover {
  transform: scale(1.05);
}

.mushroom-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mushroom-name {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.mushroom-description {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.mushroom-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attribute-label {
  font-weight: 600;
  color: #333;
}

.attribute-value {
  color: #666;
}

/* 推荐视频列表 */
.video-recommendations {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.section-description {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0 0 30px 0;
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

/* 视频卡片 */
.video-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* 视频缩略图 */
.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .thumbnail-img {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #409eff;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}

.video-card:hover .video-play-btn {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-card:hover .video-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.2);
  background: rgba(255, 255, 255, 1);
}

/* 视频信息 */
.video-info {
  padding: 20px;
}

.video-title {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
  line-height: 1.4;
}

/* 视频标签 */
.video-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag.difficulty {
  background: #ecf5ff;
  color: #409eff;
}

.tag.time {
  background: #f0f9eb;
  color: #67c23a;
}

.tag.spiciness {
  background: #fef0f0;
  color: #f56c6c;
}

/* 视频描述 */
.video-description {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 食材标签 */
.ingredient-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ingredient-tag {
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
  border: 1px solid #e4e7ed;
}

.ingredient-tag.more {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

/* 视频操作 */
.video-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.video-actions .el-button {
  flex: 1;
  min-width: 100px;
}

.video-actions .el-rate {
  margin-left: auto;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons .el-button {
  min-width: 200px;
}

/* 视频播放器 */
.video-player-container {
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  position: relative;
  margin: 20px 0;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* 分享容器 */
.share-container {
  padding: 20px 0;
}

.share-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.share-info h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 10px 0;
}

.share-description {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.share-options h4 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 20px 0;
}

.share-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.share-buttons .el-button {
  flex: 1;
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .mushroom-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .mushroom-image {
    width: 100%;
    max-width: 400px;
  }
  
  .mushroom-attributes {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .smart-match-results-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .match-results {
    padding: 20px;
  }
  
  .video-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 100%;
    max-width: 300px;
  }
  
  .video-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .video-actions .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .video-actions .el-rate {
    margin-left: 0;
    margin-top: 10px;
    align-self: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .mushroom-name {
    font-size: 1.5rem;
  }
  
  .mushroom-image {
    height: 150px;
  }
  
  .video-thumbnail {
    height: 180px;
  }
}
</style>