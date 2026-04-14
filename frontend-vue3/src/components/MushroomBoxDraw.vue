<template>
  <div class="mushroom-box-draw-container">
    <h1 class="title">
      时令菌菇盲盒抽取
    </h1>
    <p class="subtitle">
      抽取您的专属菌菇盲盒，开启美味之旅
    </p>

    <!-- 加载状态 -->
    <div
      v-if="isLoadingDrawInfo"
      class="loading-state"
    >
      <el-skeleton
        :rows="3"
        animated
      />
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="drawInfoError"
      class="error-state"
    >
      <el-alert
        :title="drawInfoError"
        type="error"
        show-icon
        :closable="false"
      />
      <div class="error-actions">
        <el-button
          type="primary"
          @click="fetchDrawInfo"
        >
          重试
        </el-button>
      </div>
    </div>

    <div
      v-else
      class="box-draw-section"
    >
      <!-- 盲盒展示区域 -->
      <div class="box-display">
        <div 
          class="mushroom-box"
          :class="{ 'draw-animation': isDrawing }"
          @click="startDraw"
        >
          <div class="box-top" />
          <div class="box-body">
            <div class="box-content">
              <div
                v-if="!drawResult"
                class="box-closed"
              >
                <el-icon class="box-icon">
                  <Box />
                </el-icon>
                <p>点击抽取</p>
              </div>
              <div
                v-else
                class="box-opened"
              >
                <div class="box-result-info">
                  <h3 class="box-name">
                    {{ drawResult.box?.name || '时令菌菇盲盒' }}
                  </h3>
                  <p class="box-description">
                    {{ drawResult.box?.description || '您获得了一个时令菌菇盲盒！' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制区域 -->
      <div class="control-section">
        <div class="draw-info">
          <div class="info-item">
            <span class="label">剩余次数:</span>
            <span class="value">{{ remainingDraws }}</span>
          </div>
          <div class="info-item">
            <span class="label">总抽取次数:</span>
            <span class="value">{{ totalDraws }}</span>
          </div>
        </div>

        <el-button 
          type="primary" 
          size="large" 
          class="draw-button"
          :disabled="isDrawing"
          @click="startDraw"
        >
          {{ isDrawing ? '抽取中...' : '开始抽取' }}
        </el-button>

        <!-- 结果展示 -->
        <div
          v-if="drawResult"
          class="result-section"
        >
          <h3>盲盒内容</h3>
          <div class="total-info">
            <el-tag
              type="success"
              size="large"
            >
              共获得 {{ getTotalItemCount() }} 个商品
            </el-tag>
          </div>
          <div class="box-items">
            <div 
              v-for="(item, index) in drawResult.drawItems || drawResult.items" 
              :key="index"
              class="box-item"
            >
              <div class="item-quantity-badge">
                {{ item.quantity || 1 }}个
              </div>
              <img 
                :src="normalizeImageUrl(item.image) || '/images/placeholder-mushroom-150.svg'" 
                :alt="item.mushroomName || '未知菌菇'" 
                class="item-image"
                @error="handleImageError"
              >
              <div class="item-info">
                <h4>{{ item.mushroomName || '未知菌菇' }}</h4>
                <p class="item-description">
                  {{ item.mushroom?.description || '暂无描述' }}
                </p>
                <div class="item-details">
                  <span class="item-type">{{ item.mushroomType || '常见菌菇' }}</span>
                  <span
                    v-if="item.probability"
                    class="item-probability"
                  >概率: {{ item.probability }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="result-actions">
            <el-button
              type="success"
              @click="saveResult"
            >
              保存结果
            </el-button>
            <el-button
              type="primary"
              @click="viewBoxDetail"
            >
              查看盲盒详情
            </el-button>
            <el-button @click="resetDraw">
              再抽一次
            </el-button>
            <el-button @click="viewHistory">
              查看记录
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频推荐区域 -->
    <div
      v-if="drawResult && (recommendedVideos.length > 0 || isPerformingSmartMatch)"
      class="video-recommendation-section"
    >
      <div class="video-recommendation-header">
        <h3>🍳 智能食谱推荐</h3>
        <p>基于您抽取的{{ drawResult.box?.name }}和口味偏好，为您精选了以下烹饪视频</p>
      </div>
      
      <!-- 智能匹配加载状态 -->
      <div
        v-if="isPerformingSmartMatch"
        class="video-loading"
      >
        <el-skeleton
          :rows="3"
          animated
        />
        <p class="loading-text">
          正在执行智能食谱匹配...
        </p>
      </div>
      
      <!-- 视频加载状态 -->
      <div
        v-else-if="isLoadingVideos"
        class="video-loading"
      >
        <el-skeleton
          :rows="3"
          animated
        />
      </div>
      
      <!-- 视频推荐列表 -->
      <div
        v-else-if="recommendedVideos.length > 0"
        class="video-list"
      >
        <div 
          v-for="(video, index) in recommendedVideos" 
          :key="video.id"
          class="video-card"
          :class="{ 'active': activeVideoIndex === index }"
        >
          <div class="video-thumbnail">
            <img 
              :src="video.thumbnailUrl || video.thumbnail" 
              :alt="video.title"
              @click="playVideo(video, index)"
            >
            <div class="video-duration">
              {{ formatVideoDuration(video.duration) }}
            </div>
          </div>
          <div class="video-info">
            <h4 @click="playVideo(video, index)">
              {{ video.title }}
            </h4>
            <p class="video-description">
              {{ video.description }}
            </p>
            <div class="video-meta">
              <span class="video-cuisine">{{ video.cuisine || '中式' }}</span>
              <span class="video-difficulty">{{ getDifficultyLabel(video.difficulty) }}</span>
              <span class="video-views">{{ video.viewCount || 0 }}次观看</span>
            </div>
            <div class="video-actions">
              <el-button 
                size="small" 
                :icon="video.isFavorited ? 'StarFilled' : 'Star'"
                :type="video.isFavorited ? 'warning' : 'default'"
                @click="favoriteVideo(video)"
              >
                {{ video.isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              <el-button 
                size="small" 
                icon="Share"
                @click="shareVideo(video)"
              >
                分享
              </el-button>
              <el-button 
                size="small" 
                :icon="video.isCached ? 'Download' : 'Download'"
                :type="video.isCached ? 'success' : 'default'"
                @click="cacheVideo(video)"
              >
                {{ video.isCached ? '已缓存' : '缓存' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无推荐视频状态 -->
      <div
        v-else
        class="empty-videos"
      >
        <el-empty description="暂无推荐视频" />
        <el-button
          type="primary"
          @click="performSmartMatching(drawResult)"
        >
          重新匹配
        </el-button>
      </div>
    </div>

    <!-- 视频播放器弹窗 -->
    <el-dialog
      v-model="showVideoPlayer"
      :title="activeVideo?.title || '烹饪视频'"
      width="80%"
      destroy-on-close
    >
      <VideoPlayer 
        v-if="activeVideo" 
        :video="activeVideo" 
        :auto-play="true" 
      />
      <div
        v-else
        class="empty-video"
      >
        <el-empty description="请选择一个视频播放" />
      </div>
    </el-dialog>

    <!-- 抽取记录 -->
    <div
      v-if="showHistory"
      class="history-section"
    >
      <div class="history-header">
        <h2>我的抽取记录</h2>
        <div class="history-actions">
          <el-button
            v-if="drawHistory.length > 0"
            type="danger"
            @click="showDeleteAllDialog = true"
          >
            删除全部
          </el-button>
          <el-button @click="showHistory = false">
            关闭
          </el-button>
        </div>
      </div>
      <div class="history-list">
        <div 
          v-for="record in drawHistory" 
          :key="record.id" 
          class="history-item"
        >
          <div class="history-mushroom">
            <img 
              :src="normalizeImageUrl(record.items?.[0]?.image || record.items?.[0]?.mushroom?.image) || '/images/placeholder-mushroom-150.svg'" 
              :alt="record.items?.[0]?.mushroomName || record.items?.[0]?.mushroom?.name || '未知菌菇'" 
              @error="handleImageError"
            >
            <div class="mushroom-info">
              <span class="mushroom-name">{{ record.boxName || '未知盲盒' }}</span>
              <div class="mushroom-varieties">
                {{ getItemsSummary(record.items) }}
              </div>
              <div
                v-if="getTotalItemsCount(record.items) > 0"
                class="item-count"
              >
                共 {{ getTotalItemsCount(record.items) }} 个商品
              </div>
            </div>
          </div>
          <div class="history-info">
            <span class="history-time">{{ formatDate(record.drawTime || record.createdAt) }}</span>
            <span class="history-status">已完成</span>
            <el-button
              type="danger"
              size="small"
              class="delete-button"
              @click="showDeleteDialog(record.id)"
            >
              删除
            </el-button>
          </div>
        </div>
        <div
          v-if="drawHistory.length === 0"
          class="empty-history"
        >
          <el-empty description="暂无抽取记录" />
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="删除确认"
      width="400px"
    >
      <p>确定要删除这条抽取记录吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteConfirm = false">取消</el-button>
          <el-button
            type="danger"
            :loading="isDeleting"
            @click="confirmDelete"
          >
            确定删除
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除全部确认对话框 -->
    <el-dialog
      v-model="showDeleteAllDialog"
      title="删除全部确认"
      width="400px"
    >
      <p>确定要删除所有抽取记录吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteAllDialog = false">取消</el-button>
          <el-button
            type="danger"
            :loading="isDeletingAll"
            @click="confirmDeleteAll"
          >
            确定删除全部
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 遮罩层 -->
    <div
      v-if="isDrawing"
      class="overlay"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Box, Star, StarFilled, Share, Download, VideoPlay, VideoPause, VideoCamera, FullScreen, Loading, WarningFilled } from '@element-plus/icons-vue'
import api from '../api/index.js'
import webSocketService from '../utils/websocket.js'
import eventBus, { EventTypes } from '../utils/eventBus.js'
import VideoPlayer from './VideoPlayer.vue'
import { useRecipeStore } from '../stores/useRecipeStore'
import { useRouter } from 'vue-router'

// 状态管理
const isDrawing = ref(false)
const drawResult = ref(null)
const remainingDraws = ref(5)
const totalDraws = ref(0)
const showHistory = ref(false)
const drawHistory = ref([])
const isLoadingDrawInfo = ref(false)
const drawInfoError = ref(null)

// 删除操作相关状态
const showDeleteConfirm = ref(false)
const showDeleteAllDialog = ref(false)
const isDeleting = ref(false)
const isDeletingAll = ref(false)
const currentDeleteId = ref(null)

// 路由管理
const router = useRouter()

// 智能匹配相关状态
const recipeStore = useRecipeStore()
const isPerformingSmartMatch = ref(false)
const showSmartMatchResults = ref(false)

// 视频相关状态
const recommendedVideos = ref([])
const isLoadingVideos = ref(false)
const showVideoPlayer = ref(false)
const activeVideo = ref(null)
const activeVideoIndex = ref(-1)
const favoriteVideos = ref([])
const cachedVideos = ref([])

// URL规范化函数
const normalizeImageUrl = (url) => {
  if (!url) return null;
  // 检查是否已包含协议
  if (!/^https?:\/\//i.test(url)) {
    // 如果是本地路径，保持不变
    if (url.startsWith('/')) {
      return url;
    }
    // 否则添加HTTPS协议
    return `https://${url}`;
  }
  return url;
};

// 图片加载错误处理函数
const handleImageError = (event) => {
  event.target.src = '/images/placeholder-mushroom-150.svg';
};

// 计算总商品数量
const getTotalItemCount = () => {
  if (!drawResult.value) return 0;
  
  // 适配新的API响应格式
  const items = drawResult.value.drawItems || drawResult.value.items || [];
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// 获取抽取历史记录的商品总数量
const getTotalItemsCount = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// 获取抽取历史记录的商品摘要
const getItemsSummary = (items) => {
  if (!items || items.length === 0) return '无商品';
  
  // 如果有数量信息，显示数量
  const hasQuantity = items.some(item => item.quantity > 1);
  if (hasQuantity) {
    return items.map(item => `${item.mushroomName || item.mushroom?.name || '未知菌菇'}(${item.quantity || 1}个)`).join(', ');
  }
  
  // 否则只显示名称
  return items.map(item => item.mushroomName || item.mushroom?.name || '未知菌菇').join(', ');
};

// 开始抽取
const startDraw = async () => {
  if (isDrawing.value) return // 移除次数限制
  
  try {
    isDrawing.value = true
    remainingDraws.value-- // 保留计数，但不限制
    totalDraws.value++
    
    // 触发盒子打开动画
    const boxElement = document.querySelector('.mushroom-box')
    if (boxElement) {
      boxElement.classList.add('box-opening')
    }
    
    // 模拟抽取动画延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 调用后端API进行盲盒抽取
    const response = await api.post('/boxes/draw')
    
    // 确保响应数据格式正确
    console.log('API响应:', response);
    if (response) {
      // 处理新的响应数据格式，包含整个盲盒和多个商品
      const responseData = response.data || response;
      drawResult.value = {
        box: responseData.box || {},
        drawItems: responseData.drawItems || [], // 新的API返回格式
        items: responseData.items || responseData.box?.items || [], // 保留旧格式兼容
        totalQuantity: responseData.totalQuantity || 0
      }
      
      // 显示成功消息，包含总数量信息
      ElMessage.success(responseData.message || response.message || `盲盒抽取成功！共获得${getTotalItemCount()}个商品`)
    } else {
      // 如果响应数据格式不正确，使用模拟数据
      drawResult.value = getMockDrawResult()
      ElMessage.success('盲盒抽取成功！')
    }
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新抽取次数
    updateDrawCounts()
    
    // 触发抽取完成事件，通知其他组件
    eventBus.emit(EventTypes.BOX_DRAW_COMPLETED, drawResult.value)
    eventBus.emit(EventTypes.BOX_DRAW_RESULT_UPDATED, drawResult.value)
    
    // 暂不执行智能食谱匹配，因为现在抽取的是整个盲盒
  } catch (error) {
    console.error('抽取失败:', error)
    // 根据不同的错误类型提供更友好的错误提示
    let errorMessage = '抽取失败，请稍后重试'
    
    if (error.response) {
      // 服务器返回了错误响应
      const { status, data } = error.response
      switch (status) {
        case 400:
          errorMessage = data.error || '请求参数错误，请稍后重试'
          break
        case 401:
          errorMessage = '登录已过期，请重新登录'
          // 可以考虑跳转到登录页
          break
        case 403:
          errorMessage = '权限不足，无法进行抽取操作'
          break
        case 404:
          errorMessage = '请求的资源不存在，请稍后重试'
          break
        case 500:
          errorMessage = '服务器内部错误，请稍后重试'
          break
        default:
          errorMessage = data.error || `请求失败(${status})，请稍后重试`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络异常，使用模拟数据进行抽取'
    } else {
      // 请求配置错误
      errorMessage = '请求配置错误，使用模拟数据进行抽取'
    }
    
    ElMessage.warning(errorMessage)
    // 使用模拟数据
    drawResult.value = getMockDrawResult()
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    // 移除盒子打开动画类
    const boxElement = document.querySelector('.mushroom-box')
    if (boxElement) {
      setTimeout(() => {
        boxElement.classList.remove('box-opening')
      }, 500)
    }
    isDrawing.value = false
  }
}

// 获取推荐视频
const fetchRecommendedVideos = async (mushroomName) => {
  if (!mushroomName) return
  
  try {
    isLoadingVideos.value = true
    
    // 尝试调用后端API获取推荐视频
    const response = await api.cookingVideo.recommendByMushroom(mushroomName, {
      limit: 5
    })
    
    if (response && response.data && Array.isArray(response.data)) {
      // 处理响应数据
      recommendedVideos.value = response.data.map(video => ({
        ...video,
        isFavorited: favoriteVideos.value.includes(video.id),
        isCached: cachedVideos.value.includes(video.id)
      }))
    } else if (response && Array.isArray(response)) {
      // 处理直接返回数组的情况
      recommendedVideos.value = response.map(video => ({
        ...video,
        isFavorited: favoriteVideos.value.includes(video.id),
        isCached: cachedVideos.value.includes(video.id)
      }))
    } else {
      // 使用模拟视频数据
      recommendedVideos.value = getMockRecommendedVideos(mushroomName)
    }
  } catch (error) {
    console.error('获取推荐视频失败:', error)
    // 使用模拟数据
    recommendedVideos.value = getMockRecommendedVideos(mushroomName)
  } finally {
    isLoadingVideos.value = false
  }
}

// 模拟推荐视频数据
const getMockRecommendedVideos = (mushroomName) => {
  const baseVideos = [
    {
      id: 'video_1',
      title: `${mushroomName}炖鸡的家常做法`,
      description: `教你如何使用${mushroomName}制作美味的炖鸡，营养丰富，味道鲜美`,
      url: 'https://example-videos.com/mushroom-chicken.mp4',
      thumbnail: `https://placehold.co/300x200?text=${mushroomName}炖鸡`,
      duration: 360,
      cuisine: '中式',
      difficulty: 'beginner',
      ingredients: [mushroomName, '鸡肉', '生姜', '料酒', '盐'],
      flavorProfile: ['鲜美', '清淡'],
      tags: [mushroomName, '鸡肉', '家常', '炖菜'],
      uploadDate: '2026-01-01',
      viewCount: 10000,
      rating: 4.8
    },
    {
      id: 'video_2',
      title: `${mushroomName}炒牛肉的技巧`,
      description: `掌握这几个技巧，轻松做出嫩滑美味的${mushroomName}炒牛肉`,
      url: 'https://example-videos.com/mushroom-beef.mp4',
      thumbnail: `https://placehold.co/300x200?text=${mushroomName}炒牛肉`,
      duration: 480,
      cuisine: '中式',
      difficulty: 'intermediate',
      ingredients: [mushroomName, '牛肉', '青椒', '生姜', '生抽', '淀粉'],
      flavorProfile: ['浓郁', '鲜美'],
      tags: [mushroomName, '牛肉', '炒菜', '技巧'],
      uploadDate: '2026-01-15',
      viewCount: 8500,
      rating: 4.7
    },
    {
      id: 'video_3',
      title: `${mushroomName}鸡蛋汤的营养做法`,
      description: `简单易做的${mushroomName}鸡蛋汤，营养丰富，适合全家食用`,
      url: 'https://example-videos.com/mushroom-egg-soup.mp4',
      thumbnail: `https://placehold.co/300x200?text=${mushroomName}鸡蛋汤`,
      duration: 300,
      cuisine: '中式',
      difficulty: 'beginner',
      ingredients: [mushroomName, '鸡蛋', '葱花', '盐', '香油'],
      flavorProfile: ['清淡', '鲜美'],
      tags: [mushroomName, '鸡蛋', '汤', '家常'],
      uploadDate: '2025-12-20',
      viewCount: 12000,
      rating: 4.9
    },
    {
      id: 'video_4',
      title: `${mushroomName}豆腐煲的制作方法`,
      description: `教你制作暖胃又营养的${mushroomName}豆腐煲`,
      url: 'https://example-videos.com/mushroom-tofu.mp4',
      thumbnail: `https://placehold.co/300x200?text=${mushroomName}豆腐煲`,
      duration: 420,
      cuisine: '中式',
      difficulty: 'intermediate',
      ingredients: [mushroomName, '豆腐', '猪肉末', '豆瓣酱', '生抽'],
      flavorProfile: ['香辣', '浓郁'],
      tags: [mushroomName, '豆腐', '煲', '香辣'],
      uploadDate: '2026-01-10',
      viewCount: 9500,
      rating: 4.6
    },
    {
      id: 'video_5',
      title: `黄油煎${mushroomName}的西式做法`,
      description: `简单美味的西式黄油煎${mushroomName}，香气四溢`,
      url: 'https://example-videos.com/butter-mushroom.mp4',
      thumbnail: `https://placehold.co/300x200?text=黄油煎${mushroomName}`,
      duration: 360,
      cuisine: '西式',
      difficulty: 'intermediate',
      ingredients: [mushroomName, '黄油', '大蒜', '黑胡椒', '盐'],
      flavorProfile: ['浓郁', '香鲜'],
      tags: [mushroomName, '黄油', '西式', '煎'],
      uploadDate: '2026-01-20',
      viewCount: 6500,
      rating: 4.7
    }
  ]
  
  return baseVideos.map(video => ({
    ...video,
    isFavorited: favoriteVideos.value.includes(video.id),
    isCached: cachedVideos.value.includes(video.id)
  }))
}

// 播放视频
const playVideo = (video, index) => {
  activeVideo.value = video
  activeVideoIndex.value = index
  showVideoPlayer.value = true
}

// 收藏视频
const favoriteVideo = (video) => {
  const videoId = video.id
  const index = recommendedVideos.value.findIndex(v => v.id === videoId)
  
  if (index !== -1) {
    const isFavorited = recommendedVideos.value[index].isFavorited
    recommendedVideos.value[index].isFavorited = !isFavorited
    
    if (!isFavorited) {
      favoriteVideos.value.push(videoId)
      ElMessage.success('视频收藏成功！')
      // 保存收藏状态到本地存储
      localStorage.setItem('favoriteVideos', JSON.stringify(favoriteVideos.value))
    } else {
      favoriteVideos.value = favoriteVideos.value.filter(id => id !== videoId)
      ElMessage.success('已取消收藏！')
      // 更新本地存储
      localStorage.setItem('favoriteVideos', JSON.stringify(favoriteVideos.value))
    }
  }
}

// 分享视频
const shareVideo = (video) => {
  if (navigator.share) {
    // 使用Web Share API
    navigator.share({
      title: video.title,
      text: video.description,
      url: window.location.href
    }).catch(err => {
      console.error('分享失败:', err)
      // 回退到复制链接
      copyVideoLink(video)
    })
  } else {
    // 回退到复制链接
    copyVideoLink(video)
  }
}

// 复制视频链接
const copyVideoLink = (video) => {
  const videoUrl = window.location.href + `?video=${video.id}`
  navigator.clipboard.writeText(videoUrl).then(() => {
    ElMessage.success('视频链接已复制到剪贴板！')
  }).catch(err => {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制')
  })
}

// 缓存视频
const cacheVideo = (video) => {
  const videoId = video.id
  const index = recommendedVideos.value.findIndex(v => v.id === videoId)
  
  if (index !== -1) {
    const isCached = recommendedVideos.value[index].isCached
    recommendedVideos.value[index].isCached = !isCached
    
    if (!isCached) {
      cachedVideos.value.push(videoId)
      ElMessage.success('视频缓存成功！')
      // 保存缓存状态到本地存储
      localStorage.setItem('cachedVideos', JSON.stringify(cachedVideos.value))
    } else {
      cachedVideos.value = cachedVideos.value.filter(id => id !== videoId)
      ElMessage.success('已取消缓存！')
      // 更新本地存储
      localStorage.setItem('cachedVideos', JSON.stringify(cachedVideos.value))
    }
  }
}

// 格式化视频时长
const formatVideoDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取难度标签
const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    beginner: '入门',
    intermediate: '中级',
    advanced: '高级'
  }
  return labels[difficulty] || '未知'
}

// 加载本地存储的视频状态
const loadVideoState = () => {
  try {
    const savedFavorites = localStorage.getItem('favoriteVideos')
    if (savedFavorites) {
      favoriteVideos.value = JSON.parse(savedFavorites)
    }
    
    const savedCached = localStorage.getItem('cachedVideos')
    if (savedCached) {
      cachedVideos.value = JSON.parse(savedCached)
    }
  } catch (error) {
    console.error('加载视频状态失败:', error)
  }
}

// 执行智能食谱匹配
const performSmartMatching = async (drawResult) => {
  isPerformingSmartMatch.value = true
  try {
    const mushroomId = drawResult.mushroom.id
    const boxId = drawResult.box?.id || 1
    
    // 调用智能匹配算法
    await recipeStore.performSmartMatching(mushroomId, boxId, {
      limit: 5,
      includeVideos: true
    })
    
    // 提取推荐视频
    recommendedVideos.value = recipeStore.videoRecommendations || []
    
    ElMessage.success('智能食谱匹配完成！')
    
    // 显示智能匹配结果
    showSmartMatchResults.value = true
  } catch (error) {
    console.error('智能匹配失败:', error)
    ElMessage.warning('智能匹配失败，使用默认推荐视频')
    
    // 使用模拟视频数据
    if (drawResult.mushroom?.name) {
      recommendedVideos.value = getMockRecommendedVideos(drawResult.mushroom.name)
    }
  } finally {
    isPerformingSmartMatch.value = false
  }
}

// 查看智能匹配结果详情
const viewSmartMatchResults = () => {
  // 跳转到智能匹配结果页面
  router.push('/smart-match-results')
}

// 更新抽取次数
const updateDrawCounts = async () => {
  try {
    const response = await api.get('/boxes/draw/info')
    if (response) {
      remainingDraws.value = response.remainingDraws || remainingDraws.value
      totalDraws.value = response.totalDraws || totalDraws.value
    }
  } catch (error) {
    console.error('更新抽取次数失败:', error)
  }
}

// 模拟抽取结果
const getMockDrawResult = () => {
  // 模拟盲盒数据
  const boxes = [
    {
      id: 1,
      name: '春季菌菇盲盒',
      description: '精选春季新鲜菌菇，包含多种美味菌菇',
      season: '春季',
      price: 99,
      image: 'https://placehold.co/300x300?text=春季盲盒'
    },
    {
      id: 2,
      name: '夏季菌菇盲盒',
      description: '精选夏季新鲜菌菇，清爽可口营养丰富',
      season: '夏季',
      price: 99,
      image: 'https://placehold.co/300x300?text=夏季盲盒'
    },
    {
      id: 3,
      name: '秋季菌菇盲盒',
      description: '精选秋季新鲜菌菇，丰收时节的美味',
      season: '秋季',
      price: 99,
      image: 'https://placehold.co/300x300?text=秋季盲盒'
    },
    {
      id: 4,
      name: '冬季菌菇盲盒',
      description: '精选冬季新鲜菌菇，温暖您的餐桌',
      season: '冬季',
      price: 99,
      image: 'https://placehold.co/300x300?text=冬季盲盒'
    }
  ]
  
  // 模拟菌菇数据
  const mushrooms = [
    {
      id: 1,
      name: '香菇',
      scientificName: 'Lentinula edodes',
      description: '香菇是一种常见的食用菌，具有浓郁的香味和丰富的营养价值。',
      type: '食用菌',
      difficulty: 'easy',
      image: 'https://placehold.co/150x150?text=香菇'
    },
    {
      id: 2,
      name: '平菇',
      scientificName: 'Pleurotus ostreatus',
      description: '平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',
      type: '食用菌',
      difficulty: 'easy',
      image: 'https://placehold.co/150x150?text=平菇'
    },
    {
      id: 3,
      name: '金针菇',
      scientificName: 'Flammulina velutipes',
      description: '金针菇是一种小型食用菌，口感脆嫩，适合凉拌或煮汤。',
      type: '食用菌',
      difficulty: 'medium',
      image: 'https://placehold.co/150x150?text=金针菇'
    },
    {
      id: 4,
      name: '杏鲍菇',
      scientificName: 'Pleurotus eryngii',
      description: '杏鲍菇是一种大型食用菌，肉质肥厚，味道鲜美。',
      type: '食用菌',
      difficulty: 'medium',
      image: 'https://placehold.co/150x150?text=杏鲍菇'
    },
    {
      id: 5,
      name: '松茸',
      scientificName: 'Tricholoma matsutake',
      description: '松茸是一种珍稀的野生食用菌，具有独特的香味和极高的营养价值。',
      type: '野生菌',
      difficulty: 'hard',
      image: 'https://placehold.co/150x150?text=松茸'
    }
  ]
  
  // 随机选择一个盲盒
  const randomBox = boxes[Math.floor(Math.random() * boxes.length)]
  
  // 为盲盒随机选择3-5个菌菇
  const itemCount = Math.floor(Math.random() * 3) + 3 // 3-5个
  const selectedMushrooms = []
  const usedIndices = new Set()
  
  while (selectedMushrooms.length < itemCount) {
    const randomIndex = Math.floor(Math.random() * mushrooms.length)
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      selectedMushrooms.push(mushrooms[randomIndex])
    }
  }
  
  // 计算每个菌菇的概率
  const baseProbability = 100 / selectedMushrooms.length
  const items = selectedMushrooms.map((mushroom, index) => ({
    mushroomId: mushroom.id,
    mushroom: mushroom,
    quantity: 1,
    probability: Math.round(baseProbability * 10) / 10
  }))
  
  // 调整最后一个菌菇的概率，确保总和为100%
  if (items.length > 0) {
    const totalProbability = items.slice(0, -1).reduce((sum, item) => sum + item.probability, 0)
    items[items.length - 1].probability = Math.round((100 - totalProbability) * 10) / 10
  }
  
  return {
    id: Date.now(),
    box: randomBox,
    items: items,
    createdAt: new Date().toISOString()
  }
}

// 保存抽取结果
const saveResult = async () => {
  if (!drawResult.value || !drawResult.value.box) return
  
  try {
    const response = await api.post('/boxes/draw/save', {
      boxId: drawResult.value.box.id
    })
    
    if (response) {
      ElMessage.success('结果保存成功！')
      // 保存成功后，可以更新相关状态或刷新数据
      // 例如，刷新抽取记录
      if (showHistory.value) {
        viewHistory()
      }
    } else {
      ElMessage.success('结果保存成功！')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  }
}

// 重置抽取
const resetDraw = () => {
  drawResult.value = null
}

// 查看抽取记录
const viewHistory = async () => {
  try {
    const response = await api.get('/boxes/draw/history')
    // 处理不同格式的响应数据
    if (response && Array.isArray(response)) {
      drawHistory.value = response
    } else if (response && response.data && Array.isArray(response.data)) {
      drawHistory.value = response.data
    } else {
      drawHistory.value = []
    }
    showHistory.value = true
  } catch (error) {
    console.error('获取记录失败:', error)
    ElMessage.error('获取记录失败，请稍后重试')
    // 即使失败也显示历史记录面板，只是为空
    drawHistory.value = []
    showHistory.value = true
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 查看盲盒详情
const viewBoxDetail = () => {
  if (drawResult.value && drawResult.value.box) {
    // 跳转到盲盒详情页面
    router.push(`/mushroom-boxes/${drawResult.value.box.id}`)
  } else {
    ElMessage.warning('无法获取盲盒信息')
  }
}

// 获取抽取信息
const fetchDrawInfo = async () => {
  isLoadingDrawInfo.value = true
  drawInfoError.value = null
  try {
    // 获取用户剩余抽取次数
    const response = await api.get('/boxes/draw/info')
    // 处理不同格式的响应数据
    if (response) {
      remainingDraws.value = response.remainingDraws || response.data?.remainingDraws || 999
      totalDraws.value = response.totalDraws || response.data?.totalDraws || 0
    }
  } catch (error) {
    console.error('获取抽取信息失败:', error)
    let errorMessage = '获取抽取信息失败，请稍后重试'
    if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    }
    drawInfoError.value = errorMessage
    // 即使失败也保持默认值，确保页面能够正常显示
  } finally {
    isLoadingDrawInfo.value = false
  }
}

// 组件挂载时获取初始数据
onMounted(async () => {
  // 加载视频状态
  loadVideoState()
  // 获取抽取信息
  await fetchDrawInfo()
})

// 显示删除确认对话框
const showDeleteDialog = (recordId) => {
  currentDeleteId.value = recordId
  showDeleteConfirm.value = true
}

// 确认删除单个记录
const confirmDelete = async () => {
  if (!currentDeleteId.value) return
  
  try {
    isDeleting.value = true
    
    // 调用后端API删除记录
    const response = await api.delete(`/boxes/draw/result/${currentDeleteId.value}`)
    
    if (response && response.success) {
      ElMessage.success('删除成功！')
      
      // 从本地列表中移除记录
      drawHistory.value = drawHistory.value.filter(record => record.id !== currentDeleteId.value)
    } else {
      ElMessage.error('删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('删除记录失败:', error)
    let errorMessage = '删除失败，请稍后重试'
    if (error.response) {
      errorMessage = error.response.data?.error || errorMessage
    }
    ElMessage.error(errorMessage)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
    currentDeleteId.value = null
  }
}

// 确认删除全部记录
const confirmDeleteAll = async () => {
  try {
    isDeletingAll.value = true
    
    // 调用后端API删除全部记录
    const response = await api.delete('/boxes/draw/result')
    
    if (response && response.success) {
      ElMessage.success('删除全部记录成功！')
      
      // 清空本地列表
      drawHistory.value = []
    } else {
      ElMessage.error('删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('删除全部记录失败:', error)
    let errorMessage = '删除失败，请稍后重试'
    if (error.response) {
      errorMessage = error.response.data?.error || errorMessage
    }
    ElMessage.error(errorMessage)
  } finally {
    isDeletingAll.value = false
    showDeleteAllDialog.value = false
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理WebSocket连接
  try {
    if (webSocketService.getConnectionStatus()) {
      webSocketService.disconnect()
    }
  } catch (error) {
    console.error('清理WebSocket连接失败:', error)
  }
  
  // 重置状态，避免内存泄漏
  isDrawing.value = false
  drawResult.value = null
  showHistory.value = false
  showDeleteConfirm.value = false
  showDeleteAllDialog.value = false
})
</script>

<style scoped>
/* 加载状态样式 */
.loading-state {
  padding: 40px 0;
}

/* 错误状态样式 */
.error-state {
  padding: 40px 0;
  text-align: center;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mushroom-box-draw-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.box-draw-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

/* 盲盒展示区域 */
.box-display {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  height: 400px;
}

.mushroom-box {
  width: 250px;
  height: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  transform-style: preserve-3d;
}

.mushroom-box:hover {
  transform: translateY(-10px);
}

/* 抽取动画 */
.draw-animation {
  animation: draw 1.5s ease-in-out;
}

@keyframes draw {
  0%, 100% {
    transform: translateY(0) rotateY(0deg);
  }
  25% {
    transform: translateY(-20px) rotateY(5deg);
  }
  50% {
    transform: translateY(-30px) rotateY(-5deg) rotateX(5deg);
  }
  75% {
    transform: translateY(-20px) rotateY(5deg);
  }
}

/* 盒子样式 */
.box-top {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px 10px 0 0;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.box-top::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 20px;
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.box-body {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 10px 10px;
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.box-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* 关闭状态 */
.box-closed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  transition: all 0.3s ease;
}

.box-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.box-closed p {
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

/* 盲盒结果信息 */
.box-result-info {
  text-align: center;
  color: white;
  animation: fadeIn 0.5s ease-in-out;
}

.box-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.box-description {
  font-size: 1rem;
  max-width: 80%;
  margin: 0 auto;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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

/* 盲盒内容列表 */
.box-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.total-info {
  margin-bottom: 15px;
  text-align: center;
}

.box-item {
  display: flex;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.box-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.item-quantity-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid white;
  z-index: 1;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.item-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.item-details {
  display: flex;
  gap: 15px;
}

.item-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.item-probability {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.result-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin-bottom: 15px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0% {
    transform: translateY(-20px);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

.result-name {
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  margin: 0;
}

/* 控制区域 */
.control-section {
  min-width: 300px;
  max-width: 400px;
  text-align: left;
}

.draw-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #6c757d;
  font-weight: 500;
}

.value {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.2rem;
}

.draw-button {
  width: 100%;
  height: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 结果展示区域 */
.result-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.result-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.result-card {
  display: flex;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  align-items: center;
}

.result-detail-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
}

.result-detail-info {
  flex: 1;
}

.result-detail-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.scientific-name {
  color: #6c757d;
  font-style: italic;
  margin: 0 0 10px 0;
}

.description {
  color: #495057;
  margin: 0 0 15px 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 10px;
}

.difficulty-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.difficulty-value {
  padding: 3px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.difficulty-value.easy {
  background: #e8f5e8;
  color: #4caf50;
}

.difficulty-value.medium {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty-value.hard {
  background: #ffebee;
  color: #f44336;
}

/* 结果操作按钮 */
.result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 抽取记录区域 */
.history-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 30px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.history-actions {
  display: flex;
  gap: 10px;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.9rem;
}

.delete-button {
  margin-left: 10px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateX(5px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.history-mushroom {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.history-mushroom img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.mushroom-info {
  flex: 1;
}

.mushroom-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  display: block;
  margin-bottom: 4px;
}

.mushroom-varieties {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.3;
}

.item-count {
  font-size: 12px;
  color: #409eff;
  margin-top: 5px;
  font-weight: bold;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.9rem;
}

.history-time {
  color: #6c757d;
}

.history-status {
  color: #4caf50;
  font-weight: 500;
}

.empty-history {
  text-align: center;
  padding: 40px 0;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 视频推荐区域 */
.video-recommendation-section {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.video-recommendation-header {
  text-align: center;
  margin-bottom: 30px;
}

.video-recommendation-header h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.video-recommendation-header p {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.video-loading {
  padding: 40px 0;
  text-align: center;
}

.loading-text {
  margin-top: 20px;
  color: #666;
  font-size: 1rem;
}

.empty-videos {
  padding: 40px 0;
  text-align: center;
}

.empty-videos .el-button {
  margin-top: 20px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.video-card.active {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-thumbnail img {
  transform: scale(1.05);
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
}

.video-info {
  padding: 15px;
}

.video-info h4 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.video-info h4:hover {
  color: #4CAF50;
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
  gap: 12px;
  margin-bottom: 15px;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.video-cuisine, .video-difficulty, .video-views {
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.video-cuisine {
  background: #e3f2fd;
  color: #1976d2;
}

.video-difficulty {
  background: #fff3e0;
  color: #ff9800;
}

.video-views {
  background: #f3e5f5;
  color: #7b1fa2;
}

.video-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.empty-video {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .box-draw-section {
    flex-direction: column;
  }
  
  .control-section {
    width: 100%;
    max-width: 100%;
  }
  
  .box-display {
    height: 300px;
  }
  
  .mushroom-box {
    width: 200px;
    height: 250px;
  }
  
  .result-card {
    flex-direction: column;
    text-align: center;
  }
  
  .history-item {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .history-info {
    justify-content: center;
  }
  
  .video-list {
    grid-template-columns: 1fr;
  }
  
  .video-recommendation-header h3 {
    font-size: 1.5rem;
  }
  
  .video-actions {
    flex-direction: column;
  }
  
  .video-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .mushroom-box {
    width: 180px;
    height: 220px;
  }
  
  .video-recommendation-section {
    padding: 15px;
  }
  
  .video-recommendation-header h3 {
    font-size: 1.3rem;
  }
}

/* 视频播放器弹窗样式 */
.el-dialog__body {
  padding: 20px;
}

@media (max-width: 768px) {
  .el-dialog {
    width: 95% !important;
    margin: 20px auto !important;
  }
  
  .el-dialog__body {
    padding: 10px;
  }
}

/* 增强的盲盒开启动画 */
.draw-animation {
  animation: draw 2s ease-in-out;
}

@keyframes draw {
  0% {
    transform: translateY(0) rotateY(0deg) scale(1);
  }
  20% {
    transform: translateY(-25px) rotateY(8deg) scale(1.05);
  }
  40% {
    transform: translateY(-35px) rotateY(-8deg) rotateX(8deg) scale(1.1);
  }
  60% {
    transform: translateY(-25px) rotateY(5deg) rotateX(-5deg) scale(1.05);
  }
  80% {
    transform: translateY(-15px) rotateY(-3deg) scale(1.02);
  }
  100% {
    transform: translateY(0) rotateY(0deg) scale(1);
  }
}

/* 盒子打开动画 */
.box-opening {
  animation: boxOpen 1s ease-in-out forwards;
}

@keyframes boxOpen {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 盒盖打开动画 */
.box-top {
  transition: transform 0.8s ease-in-out;
  transform-origin: top center;
}

.box-opening .box-top {
  transform: rotateX(-120deg) translateY(-20px);
}

/* 增强的打开状态动画 */
.box-opened {
  animation: open 0.8s ease-in-out;
}

@keyframes open {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(30px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 蘑菇出现动画 */
.result-image {
  animation: mushroomAppear 1s ease-in-out;
}

@keyframes mushroomAppear {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-50px);
  }
  30% {
    opacity: 0.7;
    transform: scale(1.3) translateY(10px);
  }
  60% {
    opacity: 0.9;
    transform: scale(0.9) translateY(-5px);
  }
  80% {
    opacity: 1;
    transform: scale(1.1) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 结果名称出现动画 */
.result-name {
  animation: nameAppear 1s ease-in-out 0.3s both;
}

@keyframes nameAppear {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 光芒效果 */
.box-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.box-opening .box-body::before {
  opacity: 1;
  animation: glow 1s ease-in-out;
}

@keyframes glow {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>