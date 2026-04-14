<template>
  <div class="order-manage-container">
    <h2>订单管理</h2>
    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form
        :inline="true"
        :model="filterForm"
        class="filter-form"
      >
        <el-form-item label="订单状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            size="large"
          >
            <el-option
              value=""
              label="全部状态"
            />
            <el-option
              value="pending"
              label="待支付"
            />
            <el-option
              value="paid"
              label="已支付"
            />
            <el-option
              value="shipping"
              label="配送中"
            />
            <el-option
              value="delivered"
              label="已送达"
            />
            <el-option
              value="completed"
              label="已完成"
            />
            <el-option
              value="cancelled"
              label="已取消"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="filterForm.orderId"
            placeholder="请输入订单号"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="fetchOrders"
          >
            筛选
          </el-button>
          <el-button
            size="large"
            @click="resetFilter"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 订单列表 -->
    <div class="order-list">
      <el-table
        v-loading="loading"
        :data="orders"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="订单号"
          width="180"
        />
        <el-table-column
          v-if="userStore.isAdmin"
          prop="userId"
          label="用户ID"
          width="100"
        />
        <el-table-column
          prop="totalAmount"
          label="总金额"
          width="120"
        >
          <template #default="scope">
            ¥{{ Number(scope.row.totalAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="下单时间"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="userStore.isAdmin"
          prop="updatedAt"
          label="更新时间"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          :width="userStore.isAdmin ? '200' : '150'"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="viewOrder(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              v-if="canUpdateStatus(scope.row.status)"
              type="success"
              size="small"
              @click="updateOrderStatus(scope.row)"
            >
              处理
            </el-button>
            <el-button
              v-if="userStore.isAdmin && scope.row.status === 'pending'"
              type="danger"
              size="small"
              @click="cancelOrder(scope.row.id)"
            >
              取消
            </el-button>
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
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="订单详情"
      width="800px"
    >
      <div
        v-if="currentOrder"
        class="order-detail"
      >
        <div class="order-header">
          <div class="order-info">
            <p><strong>订单号：</strong>{{ currentOrder.id }}</p>
            <p><strong>下单时间：</strong>{{ formatDateTime(currentOrder.createdAt) }}</p>
            <p>
              <strong>订单状态：</strong>
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </p>
          </div>
          <div class="order-actions">
            <el-button
              v-if="canUpdateStatus(currentOrder.status)"
              type="success"
              size="small"
              @click="updateOrderStatus(currentOrder)"
            >
              处理订单
            </el-button>
          </div>
        </div>
        
        <div class="order-products">
          <h3>商品信息</h3>
          <el-table
            :data="currentOrder.items"
            style="width: 100%"
          >
            <el-table-column
              label="商品图片"
              width="100"
            >
              <template #default="scope">
                <img
                  :src="scope.row.image"
                  class="product-image"
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="商品名称"
              width="200"
            />
            <el-table-column
              prop="price"
              label="单价"
              width="100"
            >
              <template #default="scope">
                ¥{{ Number(scope.row.price || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="quantity"
              label="数量"
              width="80"
            />
            <el-table-column
              label="小计"
              width="120"
            >
              <template #default="scope">
                ¥{{ (Number(scope.row.price || 0) * Number(scope.row.quantity || 0)).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="order-summary">
          <div class="total-price">
            <strong>订单总计：</strong>¥{{ Number(currentOrder.totalPrice || currentOrder.totalAmount || 0).toFixed(2) }}
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="orderDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 状态更新对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新订单状态"
      width="400px"
    >
      <el-form
        ref="statusFormRef"
        :model="statusForm"
        :rules="statusRules"
        label-width="80px"
      >
        <el-form-item
          label="订单状态"
          prop="status"
        >
          <el-select
            v-model="statusForm.status"
            placeholder="请选择状态"
          >
            <el-option
              value="paid"
              label="已支付"
            />
            <el-option
              value="shipping"
              label="配送中"
            />
            <el-option
              value="delivered"
              label="已送达"
            />
            <el-option
              value="completed"
              label="已完成"
            />
            <el-option
              value="cancelled"
              label="已取消"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.note"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitStatusUpdate"
          >提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '../../api'
import { useOrderStore } from '../../stores/useOrderStore'
import { useUserStore } from '../../stores/useUserStore'
import { message } from '../../utils/message'

const orderStore = useOrderStore()
const userStore = useUserStore()

// 筛选表单
const filterForm = ref({
  status: '',
  orderId: ''
})

// 订单列表
const orders = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 订单详情对话框
const orderDialogVisible = ref(false)
const currentOrder = ref(null)

// 状态更新对话框
const statusDialogVisible = ref(false)
const statusForm = ref({
  status: '',
  note: ''
})
const statusFormRef = ref()
const currentOrderId = ref(null)

// 状态表单验证规则
const statusRules = {
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    let response
    if (userStore.isAdmin) {
      // 管理员获取所有订单
      response = await apiClient.admin.getOrders({
        page: currentPage.value,
        limit: pageSize.value,
        status: filterForm.value.status,
        orderId: filterForm.value.orderId
      })
      orders.value = response.data.orders
      total.value = response.data.total
    } else {
      // 卖家获取自己的订单
      response = await apiClient.seller.getOrders({
        page: currentPage.value,
        limit: pageSize.value,
        status: filterForm.value.status,
        orderId: filterForm.value.orderId
      })
      orders.value = response.data.orders
      total.value = response.data.total
    }
  } catch (error) {
    message.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    status: '',
    orderId: ''
  }
  currentPage.value = 1
  fetchOrders()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchOrders()
}

// 当前页变化
const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchOrders()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'paid': return 'info'
    case 'shipping': return 'primary'
    case 'delivered': return 'success'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待支付'
    case 'paid': return '已支付'
    case 'shipping': return '配送中'
    case 'delivered': return '已送达'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    default: return status
  }
}

// 检查是否可以更新状态
const canUpdateStatus = (status) => {
  return ['pending', 'paid', 'shipping', 'delivered'].includes(status)
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return dateStr
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    return dateStr
  }
}

// 查看订单详情
const viewOrder = async (id) => {
  try {
    let response
    if (userStore.isAdmin) {
      response = await apiClient.admin.getOrderDetail(id)
    } else {
      response = await apiClient.seller.getOrderDetail(id)
    }
    // 确保response.data不为undefined
    currentOrder.value = response.data || {}
    // 确保items数组存在
    if (!currentOrder.value.items) {
      currentOrder.value.items = []
    }
    orderDialogVisible.value = true
  } catch (error) {
    message.error(error.message || '获取订单详情失败')
  }
}

// 更新订单状态
const updateOrderStatus = (order) => {
  currentOrderId.value = order.id
  statusForm.value = {
    status: getNextStatus(order.status),
    note: ''
  }
  statusDialogVisible.value = true
}

// 获取下一个状态
const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case 'pending': return 'paid'
    case 'paid': return 'shipping'
    case 'shipping': return 'delivered'
    case 'delivered': return 'completed'
    default: return currentStatus
  }
}

// 提交状态更新
const submitStatusUpdate = async () => {
  if (!statusFormRef.value) return
  
  const valid = await statusFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (userStore.isAdmin) {
      await apiClient.admin.updateOrderStatus(currentOrderId.value, { 
        status: statusForm.value.status,
        note: statusForm.value.note
      })
    } else {
      await apiClient.seller.updateOrderStatus(currentOrderId.value, { 
        status: statusForm.value.status,
        note: statusForm.value.note
      })
    }
    message.success('订单状态更新成功')
    statusDialogVisible.value = false
    fetchOrders()
    
    // 更新当前订单详情
    if (currentOrder.value && currentOrder.value.id === currentOrderId.value) {
      currentOrder.value.status = statusForm.value.status
    }
  } catch (error) {
    message.error(error.message || '状态更新失败')
  }
}

// 取消订单
const cancelOrder = async (id) => {
  try {
    if (userStore.isAdmin) {
      await apiClient.admin.updateOrderStatus(id, { status: 'cancelled' })
      message.success('订单取消成功')
      fetchOrders()
    }
  } catch (error) {
    message.error(error.message || '订单取消失败')
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-manage-container {
  padding: 20px 0;
}

.order-manage-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 筛选部分 */
.filter-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

/* 订单列表 */
.order-list {
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

/* 订单详情 */
.order-detail {
  padding: 20px 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.order-products {
  margin-bottom: 20px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.order-summary {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.total-price {
  font-size: 18px;
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-list {
    padding: 15px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>