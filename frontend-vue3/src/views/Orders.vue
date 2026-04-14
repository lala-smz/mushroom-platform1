<template>
  <div class="orders-container">
    <h2>我的订单</h2>
    
    <!-- 筛选和搜索区域 -->
    <div class="orders-filter">
      <div class="filter-left">
        <el-select
          v-model="statusFilter"
          placeholder="订单状态"
          style="width: 150px; margin-right: 10px;"
        >
          <el-option
            label="全部"
            value=""
          />
          <el-option
            label="待支付"
            value="pending"
          />
          <el-option
            label="已支付"
            value="paid"
          />
          <el-option
            label="已发货"
            value="delivered"
          />
          <el-option
            label="已完成"
            value="completed"
          />
          <el-option
            label="已取消"
            value="cancelled"
          />
        </el-select>
        
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索订单号" 
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="searchOrders"
        >
          <template #append>
            <el-button @click="searchOrders">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      
      <div class="filter-right">
        <el-button
          type="primary"
          @click="refreshOrders"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 订单列表 -->
    <el-table
      :data="filteredOrders"
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column
        prop="orderNo"
        label="订单号"
        width="180"
      />
      <el-table-column
        label="订单状态"
        width="120"
      >
        <template #default="scope">
          <el-tag 
            :type="getStatusTagType(scope.row.status)"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalAmount"
        label="总金额"
        width="120"
        align="right"
      >
        <template #default="scope">
          <span>¥{{ (parseFloat(scope.row.totalAmount) || 0).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人"
        width="120"
      />
      <el-table-column
        prop="phone"
        label="联系电话"
        width="120"
      />
      <el-table-column
        prop="createdAt"
        label="下单时间"
        width="180"
      >
        <template #default="scope">
          <span>{{ formatDate(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        align="center"
      >
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            class="order-detail-btn"
            @click="viewOrder(scope.row.id)"
          >
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
          
          <!-- 根据订单状态显示不同的操作按钮 -->
          <el-button 
            v-if="scope.row.status === 'pending'" 
            type="success" 
            size="small" 
            @click="payOrder(scope.row)"
          >
            去支付
          </el-button>
          
          <el-button 
            v-if="scope.row.status === 'paid'" 
            type="info" 
            size="small" 
            @click="confirmDelivery(scope.row)"
          >
            确认收货
          </el-button>
          
          <el-button 
            v-if="scope.row.status === 'pending' " 
            type="danger" 
            size="small" 
            :loading="cancelingOrders.has(scope.row.id)"
            :disabled="cancelingOrders.has(scope.row.id)"
            @click="cancelOrder(scope.row)"
          >
            取消订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页控件 -->
    <div
      class="pagination-container"
      style="margin-top: 20px;"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredOrders.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 订单为空时的提示 -->
    <div
      v-if="filteredOrders.length === 0"
      class="empty-orders"
    >
      <p>暂无订单记录</p>
      <el-button
        type="primary"
        @click="$router.push('/products')"
      >
        去购物
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/useOrderStore'
import dayjs from 'dayjs'
import { View } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

// 订单列表
const orders = ref([])

// 筛选条件
const statusFilter = ref('')
const searchKeyword = ref('')

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 防重复提交
const cancelingOrders = ref(new Set())

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    delivered: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'primary',
    delivered: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

// 筛选后的订单列表
const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(order => order.orderNo.toLowerCase().includes(keyword))
  }
  
  return result
})

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1
}

// 刷新订单
const refreshOrders = async () => {
  await loadOrders()
}

// 查看订单详情
const viewOrder = (orderId) => {
  router.push(`/order/${orderId}`)
}

// 支付订单
const payOrder = (order) => {
  console.log('支付订单:', order)
  ElMessage.info('支付功能开发中')
}

// 确认收货
const confirmDelivery = async (order) => {
  try {
    await orderStore.confirmOrder(order.id)
    await loadOrders()
    ElMessage.success('确认收货成功')
  } catch (error) {
    ElMessage.error('确认收货失败，请重试')
    console.error('确认收货失败:', error)
  }
}

// 取消订单
const cancelOrder = async (order) => {
  // 防止重复提交
  if (cancelingOrders.value.has(order.id)) {
    return
  }
  
  try {
    cancelingOrders.value.add(order.id)
    await orderStore.cancelOrder(order.id)
    await loadOrders()
    ElMessage.success('订单取消成功')
  } catch (error) {
    ElMessage.error('订单取消失败，请重试')
    console.error('订单取消失败:', error)
  } finally {
    cancelingOrders.value.delete(order.id)
  }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    await orderStore.getOrders()
    orders.value = orderStore.orders
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error('获取订单列表失败:', error)
  }
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 当前页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.orders-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.empty-orders {
  text-align: center;
  padding: 60px 20px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-top: 20px;
}

.empty-orders p {
  margin-bottom: 20px;
  font-size: 18px;
  color: #666;
}

/* 订单详情按钮样式 */
.order-detail-btn {
  min-width: 100px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.order-detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3);
}

.order-detail-btn:focus {
  outline: 2px solid rgba(144, 147, 153, 0.5);
  outline-offset: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail-btn {
    min-width: 80px;
    padding: 0 12px;
  }
}

/* 确保触摸目标大小 */
@media (hover: none) and (pointer: coarse) {
  .order-detail-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>