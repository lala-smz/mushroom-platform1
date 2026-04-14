<template>
  <div
    v-if="visible"
    class="star-rating-overlay"
    @click="handleOverlayClick"
  >
    <div
      class="star-rating-container"
      @click.stop
    >
      <div class="star-rating-header">
        <h3>为作品评分</h3>
        <el-button
          type="text"
          class="close-button"
          @click="handleCancel"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <!-- 星级评分区域 -->
      <div class="star-rating-body">
        <div class="rating-stars">
          <el-rate
            v-model="ratingValue"
            :max="5"
            :show-score="false"
            :texts="['很差', '较差', '一般', '满意', '非常满意']"
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A', '#F7BA2A', '#F7BA2A']"
            :allow-half="true"
            class="star-rating-input"
            @change="handleRatingChange"
          />
          <div class="rating-text">
            {{ currentRatingText }}
          </div>
        </div>
        
        <!-- 评分文字输入 -->
        <div class="rating-comment">
          <el-input
            v-model="ratingComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评分感受（可选，最多100字）"
            maxlength="100"
            show-word-limit
          />
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="star-rating-footer">
        <el-button @click="handleCancel">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="isSubmitting"
          @click="handleConfirm"
        >
          确认评分
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  workId: {
    type: String || Number,
    required: true
  },
  currentRating: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['close', 'confirm'])

// 响应式数据
const ratingValue = ref(props.currentRating)
const ratingComment = ref('')
const isSubmitting = ref(false)

// 评分文字
const ratingTexts = ['很差', '较差', '一般', '满意', '非常满意']

// 当前评分文字
const currentRatingText = computed(() => {
  if (ratingValue.value === 0) return '请选择评分'
  return ratingTexts[Math.floor(ratingValue.value) - 1] || ''
})

// 监听当前评分变化
watch(() => props.currentRating, (newValue) => {
  ratingValue.value = newValue
})

// 动画状态
const isAnimating = ref(false)

// 处理评分变化
const handleRatingChange = (value) => {
  console.log('评分变化:', value)
  // 添加评分变化的动画效果
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

// 处理确认评分
const handleConfirm = () => {
  if (ratingValue.value === 0) {
    // 提示用户必须选择评分
    return
  }
  
  isSubmitting.value = true
  
  // 模拟评分提交延迟
  setTimeout(() => {
    emit('confirm', {
      workId: props.workId,
      rating: ratingValue.value,
      comment: ratingComment.value
    })
    isSubmitting.value = false
    resetForm()
  }, 500)
}

// 处理取消
const handleCancel = () => {
  emit('close')
  resetForm()
}

// 处理点击外部区域关闭
const handleOverlayClick = () => {
  emit('close')
  resetForm()
}

// 重置表单
const resetForm = () => {
  ratingComment.value = ''
  // 保留当前评分值，不重置
}
</script>

<style scoped>
.star-rating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.star-rating-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 480px;
  padding: 24px;
  animation: slideUp 0.3s ease;
}

.star-rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.star-rating-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-button {
  padding: 4px;
}

.star-rating-body {
  margin-bottom: 24px;
}

.rating-stars {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.el-rate {
  font-size: 32px;
  margin-bottom: 12px;
}

/* 星级评分动画效果 */
.star-rating-input {
  transition: all 0.3s ease;
}

.star-rating-input .el-rate__icon {
  transition: all 0.2s ease;
}

.star-rating-input .el-rate__icon:hover {
  transform: scale(1.2);
}

.star-rating-input .el-rate__icon.is-full {
  animation: starPulse 0.3s ease;
}

@keyframes starPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.rating-text {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.rating-comment {
  margin-top: 20px;
}

.star-rating-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .star-rating-container {
    width: 95%;
    padding: 20px;
  }
  
  .el-rate {
    font-size: 28px;
  }
}
</style>