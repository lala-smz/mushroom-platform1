<template>
  <div class="admin-boxes">
    <div class="page-header">
      <h1>盲盒管理</h1>
      <p>管理所有盲盒及其内容</p>
    </div>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索盲盒名称"
          prefix-icon="el-icon-search"
          @keyup.enter="handleSearch"
        />
        <el-button
          type="primary"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </div>
      
      <el-button
        type="primary"
        @click="goToCreateBox"
      >
        <i class="el-icon-plus" /> 创建盲盒
      </el-button>
    </div>
    
    <!-- 盲盒列表 -->
    <div class="boxes-list">
      <el-table
        v-loading="loading"
        :data="boxes"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          label="盲盒名称"
          min-width="200"
        >
          <template #default="scope">
            <div class="box-name">
              <img
                :src="scope.row.image"
                alt="盲盒图片"
                class="box-image"
              >
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column
          prop="price"
          label="价格"
          width="120"
        >
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="season"
          label="季节"
          width="100"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="cultivationService"
          label="代培服务"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="scope.row.cultivationService ? 'info' : 'warning'">
              {{ scope.row.cultivationService ? '包含' : '不包含' }}
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
              type="primary"
              size="small"
              @click.stop="editBox(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              @click.stop="manageBoxItems(scope.row.id)"
            >
              管理内容
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="deleteBox(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'

const router = useRouter()
const boxStore = useMushroomBoxStore()

const boxes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取盲盒列表
async function fetchBoxes() {
  loading.value = true
  try {
    // 调用store方法获取盲盒列表
    await boxStore.fetchBoxes()
    let filteredBoxes = boxStore.boxes
    
    // 搜索过滤
    if (searchQuery.value) {
      filteredBoxes = filteredBoxes.filter(box => 
        box.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    total.value = filteredBoxes.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    boxes.value = filteredBoxes.slice(start, end)
  } catch (error) {
    console.error('获取盲盒列表失败:', error)
    ElMessage.error('获取盲盒列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchBoxes()
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  fetchBoxes()
}

function handleCurrentChange(current) {
  currentPage.value = current
  fetchBoxes()
}

// 跳转到创建盲盒页面
function goToCreateBox() {
  router.push('/admin/boxes/create')
}

// 编辑盲盒
function editBox(id) {
  router.push(`/admin/boxes/edit/${id}`)
}

// 管理盲盒内容
function manageBoxItems(id) {
  router.push(`/admin/boxes/items/${id}`)
}

// 删除盲盒
async function deleteBox(id) {
  try {
    await boxStore.deleteMushroomBox(id)
    ElMessage.success('盲盒删除成功')
    fetchBoxes()
  } catch (error) {
    console.error('删除盲盒失败:', error)
    ElMessage.error('删除盲盒失败')
  }
}

// 行点击事件
function handleRowClick(row) {
  manageBoxItems(row.id)
}

// 页面加载时获取数据
onMounted(() => {
  fetchBoxes()
})
</script>

<style scoped>
.admin-boxes {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.page-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box .el-input {
  width: 300px;
}

.boxes-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.box-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.box-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .search-box {
    justify-content: space-between;
  }
  
  .search-box .el-input {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .admin-boxes {
    padding: 0 15px;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .search-box {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-box .el-input {
    width: 100%;
  }
}
</style>