<template>
  <div class="video-management">
    <h1>视频管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon> 新增视频
        </el-button>
        <el-button
          type="success"
          @click="openStatisticsDialog"
        >
          <el-icon><DataAnalysis /></el-icon> 数据统计
        </el-button>
      </div>
      
      <!-- 批量操作栏 -->
      <div
        v-if="selectedVideos.length > 0"
        class="batch-actions-bar"
      >
        <div class="selected-info">
          <el-tag
            type="info"
            size="large"
            class="selected-count-tag"
          >
            <el-icon><Tickets /></el-icon>
            已选择 <strong>{{ selectedVideos.length }}</strong> 项
          </el-tag>
          <el-button
            type="primary"
            :text="true"
            class="clear-selection-btn"
            @click="clearSelection"
          >
            <el-icon><RefreshLeft /></el-icon>
            清除选择
          </el-button>
        </div>
        <div class="batch-buttons">
          <el-button
            type="success"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn"
            @click="batchUpdateStatus('active')"
          >
            <el-icon><CircleCheck /></el-icon>
            批量启用
          </el-button>
          <el-button
            type="warning"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn"
            @click="batchUpdateStatus('inactive')"
          >
            <el-icon><CircleClose /></el-icon>
            批量禁用
          </el-button>
          <el-button
            type="danger"
            :loading="batchLoading"
            :disabled="!canBatchOperate"
            class="batch-action-btn delete-btn"
            @click="batchDeleteVideos"
          >
            <el-icon><DeleteFilled /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 高级筛选栏 -->
    <div class="filter-bar">
      <el-form
        :inline="true"
        :model="filterForm"
        class="filter-form"
      >
        <el-form-item label="分类">
          <el-select
            v-model="filterForm.category"
            placeholder="全部分类"
            clearable
            @change="loadVideos"
          >
            <el-option
              label="培育指南"
              value="cultivation"
            />
            <el-option
              label="烹饪教程"
              value="cooking"
            />
            <el-option
              label="种类识别"
              value="identification"
            />
            <el-option
              label="综合内容"
              value="general"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            @change="loadVideos"
          >
            <el-option
              label="启用"
              value="active"
            />
            <el-option
              label="禁用"
              value="inactive"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="质量">
          <el-select
            v-model="filterForm.quality"
            placeholder="全部质量"
            clearable
            @change="loadVideos"
          >
            <el-option
              label="高清"
              value="hd"
            />
            <el-option
              label="标清"
              value="sd"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="resetFilters"
          >
            <el-icon><Refresh /></el-icon> 重置筛选
          </el-button>
        </el-form-item>
      </el-form>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索视频标题或描述"
          clearable
          class="search-input"
          @keyup.enter="loadVideos"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 视频列表 -->
    <el-card
      shadow="hover"
      class="videos-card"
    >
      <template #header>
        <div class="card-header">
          <span>视频列表</span>
          <span class="total-count">共 {{ total }} 个视频</span>
        </div>
      </template>
      
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="videos"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="title"
          label="视频标题"
          min-width="200"
        >
          <template #default="scope">
            <div class="video-title">
              <img
                :src="scope.row && scope.row.thumbnailUrl ? getImageUrl(scope.row.thumbnailUrl) : DEFAULT_PLACEHOLDER_URL"
                alt="视频封面"
                class="video-thumbnail"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <span>{{ scope.row?.title || '' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="category"
          label="分类"
          width="120"
        >
          <template #default="scope">
            {{ getCategoryText(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="duration"
          label="时长"
          width="100"
        >
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="viewCount"
          label="观看次数"
          width="100"
        />
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="80"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="240"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="previewVideo(scope.row)"
            >
              <el-icon><VideoPlay /></el-icon> 预览
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="openEditDialog(scope.row)"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteVideo(scope.row.id)"
            >
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑视频对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑视频' : '新增视频'"
      width="70%"
    >
      <el-form
        ref="videoForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="video-form"
      >
        <el-form-item
          label="视频标题"
          prop="title"
        >
          <el-input
            v-model="form.title"
            placeholder="请输入视频标题"
          />
        </el-form-item>
        
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入视频描述"
          />
        </el-form-item>
        
        <el-form-item
          label="视频文件"
          prop="videoUrl"
        >
          <el-upload
            class="video-upload"
            :action="`${API_BASE_URL}/cooking-videos/upload-video`"
            :headers="getUploadHeaders()"
            :on-success="handleVideoUpload"
            :on-error="handleVideoUploadError"
            :on-progress="handleVideoUploadProgress"
            :limit="1"
            :file-list="videoFileList"
            accept=".mp4,.webm,.ogg,.mov,.avi"
            name="video"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon> 上传视频
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传MP4、WebM、OGG、MOV、AVI格式的视频，大小不超过500MB
              </div>
            </template>
          </el-upload>
          <el-progress
            v-if="uploadProgress > 0 && uploadProgress < 100"
            :percentage="uploadProgress"
            :stroke-width="10"
            style="margin-top: 10px;"
          />
          <el-input
            v-model="form.videoUrl"
            placeholder="或输入视频URL"
            class="video-url-input"
            style="margin-top: 10px;"
          />
        </el-form-item>
        
        <el-form-item
          label="封面图片"
          prop="thumbnailUrl"
        >
          <el-upload
            v-model:file-list="thumbnailFileList"
            class="thumbnail-upload"
            :action="`${API_BASE_URL}/cooking-videos/upload-thumbnail`"
            :headers="getUploadHeaders()"
            :on-success="handleThumbnailUpload"
            :on-error="handleUploadError"
            :limit="1"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            name="thumbnail"
            list-type="picture-card"
            :on-remove="handleThumbnailRemove"
          >
            <template #default="{ file }">
              <template v-if="file">
                <img
                  :src="getImageUrl(file.url)"
                  class="upload-image"
                  @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
                >
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click.stop="handleThumbnailPreview(file)"
                  >
                    <el-icon><ZoomIn /></el-icon>
                  </span>
                  <span
                    class="el-upload-list__item-delete"
                    @click.stop="handleThumbnailRemove(file)"
                  >
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </template>
            </template>
            <template #trigger>
              <el-button
                type="primary"
                size="small"
              >
                <el-icon><Plus /></el-icon>
                上传封面
              </el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传JPG、JPEG、PNG、GIF、WEBP格式的图片，大小不超过5MB
              </div>
            </template>
          </el-upload>
          <el-input
            v-model="form.thumbnailUrl"
            placeholder="或输入封面图片URL"
            class="thumbnail-url-input"
            style="margin-top: 10px;"
          />
        </el-form-item>
        
        <el-form-item
          label="时长"
          prop="duration"
        >
          <el-input-number
            v-model="form.duration"
            :min="1"
            :max="36000"
            :step="1"
            placeholder="请输入视频时长（秒）"
          />
        </el-form-item>
        
        <el-form-item
          label="分类"
          prop="category"
        >
          <el-select
            v-model="form.category"
            placeholder="请选择分类"
          >
            <el-option
              label="培育指南"
              value="cultivation"
            />
            <el-option
              label="烹饪教程"
              value="cooking"
            />
            <el-option
              label="种类识别"
              value="identification"
            />
            <el-option
              label="综合内容"
              value="general"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="关联盲盒"
          prop="mushroomBoxId"
        >
          <el-select
            v-model="form.mushroomBoxId"
            placeholder="选择关联的盲盒（可选）"
            clearable
            filterable
          >
            <el-option
              v-for="box in mushroomBoxes"
              :key="box.id"
              :label="box.name"
              :value="box.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="排序"
          prop="sortOrder"
        >
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            :max="9999"
            :step="1"
            placeholder="数字越小越靠前"
          />
        </el-form-item>
        
        <el-form-item
          label="标签"
          prop="tags"
        >
          <el-input
            v-model="tagsInput"
            placeholder="请输入标签，用逗号分隔"
          />
        </el-form-item>
        
        <el-form-item
          label="质量"
          prop="quality"
        >
          <el-select
            v-model="form.quality"
            placeholder="请选择视频质量"
            clearable
          >
            <el-option
              label="高清"
              value="hd"
            />
            <el-option
              label="标清"
              value="sd"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="来源"
          prop="source"
        >
          <el-input
            v-model="form.source"
            placeholder="请输入视频来源（可选）"
          />
        </el-form-item>
        
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="saveVideo"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="视频预览"
      width="80%"
    >
      <div class="video-preview">
        <VideoPlayer
          v-if="previewVideoData.videoUrl || previewVideoData.url"
          :video="previewVideoData"
          :auto-play="false"
          :show-info="true"
        />
        <div
          v-else
          class="no-video"
        >
          <el-icon class="no-video-icon">
            <VideoPlay />
          </el-icon>
          <p>视频URL不存在</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      title="封面预览"
      width="500px"
    >
      <img
        :src="previewImageUrl"
        alt="封面预览"
        class="preview-image"
        style="width: 100%;"
      >
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="imagePreviewVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 数据统计对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="视频数据统计"
      width="85%"
    >
      <div class="statistics-content">
        <div
          v-if="loadingStatistics"
          class="loading-statistics"
        >
          <el-skeleton
            :rows="10"
            animated
          />
        </div>
        <div v-else>
          <!-- 基本统计 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Document />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.totalVideos }}
                    </div>
                    <div class="stat-label">
                      总视频数
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <View />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.totalViews }}
                    </div>
                    <div class="stat-label">
                      总观看次数
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Check />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ activeCount }}
                    </div>
                    <div class="stat-label">
                      启用视频
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card
                shadow="hover"
                class="stat-card"
              >
                <div class="stat-item">
                  <el-icon class="stat-icon">
                    <Close />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ inactiveCount }}
                    </div>
                    <div class="stat-label">
                      禁用视频
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 分类分布 -->
          <el-card
            shadow="hover"
            class="category-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>分类分布</span>
              </div>
            </template>
            <div class="category-stat-container">
              <div
                v-for="stat in statistics.categoryStats"
                :key="stat.category"
                class="category-stat-item"
              >
                <div class="category-info">
                  <span class="category-name">{{ getCategoryText(stat.category) }}</span>
                  <span class="category-count">{{ stat.count }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.totalVideos > 0 ? (stat.count / statistics.totalVideos) * 100 : 0" 
                  :color="getProgressColor(statistics.categoryStats.findIndex(s => s.category === stat.category))"
                  :stroke-width="12"
                  class="category-progress"
                />
              </div>
              <div
                v-if="!statistics.categoryStats || statistics.categoryStats.length === 0"
                class="no-data"
              >
                暂无分类数据
              </div>
            </div>
          </el-card>
          
          <!-- 状态分布 -->
          <el-card
            shadow="hover"
            class="status-stat-card"
          >
            <template #header>
              <div class="card-header">
                <span>状态分布</span>
                <el-tag
                  type="info"
                  size="small"
                >
                  更新时间: {{ new Date(statistics.lastUpdated).toLocaleString() }}
                </el-tag>
              </div>
            </template>
            <div class="status-stat-container">
              <div
                v-for="stat in statistics.statusStats"
                :key="stat.status"
                class="status-stat-item"
              >
                <div class="status-info">
                  <span class="status-name">{{ stat.status === 'active' ? '启用' : '禁用' }}</span>
                  <span class="status-count">{{ stat.count }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.totalVideos > 0 ? (stat.count / statistics.totalVideos) * 100 : 0" 
                  :color="stat.status === 'active' ? '#67C23A' : '#F56C6C'"
                  :stroke-width="12"
                  class="status-progress"
                />
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statisticsDialogVisible = false">
            关闭
          </el-button>
          <el-button
            type="primary"
            @click="refreshStatistics"
          >
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Plus, Search, Edit, Delete, Upload, Check, Close, Refresh, Tickets, RefreshLeft, CircleCheck, CircleClose, DeleteFilled, DataAnalysis, Document, View, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../../utils/imageUtils'
import VideoPlayer from '../../components/VideoPlayer.vue'

// 后端API基础URL
const API_BASE_URL = 'https://grateful-renewal-production-b1b1.up.railway.app/api'

// 获取上传请求头（包含token）
const getUploadHeaders = () => {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

// 响应式数据
const videos = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedVideos = ref([])
const batchLoading = ref(false)
const tableRef = ref(null)
const mushroomBoxes = ref([])

const canBatchOperate = computed(() => {
  return selectedVideos.value && selectedVideos.value.length > 0 && !batchLoading.value
})

// 数据统计相关
const statisticsDialogVisible = ref(false)
const loadingStatistics = ref(false)
const statistics = ref({
  totalVideos: 0,
  totalViews: 0,
  statusStats: [],
  categoryStats: [],
  qualityStats: [],
  lastUpdated: new Date().toISOString()
})

const activeCount = computed(() => {
  const stat = statistics.value.statusStats?.find(s => s.status === 'active')
  return stat?.count || 0
})

const inactiveCount = computed(() => {
  const stat = statistics.value.statusStats?.find(s => s.status === 'inactive')
  return stat?.count || 0
})

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#00CED1', '#FF69B4', '#9370DB']
  return colors[index % colors.length]
}

// 打开统计对话框
const openStatisticsDialog = async () => {
  statisticsDialogVisible.value = true
  await loadStatistics()
}

// 加载统计数据
const loadStatistics = async () => {
  loadingStatistics.value = true
  try {
    const response = await api.get('/cooking-videos/stats')
    if (response.success && response.data) {
      statistics.value = {
        ...response.data,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败，请稍后重试')
  } finally {
    loadingStatistics.value = false
  }
}

// 刷新统计数据
const refreshStatistics = async () => {
  await loadStatistics()
  ElMessage.success('统计数据已刷新')
}

const filterForm = reactive({
  category: '',
  status: '',
  quality: ''
})

const tagsInput = ref('')
const uploadProgress = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const videoForm = ref(null)
const thumbnailFileList = ref([])
const videoFileList = ref([])

// 图片预览相关
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// 预览相关
const previewVisible = ref(false)
const previewVideoData = ref({})

// 表单数据
const form = reactive({
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  duration: 60,
  category: 'cultivation',
  mushroomBoxId: null,
  sortOrder: 0,
  tags: '',
  quality: '',
  source: '',
  status: 'active'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 2, max: 100, message: '视频标题长度应在2-100个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入视频描述', trigger: 'blur' },
    { min: 10, max: 500, message: '视频描述长度应在10-500个字符之间', trigger: 'blur' }
  ],
  videoUrl: [
    { required: true, message: '请上传视频或输入视频URL', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入视频时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '视频时长应大于0', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取分类文本
const getCategoryText = (category) => {
  const categoryMap = {
    cultivation: '培育指南',
    cooking: '烹饪教程',
    identification: '种类识别',
    general: '综合内容'
  }
  return categoryMap[category] || '综合内容'
}

// 加载盲盒列表
const loadMushroomBoxes = async () => {
  try {
    console.log('正在加载盲盒列表...')
    const response = await api.get('/boxes', { params: { limit: 1000 } })
    console.log('盲盒列表响应:', response)
    if (response.success) {
      // 兼容两种数据格式
      if (response.data && Array.isArray(response.data)) {
        mushroomBoxes.value = response.data
      } else if (response.data && response.data.boxes) {
        mushroomBoxes.value = response.data.boxes
      } else {
        mushroomBoxes.value = []
      }
      console.log('盲盒列表加载完成，数量:', mushroomBoxes.value.length)
    }
  } catch (error) {
    console.error('加载盲盒列表失败:', error)
    mushroomBoxes.value = []
  }
}

// 加载视频列表
const loadVideos = async () => {
  loading.value = true
  try {
    const response = await api.get('/cooking-videos', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
        status: filterForm.status,
        quality: filterForm.quality,
        category: filterForm.category
      }
    })
    console.log('视频列表响应:', response)
    // 兼容两种响应格式
    if (response.data && typeof response.data === 'object') {
      videos.value = Array.isArray(response.data.videos) ? response.data.videos : []
      total.value = typeof response.data.total === 'number' ? response.data.total : 0
    } else if (Array.isArray(response)) {
      videos.value = response
      total.value = response.length
    } else {
      videos.value = []
      total.value = 0
    }
    console.log('视频列表数据:', videos.value.length)
  } catch (error) {
    console.error('加载视频失败:', error)
    ElMessage.error('加载视频失败，请稍后重试')
    videos.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilters = () => {
  filterForm.category = ''
  filterForm.status = ''
  filterForm.quality = ''
  searchQuery.value = ''
  currentPage.value = 1
  loadVideos()
}

// 打开新增对话框
const openCreateDialog = () => {
  isEdit.value = false
  // 重置表单
  Object.assign(form, {
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 60,
    category: 'cultivation',
    mushroomBoxId: null,
    sortOrder: 0,
    tags: '',
    quality: '',
    source: '',
    status: 'active'
  })
  tagsInput.value = ''
  thumbnailFileList.value = []
  videoFileList.value = []
  uploadProgress.value = 0
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (video) => {
  isEdit.value = true
  // 填充表单数据
  Object.assign(form, {
    ...video,
    mushroomBoxId: video.mushroomBoxId || null
  })
  // 处理标签 - 后端可能存储为JSON字符串或数组
  let tagsArray = []
  if (video.tags) {
    if (Array.isArray(video.tags)) {
      tagsArray = video.tags
    } else if (typeof video.tags === 'string') {
      // 尝试解析JSON字符串
      try {
        const parsed = JSON.parse(video.tags)
        tagsArray = Array.isArray(parsed) ? parsed : [video.tags]
      } catch {
        // 如果不是有效的JSON，按普通字符串处理
        tagsArray = video.tags.split(',').map(t => t.trim()).filter(t => t)
      }
    }
  }
  tagsInput.value = tagsArray.join(', ') || ''
  thumbnailFileList.value = video && video.thumbnailUrl ? [{ url: getImageUrl(video.thumbnailUrl) }] : []
  videoFileList.value = video && video.videoUrl ? [{ url: video.videoUrl }] : []
  uploadProgress.value = 0
  dialogVisible.value = true
}

// 预览视频
const previewVideo = (video) => {
  previewVideoData.value = video
  previewVisible.value = true
}

// 保存视频
const saveVideo = async () => {
  if (!videoForm.value) return
  
  await videoForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const videoData = {
          ...form,
          tags: tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t) : []
        }
        
        console.log('=== 准备保存视频 ===')
        console.log('是否编辑模式:', isEdit.value)
        console.log('发送的数据:', videoData)
        
        let response
        if (isEdit.value) {
          response = await api.put(`/cooking-videos/${form.id}`, videoData)
        } else {
          response = await api.post('/cooking-videos', videoData)
        }
        
        console.log('保存成功，响应:', response)
        ElMessage.success(isEdit.value ? '视频更新成功' : '视频创建成功')
        dialogVisible.value = false
        loadVideos()
      } catch (error) {
        console.error('=== 保存视频失败 ===')
        console.error('错误详情:', error)
        console.error('错误消息:', error.message)
        console.error('错误响应:', error.response?.data)
        const errorMsg = error.response?.data?.error || error.message || '未知错误'
        ElMessage.error(isEdit.value ? `视频更新失败: ${errorMsg}` : `视频创建失败: ${errorMsg}`)
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除视频
const deleteVideo = async (id) => {
  await ElMessageBox.confirm('确定要删除这个视频吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    loading.value = true
    try {
      await api.delete(`/cooking-videos/${id}`)
      ElMessage.success('视频删除成功')
      loadVideos()
    } catch (error) {
      console.error('删除视频失败:', error)
      ElMessage.error('视频删除失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
  })
}

// 处理封面上传
const handleThumbnailUpload = (response, file) => {
  try {
    if (!file) {
      ElMessage.error('封面上传失败：文件对象不存在')
      return
    }
    if (response.success && response.data) {
      const fileUrl = response.data.url || response.data.thumbnailUrl
      if (fileUrl) {
        file.url = fileUrl
        form.thumbnailUrl = fileUrl
        ElMessage.success('封面上传成功')
      } else {
        ElMessage.error('封面上传失败：返回数据格式不正确')
      }
    } else {
      ElMessage.error('封面上传失败')
    }
  } catch (error) {
    ElMessage.error('封面上传失败：处理响应数据时出错')
  }
}

// 处理封面删除
const handleThumbnailRemove = (file) => {
  if (!file) return
  form.thumbnailUrl = ''
}

// 处理封面预览
const handleThumbnailPreview = (file) => {
  if (!file || !file.url) return
  previewImageUrl.value = getImageUrl(file.url)
  imagePreviewVisible.value = true
}

// 处理视频上传
const handleVideoUpload = (response, file) => {
  try {
    if (response.success && response.data) {
      const fileUrl = response.data.url
      if (fileUrl) {
        file.url = fileUrl
        form.videoUrl = fileUrl
        uploadProgress.value = 100
        ElMessage.success('视频上传成功')
      } else {
        uploadProgress.value = 0
        ElMessage.error('视频上传失败：返回数据格式不正确')
      }
    } else {
      uploadProgress.value = 0
      ElMessage.error('视频上传失败')
    }
  } catch (error) {
    uploadProgress.value = 0
    ElMessage.error('视频上传失败：处理响应数据时出错')
  }
}

// 处理视频上传进度
const handleVideoUploadProgress = (event) => {
  uploadProgress.value = Math.round((event.loaded / event.total) * 100)
}

// 处理视频上传错误
const handleVideoUploadError = (error) => {
  uploadProgress.value = 0
  console.error('视频上传失败:', error)
  ElMessage.error('视频上传失败，请稍后重试')
}

// 处理上传错误
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('上传失败，请稍后重试')
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadVideos()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadVideos()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedVideos.value = selection
}

// 清除选择
const clearSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  selectedVideos.value = []
}

// 批量删除视频
const batchDeleteVideos = async () => {
  if (selectedVideos.value.length === 0) {
    ElMessage.warning('请先选择要删除的视频')
    return
  }
  
  const videoListHtml = selectedVideos.value
    .slice(0, 10)
    .map(video => `• ${video.title} (ID: ${video.id})`)
    .join('<br>')
  
  const moreText = selectedVideos.value.length > 10 
    ? `<br>...还有 ${selectedVideos.value.length - 10} 个视频` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要删除以下 ${selectedVideos.value.length} 个视频吗？此操作不可恢复。</strong>
        </div>
        <div style="background-color: #fef0f0; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid #fbc4c4;">
          ${videoListHtml}${moreText}
        </div>
      `,
      '批量删除确认',
      {
        confirmButtonText: `删除 ${selectedVideos.value.length} 项`,
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedVideos.value.map(video => Number(video.id))
      const result = await api.post('/cooking-videos/bulk-delete', { ids })
      
      if (result.success) {
        ElMessage.success({
          message: `✅ 成功删除 ${selectedVideos.value.length} 个视频`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadVideos()
      }
    } catch (error) {
      console.error('批量删除视频失败:', error)
      ElMessage.error({
        message: '批量删除失败，请稍后重试',
        duration: 5000,
        showClose: true
      })
    } finally {
      batchLoading.value = false
    }
  } catch (cancelError) {
    console.log('用户取消批量删除')
  }
}

// 批量更新视频状态
const batchUpdateStatus = async (status) => {
  if (selectedVideos.value.length === 0) {
    ElMessage.warning('请先选择要操作的视频')
    return
  }
  
  const action = status === 'active' ? '启用' : '禁用'
  const bgColor = status === 'active' ? '#f0f9ff' : '#fff7ed'
  const borderColor = status === 'active' ? '#b3e5fc' : '#fed7aa'
  
  const videoListHtml = selectedVideos.value
    .slice(0, 10)
    .map(video => `• ${video.title} (ID: ${video.id})`)
    .join('<br>')
  
  const moreText = selectedVideos.value.length > 10 
    ? `<br>...还有 ${selectedVideos.value.length - 10} 个视频` 
    : ''
  
  try {
    await ElMessageBox.confirm(
      `
        <div style="margin-bottom: 10px;">
          <strong>确定要${action}以下 ${selectedVideos.value.length} 个视频吗？</strong>
        </div>
        <div style="background-color: ${bgColor}; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto; border: 1px solid ${borderColor};">
          ${videoListHtml}${moreText}
        </div>
      `,
      `批量${action}确认`,
      {
        confirmButtonText: `${action} ${selectedVideos.value.length} 项`,
        cancelButtonText: '取消',
        type: status === 'active' ? 'success' : 'warning',
        distinguishCancelAndClose: true,
        dangerouslyUseHTMLString: true
      }
    )
    
    batchLoading.value = true
    
    try {
      const ids = selectedVideos.value.map(video => Number(video.id))
      const result = await api.post('/cooking-videos/bulk-status', { ids, status })
      
      if (result.success) {
        ElMessage.success({
          message: `✅ 成功${action} ${selectedVideos.value.length} 个视频`,
          duration: 3000,
          showClose: true
        })
        clearSelection()
        await loadVideos()
      }
    } catch (error) {
      console.error(`批量${action}视频失败:`, error)
      ElMessage.error({
        message: `批量${action}失败，请稍后重试`,
        duration: 5000,
        showClose: true
      })
    } finally {
      batchLoading.value = false
    }
  } catch (cancelError) {
    console.log('用户取消批量操作')
  }
}

// 初始化
onMounted(() => {
  loadVideos()
  loadMushroomBoxes()
})
</script>

<style scoped>
.video-management {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.left-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.batch-actions-bar {
  background: linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid #bae6fd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count-tag {
  font-weight: 600;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.batch-action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  flex-shrink: 0;
}

.search-input {
  width: 300px;
}

.videos-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.video-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-thumbnail {
  width: 100px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.video-form {
  max-height: 600px;
  overflow-y: auto;
}

.video-upload,
.thumbnail-upload {
  margin-bottom: 10px;
}

.video-url-input,
.thumbnail-url-input {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.video-preview {
  padding: 20px 0;
}

.preview-video {
  width: 100%;
  height: 500px;
  object-fit: contain;
  border-radius: 8px;
}

.no-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.no-video-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.video-info {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.video-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.video-description {
  margin: 0 0 15px 0;
  color: #606266;
  line-height: 1.5;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

/* 统计相关样式 */
.statistics-content {
  padding: 10px 0;
}

.loading-statistics {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
  color: #409EFF;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.category-stat-card,
.status-stat-card {
  margin-bottom: 20px;
}

.category-stat-container,
.status-stat-container {
  padding: 10px 0;
}

.category-stat-item,
.status-stat-item {
  margin-bottom: 20px;
}

.category-info,
.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.category-name,
.status-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.category-count,
.status-count {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.category-progress,
.status-progress {
  margin-top: 5px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .batch-actions-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .batch-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>