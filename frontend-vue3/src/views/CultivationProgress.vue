<template>
  <div class="cultivation-progress-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>菌菇代培进度</h1>
      <p class="subtitle">
        实时跟踪您的菌菇培育进度
      </p>
    </div>
    
    <!-- 加载状态 -->
    <el-skeleton
      v-if="loading"
      :rows="8"
      animated
    />
    
    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="error-state"
    >
      <el-empty description="获取代培进度失败，请稍后重试" />
      <el-button
        type="primary"
        @click="fetchCultivationProgress"
      >
        重试
      </el-button>
    </div>
    
    <!-- 代培进度内容 -->
    <div
      v-else-if="cultivationData"
      class="progress-content"
    >
      <!-- 基本信息卡片 -->
      <el-card
        class="info-card"
        shadow="hover"
      >
        <div class="card-header">
          <h2 class="card-title">
            {{ cultivationData.boxName }}
          </h2>
          <el-tag
            :type="statusType"
            size="large"
          >
            {{ cultivationData.cultivationStatus === 'in_progress' ? '培育中' : 
              cultivationData.cultivationStatus === 'completed' ? '已完成' : 
              cultivationData.cultivationStatus === 'pending' ? '待开始' : '已取消' }}
          </el-tag>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">培育进度</span>
            <span class="progress-value">{{ cultivationData.cultivationProgress }}%</span>
          </div>
          <el-progress 
            :percentage="cultivationData.cultivationProgress" 
            :color="progressColor" 
            :status="progressStatus"
            :stroke-width="20"
          />
        </div>
        
        <!-- 培育时间信息 -->
        <div class="timeline-section">
          <div class="timeline-item">
            <div class="timeline-label">
              开始时间
            </div>
            <div class="timeline-value">
              {{ formatDate(cultivationData.cultivationStartDate) }}
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-arrow">
              →
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">
              预计结束
            </div>
            <div class="timeline-value">
              {{ formatDate(cultivationData.cultivationEndDate) }}
            </div>
          </div>
        </div>
        
        <!-- 服务包含内容 -->
        <div class="inclusions-section">
          <h3 class="section-title">
            服务包含
          </h3>
          <div class="inclusion-grid">
            <div class="inclusion-item">
              <el-icon class="item-icon">
                <Monitor />
              </el-icon>
              <span>实时监控</span>
            </div>
            <div class="inclusion-item">
              <el-icon class="item-icon">
                <ChatDotRound />
              </el-icon>
              <span>专业指导</span>
            </div>
            <div class="inclusion-item">
              <el-icon class="item-icon">
                <Calendar />
              </el-icon>
              <span>定期报告</span>
            </div>
            <div class="inclusion-item">
              <el-icon class="item-icon">
                <StarFilled />
              </el-icon>
              <span>收获保障</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 培育更新记录 -->
      <el-card
        v-if="cultivationData.cultivationUpdates && cultivationData.cultivationUpdates.length > 0"
        class="updates-card"
        shadow="hover"
      >
        <h3 class="section-title">
          培育更新记录
        </h3>
        <div class="updates-list">
          <div 
            v-for="(update, index) in cultivationData.cultivationUpdates" 
            :key="index" 
            class="update-item"
          >
            <div class="update-header">
              <div class="update-time">
                {{ formatDate(update.timestamp) }}
              </div>
              <el-tag
                size="small"
                type="success"
              >
                进度：{{ update.progress }}%
              </el-tag>
            </div>
            <div class="update-content">
              {{ update.content }}
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 培育笔记 -->
      <el-card
        v-if="cultivationData.cultivationNotes"
        class="notes-card"
        shadow="hover"
      >
        <h3 class="section-title">
          培育笔记
        </h3>
        <div class="notes-content">
          {{ cultivationData.cultivationNotes }}
        </div>
      </el-card>
      
      <!-- 培育指南 -->
      <el-card
        class="guide-card"
        shadow="hover"
      >
        <h3 class="section-title">
          培育指南
        </h3>
        <el-tabs v-model="activeGuideTab">
          <el-tab-pane label="当前阶段要点">
            <div class="guide-content">
              <div
                v-if="currentStageTips && currentStageTips.length > 0"
                class="tips-list"
              >
                <div
                  v-for="(tip, index) in currentStageTips"
                  :key="index"
                  class="tip-item"
                >
                  <el-icon class="tip-icon">
                    <WarningFilled />
                  </el-icon>
                  <span>{{ tip }}</span>
                </div>
              </div>
              <div
                v-else
                class="no-tips"
              >
                当前阶段暂无特别注意事项
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="常见问题">
            <div class="faq-content">
              <el-collapse>
                <el-collapse-item
                  title="菌菇生长缓慢怎么办？"
                  name="1"
                >
                  <div class="faq-answer">
                    菌菇生长缓慢可能是由于温度、湿度或光照条件不适宜。请确保环境温度保持在18-25℃，湿度在80-90%，并避免阳光直射。
                  </div>
                </el-collapse-item>
                <el-collapse-item
                  title="菌包出现异味是正常的吗？"
                  name="2"
                >
                  <div class="faq-answer">
                    轻微的菌菇特有气味是正常的，但如果出现刺鼻异味或发霉现象，可能是菌包感染了杂菌，请立即联系客服处理。
                  </div>
                </el-collapse-item>
                <el-collapse-item
                  title="如何判断菌菇是否可以收获？"
                  name="3"
                >
                  <div class="faq-answer">
                    当菌菇子实体长到合适大小，菌盖边缘开始内卷时，即可收获。不同种类的菌菇收获时机略有不同，请参考具体品种的培育指南。
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      
      <!-- 联系客服按钮 -->
      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          @click="contactService"
        >
          <el-icon><Headset /></el-icon>
          联系客服
        </el-button>
      </div>
    </div>
    
    <!-- 无代培订单状态 -->
    <div
      v-else
      class="no-cultivation"
    >
      <el-empty description="您暂无代培服务订单" />
      <el-button
        type="primary"
        @click="navigateToBoxes"
      >
        去选购盲盒
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import { 
  Monitor, ChatDotRound, Calendar, StarFilled, 
  WarningFilled, Headset 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 状态管理
const loading = ref(false)
const error = ref(null)
const cultivationData = ref(null)
const activeGuideTab = ref('0')

// 从路由参数获取orderId
const orderId = computed(() => route.params.orderId)

// 根据状态计算样式
const statusType = computed(() => {
  if (!cultivationData.value) return 'info'
  return cultivationData.value.cultivationStatus === 'in_progress' ? 'success' :
         cultivationData.value.cultivationStatus === 'completed' ? 'success' :
         cultivationData.value.cultivationStatus === 'pending' ? 'warning' : 'danger'
})

// 进度条颜色
const progressColor = computed(() => {
  if (!cultivationData.value) return '#67c23a'
  const progress = cultivationData.value.cultivationProgress
  if (progress < 30) return '#e6a23c'
  if (progress < 70) return '#67c23a'
  return '#67c23a'
})

// 进度条状态
const progressStatus = computed(() => {
  if (!cultivationData.value) return 'active'
  return cultivationData.value.cultivationProgress === 100 ? 'success' : 'active'
})

// 当前阶段要点
const currentStageTips = computed(() => {
  if (!cultivationData.value) return []
  const progress = cultivationData.value.cultivationProgress
  
  if (progress < 30) {
    return [
      '保持菌包湿润，但避免过度浇水',
      '确保环境通风良好',
      '避免阳光直射'
    ]
  } else if (progress < 70) {
    return [
      '定期检查菌菇生长情况',
      '保持适宜的温度和湿度',
      '注意观察是否有杂菌感染'
    ]
  } else {
    return [
      '准备收获工具',
      '学习正确的收获方法',
      '收获后继续管理菌包，可能有第二潮收获'
    ]
  }
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取代培进度
const fetchCultivationProgress = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`/api/boxes/cultivation/${orderId.value}`)
    cultivationData.value = response.data.data
  } catch (err) {
    error.value = err.message
    console.error('获取代培进度失败:', err)
  } finally {
    loading.value = false
  }
}

// 联系客服
const contactService = () => {
  // 这里可以跳转到客服聊天页面或显示客服联系方式
  router.push('/messages')
}

// 跳转到盲盒列表
const navigateToBoxes = () => {
  router.push('/mushroom-boxes')
}

// 页面加载时获取数据
onMounted(() => {
  if (orderId.value) {
    fetchCultivationProgress()
  }
})
</script>

<style scoped>
.cultivation-progress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.progress-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 卡片样式 */
.info-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

/* 进度条样式 */
.progress-section {
  margin: 20px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 1rem;
  color: #546e7a;
  font-weight: 500;
}

.progress-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #67c23a;
}

/* 时间线样式 */
.timeline-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 30px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.timeline-label {
  font-size: 0.9rem;
  color: #546e7a;
  margin-bottom: 8px;
  font-weight: 500;
}

.timeline-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.timeline-arrow {
  font-size: 1.5rem;
  color: #67c23a;
  font-weight: bold;
}

/* 服务包含样式 */
.inclusions-section {
  margin: 30px 0;
}

.section-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.inclusion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.inclusion-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.inclusion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #67c23a;
}

.item-icon {
  font-size: 1.5rem;
  color: #67c23a;
  margin-right: 10px;
}

/* 更新记录样式 */
.updates-card {
  border-radius: 12px;
}

.updates-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.update-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.update-time {
  font-size: 0.85rem;
  color: #95a5a6;
}

.update-content {
  color: #546e7a;
  line-height: 1.5;
}

/* 培育笔记样式 */
.notes-card {
  border-radius: 12px;
}

.notes-content {
  color: #546e7a;
  line-height: 1.6;
  white-space: pre-line;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

/* 指南样式 */
.guide-card {
  border-radius: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #fef0f0;
  border-radius: 8px;
  border: 1px solid #fbc4ab;
}

.tip-icon {
  color: #f56c6c;
  margin-right: 10px;
}

.no-tips {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
  font-size: 0.95rem;
}

.faq-answer {
  color: #546e7a;
  line-height: 1.6;
}

/* 操作区域 */
.action-section {
  text-align: center;
  margin: 30px 0;
}

/* 空状态 */
.no-cultivation,
.error-state {
  text-align: center;
  padding: 50px 0;
}

.no-cultivation .el-button,
.error-state .el-button {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-title {
    margin-bottom: 15px;
  }
  
  .timeline-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .timeline-arrow {
    transform: rotate(90deg);
  }
  
  .inclusion-grid {
    grid-template-columns: 1fr;
  }
}
</style>