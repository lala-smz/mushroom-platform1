<template>
  <div class="mushroom-boxes-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>时令菌菇盲盒</h1>
      <p class="subtitle">
        精选当季新鲜菌菇品种，从菌包培育到收获的全程指导
      </p>
    </div>

    <!-- 筛选功能 -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          筛选条件
        </h3>
      </div>
      <div class="filter-form">
        <div class="filter-group">
          <span class="filter-label">季节</span>
          <el-select
            v-model="selectedSeason"
            placeholder="请选择季节"
            clearable
            class="filter-select"
          >
            <el-option
              label="春季"
              value="春季"
            />
            <el-option
              label="夏季"
              value="夏季"
            />
            <el-option
              label="秋季"
              value="秋季"
            />
            <el-option
              label="冬季"
              value="冬季"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">搜索</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索盲盒名称或描述"
            class="filter-input"
            prefix-icon="Search"
            clearable
          />
        </div>
        
        <div class="filter-actions">
          <el-button
            type="primary"
            class="filter-btn primary"
            @click="applyFilters"
          >
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button
            type="default"
            class="filter-btn reset"
            @click="resetFilters"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        
        <div class="sync-section">
          <el-button
            type="info"
            class="sync-btn"
            :loading="isSyncing"
            @click="syncData"
          >
            <el-icon><Refresh /></el-icon> {{ isSyncing ? '同步中...' : '同步数据' }}
          </el-button>
          <div
            v-if="lastSyncTime"
            class="sync-info"
          >
            上次同步: {{ formatSyncTime(lastSyncTime) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="boxStore.loading && boxStore.boxes.length === 0"
      class="loading-state"
    >
      <el-skeleton
        :rows="3"
        animated
      />
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="boxStore.error && boxStore.boxes.length === 0"
      class="error-state"
    >
      <el-alert
        :title="boxStore.error"
        type="error"
        show-icon
        :closable="false"
      />
      <div class="error-actions">
        <el-button
          type="primary"
          @click="retryFetchBoxes"
        >
          重试
        </el-button>
      </div>
    </div>

    <!-- 盲盒列表 -->
    <div
      v-else
      class="boxes-grid"
    >
      <div 
        v-for="box in filteredBoxes" 
        :key="box.id" 
        class="box-card"
        @click="navigateToBoxDetail(box.id)"
      >
        <div class="box-image-container">
          <el-carousel 
            v-if="box.images && box.images.length > 1"
            :interval="3000"
            arrow="hover"
            height="200px"
          >
            <el-carousel-item
              v-for="(image, index) in box.images"
              :key="index"
            >
              <img 
              :src="image || getPlaceholderImage('300')" 
              :alt="box.name" 
              class="box-image" 
              @error="(e) => e.target.src = getPlaceholderImage('300')"
            >
            </el-carousel-item>
          </el-carousel>
          <img 
            v-else
            :src="(box.images && box.images[0]) || box.image || getPlaceholderImage('300')" 
            :alt="box.name" 
            class="box-image" 
            @error="(e) => e.target.src = getPlaceholderImage('300')"
          >
          <div class="season-tag">
            {{ box.season }}季
          </div>
        </div>
        <div class="box-content">
          <h3 class="box-name">
            {{ box.name }}
          </h3>
          <p class="box-description">
            {{ box.description }}
          </p>
          <div class="box-price">
            <span class="price">¥{{ Number(box.price || 0).toFixed(2) }}</span>
          </div>
          <div class="box-items-preview">
            <div 
              v-for="item in box.items.slice(0, 3)" 
              :key="item.id" 
              class="item-preview"
            >
              <img 
                :src="item.image || item.mushroom?.image || '/mushroom-platform/images/placeholder-mushroom-50.svg'" 
                :alt="item.mushroomName || item.mushroom?.name || '菌菇'" 
                @error="(e) => e.target.src = '/mushroom-platform/images/placeholder-mushroom-50.svg'"
              >
              <span>{{ item.mushroomName || item.mushroom?.name || '菌菇' }}</span>
            </div>
            <div
              v-if="box.items.length > 3"
              class="more-items"
            >
              +{{ box.items.length - 3 }}
            </div>
          </div>
          <el-button
            type="primary"
            class="order-btn"
            @click.stop="navigateToBoxDetail(box.id)"
          >
            查看详情
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!boxStore.loading && boxStore.boxes.length === 0"
      class="empty-state"
    >
      <el-empty description="暂无可用的菌菇盲盒" />
    </div>

    <!-- 抽取结果展示区域 -->
    <div
      v-if="showDrawResult && drawResult"
      class="draw-result-section"
    >
      <div class="result-container">
        <div class="result-header">
          <h2>🎉 抽取结果</h2>
          <el-button
            type="text"
            @click="closeDrawResult"
          >
            关闭
          </el-button>
        </div>
        <div class="result-content">
          <div class="result-image">
            <img 
              :src="drawResult.mushroom?.image || '/mushroom-platform/images/placeholder-mushroom-150.svg'" 
              :alt="drawResult.mushroom?.name || '未知菌菇'" 
              @error="(e) => e.target.src = '/mushroom-platform/images/placeholder-mushroom-150.svg'"
            >
          </div>
          <div class="result-info">
            <h3 class="result-name">
              {{ drawResult.mushroom?.name || '未知菌菇' }}
            </h3>
            <p class="result-description">
              {{ drawResult.mushroom?.description || '暂无描述' }}
            </p>
            <div class="result-meta">
              <span class="meta-item">
                培育难度: <span class="difficulty">{{ drawResult.mushroom?.difficulty || 'easy' }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 盲盒抽取入口 -->
    <div class="mushroom-box-entrance">
      <div class="container">
        <div class="entrance-content">
          <div class="entrance-text">
            <h2>✨ 立即抽取您的专属盲盒 ✨</h2>
            <p>体验惊喜与美味的完美结合！</p>
            <p class="highlight">
              每个盲盒都包含精选当季新鲜菌菇，开启您的美食之旅
            </p>
            <div
              class="draw-button"
              @click="openDrawComponent"
            >
              <el-button
                type="primary"
                size="large"
              >
                立即抽取
              </el-button>
            </div>
          </div>
          <div class="entrance-image">
            <div class="box-animation">
              <div class="floating-box">
                <el-icon class="box-icon">
                  <Box />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内联盲盒抽取组件 -->
    <el-dialog
      v-model="showDrawComponent"
      title="盲盒抽取"
      width="90%"
      destroy-on-close
      center
    >
      <MushroomBoxDraw />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'
import { Box, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import eventBus, { EventTypes } from '../utils/eventBus.js'
import MushroomBoxDraw from '../components/MushroomBoxDraw.vue'
import { getPlaceholderImage } from '../utils/imageUtils'

const router = useRouter()
const boxStore = useMushroomBoxStore()

// 筛选条件
const selectedSeason = ref('')
const searchKeyword = ref('')

// 抽取结果状态
const showDrawComponent = ref(false)
const drawResult = ref(null)
const showDrawResult = ref(false)

// 同步状态
const isSyncing = ref(false)
const lastSyncTime = ref(null)

// 事件监听函数
const handleDrawCompleted = (result) => {
  drawResult.value = result
  showDrawResult.value = true
  // 可以在这里添加更多逻辑，比如更新UI、显示通知等
}

// 处理数据同步完成事件
const handleDataSyncCompleted = (syncData) => {
  lastSyncTime.value = syncData.timestamp
  isSyncing.value = false
  ElMessage.success('数据同步完成')
}

// 处理盲盒数据更新事件
const handleBoxesUpdated = (boxes) => {
  console.log('盲盒数据已更新:', boxes.length, '个盲盒')
}

// 打开抽取组件
const openDrawComponent = () => {
  showDrawComponent.value = true
}

// 关闭抽取组件
const closeDrawComponent = () => {
  showDrawComponent.value = false
}

// 关闭抽取结果
const closeDrawResult = () => {
  showDrawResult.value = false
}

// 手动同步数据
const syncData = async () => {
  isSyncing.value = true
  await boxStore.syncData()
}

// 筛选后的盲盒列表
const filteredBoxes = computed(() => {
  // 只显示启用状态的盲盒
  let result = boxStore.boxes.filter(box => box.status === 'active')
  
  // 按季节筛选
  if (selectedSeason.value) {
    result = result.filter(box => box.season === selectedSeason.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(box => 
      box.name.toLowerCase().includes(keyword) ||
      box.description.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 应用筛选
const applyFilters = () => {
  console.log('应用筛选:', { selectedSeason: selectedSeason.value, searchKeyword: searchKeyword.value })
  // 筛选逻辑已在computed属性中实现
}

// 重置筛选
const resetFilters = () => {
  selectedSeason.value = ''
  searchKeyword.value = ''
  console.log('重置筛选')
}



// 重试获取盲盒列表
const retryFetchBoxes = () => {
  boxStore.fetchBoxes()
};

// 导航到盲盒详情页
const navigateToBoxDetail = (boxId) => {
  router.push(`/mushroom-boxes/${boxId}`)
};

// 格式化同步时间
const formatSyncTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
};

// 页面加载时获取盲盒列表
onMounted(() => {
  // 初始化数据 - 使用syncData替代直接调用多个API，利用其防抖特性
  boxStore.syncData(true)
  
  // 设置定期数据同步
  boxStore.setupPeriodicSync()
  
  // 监听事件
  eventBus.on(EventTypes.BOX_DRAW_COMPLETED, handleDrawCompleted)
  eventBus.on(EventTypes.BOX_DRAW_RESULT_UPDATED, handleDrawCompleted)
  eventBus.on(EventTypes.DATA_SYNC_COMPLETED, handleDataSyncCompleted)
  eventBus.on(EventTypes.BOXES_DATA_UPDATED, handleBoxesUpdated)
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  eventBus.off(EventTypes.BOX_DRAW_COMPLETED, handleDrawCompleted)
  eventBus.off(EventTypes.BOX_DRAW_RESULT_UPDATED, handleDrawCompleted)
  eventBus.off(EventTypes.DATA_SYNC_COMPLETED, handleDataSyncCompleted)
  eventBus.off(EventTypes.BOXES_DATA_UPDATED, handleBoxesUpdated)
});
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

/* 主容器样式 */
.mushroom-boxes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

/* 筛选部分 */
.filter-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
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
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-select,
.filter-input {
  width: 100%;
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

.sync-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.sync-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
}

.sync-info {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
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

/* 盲盒网格 */
.boxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* 盲盒卡片 */
.box-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.box-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 图片容器 */
.box-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.box-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.box-card:hover .box-image {
  transform: scale(1.05);
}

/* 季节标签 */
.season-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 卡片内容 */
.box-content {
  padding: 20px;
}

.box-name {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.box-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 15px 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 价格 */
.box-price {
  margin: 15px 0;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

/* 菌菇预览 */
.box-items-preview {
  display: flex;
  align-items: center;
  margin: 15px 0;
}

.item-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
}

.item-preview img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ecf0f1;
  margin-bottom: 5px;
}

.item-preview span {
  font-size: 12px;
  color: #999;
}

.more-items {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

/* 按钮 */
.order-btn {
  width: 100%;
  margin-top: 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 0;
}

/* 盲盒抽取入口 */
.mushroom-box-entrance {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 40px 0;
  border-radius: 12px;
  overflow: hidden;
}

.entrance-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.entrance-text {
  flex: 1;
  min-width: 300px;
}

.entrance-text h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.entrance-text p {
  font-size: 1.2rem;
  margin-bottom: 15px;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.entrance-text .highlight {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  font-weight: 500;
  border-left: 4px solid white;
}

.draw-button {
  margin-top: 20px;
  display: inline-block;
}

.draw-button .el-button {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 12px 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.draw-button .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.entrance-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  height: 300px;
  position: relative;
}

.box-animation {
  width: 200px;
  height: 200px;
  position: relative;
}

.floating-box {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotateY(0deg);
  }
  33% {
    transform: translateY(-20px) rotateY(10deg);
  }
  66% {
    transform: translateY(10px) rotateY(-10deg);
  }
}

.box-icon {
  font-size: 4rem;
  color: #667eea;
  animation: spin 4s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .boxes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .entrance-content {
    flex-direction: column;
    text-align: center;
  }
  
  .entrance-text h2 {
    font-size: 2rem;
  }
  
  .entrance-text p {
    font-size: 1rem;
  }
  
  .floating-box {
    width: 120px;
    height: 120px;
  }
  
  .box-icon {
    font-size: 3rem;
  }
}

/* 抽取结果展示区域 */
.draw-result-section {
  margin: 30px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.result-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 30px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.result-container:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.result-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.result-content {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.result-image {
  flex-shrink: 0;
}

.result-image img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e8f5e8;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.result-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.result-info {
  flex: 1;
  min-width: 300px;
}

.result-name {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.result-description {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.result-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.meta-item .difficulty {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.meta-item .difficulty.easy {
  background: #e8f5e8;
  color: #4caf50;
}

.meta-item .difficulty.medium {
  background: #fff3e0;
  color: #ff9800;
}

.meta-item .difficulty.hard {
  background: #ffebee;
  color: #f44336;
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
  .result-content {
    flex-direction: column;
    text-align: center;
  }
  
  .result-info {
    min-width: 100%;
  }
  
  .result-image img {
    width: 120px;
    height: 120px;
  }
  
  .result-header h2 {
    font-size: 1.5rem;
  }
  
  .result-name {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .boxes-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .entrance-text {
    min-width: 100%;
  }
  
  .result-container {
    padding: 20px;
  }
  
  .result-image img {
    width: 100px;
    height: 100px;
  }
  
  .result-header h2 {
    font-size: 1.3rem;
  }
  
  .result-name {
    font-size: 1.2rem;
  }
}
</style>
