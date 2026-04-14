<template>
  <div class="product-manage-container">
    <h2>商品管理</h2>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <div class="left-actions">
        <el-button
          v-if="userStore.isAdmin"
          type="success"
          @click="openStatisticsDialog"
        >
          <el-icon><DataAnalysis /></el-icon> 数据统计
        </el-button>
      </div>
    </div>
    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          筛选条件
        </h3>
      </div>
      <div class="filter-form">
        <div class="filter-group">
          <span class="filter-label">分类</span>
          <el-select
            v-model="filterForm.category"
            class="filter-select"
          >
            <el-option
              value=""
              label="全部分类"
            />
            <el-option
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
              :label="category.label"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">状态</span>
          <el-select
            v-model="filterForm.status"
            class="filter-select"
          >
            <el-option
              value=""
              label="全部状态"
            />
            <el-option
              value="pending"
              label="待审核"
            />
            <el-option
              value="approved"
              label="已审核"
            />
            <el-option
              value="rejected"
              label="已拒绝"
            />
          </el-select>
        </div>
        
        <div class="filter-actions">
          <el-button
            type="primary"
            class="filter-btn primary"
            @click="fetchProducts"
          >
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button
            type="default"
            class="filter-btn reset"
            @click="resetFilter"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 商品列表 -->
    <div class="product-list">
      <el-table
        v-loading="loading"
        :data="products"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="70"
        />
        <el-table-column
          prop="name"
          label="商品名称"
          min-width="220"
        >
          <template #default="scope">
            <div class="product-name">
              <img
                :key="`${scope.row.id}-${imageRefreshKey}`"
                :src="getImageUrl(scope.row.images?.[0], imageRefreshKey > 0)"
                alt="商品图片"
                class="product-image"
                @error="(e) => handleImageError(e, DEFAULT_PLACEHOLDER_URL)"
              >
              <span class="product-name-text">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="100"
        >
          <template #default="scope">
            ¥{{ Number(scope.row.price || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="库存"
          width="80"
        />
        <el-table-column
          prop="category"
          label="一级分类"
          width="100"
        />
        <el-table-column
          prop="subCategory"
          label="二级分类"
          width="100"
        />
        <el-table-column
          prop="subSubCategory"
          label="三级分类"
          width="120"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <div class="status-cell">
              <el-icon
                class="status-icon"
                :class="getStatusIconClass(scope.row.status)"
              >
                <svg
                  v-if="scope.row.status === 'approved'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <svg
                  v-else-if="scope.row.status === 'pending'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><circle
                  cx="12"
                  cy="12"
                  r="10"
                /><polyline points="12 6 12 12 16 14" /></svg>
                <svg
                  v-else-if="scope.row.status === 'rejected'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><circle
                  cx="12"
                  cy="12"
                  r="10"
                /><line
                  x1="15"
                  y1="9"
                  x2="9"
                  y2="15"
                /><line
                  x1="9"
                  y1="9"
                  x2="15"
                  y2="15"
                /></svg>
              </el-icon>
              <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="isHot"
          label="热门"
          width="70"
        >
          <template #default="scope">
            <el-tag
              v-if="scope.row.isHot"
              type="danger"
              size="small"
            >
              热门
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="viewCount"
          label="浏览"
          width="70"
        />
        <el-table-column
          v-if="userStore.isAdmin"
          prop="sellerId"
          label="卖家ID"
          width="80"
        />
        <el-table-column
          label="拒绝原因"
          width="120"
        >
          <template #default="scope">
            <div
              v-if="scope.row.status === 'rejected'"
              class="reject-reason-cell"
            >
              <el-tooltip
                :content="scope.row.rejectReason || '无拒绝原因'"
                placement="top"
              >
                <span class="reject-reason-text">{{ truncateText(scope.row.rejectReason || '无', 10) }}</span>
              </el-tooltip>
              <el-button 
                v-if="userStore.isAdmin"
                type="primary" 
                size="small" 
                class="view-detail-btn"
                link
                @click="showRejectDetail(scope.row)"
              >
                详情
              </el-button>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="160"
        >
          <template #default="scope">
            {{ formatDateShort(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="scope">
            <el-dropdown
              trigger="click"
            >
              <el-button
                type="primary"
                size="small"
                link
              >
                操作
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="viewProduct(scope.row.id)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="userStore.hasPermission('product:update')" 
                    @click="editProduct(scope.row.id)"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="userStore.hasPermission('product:delete')" 
                    divided
                    @click="deleteProduct(scope.row.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="userStore.hasPermission('product:approve') && scope.row.status === 'pending'" 
                    @click="approveProduct(scope.row.id)"
                  >
                    <el-icon><Check /></el-icon>
                    审核
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="userStore.isAdmin" 
                    @click="setHotProduct(scope.row.id, !scope.row.isHot)"
                  >
                    <el-icon><TrendCharts /></el-icon>
                    {{ scope.row.isHot ? '取消热门' : '设为热门' }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div
        v-if="total > 0"
        class="pagination"
      >
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
    
    <!-- 审核对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="商品审核"
      width="500px"
    >
      <el-form
        ref="approveFormRef"
        :model="approveForm"
        :rules="approveRules"
        label-width="100px"
      >
        <el-form-item
          label="审核结果"
          prop="status"
        >
          <el-radio-group v-model="approveForm.status">
            <el-radio label="approved">
              通过
            </el-radio>
            <el-radio label="rejected">
              拒绝
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item
          v-if="approveForm.status === 'rejected'"
          label="拒绝类型"
          prop="rejectType"
        >
          <el-select
            v-model="approveForm.rejectType"
            placeholder="请选择拒绝类型"
          >
            <el-option
              label="内容违规"
              value="content"
            />
            <el-option
              label="质量问题"
              value="quality"
            />
            <el-option
              label="价格异常"
              value="price"
            />
            <el-option
              label="分类错误"
              value="category"
            />
            <el-option
              label="版权问题"
              value="copyright"
            />
            <el-option
              label="其他原因"
              value="other"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          v-if="approveForm.status === 'rejected'"
          label="拒绝原因"
          prop="rejectReason"
        >
          <el-input
            v-model="approveForm.rejectReason"
            type="textarea"
            placeholder="请输入详细拒绝原因"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item
          v-if="approveForm.status === 'rejected'"
          label="规则依据"
          prop="rejectRule"
        >
          <el-input
            v-model="approveForm.rejectRule"
            type="textarea"
            placeholder="请输入相关规则依据"
            rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitApprove"
          >提交</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 拒绝详情弹窗 -->
    <el-dialog
      v-model="rejectDetailVisible"
      title="拒绝详情"
      width="500px"
    >
      <div class="reject-detail-content">
        <el-descriptions
          :column="1"
          border
        >
          <el-descriptions-item label="拒绝类型">
            <el-tag :type="'danger'">
              {{ getRejectTypeText(currentRejectDetail.rejectType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="详细说明">
            {{ currentRejectDetail.rejectReason || '无详细说明' }}
          </el-descriptions-item>
          <el-descriptions-item label="规则依据">
            {{ currentRejectDetail.rejectRule || '无规则依据' }}
          </el-descriptions-item>
          <el-descriptions-item label="拒绝时间">
            {{ formatDate(currentRejectDetail.rejectedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 数据统计对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="商品数据统计"
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
                      {{ statistics.totalProducts }}
                    </div>
                    <div class="stat-label">
                      总商品数
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
                      总浏览次数
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
                    <TrendCharts />
                  </el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      {{ statistics.hotProductsCount }}
                    </div>
                    <div class="stat-label">
                      热门商品
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
                      {{ approvedCount }}
                    </div>
                    <div class="stat-label">
                      已审核
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
                  <span class="category-name">{{ stat.category }}</span>
                  <span class="category-count">{{ stat.count }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.totalProducts > 0 ? (stat.count / statistics.totalProducts) * 100 : 0" 
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
                  <span class="status-name">{{ getStatusText(stat.status) }}</span>
                  <span class="status-count">{{ stat.count }}个</span>
                </div>
                <el-progress 
                  :percentage="statistics.totalProducts > 0 ? (stat.count / statistics.totalProducts) * 100 : 0" 
                  :color="getStatStatusColor(stat.status)"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Edit, Delete, Check, Close, Refresh, DataAnalysis, Document, View, TrendCharts, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProductStore } from '../../stores/useProductStore'
import { useUserStore } from '../../stores/useUserStore'
import { message } from '../../utils/message'
import { apiClient } from '../../api'
import { getImageUrl, handleImageError, DEFAULT_PLACEHOLDER_URL } from '../../utils/imageUtils'

const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()
const imageRefreshKey = ref(0)

// 数据统计相关
const statisticsDialogVisible = ref(false)
const loadingStatistics = ref(false)
const statistics = ref({
  totalProducts: 0,
  totalViews: 0,
  statusStats: [],
  categoryStats: [],
  hotProductsCount: 0,
  lastUpdated: new Date().toISOString()
})

const approvedCount = computed(() => {
  const stat = statistics.value.statusStats?.find(s => s.status === 'approved')
  return stat?.count || 0
})

const headerCellStyle = computed(() => {
  return {
    background: '#f5f7fa',
    color: '#303133'
  }
})

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#00CED1', '#FF69B4', '#9370DB']
  return colors[index % colors.length]
}

// 获取统计状态颜色
const getStatStatusColor = (status) => {
  switch (status) {
    case 'approved': return '#67C23A'
    case 'pending': return '#E6A23C'
    case 'rejected': return '#F56C6C'
    default: return '#909399'
  }
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
    const response = await apiClient.product.getStats()
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

// 筛选表单
const filterForm = ref({
  category: '',
  status: ''
})

// 商品列表
const products = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 分类列表
const categories = productStore.categories

// 审核对话框
const approveDialogVisible = ref(false)

// 审核表单
const approveForm = ref({
  status: 'approved',
  rejectReason: '',
  rejectType: '',
  rejectRule: ''
})
const approveFormRef = ref()
const currentProductId = ref(null)

// 拒绝详情弹窗
const rejectDetailVisible = ref(false)
const currentRejectDetail = ref({
  rejectType: '',
  rejectReason: '',
  rejectRule: '',
  rejectedAt: ''
})

// 审核表单验证规则
const approveRules = {
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  rejectReason: [
    { required: true, message: '请输入审核意见', trigger: 'blur', validator: (rule, value, callback) => {
      if (approveForm.value.status === 'rejected' && !value) {
        return callback(new Error('拒绝时必须填写拒绝原因'))
      }
      callback()
    }} 
  ],
  rejectType: [
    { required: true, message: '请选择拒绝类型', trigger: 'blur', validator: (rule, value, callback) => {
      if (approveForm.value.status === 'rejected' && !value) {
        return callback(new Error('拒绝时必须选择拒绝类型'))
      }
      callback()
    }} 
  ]
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    // 根据用户角色选择接口
    let response
    if (userStore.isAdmin) {
      // 管理员查看所有商品
      response = await productStore.getProducts({
        page: currentPage.value,
        limit: pageSize.value,
        category: filterForm.value.category,
        status: filterForm.value.status
      })
    } else {
      // 卖家查看自己的商品
      response = await productStore.getSellerProducts({
        page: currentPage.value,
        limit: pageSize.value,
        category: filterForm.value.category,
        status: filterForm.value.status
      })
    }
    products.value = productStore.products
    total.value = productStore.total
  } catch (error) {
    message.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    category: '',
    status: ''
  }
  currentPage.value = 1
  fetchProducts()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchProducts()
}

// 当前页变化
const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchProducts()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'danger'
    default: return 'info'
  }
}

// 获取状态图标类名
const getStatusIconClass = (status) => {
  switch (status) {
    case 'approved': return 'status-approved'
    case 'pending': return 'status-pending'
    case 'rejected': return 'status-rejected'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'approved': return '已审核'
    case 'pending': return '待审核'
    case 'rejected': return '已拒绝'
    default: return status
  }
}

// 获取拒绝类型文本
const getRejectTypeText = (type) => {
  const typeMap = {
    'content': '内容违规',
    'quality': '质量问题',
    'price': '价格异常',
    'category': '分类错误',
    'copyright': '版权问题',
    'other': '其他原因'
  }
  return typeMap[type] || type || '未指定'
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 显示拒绝详情
const showRejectDetail = (product) => {
  currentRejectDetail.value = {
    rejectType: product.rejectType,
    rejectReason: product.rejectReason,
    rejectRule: product.rejectRule,
    rejectedAt: product.rejectedAt
  }
  rejectDetailVisible.value = true
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '无'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 短日期格式
const formatDateShort = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看商品 - 跳转到管理后台编辑页面
const viewProduct = (id) => {
  router.push(`/admin/product/upload?id=${id}`)
}

// 编辑商品
const editProduct = (id) => {
  router.push(`/admin/product/upload?id=${id}`)
}

// 删除商品
const deleteProduct = async (id) => {
  try {
    await productStore.deleteProduct(id)
    message.success('商品删除成功')
    fetchProducts()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

// 审核商品
const approveProduct = (id) => {
  currentProductId.value = id
  approveForm.value = {
    status: 'approved',
    reason: ''
  }
  approveDialogVisible.value = true
}

// 设置热门商品
const setHotProduct = async (id, isHot) => {
  try {
    await productStore.setHotProduct(id, isHot)
    message.success(isHot ? '设置为热门商品成功' : '取消热门商品成功')
    fetchProducts()
  } catch (error) {
    message.error(error.message || (isHot ? '设置热门商品失败' : '取消热门商品失败'))
  }
}

// 提交审核
const submitApprove = async () => {
  if (!approveFormRef.value) return
  
  const valid = await approveFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    await productStore.approveProduct(currentProductId.value, {
      status: approveForm.value.status,
      rejectReason: approveForm.value.status === 'rejected' ? approveForm.value.rejectReason : '',
      rejectType: approveForm.value.status === 'rejected' ? approveForm.value.rejectType : '',
      rejectRule: approveForm.value.status === 'rejected' ? approveForm.value.rejectRule : ''
    })
    message.success('商品审核成功')
    approveDialogVisible.value = false
    fetchProducts()
  } catch (error) {
    message.error(error.message || '审核失败')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-manage-container {
  padding: 20px 0;
}

.product-manage-container h2 {
  margin-bottom: 20px;
  color: #333;
}

.operation-bar {
  margin-bottom: 20px;
}

.left-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 筛选部分 */
.filter-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 20px;
}

.filter-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-select {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.filter-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.filter-btn.primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filter-btn.reset:hover {
  border-color: #909399;
  color: #909399;
  transform: translateY(-2px);
}

/* 商品列表 */
.product-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 状态样式 */
.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-approved {
  color: #67c23a;
}

.status-pending {
  color: #e6a23c;
}

.status-rejected {
  color: #f56c6c;
}

/* 拒绝原因样式 */
.reject-reason-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.reject-reason-text {
  color: #f56c6c;
  font-weight: 500;
  cursor: pointer;
  font-size: 12px;
}

.view-detail-btn {
  margin: 0;
  padding: 0;
}

/* 拒绝详情弹窗样式 */
.reject-detail-content {
  padding: 10px 0;
}

.reject-detail-content .el-descriptions__label {
  font-weight: 600;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-list {
    padding: 15px;
  }
  
  .reject-reason-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
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

.product-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #f5f7fa;
}

.product-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
