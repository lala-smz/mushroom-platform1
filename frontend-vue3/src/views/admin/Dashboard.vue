<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>控制台</h2>
      <el-button
        type="primary"
        :loading="refreshing"
        class="refresh-btn"
        @click="refreshData"
      >
        <el-icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
        </el-icon>
        刷新数据
      </el-button>
    </div>
    
    <!-- 快速操作按钮 -->
    <div class="quick-actions">
      <el-button
        type="primary"
        class="quick-action-btn"
        @click="quickAddProduct"
      >
        <el-icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
        </el-icon>
        添加新商品
      </el-button>
      <el-button
        type="warning"
        class="quick-action-btn"
        @click="quickViewOrders"
      >
        <el-icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect
            width="8"
            height="4"
            x="8"
            y="2"
            rx="1"
            ry="1"
          /></svg>
        </el-icon>
        查看待处理订单
      </el-button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card
        v-if="userStore.isAdmin"
        v-loading="loading"
        class="stat-card"
      >
        <div class="stat-content">
          <div class="stat-icon users">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle
                cx="9"
                cy="7"
                r="4"
              /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </el-icon>
          </div>
          <div class="stat-info">
            <h3>用户总数</h3>
            <p class="stat-number">
              {{ stats.users }}
            </p>
            <p class="stat-change">
              +12% 较上月
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card
        v-loading="loading"
        class="stat-card"
      >
        <div class="stat-content">
          <div class="stat-icon products">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><circle
                cx="9"
                cy="21"
                r="1"
              /><circle
                cx="20"
                cy="21"
                r="1"
              /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            </el-icon>
          </div>
          <div class="stat-info">
            <h3>商品总数</h3>
            <p class="stat-number">
              {{ stats.products }}
            </p>
            <p class="stat-change">
              +8% 较上月
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card
        v-loading="loading"
        class="stat-card"
      >
        <div class="stat-content">
          <div class="stat-icon orders">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect
                width="8"
                height="4"
                x="8"
                y="2"
                rx="1"
                ry="1"
              /></svg>
            </el-icon>
          </div>
          <div class="stat-info">
            <h3>订单总数</h3>
            <p class="stat-number">
              {{ stats.orders }}
            </p>
            <p class="stat-change">
              +15% 较上月
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card
        v-loading="loading"
        class="stat-card"
      >
        <div class="stat-content">
          <div class="stat-icon revenue">
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            </el-icon>
          </div>
          <div class="stat-info">
            <h3>总销售额</h3>
            <p class="stat-number">
              ¥{{ typeof stats.revenue === 'number' ? stats.revenue.toFixed(2) : '0.00' }}
            </p>
            <p class="stat-change">
              +20% 较上月
            </p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 最近订单 -->
    <div class="recent-orders">
      <div class="section-header">
        <h3>最近订单</h3>
        <el-button 
          type="primary" 
          size="small" 
          link
          @click="quickViewOrders"
        >
          查看全部
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="recentOrders"
        style="width: 100%"
        class="custom-table"
        :header-cell-style="{ backgroundColor: 'var(--theme-backgroundColor)', color: 'var(--theme-secondaryTextColor)', fontWeight: '600' }"
        :row-style="{ transition: 'background-color 0.2s ease' }"
        stripe
      >
        <el-table-column
          prop="orderNo"
          label="订单编号"
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
            <span class="amount-text">¥{{ typeof scope.row.totalAmount === 'number' ? scope.row.totalAmount.toFixed(2) : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="120"
        >
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
              effect="light"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
        />
        <el-table-column
          label="操作"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="viewOrder(scope.row.id)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 待审核商品 - 仅管理员可见 -->
    <div
      v-if="userStore.isAdmin"
      class="pending-products"
    >
      <div class="section-header">
        <h3>待审核商品</h3>
        <div
          v-if="pendingProducts.length > 0"
          class="pending-count"
        >
          <el-badge
            :value="pendingProducts.length"
            class="item"
            type="warning"
          />
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="pendingProducts"
        style="width: 100%"
        class="custom-table"
        :header-cell-style="{ backgroundColor: 'var(--theme-backgroundColor)', color: 'var(--theme-secondaryTextColor)', fontWeight: '600' }"
        :row-style="{ transition: 'background-color 0.2s ease' }"
        stripe
      >
        <el-table-column
          prop="id"
          label="商品ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="商品名称"
        />
        <el-table-column
          prop="price"
          label="价格"
          width="120"
        >
          <template #default="scope">
            <span class="price-text">¥{{ typeof scope.row.price === 'number' ? scope.row.price.toFixed(2) : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sellerId"
          label="卖家ID"
          width="100"
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
        />
        <el-table-column
          label="操作"
          width="220"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="viewProduct(scope.row.id)"
              >
                <el-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
                    cx="12"
                    cy="12"
                    r="3"
                  /></svg>
                </el-icon>
                查看
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="approveProduct(scope.row.id)"
              >
                <el-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ><polyline points="20 6 9 17 4 12" /></svg>
                </el-icon>
                通过
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="rejectProduct(scope.row.id)"
              >
                <el-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ><line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                  /><line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                  /></svg>
                </el-icon>
                拒绝
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空状态提示 -->
      <div
        v-if="!loading && pendingProducts.length === 0"
        class="empty-state"
      >
        <el-empty description="暂无待审核商品" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '../../api'
import { useProductStore } from '../../stores/useProductStore'
import { useOrderStore } from '../../stores/useOrderStore'
import { useUserStore } from '../../stores/useUserStore'
import { message } from '../../utils/message'

const router = useRouter()
const productStore = useProductStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 加载状态
const loading = ref(false)
const refreshing = ref(false)

// 统计数据
const stats = ref({
  users: 0,
  products: 0,
  orders: 0,
  revenue: 0
})

// 最近订单
const recentOrders = ref([])

// 待审核商品
const pendingProducts = ref([])

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'paid': return 'primary'
    case 'delivered': return 'info'
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
    case 'delivered': return '已发货'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    default: return status
  }
}

// 查看订单
const viewOrder = (id) => {
  router.push(`/admin/orders?id=${id}`)
}

// 查看商品
const viewProduct = (id) => {
  router.push(`/admin/product/upload?id=${id}`)
}

// 审核通过商品
const approveProduct = async (id) => {
  try {
    await productStore.approveProduct(id, { status: 'approved' })
    message.success('商品审核通过')
    // 从列表中移除
    pendingProducts.value = pendingProducts.value.filter(product => product.id !== id)
    // 更新统计数据
    fetchStats()
  } catch (error) {
    message.error(error.message || '审核失败')
  }
}

// 拒绝商品
const rejectProduct = async (id) => {
  try {
    await productStore.approveProduct(id, { status: 'rejected' })
    message.success('商品已拒绝')
    // 从列表中移除
    pendingProducts.value = pendingProducts.value.filter(product => product.id !== id)
    // 更新统计数据
    fetchStats()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    let response
    if (userStore.isAdmin) {
      response = await apiClient.admin.getStats()
    } else {
      response = await apiClient.seller.getStats()
    }
    stats.value = response.data
  } catch (error) {
    message.error('获取统计数据失败')
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    let response
    if (userStore.isAdmin) {
      response = await apiClient.admin.getOrders({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
    } else {
      response = await apiClient.seller.getOrders({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
    }
    recentOrders.value = response.data.orders
  } catch (error) {
    message.error('获取最近订单失败')
    console.error('获取最近订单失败:', error)
  }
}

// 获取待审核商品
const fetchPendingProducts = async () => {
  if (!userStore.isAdmin) return
  
  try {
    // 使用管理员API获取待审核商品
    const response = await apiClient.admin.getProducts({ status: 'pending', page: 1, limit: 10 })
    pendingProducts.value = response.data?.products || []
  } catch (error) {
    message.error('获取待审核商品失败')
    console.error('获取待审核商品失败:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchRecentOrders(),
      fetchPendingProducts()
    ])
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
    console.error('数据刷新失败:', error)
  } finally {
    refreshing.value = false
  }
}

// 快速操作：添加新商品
const quickAddProduct = () => {
  router.push('/admin/product/upload')
}

// 快速操作：查看待处理订单
const quickViewOrders = () => {
  router.push('/admin/orders?status=pending')
}

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentOrders(),
    fetchPendingProducts()
  ])
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h2 {
  margin: 0;
  color: var(--theme-textColor);
  font-size: 24px;
  font-weight: 600;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 快速操作按钮 */
.quick-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card :deep(.el-card__body) {
  padding: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.stat-icon.users {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-icon.products {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--theme-secondaryTextColor);
  font-weight: 500;
}

.stat-number {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-textColor);
  line-height: 1.2;
}

.stat-change {
  margin: 0;
  font-size: 13px;
  color: #67c23a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 最近订单 */
.recent-orders {
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}

.recent-orders h3 {
  margin: 0 0 20px 0;
  color: var(--theme-textColor);
  font-size: 18px;
  font-weight: 600;
}

/* 待审核商品 */
.pending-products {
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.pending-products h3 {
  margin: 0 0 20px 0;
  color: var(--theme-textColor);
  font-size: 18px;
  font-weight: 600;
}

/* 区块头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: var(--theme-textColor);
  font-size: 18px;
  font-weight: 600;
}

.pending-count {
  display: flex;
  align-items: center;
}

/* 表格样式 */
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header-wrapper) {
  border-radius: 8px 8px 0 0;
}

.custom-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.custom-table :deep(.el-table__row:hover) {
  background-color: var(--theme-hoverColor) !important;
}

.custom-table :deep(.el-table__cell) {
  padding: 14px 0;
}

/* 价格和金额文字 */
.price-text,
.amount-text {
  font-weight: 600;
  color: var(--theme-textColor);
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-buttons .el-button {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  font-weight: 500;
}

.action-buttons .el-button .el-icon {
  margin-right: 2px;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 空状态样式 */
.pending-products :deep(.el-table__empty-text),
.recent-orders :deep(.el-table__empty-text) {
  color: var(--theme-secondaryTextColor);
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-orders,
  .pending-products {
    padding: 16px;
  }
  
  .quick-actions {
    gap: 12px;
  }
  
  .quick-action-btn {
    padding: 12px 18px;
    font-size: 14px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .custom-table :deep(.el-table__cell) {
    padding: 10px 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stat-card :deep(.el-card__body) {
    padding: 20px;
  }
}
</style>