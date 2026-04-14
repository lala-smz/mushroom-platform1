<template>
  <div class="mushroom-kitchen-upload">
    <div class="upload-container">
      <h1>上传菌菇作品</h1>
      <p class="upload-subtitle">
        分享你的菌菇美食创意，让更多人看到
      </p>
      
      <el-form 
        ref="uploadForm" 
        :model="formData" 
        :rules="formRules"
        class="upload-form"
      >
        <el-form-item
          label="作品图片"
          prop="image"
        >
          <el-upload
            v-model:file-list="imageFileList"
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :limit="1"
            :on-exceed="handleExceed"
            list-type="picture-card"
            :on-remove="handleRemove"
            name="files"
          >
            <template #default="{ file }">
              <img
                :src="file?.url ?? ''"
                class="upload-image"
              >
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  @click.stop="handlePreview(file)"
                >
                  <el-icon><ZoomIn /></el-icon>
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click.stop="handleRemove(file)"
                >
                  <el-icon><Delete /></el-icon>
                </span>
              </span>
            </template>
            <template #trigger>
              <el-button type="primary">
                <el-icon><Plus /></el-icon> 上传图片
              </el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传清晰的菌菇菜肴图片，建议尺寸为 800x600 像素，大小不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item
          label="作品标题"
          prop="title"
        >
          <el-input 
            v-model="formData.title" 
            placeholder="请输入作品标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item
          label="菌菇种类"
          prop="mushroomType"
        >
          <el-select 
            v-model="formData.mushroomType" 
            placeholder="请选择菌菇种类"
            class="w-full"
          >
            <el-option 
              v-for="category in mushroomCategories" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="作品评分"
          prop="rating"
        >
          <div class="rating-section">
            <el-rate 
              v-model="formData.rating" 
              :max="5" 
              :texts="['1星', '2星', '3星', '4星', '5星']" 
              show-text
            />
            <p class="rating-hint">
              请为你的作品进行评分（1-5星）
            </p>
          </div>
        </el-form-item>
        
        <el-form-item
          label="作品描述"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述你的菌菇菜肴，包括制作方法、口感特点等"
            maxlength="500"
            show-word-limit
          />
          <p class="description-hint">
            描述字数限制：50-500字
          </p>
        </el-form-item>
        
        <el-form-item class="submit-section">
          <el-button 
            type="primary" 
            :loading="isSubmitting" 
            size="large"
            class="submit-button"
            :disabled="isSubmitting"
            @click="submitForm"
          >
            <template v-if="isSubmitting">
              <el-icon class="el-icon--left">
                <Loading />
              </el-icon>
              发布中...
            </template>
            <template v-else>
              发布作品
            </template>
          </el-button>
          <el-button 
            size="large"
            :disabled="isSubmitting"
            @click="cancelUpload"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-dialog v-model="previewDialogVisible">
      <img
        :src="previewImageUrl"
        class="preview-image"
      >
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Loading, ZoomIn, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiClient } from '../api/index'
import { useWorkStore } from '../stores/useWorkStore'
import { useUserStore } from '../stores/useUserStore'
import eventBus, { EventTypes } from '../utils/eventBus'

const router = useRouter()
const workStore = useWorkStore()
const userStore = useUserStore()

const uploadUrl = '/api/upload'

const formData = reactive({
  title: '',
  image: '',
  mushroomType: '',
  rating: 5,
  description: ''
})

const imageFileList = ref([])
const isSubmitting = ref(false)
const uploadForm = ref(null)
const abortController = ref(null)
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

const mushroomCategories = [
  { value: 'shiitake', label: '香菇' },
  { value: 'oyster', label: '平菇' },
  { value: 'enoki', label: '金针菇' },
  { value: 'king', label: '杏鲍菇' },
  { value: '松茸', label: '松茸' },
  { value: 'other', label: '其他' }
]

const formRules = {
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度为 2-50 个字符', trigger: 'blur' },
    { pattern: /^[^\s]+(\s+[^\s]+)*$/, message: '标题不能只包含空白字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传作品图片', trigger: 'change' }
  ],
  mushroomType: [
    { required: true, message: '请选择菌菇种类', trigger: 'change' }
  ],
  rating: [
    { required: true, message: '请为作品评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分必须在 1-5 星之间', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入作品描述', trigger: 'blur' },
    { min: 50, max: 500, message: '描述长度为 50-500 个字符', trigger: 'blur' },
    { pattern: /^[^\s]+(\s+[^\s]+)*$/, message: '描述不能只包含空白字符', trigger: 'blur' }
  ]
}

watch(imageFileList, (newList) => {
  if (newList && newList.length > 0) {
    formData.image = newList[0]?.url ?? ''
  } else {
    formData.image = ''
  }
}, { deep: true })

const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
  const isAllowedType = allowedTypes.includes(file.type)
  if (!isAllowedType) {
    ElMessage.error('只能上传 JPG、PNG、WebP、GIF 格式的图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  return true
}

const handleUploadSuccess = (response, file) => {
  try {
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      const filePath = response.data[0].path || response.data[0].url
      if (filePath) {
        file.url = filePath
        formData.image = filePath
        ElMessage.success('图片上传成功')
      } else {
        file.url = ''
        ElMessage.error('图片上传失败：返回数据格式不正确')
        console.error('上传成功但返回数据格式不正确:', response)
      }
    } else {
      file.url = ''
      ElMessage.error('图片上传失败：返回数据格式不正确')
      console.error('上传成功但返回数据格式不正确:', response)
    }
  } catch (error) {
    file.url = ''
    ElMessage.error('图片上传失败：处理响应数据时出错')
    console.error('处理上传成功响应时出错:', error)
  }
}

const handleUploadError = (error, file) => {
  file.url = ''
  let errorMessage = '图片上传失败'
  
  if (error && error.response) {
    const { status, data } = error.response
    if (data && data.error) {
      errorMessage = data.error
    } else if (status === 400) {
      errorMessage = '请求参数错误，请检查上传配置'
    } else if (status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (status === 404) {
      errorMessage = '上传接口不存在，请检查服务配置'
    } else if (status === 413) {
      errorMessage = '文件大小超过限制'
    }
  } else if (error && error.message) {
    if (error.message.includes('ERR_CONNECTION_RESET')) {
      errorMessage = '服务器连接重置，请检查服务器配置'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    }
  }
  
  ElMessage.error(errorMessage)
  console.error('上传失败:', error)
}

const handleExceed = () => {
  ElMessage.error('最多只能上传1张图片')
}

const handlePreview = (file) => {
  if (file?.url) {
    previewImageUrl.value = file.url
    previewDialogVisible.value = true
  }
}

const handleRemove = () => {
  if (imageFileList.value.length === 0) {
    formData.image = ''
  }
}

const submitForm = async () => {
  try {
    await uploadForm.value.validate()
    
    isSubmitting.value = true
    
    if (!formData.image) {
      ElMessage.error('请上传作品图片')
      return
    }
    
    const userId = userStore.userInfo?.id || 1
    if (!userId || userId <= 0) {
      ElMessage.error('用户信息无效，请重新登录')
      return
    }
    
    abortController.value = new AbortController()
    
    const response = await apiClient.work.upload({
      title: formData.title,
      description: formData.description,
      rating: formData.rating,
      mushroomType: formData.mushroomType,
      userId: userId,
      image: formData.image
    }, {
      signal: abortController.value.signal
    })
    
    ElMessage.success('作品发布成功！')
    
    // 触发作品上传成功事件，通知其他页面刷新
    eventBus.emit(EventTypes.WORK_UPLOADED, { userId })
    
    router.push(`/mushroom-kitchen/user/${userId}`)
  } catch (error) {
    console.error('提交失败:', error)
    
    if (error && error.name === 'AbortError') {
      console.log('上传被取消')
      return
    } else if (error && error.response) {
      const errorMessage = error.response.data?.error || '上传失败，请稍后重试'
      ElMessage.error(errorMessage)
    } else if (error && error.message) {
      ElMessage.error(error.message)
    } else if (error && typeof error === 'string') {
      ElMessage.error(error)
    } else if (error && error.name === 'TimeoutError') {
      ElMessage.error('上传超时，请检查网络连接后重试')
    } else if (error && error.name === 'NetworkError') {
      ElMessage.error('网络错误，请检查网络连接后重试')
    } else {
      ElMessage.error('提交失败，请稍后重试')
    }
  } finally {
    isSubmitting.value = false
    abortController.value = null
  }
}

const cancelUpload = () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  
  router.push('/mushroom-kitchen')
}

onMounted(() => {
  // 页面挂载时，重置所有表单和图片列表，清除上一个商品的照片
  formData.title = ''
  formData.image = ''
  formData.mushroomType = ''
  formData.rating = 5
  formData.description = ''
  imageFileList.value = []
})

onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
})
</script>

<style scoped>
.mushroom-kitchen-upload {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 40px 20px;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.upload-container h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.upload-subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.upload-form {
  width: 100%;
}

.upload-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rating-section {
  margin-top: 10px;
}

.rating-hint {
  margin-top: 10px;
  color: #999;
  font-size: 0.9rem;
}

.description-hint {
  margin-top: 8px;
  color: #999;
  font-size: 0.9rem;
}

.submit-section {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.submit-button {
  min-width: 180px;
}

@media (max-width: 768px) {
  .mushroom-kitchen-upload {
    padding: 20px 15px;
  }

  .upload-container {
    padding: 30px 20px;
  }

  .upload-container h1 {
    font-size: 1.6rem;
  }

  .submit-section {
    flex-direction: column;
    align-items: center;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
