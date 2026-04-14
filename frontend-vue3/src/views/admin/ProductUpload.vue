<template>
  <div class="product-upload-container">
    <h2>{{ isEdit ? '编辑商品' : '上传商品' }}</h2>
    
    <div
      v-loading="productStore.loading"
      class="upload-form"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <!-- 商品基本信息 -->
        <el-form-item
          label="商品名称"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入商品名称"
            size="large"
          />
        </el-form-item>
        
        <el-form-item
          label="一级分类"
          prop="category"
        >
          <el-select
            v-model="form.category"
            placeholder="请选择一级分类"
            size="large"
            @change="handleCategoryChange"
          >
            <el-option
              v-for="category in level1Categories"
              :key="category.key"
              :value="category.key"
              :label="category.label"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="二级分类"
          prop="subCategory"
        >
          <el-select
            v-model="form.subCategory"
            placeholder="请选择二级分类"
            size="large"
            :disabled="!form.category"
            @change="handleSubCategoryChange"
          >
            <el-option
              v-for="category in level2Categories"
              :key="category.key"
              :value="category.key"
              :label="category.label"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="三级分类"
          prop="subSubCategory"
        >
          <el-select
            v-model="form.subSubCategory"
            placeholder="请选择三级分类（可选）"
            size="large"
            :disabled="!form.subCategory"
          >
            <el-option
              v-for="category in level3Categories"
              :key="category.key"
              :value="category.key"
              :label="category.label"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="商品价格"
          prop="price"
        >
          <el-input-number
            v-model="form.price"
            :min="0.01"
            :step="0.01"
            :precision="2"
            size="large"
          />
        </el-form-item>
        
        <el-form-item
          label="库存数量"
          prop="stock"
        >
          <el-input-number
            v-model="form.stock"
            :min="0"
            size="large"
          />
        </el-form-item>
        
        <!-- 商品描述 -->
        <el-form-item
          label="商品描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="5"
            placeholder="请输入商品描述"
            size="large"
          />
        </el-form-item>
        
        <!-- 商品图片 -->
        <el-form-item
          label="商品图片"
          prop="images"
        >
          <el-upload
            v-model:file-list="fileList"
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
            :limit="5"
            :on-exceed="handleExceed"
            list-type="picture-card"
            :on-remove="handleRemove"
            name="files"
          >
            <template #default="{ file }">
              <img
                :src="getImageUrl(file?.url ?? file?.url)"
                class="upload-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
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
              <el-button
                type="primary"
                size="small"
              >
                <el-icon><Plus /></el-icon>
                上传图片
              </el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传不超过5张图片，支持JPG、PNG、WebP格式，单张图片大小不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="productStore.loading"
            @click="submitForm"
          >
            {{ isEdit ? '保存修改' : '上传商品' }}
          </el-button>
          <el-button
            size="large"
            @click="resetForm"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewDialogVisible">
      <img
        :src="previewImageUrl"
        class="preview-image"
      >
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElUpload, ElMessageBox } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { useProductStore } from '../../stores/useProductStore'
import { useUserStore } from '../../stores/useUserStore'
import { message } from '../../utils/message'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../../utils/imageUtils'
import { apiClient } from '../../api'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const formRef = ref()

// 上传URL
const uploadUrl = '/api/upload'

// 是否为编辑模式
const isEdit = computed(() => !!route.query.id)

// 商品表单
const form = ref({
  name: '',
  category: '',
  subCategory: '',
  subSubCategory: '',
  price: 0,
  stock: 0,
  description: '',
  images: []
})

// 文件列表
const fileList = ref([])

// 三级分类数据
const level1Categories = ref([])
const level2Categories = ref([])
const level3Categories = ref([])

// 加载一级分类
const loadLevel1Categories = async () => {
  try {
    const response = await apiClient.product.getCategories()
    if (response.success && response.data) {
      level1Categories.value = response.data
    }
  } catch (error) {
    console.error('加载一级分类失败:', error)
  }
}

// 加载二级分类
const loadLevel2Categories = async (level1Key) => {
  level2Categories.value = []
  level3Categories.value = []
  form.value.subCategory = ''
  form.value.subSubCategory = ''
  
  if (!level1Key) return
  
  try {
    const response = await apiClient.product.getLevel2Categories(level1Key)
    if (response.success && response.data) {
      level2Categories.value = response.data
    }
  } catch (error) {
    console.error('加载二级分类失败:', error)
  }
}

// 加载三级分类
const loadLevel3Categories = async (level2Key) => {
  level3Categories.value = []
  form.value.subSubCategory = ''
  
  if (!level2Key) return
  
  try {
    const response = await apiClient.product.getLevel3Categories(level2Key)
    if (response.success && response.data) {
      level3Categories.value = response.data
    }
  } catch (error) {
    console.error('加载三级分类失败:', error)
  }
}

// 一级分类变化处理
const handleCategoryChange = (value) => {
  loadLevel2Categories(value)
}

// 二级分类变化处理
const handleSubCategoryChange = (value) => {
  loadLevel3Categories(value)
}

// 图片预览
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在2-100个字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择一级分类', trigger: 'change' }
  ],
  subCategory: [
    { required: true, message: '请选择二级分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '商品价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存数量必须大于等于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, message: '商品描述至少10个字符', trigger: 'blur' }
  ],
  images: [
    { required: true, message: '请上传至少一张商品图片', trigger: 'change' }
  ]
}

// 监听文件列表变化
watch(fileList, (newList) => {
  form.value.images = newList.map(file => file?.url ?? '').filter(url => url)
}, { deep: true })

// 上传前验证
const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    message.error('只能上传JPG、PNG或WebP图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过5MB')
    return false
  }
  return true
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
  try {
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      // 从响应中获取文件路径，优先使用path，其次使用url
      const filePath = response.data[0].path || response.data[0].url
      if (filePath) {
        file.url = filePath
        message.success('图片上传成功')
      } else {
        file.url = '' // 确保file.url存在，避免后续错误
        message.error('图片上传失败：返回数据格式不正确')
        console.error('上传成功但返回数据格式不正确:', response)
      }
    } else {
      file.url = '' // 确保file.url存在，避免后续错误
      message.error('图片上传失败：返回数据格式不正确')
      console.error('上传成功但返回数据格式不正确:', response)
    }
  } catch (error) {
    file.url = '' // 确保file.url存在，避免后续错误
    message.error('图片上传失败：处理响应数据时出错')
    console.error('处理上传成功响应时出错:', error)
  }
}

// 上传失败处理
const handleUploadError = (error, file) => {
  file.url = '' // 确保file.url存在，避免后续错误
  let errorMessage = '图片上传失败'
  
  // 从错误响应中提取更详细的错误信息
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
    // 网络错误或其他错误
    if (error.message.includes('ERR_CONNECTION_RESET')) {
      errorMessage = '服务器连接重置，请检查服务器配置'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    }
  }
  
  message.error(errorMessage)
  console.error('上传失败:', error)
}

// 文件超出限制处理
const handleExceed = () => {
  message.error('最多只能上传5张图片')
}

// 图片预览
const handlePreview = (file) => {
  if (file?.url) {
    previewImageUrl.value = file.url
    previewDialogVisible.value = true
  }
}

// 移除图片
const handleRemove = () => {
  // 更新图片列表
  form.value.images = fileList.value.map(file => file?.url ?? '').filter(url => url)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value) {
      // 编辑商品
      await productStore.updateProduct(route.query.id, form.value)
      message.success('商品修改成功')
      // 提供选项：返回商品列表或继续编辑
      ElMessageBox.confirm('商品修改成功，是否前往商品管理页面？', '提示', {
        confirmButtonText: '前往管理',
        cancelButtonText: '继续编辑',
        type: 'success'
      }).then(() => {
        router.push('/admin/products')
      }).catch(() => {
        // 继续编辑
      })
    } else {
        // 上传新商品
        await productStore.createProduct(form.value)
        // 根据用户角色显示不同的提示信息
        const userStore = useUserStore()
        const isAdmin = userStore.isAdmin
        const successMessage = isAdmin ? '商品上传成功，已自动通过审核' : '商品上传成功，等待审核'
        const confirmMessage = isAdmin ? '商品上传成功，已自动通过审核。是否前往商品管理页面？' : '商品上传成功，等待审核。是否前往商品管理页面？'
        
        message.success(successMessage)
        // 提供选项：返回商品列表或继续上传
        ElMessageBox.confirm(confirmMessage, '提示', {
          confirmButtonText: '前往管理',
          cancelButtonText: '继续上传',
          type: 'success'
        }).then(() => {
          router.push(isAdmin ? '/admin/products' : '/seller/products')
        }).catch(() => {
          // 继续上传
          resetForm()
        })
      }
  } catch (error) {
    message.error(error.message || '操作失败')
    console.error('提交表单失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  fileList.value = []
  form.value.images = []
}

// 获取商品详情（编辑模式）
const fetchProductDetail = async () => {
  if (!isEdit.value) return
  
  try {
    await productStore.getProductDetail(route.query.id)
    const product = productStore.productDetail
    if (product) {
      form.value = {
        name: product.name,
        category: product.category,
        subCategory: product.subCategory || '',
        subSubCategory: product.subSubCategory || '',
        price: product.price,
        stock: product.stock,
        description: product.description,
        images: product.images || []
      }
      // 初始化文件列表
      fileList.value = (Array.isArray(product.images) ? product.images : []).map((image, index) => ({
        id: index,
        url: getImageUrl(image || ''), // 确保url存在并使用getImageUrl处理
        name: `image${index + 1}`
      })).filter(item => item.url) // 过滤掉空url的文件
      
      // 加载二级和三级分类
      if (product.category) {
        await loadLevel2Categories(product.category)
        if (product.subCategory) {
          await loadLevel3Categories(product.subCategory)
        }
      }
    }
  } catch (error) {
    message.error(error.message || '获取商品详情失败')
  }
}

onMounted(() => {
  // 加载一级分类
  loadLevel1Categories()
  
  if (isEdit.value) {
    fetchProductDetail()
  }
})
</script>

<style scoped>
.product-upload-container {
  padding: 20px 0;
}

.product-upload-container h2 {
  margin-bottom: 20px;
  color: #333;
}

.upload-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.upload-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .upload-form {
    padding: 20px;
  }
}
</style>