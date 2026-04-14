<template>
  <div class="category-management">
    <h1>分类与标签管理</h1>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="tabs">
        <el-button 
          :type="activeTab === 'category' ? 'primary' : ''" 
          @click="activeTab = 'category'"
        >
          分类管理
        </el-button>
        <el-button 
          :type="activeTab === 'tag' ? 'primary' : ''" 
          @click="activeTab = 'tag'"
        >
          标签管理
        </el-button>
      </div>
      <div class="actions">
        <el-button
          type="primary"
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon> 新增
        </el-button>
      </div>
    </div>
    
    <!-- 分类管理 -->
    <div v-show="activeTab === 'category'">
      <el-card
        shadow="hover"
        class="items-card"
      >
        <template #header>
          <div class="card-header">
            <span>分类列表</span>
            <span class="total-count">共 {{ categories.length }} 个分类</span>
          </div>
        </template>
        
        <el-table
          v-loading="loading"
          :data="categories"
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
          />
          <el-table-column
            prop="name"
            label="分类名称"
            min-width="150"
          />
          <el-table-column
            prop="description"
            label="描述"
            min-width="200"
          />
          <el-table-column
            prop="sortOrder"
            label="排序"
            width="100"
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
            width="180"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="openEditDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteItem(scope.row.id, 'category')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 标签管理 -->
    <div v-show="activeTab === 'tag'">
      <el-card
        shadow="hover"
        class="items-card"
      >
        <template #header>
          <div class="card-header">
            <span>标签列表</span>
            <span class="total-count">共 {{ tags.length }} 个标签</span>
          </div>
        </template>
        
        <el-table
          v-loading="loading"
          :data="tags"
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
          />
          <el-table-column
            prop="name"
            label="标签名称"
            min-width="150"
          >
            <template #default="scope">
              <span
                class="tag-preview"
                :style="{ backgroundColor: scope.row.color || '#409eff' }"
              >
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="颜色"
            width="150"
          >
            <template #default="scope">
              <div class="color-preview">
                <div
                  class="color-box"
                  :style="{ backgroundColor: scope.row.color || '#409eff' }"
                />
                <span>{{ scope.row.color || '#409eff' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="usageCount"
            label="使用次数"
            width="100"
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
            width="180"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="openEditDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteItem(scope.row.id, 'tag')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item
          :label="activeTab === 'category' ? '分类名称' : '标签名称'"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item
          v-if="activeTab === 'category'"
          label="描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item
          v-if="activeTab === 'category'"
          label="排序"
          prop="sortOrder"
        >
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
          />
        </el-form-item>
        <el-form-item
          v-if="activeTab === 'tag'"
          label="颜色"
          prop="color"
        >
          <div class="color-picker">
            <el-color-picker v-model="form.color" />
            <span class="color-value">{{ form.color }}</span>
          </div>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
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
            @click="saveItem"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api/index.js'

// 响应式数据
const activeTab = ref('category')
const categories = ref([])
const tags = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  sortOrder: 0,
  color: '#409eff',
  status: 'active'
})

// 表单验证规则
const rules = computed(() => ({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ]
}))

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'category') {
      const response = await api.get('/categories/categories')
      if (response.success) {
        categories.value = response.data || []
      }
    } else {
      const response = await api.get('/categories/tags')
      if (response.success) {
        tags.value = response.data || []
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 打开新增对话框
const openCreateDialog = () => {
  isEdit.value = false
  currentId.value = null
  Object.assign(form, {
    name: '',
    description: '',
    sortOrder: 0,
    color: '#409eff',
    status: 'active'
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (item) => {
  isEdit.value = true
  currentId.value = item.id
  Object.assign(form, item)
  dialogVisible.value = true
}

// 保存项目
const saveItem = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let response
        const type = activeTab.value
        
        if (isEdit.value) {
          if (type === 'category') {
            response = await api.put(`/categories/categories/${currentId.value}`, form)
          } else {
            response = await api.put(`/categories/tags/${currentId.value}`, form)
          }
        } else {
          if (type === 'category') {
            response = await api.post('/categories/categories', form)
          } else {
            response = await api.post('/categories/tags', form)
          }
        }
        
        if (response.success) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadData()
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除项目
const deleteItem = async (id, type) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })
    
    loading.value = true
    let response
    if (type === 'category') {
      response = await api.delete(`/categories/categories/${id}`)
    } else {
      response = await api.delete(`/categories/tags/${id}`)
    }
    
    if (response.success) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 监听标签切换
watch(activeTab, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.category-management {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.tabs {
  display: flex;
  gap: 10px;
}

.items-card {
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

.tag-preview {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-value {
  font-family: monospace;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
