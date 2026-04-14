<template>
  <div class="admin-box-video-upload">
    <h1>盲盒制作视频上传</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button
        type="primary"
        @click="openUploadDialog"
      >
        <el-icon><Plus /></el-icon> 上传新视频
      </el-button>
    </div>
    
    <!-- 视频列表 -->
    <el-card
      shadow="hover"
      class="videos-card"
    >
      <template #header>
        <div class="card-header">
          <span>盲盒制作视频列表</span>
          <span class="total-count">共 {{ videos.length }} 个视频</span>
        </div>
      </template>
      
      <el-table
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
                v-if="scope.row.thumbnailUrl"
                :src="scope.row.thumbnailUrl"
                alt="视频封面"
                class="video-thumbnail"
              >
              <span>{{ scope.row.title }}</span>
            </div>
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
          prop="boxId"
          label="关联盲盒"
          width="120"
        >
          <template #default="scope">
            {{ scope.row.boxId || '未关联' }}
          </template>
        </el-table-column>
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
          width="200"
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
    </el-card>
    
    <!-- 上传/编辑视频对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑视频' : '上传盲盒制作视频'"
      width="70%"
    >
      <el-form
        ref="videoForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="video-form"
      >
        <!-- 视频文件上传 -->
        <el-form-item
          label="视频文件"
          prop="videoFile"
        >
          <el-upload
            v-model:file-list="videoFileList"
            class="video-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleVideoFileChange"
            :before-upload="beforeVideoUpload"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <template #default>
              <div
                v-if="!form.videoUrl"
                class="upload-placeholder"
              >
                <el-icon class="upload-icon">
                  <VideoCamera />
                </el-icon>
                <div class="upload-text">
                  点击或拖拽上传视频
                </div>
                <div class="upload-hint">
                  支持 MP4/MOV 格式，最大 100MB
                </div>
              </div>
              <video
                v-else
                :src="form.videoUrl"
                controls
                class="uploaded-video"
              >
                您的浏览器不支持视频播放
              </video>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传清晰的盲盒制作视频，建议时长不超过5分钟
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <!-- 视频封面上传 -->
        <el-form-item
          label="视频封面"
          prop="thumbnailUrl"
        >
          <el-upload
            v-model:file-list="thumbnailFileList"
            class="thumbnail-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleThumbnailChange"
            :before-upload="beforeThumbnailUpload"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <template #default>
              <div
                v-if="!form.thumbnailUrl"
                class="upload-placeholder"
              >
                <el-icon class="upload-icon">
                  <PictureFilled />
                </el-icon>
                <div class="upload-text">
                  点击或拖拽上传封面
                </div>
                <div class="upload-hint">
                  支持 JPG/PNG 格式，最大 2MB
                </div>
              </div>
              <img
                v-else
                :src="form.thumbnailUrl"
                alt="视频封面"
                class="uploaded-thumbnail"
              >
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item
          label="视频标题"
          prop="title"
        >
          <el-input
            v-model="form.title"
            placeholder="请输入视频标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item
          label="视频描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入视频描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item
          label="视频时长"
          prop="duration"
        >
          <el-input-number
            v-model="form.duration"
            :min="1"
            :max="3600"
            :step="1"
            placeholder="请输入视频时长（秒）"
          />
        </el-form-item>
        
        <el-form-item
          label="关联盲盒ID"
          prop="boxId"
        >
          <el-input
            v-model="form.boxId"
            placeholder="请输入关联的盲盒ID"
            type="number"
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
      
      <!-- 上传进度条 -->
      <div
        v-if="isUploading"
        class="upload-progress-container"
      >
        <el-progress 
          :percentage="uploadProgress" 
          :status="uploadProgress === 100 ? 'success' : ''"
          :stroke-width="10"
          :text-inside="true"
          class="upload-progress"
        />
        <p class="upload-status">
          {{ uploadStatusText }}
        </p>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button
            :disabled="isUploading"
            @click="dialogVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            :disabled="isUploading"
            @click="saveVideo"
          >
            <template v-if="isUploading">
              <el-icon class="el-icon--left">
                <Loading />
              </el-icon>
              上传中...
            </template>
            <template v-else>
              {{ isEdit ? '保存' : '上传视频' }}
            </template>
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
          v-if="previewVideoPlayerData"
          :video="previewVideoPlayerData"
          :auto-play="true"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Search, Edit, Delete, VideoCamera, PictureFilled, Loading, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'
import VideoPlayer from '../../components/VideoPlayer.vue'

// 响应式数据
const videos = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const videoForm = ref(null)
const videoFileList = ref([])
const thumbnailFileList = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')

// 预览相关
const previewVisible = ref(false)
const previewVideoData = ref({})

// 预览视频数据转换为 VideoPlayer 组件格式
const previewVideoPlayerData = computed(() => {
  if (!previewVideoData.value) return null
  return {
    id: previewVideoData.value.id || '',
    title: previewVideoData.value.title || '预览视频',
    description: previewVideoData.value.description || '',
    videoUrl: previewVideoData.value.videoUrl || '',
    thumbnailUrl: previewVideoData.value.thumbnailUrl || '',
    duration: previewVideoData.value.duration || 0,
    viewCount: 0,
    category: 'cooking'
  }
})

// 表单数据
const form = reactive({
  id: '',
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  duration: 60,
  boxId: '',
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
  videoFile: [
    {
      required: true,
      message: '请上传视频文件',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!isEdit.value && !form.videoUrl) {
          callback(new Error('请上传视频文件'))
        } else {
          callback()
        }
      }
    }
  ],
  thumbnailUrl: [
    { required: true, message: '请上传视频封面', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入视频时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '视频时长应大于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 加载视频列表
const loadVideos = async () => {
  loading.value = true
  try {
    // 调用实际的API获取烹饪视频列表
    const response = await apiClient.contentManagement.filterVideos()
    videos.value = response.data || []
  } catch (error) {
    console.error('加载视频失败:', error)
    ElMessage.error('加载视频失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 打开上传对话框
const openUploadDialog = () => {
  isEdit.value = false
  // 重置表单
  Object.assign(form, {
    id: '',
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 60,
    boxId: '',
    status: 'active'
  })
  videoFileList.value = []
  thumbnailFileList.value = []
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (video) => {
  isEdit.value = true
  // 填充表单数据
  Object.assign(form, video)
  videoFileList.value = video.videoUrl ? [{ url: video.videoUrl }] : []
  thumbnailFileList.value = video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : []
  dialogVisible.value = true
}

// 预览视频
const previewVideo = (video) => {
  previewVideoData.value = video
  previewVisible.value = true
}

// 处理视频文件变化
const handleVideoFileChange = (file, fileList) => {
  videoFileList.value = fileList
}

// 处理封面文件变化
const handleThumbnailChange = (file, fileList) => {
  thumbnailFileList.value = fileList
}

// 视频上传前验证
const beforeVideoUpload = (file) => {
  const allowedTypes = ['video/mp4', 'video/quicktime']
  const isAllowedType = allowedTypes.includes(file.type)
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isAllowedType) {
    ElMessage.error('只允许上传 MP4、MOV 格式的视频！')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过 100MB！')
    return false
  }
  if (file.name.length > 255) {
    ElMessage.error('文件名长度不能超过 255 个字符！')
    return false
  }

  return true
}

// 封面上传前验证
const beforeThumbnailUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const isAllowedType = allowedTypes.includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isAllowedType) {
    ElMessage.error('只允许上传 JPG、PNG、WebP、GIF 格式的图片！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }

  return true
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传 1 个文件！')
}

// 保存视频
const saveVideo = async () => {
  if (!videoForm.value) return
  
  await videoForm.value.validate(async (valid) => {
    if (valid) {
      try {
        if (!isEdit.value && videoFileList.value.length > 0) {
          // 上传视频文件
          isUploading.value = true
          uploadProgress.value = 0
          uploadStatusText.value = '正在上传视频...'
          
          // 创建FormData对象
          const formData = new FormData()
          formData.append('title', form.title)
          formData.append('description', form.description)
          formData.append('duration', form.duration)
          formData.append('boxId', form.boxId)
          formData.append('status', form.status)
          formData.append('video', videoFileList.value[0].raw)
          
          if (thumbnailFileList.value.length > 0 && thumbnailFileList.value[0].raw) {
            formData.append('thumbnail', thumbnailFileList.value[0].raw)
          }
          
          // 模拟上传进度
          let progress = 0
          const interval = setInterval(() => {
            progress += 10
            uploadProgress.value = progress
            if (progress >= 100) {
              clearInterval(interval)
            }
          }, 500)
          
          // 调用实际的API上传视频
          const response = await apiClient.contentManagement.uploadVideo(formData)
          
          clearInterval(interval)
          uploadProgress.value = 100
          uploadStatusText.value = '上传完成！'
          
          // 添加新视频到列表
          videos.value.push(response.data)
          ElMessage.success('视频上传成功')
          dialogVisible.value = false
          isUploading.value = false
        } else {
          // 编辑视频信息
          const updatedVideo = {
            ...form
          }
          
          // 这里可以添加视频更新的API调用
          // 暂时使用模拟数据
          const index = videos.value.findIndex(v => v.id === form.id)
          if (index !== -1) {
            videos.value[index] = updatedVideo
          }
          ElMessage.success('视频信息更新成功')
          dialogVisible.value = false
        }
      } catch (error) {
        console.error('保存视频失败:', error)
        ElMessage.error(isEdit.value ? '视频更新失败' : '视频上传失败')
        isUploading.value = false
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
    try {
      // 调用实际的API删除视频
      await apiClient.contentManagement.deleteVideo(id)
      videos.value = videos.value.filter(v => v.id !== id)
      ElMessage.success('视频删除成功')
    } catch (error) {
      console.error('删除视频失败:', error)
      ElMessage.error('视频删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 选择处理
const handleSelectionChange = (selection) => {
  // 可以在这里处理批量操作
}

// 初始化
onMounted(() => {
  loadVideos()
})
</script>

<style scoped>
.admin-box-video-upload {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
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
  width: 80px;
  height: 45px;
  border-radius: 4px;
  object-fit: cover;
}

.video-form {
  max-height: 600px;
  overflow-y: auto;
}

.video-uploader {
  margin-bottom: 20px;
}

.thumbnail-uploader {
  margin-bottom: 20px;
}

.upload-placeholder {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #4CAF50;
  background: #f6fff6;
}

.upload-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
}

.uploaded-video {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
}

.uploaded-thumbnail {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-progress-container {
  margin-top: 20px;
}

.upload-progress {
  margin-bottom: 10px;
}

.upload-status {
  text-align: center;
  color: #666;
  font-size: 14px;
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

@media (max-width: 768px) {
  .admin-box-video-upload {
    padding: 10px;
  }

  .upload-placeholder {
    padding: 30px 15px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .preview-video {
    height: 300px;
  }
}
</style>