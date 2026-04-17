<template>
  <div class="works-grid">
    <div
      v-if="loading"
      class="loading-state"
    >
      <el-skeleton
        :rows="3"
        animated
      />
    </div>
    
    <div
      v-else-if="!works || works.length === 0"
      class="empty-state"
    >
      <el-empty description="暂无作品">
        <el-button
          type="primary"
          @click="$emit('upload')"
        >
          上传作品
        </el-button>
        <el-button @click="$emit('resetFilter')">
          查看全部
        </el-button>
      </el-empty>
    </div>
    
    <div
      v-else
      class="grid-container"
    >
      <div
        v-for="work in works"
        :key="work.id"
        class="work-card"
        @click="navigateToWorkDetail(work.id)"
      >
        <div class="work-image-container">
          <img 
            :src="getImageUrl(work.imageUrl) || getPlaceholderImage()" 
            :alt="work.title" 
            class="work-image"
            loading="lazy"
            @load="(e) => handleImageLoad(e, work)"
            @error="(e) => handleImageError(e, work)"
          >
          <div class="work-rating">
            <el-rate
              :model-value="work.rating"
              disabled
              :max="5"
              :score-template="'{{ value }}'"
            />
          </div>
          <div 
            v-if="(showEdit || showDelete || showUnfavorite || showAdminDelete) && (work.authorId === currentUserId || showUnfavorite || showAdminDelete)"
            class="work-actions"
          >
            <el-tooltip
              content="编辑作品"
              placement="top"
            >
              <el-button 
                v-if="showEdit && work.authorId === currentUserId"
                type="success" 
                circle
                size="small"
                @click.stop="handleEdit(work.id)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="删除作品"
              placement="top"
            >
              <el-button 
                v-if="(showDelete && work.authorId === currentUserId) || showAdminDelete"
                type="danger" 
                circle
                size="small"
                @click.stop="confirmDelete(work.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="取消收藏"
              placement="top"
            >
              <el-button 
                v-if="showUnfavorite"
                type="warning" 
                circle
                size="small"
                @click.stop="handleUnfavorite(work.id)"
              >
                <el-icon><Star /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="work-content">
          <h3 class="work-title">
            {{ work.title }}
          </h3>
          <p class="work-description">
            {{ work.description }}
          </p>
          <div class="work-meta">
            <div class="author-info">
              <span class="author-name">{{ work.authorName }}</span>
              <span class="publish-date">{{ formatDate(work.createdAt) }}</span>
            </div>
            <div class="work-stats">
              <span class="stat-item">
                <el-icon><StarFilled /></el-icon>
                {{ work.likes || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { StarFilled, Delete, Edit, Star } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { getPlaceholderImage, getImageUrl } from '../utils/imageUtils'

defineProps({
  works: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showEdit: {
    type: Boolean,
    default: false
  },
  showUnfavorite: {
    type: Boolean,
    default: false
  },
  showAdminDelete: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['upload', 'resetFilter', 'delete', 'edit', 'unfavorite'])
const router = useRouter()

const handleEdit = (workId) => {
  emit('edit', workId)
}

const confirmDelete = (workId) => {
  ElMessageBox.confirm('确定要删除这个作品吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    emit('delete', workId)
  }).catch(() => {})
}

const handleUnfavorite = (workId) => {
  console.log('WorksGrid 组件触发取消收藏事件:', { workId })
  emit('unfavorite', workId)
}

const navigateToWorkDetail = (workId) => {
  if (workId) {
    router.push(`/mushroom-kitchen/work/${workId}`)
  }
}

const handleImageLoad = (event, work) => {
  console.log(`✅ 图片加载成功: ${work.title} (${work.imageUrl})`)
}

const handleImageError = (event, work) => {
  console.error(`❌ 图片加载失败: ${work.title} (${work.imageUrl})`)
  console.error('   尝试加载的 URL:', event.target.src)
  
  // 使用占位图
  event.target.src = getPlaceholderImage()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.works-grid {
  width: 100%;
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.empty-description {
  font-size: 1rem;
  color: #606266;
}

.empty-hint {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 8px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.work-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: default;
}

.work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.work-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.work-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-rating {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.work-card:hover .work-image {
  transform: scale(1.05);
}

.work-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 2;
}

.work-actions .el-button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

/* 编辑按钮 - 绿色主题 */
.work-actions .el-button[type=success] {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.work-actions .el-button[type=success]:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.5);
}

/* 删除按钮 - 红色主题 */
.work-actions .el-button[type=danger] {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.work-actions .el-button[type=danger]:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: scale(1.15) rotate(-5deg);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.5);
}

/* 取消收藏按钮 - 黄色主题 */
.work-actions .el-button[type=warning] {
  background: linear-gradient(135deg, #FFC107 0%, #ff9800 100%);
  color: white;
}

.work-actions .el-button[type=warning]:hover {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.5);
}

.work-actions .el-button .el-icon {
  font-size: 20px;
  font-weight: bold;
}

.work-content {
  padding: 15px;
}

.work-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.work-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 0.85rem;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  color: #2c3e50;
  font-weight: 500;
}

.publish-date {
  color: #95a5a6;
}

.work-stats {
  display: flex;
  gap: 15px;
  color: #7f8c8d;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.stat-item .el-icon {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .work-image-container {
    height: 180px;
  }

  .work-title {
    font-size: 1rem;
  }

  .work-description {
    font-size: 0.85rem;
  }

  .work-meta {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .work-image-container {
    height: 200px;
  }
}
</style>
