<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑作品"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="edit-work-form"
    >
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
        label="作品描述"
        prop="description"
      >
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入作品描述"
          maxlength="500"
          show-word-limit
          rows="4"
        />
      </el-form-item>
      
      <el-form-item
        label="菌菇类型"
        prop="mushroomType"
      >
        <el-select
          v-model="formData.mushroomType"
          placeholder="请选择菌菇类型"
        >
          <el-option
            label="香菇"
            value="shiitake"
          />
          <el-option
            label="平菇"
            value="oyster"
          />
          <el-option
            label="金针菇"
            value="enoki"
          />
          <el-option
            label="杏鲍菇"
            value="king"
          />
          <el-option
            label="松茸"
            value="松茸"
          />
          <el-option
            label="其他"
            value="other"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item
        label="作品评分"
        prop="rating"
      >
        <el-rate
          v-model="formData.rating"
          :max="5"
          show-score
          text-color="#ff9900"
          score-template="{value}星"
        />
      </el-form-item>
      
      <el-form-item label="作品图片">
        <el-upload
          v-model:file-list="fileList"
          class="avatar-uploader"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          accept="image/*"
        >
          <el-button type="primary">
            点击上传
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 JPG、PNG、GIF 格式的图片，且不超过 10MB
            </div>
          </template>
        </el-upload>
        <div
          v-if="formData.imageUrl"
          class="preview-image"
        >
          <img
            :src="formData.imageUrl"
            alt="作品图片"
          >
          <el-button
            type="danger"
            size="small"
            @click="removeImage"
          >
            删除图片
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  work: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'update:work'])

// 响应式数据
const dialogVisible = ref(props.visible)
const formRef = ref(null)
const loading = ref(false)
const fileList = ref([])

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  mushroomType: '',
  rating: 5,
  imageUrl: ''
})

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度必须在 2-50 个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入作品描述', trigger: 'blur' },
    { min: 50, max: 500, message: '描述长度必须在 50-500 个字符之间', trigger: 'blur' }
  ],
  mushroomType: [
    { required: true, message: '请选择菌菇类型', trigger: 'change' }
  ],
  rating: [
    { required: true, message: '请选择作品评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分必须在 1-5 星之间', trigger: 'change' }
  ]
})

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听 work 变化
watch(() => props.work, (newVal) => {
  if (newVal) {
    formData.title = newVal.title || ''
    formData.description = newVal.description || ''
    formData.mushroomType = newVal.mushroomType || ''
    formData.rating = newVal.rating || 5
    formData.imageUrl = newVal.imageUrl || ''
    fileList.value = []
  }
}, { deep: true, immediate: true })

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 处理文件上传
const handleFileChange = (file) => {
  fileList.value = [file]
}

// 处理文件超出限制
const handleExceed = (files) => {
  ElMessage.warning(`只能上传一个文件，已自动忽略多余的 ${files.length - 1} 个文件`)
}

// 上传前验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG、PNG、GIF 格式的图片！')
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
  }
  
  return isJpgOrPng && isLt10M
}

// 移除图片
const removeImage = () => {
  formData.imageUrl = ''
  fileList.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 构建表单数据
        const formDataToSubmit = new FormData()
        formDataToSubmit.append('userId', props.work.userId)
        formDataToSubmit.append('title', formData.title)
        formDataToSubmit.append('description', formData.description)
        formDataToSubmit.append('mushroomType', formData.mushroomType)
        formDataToSubmit.append('rating', formData.rating)
        
        // 添加文件
        if (fileList.value.length > 0 && fileList.value[0].raw) {
          formDataToSubmit.append('files', fileList.value[0].raw)
        }
        
        emit('update:work', formDataToSubmit)
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('提交失败，请稍后重试')
        console.error('提交失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.edit-work-form {
  margin-top: 20px;
}

.preview-image {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>