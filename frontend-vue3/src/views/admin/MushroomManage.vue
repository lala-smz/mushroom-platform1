<template>
  <div class="mushroom-manage-container">
    <h1>蘑菇数据管理</h1>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
        type="primary"
        @click="openCreateDialog"
      >
        添加蘑菇
      </el-button>
      <el-select
        v-model="seasonFilter"
        placeholder="按季节筛选"
        size="large"
        style="margin-left: 20px;"
      >
        <el-option
          value=""
          label="全部季节"
        />
        <el-option
          v-for="season in mushroomStore.seasons"
          :key="season.value"
          :value="season.value"
          :label="season.label"
        />
      </el-select>
    </div>
    
    <!-- 加载状态 -->
    <el-skeleton
      v-if="mushroomStore.loading && mushroomStore.mushrooms.length === 0"
      :rows="3"
      animated
    />
    
    <!-- 蘑菇列表 -->
    <div
      v-else
      class="mushrooms-grid"
    >
      <div 
        v-for="mushroom in filteredMushrooms" 
        :key="mushroom.id" 
        class="mushroom-card"
      >
        <div class="mushroom-image">
          <img
            :src="mushroom.image || '/images/placeholder-mushroom-300.svg'"
            :alt="mushroom.name"
            @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
          >
        </div>
        <div class="mushroom-info">
          <div class="mushroom-header">
            <h3 class="mushroom-name">
              {{ mushroom.name }}
            </h3>
            <div class="mushroom-seasons">
              <span 
                v-for="season in mushroom.seasons" 
                :key="season"
                class="season-tag"
              >
                {{ getSeasonLabel(season) }}
              </span>
            </div>
          </div>
          <p class="mushroom-scientific">
            {{ mushroom.scientificName }}
          </p>
          <p class="mushroom-description">
            {{ mushroom.characteristics }}
          </p>
          <div class="mushroom-meta">
            <span class="edibility">{{ mushroom.edibility }}</span>
            <span
              class="difficulty"
              :class="mushroom.difficulty"
            >{{ mushroom.difficulty }}</span>
          </div>
          <div class="mushroom-actions">
            <el-button
              type="primary"
              size="small"
              @click="openEditDialog(mushroom)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(mushroom.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div
        v-if="filteredMushrooms.length === 0"
        class="empty-state"
      >
        <el-empty description="暂无蘑菇数据" />
      </div>
    </div>
    
    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑蘑菇' : '添加蘑菇'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item
          label="蘑菇名称"
          prop="name"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入蘑菇名称"
          />
        </el-form-item>
        <el-form-item
          label="科学名称"
          prop="scientificName"
        >
          <el-input
            v-model="formData.scientificName"
            placeholder="请输入科学名称"
          />
        </el-form-item>
        <el-form-item
          label="生长季节"
          prop="seasons"
        >
          <el-checkbox-group v-model="formData.seasons">
            <el-checkbox
              v-for="season in mushroomStore.seasons"
              :key="season.value"
              :label="season.value"
            >
              {{ season.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          label="形态特征"
          prop="characteristics"
        >
          <el-input
            v-model="formData.characteristics"
            type="textarea"
            :rows="3"
            placeholder="请输入形态特征"
          />
        </el-form-item>
        <el-form-item
          label="生长环境"
          prop="environment"
        >
          <el-input
            v-model="formData.environment"
            type="textarea"
            :rows="2"
            placeholder="请输入生长环境"
          />
        </el-form-item>
        <el-form-item
          label="食用安全性"
          prop="edibility"
        >
          <el-input
            v-model="formData.edibility"
            placeholder="请输入食用安全性"
          />
        </el-form-item>
        <el-form-item
          label="培育难度"
          prop="difficulty"
        >
          <el-select
            v-model="formData.difficulty"
            placeholder="请选择培育难度"
          >
            <el-option
              label="简单"
              value="easy"
            />
            <el-option
              label="中等"
              value="medium"
            />
            <el-option
              label="困难"
              value="hard"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片URL"
          prop="image"
        >
          <el-input
            v-model="formData.image"
            placeholder="请输入图片URL"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
          >保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMushroomStore } from '../../stores/useMushroomStore'

const mushroomStore = useMushroomStore()
const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref(null)
const seasonFilter = ref('')

// 表单数据
const formData = ref({
  name: '',
  scientificName: '',
  seasons: [],
  characteristics: '',
  environment: '',
  edibility: '',
  difficulty: 'easy',
  image: ''
})

// 表单验证规则
const formRules = ref({
  name: [{ required: true, message: '请输入蘑菇名称', trigger: 'blur' }],
  scientificName: [{ required: true, message: '请输入科学名称', trigger: 'blur' }],
  seasons: [{ required: true, message: '请选择生长季节', trigger: 'change' }],
  characteristics: [{ required: true, message: '请输入形态特征', trigger: 'blur' }],
  environment: [{ required: true, message: '请输入生长环境', trigger: 'blur' }],
  edibility: [{ required: true, message: '请输入食用安全性', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择培育难度', trigger: 'change' }]
})

// 过滤后的蘑菇列表
const filteredMushrooms = computed(() => {
  if (!seasonFilter.value) return mushroomStore.mushrooms
  return mushroomStore.mushroomsBySeason(seasonFilter.value)
})

// 获取季节标签
const getSeasonLabel = (seasonValue) => {
  const season = mushroomStore.seasons.find(s => s.value === seasonValue)
  return season ? season.label : seasonValue
}

// 打开创建对话框
const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    name: '',
    scientificName: '',
    seasons: [],
    characteristics: '',
    environment: '',
    edibility: '',
    difficulty: 'easy',
    image: ''
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (mushroom) => {
  isEditing.value = true
  formData.value = {
    ...mushroom
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (isEditing.value) {
      // 更新蘑菇
      await mushroomStore.updateMushroom(formData.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      // 创建蘑菇
      await mushroomStore.createMushroom(formData.value)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写')
  }
}

// 确认删除
const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除这个蘑菇数据吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await mushroomStore.deleteMushroom(id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 组件挂载时获取蘑菇数据
onMounted(async () => {
  await mushroomStore.fetchMushrooms()
})
</script>

<style scoped>
.mushroom-manage-container {
  padding: 20px;
}

.mushroom-manage-container h1 {
  margin-bottom: 30px;
  color: #333;
}

.action-buttons {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}

.mushrooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
}

.mushroom-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.mushroom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.mushroom-image {
  height: 200px;
  overflow: hidden;
}

.mushroom-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mushroom-card:hover .mushroom-image img {
  transform: scale(1.05);
}

.mushroom-info {
  padding: 20px;
}

.mushroom-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.mushroom-name {
  font-size: 1.3rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.mushroom-seasons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.season-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.mushroom-scientific {
  font-style: italic;
  color: #666;
  margin: 5px 0 15px 0;
}

.mushroom-description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mushroom-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.edibility {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.difficulty {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.difficulty.easy {
  background: #e8f5e8;
  color: #4caf50;
}

.difficulty.medium {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty.hard {
  background: #ffebee;
  color: #f44336;
}

.mushroom-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .mushrooms-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .mushroom-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>