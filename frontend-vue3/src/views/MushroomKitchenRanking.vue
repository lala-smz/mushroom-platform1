<template>
  <div class="mushroom-kitchen-ranking">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <el-button
        type="primary"
        plain
        :icon="ArrowLeft"
        class="back-button"
        aria-label="返回上一级页面"
        aria-pressed="false"
        @click="goBack"
      >
        返回
      </el-button>
    </div>

    <!-- 页面头部 -->
    <div class="ranking-header">
      <h1>菌菇美食榜</h1>
      <p class="ranking-subtitle">
        每周/每月榜单前三名作品将获得平台奖励
      </p>
    </div>

    <!-- 筛选和切换控件 -->
    <div class="ranking-controls">
      <!-- 时间范围切换 -->
      <div class="time-range-selector">
        <el-radio-group
          v-model="activeTimeRange"
          @change="handleTimeRangeChange"
        >
          <el-radio-button label="daily">
            日榜
          </el-radio-button>
          <el-radio-button label="weekly">
            周榜
          </el-radio-button>
          <el-radio-button label="monthly">
            月榜
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 菌菇种类筛选 -->
      <div class="mushroom-type-filter">
        <el-select
          v-model="selectedMushroomType"
          placeholder="按菌菇种类筛选"
          @change="handleMushroomTypeChange"
        >
          <el-option
            value="all"
            label="全部"
          />
          <el-option
            value="shiitake"
            label="香菇"
          />
          <el-option
            value="oyster"
            label="平菇"
          />
          <el-option
            value="enoki"
            label="金针菇"
          />
          <el-option
            value="king"
            label="杏鲍菇"
          />
          <el-option
            value="松茸"
            label="松茸"
          />
          <el-option
            value="other"
            label="其他"
          />
        </el-select>
      </div>
    </div>

    <!-- 排行榜数据展示 -->
    <div class="ranking-content">
      <!-- 前三名特殊展示 -->
      <div
        v-if="topThreeWorks.length > 0"
        class="top-three-section"
      >
        <div class="top-three-header">
          <h2>{{ getTimeRangeTitle() }} 前三名</h2>
          <div class="reward-info">
            <span class="reward-label">奖励：</span>
            <span class="reward-details">
              第1名：平台积分 1000，第2名：平台积分 800，第3名：平台积分 500
            </span>
          </div>
        </div>
        <div class="top-three-works">
          <div 
            v-for="(work, index) in topThreeWorks" 
            :key="work.id"
            class="top-work-card"
            :class="`rank-${index + 1}`"
            @click="navigateToWorkDetail(work.id)"
          >
            <div class="rank-number">
              {{ index + 1 }}
            </div>
            <div class="work-image-container">
              <img
                :src="work.imageUrl || getPlaceholderImage('300')"
                :alt="work.title"
                class="work-image"
                @error="(e) => e.target.src = getPlaceholderImage('300')"
              >
            </div>
            <div class="work-info">
              <h3 class="work-title">
                {{ work.title }}
              </h3>
              <div class="work-rating">
                <el-rate
                  v-model="work.rating"
                  disabled
                  :max="5"
                  :score-template="'{{ value }}'"
                />
              </div>
              <div class="work-meta">
                <span class="author-name">{{ work.authorName }}</span>
                <span class="publish-date">{{ formatDate(work.createdAt) }}</span>
              </div>
              <div class="work-stats">
                <span class="stat-item">
                  <el-icon><StarFilled /></el-icon>
                  {{ work.likes }} 赞
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ work.comments }} 评论
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 完整排行榜列表 -->
      <div class="full-ranking-section">
        <h2>{{ getTimeRangeTitle() }} 完整榜单</h2>
        <div class="ranking-list">
          <div 
            v-for="(work, index) in rankingWorks" 
            :key="work.id"
            class="ranking-item"
            :class="{ 'top-rank': index < 3 }"
            @click="navigateToWorkDetail(work.id)"
          >
            <div class="rank-number">
              {{ index + 1 }}
            </div>
            <div class="work-image-container">
              <img
                :src="work.imageUrl || getPlaceholderImage('300')"
                :alt="work.title"
                class="work-image"
                @error="(e) => e.target.src = getPlaceholderImage('300')"
              >
            </div>
            <div class="work-info">
              <h3 class="work-title">
                {{ work.title }}
              </h3>
              <div class="work-rating">
                <el-rate
                  v-model="work.rating"
                  disabled
                  :max="5"
                  :score-template="'{{ value }}'"
                />
              </div>
              <div class="work-meta">
                <span class="author-name">{{ work.authorName }}</span>
                <span class="publish-date">{{ formatDate(work.createdAt) }}</span>
              </div>
              <div class="work-stats">
                <span class="stat-item">
                  <el-icon><StarFilled /></el-icon>
                  {{ work.likes }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ work.comments }}
                </span>
              </div>
            </div>
            <div class="work-score">
              <span class="score-label">综合评分：</span>
              <span class="score-value">{{ work.totalScore.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="rankingWorks.length === 0"
          class="empty-ranking"
        >
          <el-empty description="暂无排行榜数据" />
        </div>
      </div>
    </div>

    <!-- 数据可视化图表 -->
    <div class="ranking-charts">
      <h2>榜单数据趋势</h2>
      <div class="chart-container">
        <div class="chart-item">
          <h3>评分权重分布</h3>
          <div
            class="score-distribution-chart"
            style="height: 300px;"
          />
        </div>
        <div class="chart-item">
          <h3>评分趋势</h3>
          <div
            class="score-trend-chart"
            style="height: 300px;"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { StarFilled, ChatDotRound, DataAnalysis, PieChart, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useWorkStore } from '../stores/useWorkStore'
import * as echarts from 'echarts'
import { apiClient } from '../api/index.js'
import webSocketService from '../utils/websocket'
import { getPlaceholderImage } from '../utils/imageUtils'

const router = useRouter()
const workStore = useWorkStore()

// 时间范围和筛选条件
const activeTimeRange = ref('weekly')
const selectedMushroomType = ref('all')

// 排行榜数据
const isLoading = computed(() => workStore.isLoading)

// 前三名作品（用于特殊展示）
const topThreeWorks = computed(() => {
  return workStore.currentRankingWorks.slice(0, 3)
})

// 排行榜作品
const rankingWorks = computed(() => {
  return workStore.currentRankingWorks
})

// 获取时间范围标题
const getTimeRangeTitle = () => {
  const titles = {
    daily: '日榜',
    weekly: '周榜',
    monthly: '月榜'
  }
  return titles[activeTimeRange.value] || '榜单'
}



// 处理时间范围变化
const handleTimeRangeChange = () => {
  fetchRankingData()
}

// 处理菌菇种类筛选变化
const handleMushroomTypeChange = () => {
  fetchRankingData()
}

// 导航到作品详情页
const navigateToWorkDetail = (workId) => {
  router.push(`/mushroom-kitchen/work/${workId}`)
}

// 返回上一级页面
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取排行榜数据
const fetchRankingData = async () => {
  try {
    // 使用状态管理中的方法获取数据
    await workStore.fetchRankingData(activeTimeRange.value, selectedMushroomType.value)
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    ElMessage.error('获取排行榜数据失败，请稍后重试')
  }
}

// 图表相关变量
const scoreDistributionChart = ref(null)
const scoreTrendChart = ref(null)
const scoreConfig = ref({
  ratingWeight: 0.3,
  interactionWeight: 0.25,
  qualityWeight: 0.2,
  creativityWeight: 0.15,
  recencyWeight: 0.1
})
const scoreTrendData = ref([])

// 初始化评分分布饼图
const initScoreDistributionChart = async () => {
  await nextTick()
  const chartDom = document.querySelector('.score-distribution-chart')
  if (!chartDom) return
  
  // 销毁旧图表实例
  if (scoreDistributionChart.value) {
    scoreDistributionChart.value.dispose()
  }
  
  // 创建新图表实例
  scoreDistributionChart.value = echarts.init(chartDom)
  
  // 准备数据
  const option = {
    title: {
      text: '评分权重分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '评分权重',
        type: 'pie',
        radius: '50%',
        data: [
          { value: scoreConfig.value.ratingWeight * 100, name: '作品评分' },
          { value: scoreConfig.value.interactionWeight * 100, name: '用户互动' },
          { value: scoreConfig.value.qualityWeight * 100, name: '作品质量' },
          { value: scoreConfig.value.creativityWeight * 100, name: '创新性' },
          { value: scoreConfig.value.recencyWeight * 100, name: '时效性' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  // 设置图表选项
  scoreDistributionChart.value.setOption(option)
}

// 初始化评分趋势折线图
const initScoreTrendChart = async () => {
  await nextTick()
  const chartDom = document.querySelector('.score-trend-chart')
  if (!chartDom) return
  
  // 销毁旧图表实例
  if (scoreTrendChart.value) {
    scoreTrendChart.value.dispose()
  }
  
  // 创建新图表实例
  scoreTrendChart.value = echarts.init(chartDom)
  
  // 准备数据
  const option = {
    title: {
      text: '评分趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均评分'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: scoreTrendData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '平均评分',
        type: 'line',
        data: scoreTrendData.value.map(item => item.score),
        smooth: true,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  }
  
  // 设置图表选项
  scoreTrendChart.value.setOption(option)
}

// 获取评分配置
const fetchScoreConfig = async () => {
  try {
    const response = await apiClient.work.getScoreConfig()
    if (response.success && response.data) {
      scoreConfig.value = response.data
      // 更新图表
      initScoreDistributionChart()
    }
  } catch (error) {
    console.error('获取评分配置失败:', error)
  }
}

// 模拟评分趋势数据
const generateScoreTrendData = () => {
  const data = []
  const now = new Date()
  
  // 生成过去7天的数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    
    // 生成随机评分数据（5-9.5分之间）
    const score = 5 + Math.random() * 4.5
    data.push({ date: dateStr, score: score.toFixed(2) })
  }
  
  scoreTrendData.value = data
}

// 处理窗口大小变化
const handleResize = () => {
  if (scoreDistributionChart.value) {
    scoreDistributionChart.value.resize()
  }
  if (scoreTrendChart.value) {
    scoreTrendChart.value.resize()
  }
}

// 处理排行榜更新事件
const handleRankingUpdate = () => {
  console.log('接收到排行榜更新事件，重新获取排行榜数据')
  fetchRankingData()
}

// 组件挂载时获取数据
onMounted(async () => {
  fetchRankingData()
  // 初始化图表
  fetchScoreConfig()
  generateScoreTrendData()
  
  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initScoreDistributionChart()
    initScoreTrendChart()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 订阅排行榜更新事件
  try {
    await webSocketService.ensureConnection()
    webSocketService.subscribeToRankingUpdate()
    webSocketService.onRankingUpdate(handleRankingUpdate)
    console.log('已订阅排行榜更新事件')
  } catch (error) {
    console.error('订阅排行榜更新事件失败:', error)
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (scoreDistributionChart.value) {
    scoreDistributionChart.value.dispose()
  }
  if (scoreTrendChart.value) {
    scoreTrendChart.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
  
  // 取消订阅排行榜更新事件
  try {
    webSocketService.offRankingUpdate(handleRankingUpdate)
    webSocketService.unsubscribeFromRankingUpdate()
    console.log('已取消订阅排行榜更新事件')
  } catch (error) {
    console.error('取消订阅排行榜更新事件失败:', error)
  }
})
</script>

<style scoped>
.mushroom-kitchen-ranking {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.back-button-container {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-start;
}

.back-button {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-size: 1rem;
  padding: 8px 16px;
}

.back-button:hover {
  transform: translateX(-5px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.back-button:active {
  transform: translateX(-3px);
}

.back-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.ranking-header {
  text-align: center;
  margin-bottom: 60px;
}

.ranking-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.ranking-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.ranking-controls {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.time-range-selector {
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.mushroom-type-filter {
  min-width: 200px;
}

.ranking-content {
  margin-bottom: 60px;
}

.top-three-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.top-three-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.top-three-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.reward-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.reward-label {
  font-weight: 600;
  color: #2c3e50;
}

.reward-details {
  color: #7f8c8d;
}

.top-three-works {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.top-work-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  padding: 20px;
}

.top-work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.top-work-card.rank-1 {
  border: 3px solid #ffd700;
}

.top-work-card.rank-2 {
  border: 3px solid #c0c0c0;
}

.top-work-card.rank-3 {
  border: 3px solid #cd7f32;
}

.rank-number {
  position: absolute;
  top: -10px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  z-index: 10;
}

.top-work-card.rank-1 .rank-number {
  background: #ffd700;
}

.top-work-card.rank-2 .rank-number {
  background: #c0c0c0;
}

.top-work-card.rank-3 .rank-number {
  background: #cd7f32;
}

.work-image-container {
  margin-top: 30px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.work-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.top-work-card:hover .work-image {
  transform: scale(1.05);
}

.work-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.work-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.work-rating {
  display: flex;
  align-items: center;
}

.work-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.author-name {
  font-weight: 500;
  color: #2c3e50;
}

.work-stats {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.full-ranking-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.full-ranking-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.ranking-item:hover {
  background: #e9ecef;
  transform: translateX(10px);
}

.ranking-item .rank-number {
  position: static;
  width: 30px;
  height: 30px;
  font-size: 1rem;
  background: #7f8c8d;
}

.ranking-item.top-rank:nth-child(1) .rank-number {
  background: #ffd700;
}

.ranking-item.top-rank:nth-child(2) .rank-number {
  background: #c0c0c0;
}

.ranking-item.top-rank:nth-child(3) .rank-number {
  background: #cd7f32;
}

.ranking-item .work-image-container {
  margin: 0;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
}

.ranking-item .work-image {
  width: 100%;
  height: 100%;
}

.ranking-item .work-info {
  flex: 1;
  gap: 10px;
}

.ranking-item .work-title {
  font-size: 1rem;
}

.work-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  min-width: 120px;
}

.score-label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.score-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.empty-ranking {
  padding: 60px 20px;
  text-align: center;
}

.ranking-charts {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.ranking-charts h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.chart-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
}

.chart-item h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 15px;
}

.chart-placeholder p {
  color: #95a5a6;
  margin: 0;
}

@media (max-width: 768px) {
  .mushroom-kitchen-ranking {
    padding: 20px 15px;
  }

  .back-button-container {
    margin-bottom: 20px;
  }

  .back-button {
    font-size: 0.9rem;
    padding: 6px 12px;
  }

  .ranking-header h1 {
    font-size: 2rem;
  }

  .ranking-controls {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .top-three-section {
    padding: 30px 20px;
  }

  .top-three-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .top-three-works {
    grid-template-columns: 1fr;
  }

  .full-ranking-section {
    padding: 30px 20px;
  }

  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .ranking-item .work-image-container {
    width: 100%;
    height: 200px;
  }

  .work-score {
    align-self: flex-start;
  }

  .chart-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .ranking-charts {
    padding: 30px 20px;
  }
}
</style>
