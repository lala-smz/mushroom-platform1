<template>
  <div class="order-detail-container">
    <h2>订单详情</h2>
    
    <!-- 返回按钮 -->
    <el-button
      type="primary"
      style="margin-bottom: 20px;"
      @click="$router.push('/orders')"
    >
      <el-icon><ArrowLeft /></el-icon> 返回订单列表
    </el-button>
    
    <!-- 订单基本信息 -->
    <el-card
      class="order-info-card"
      shadow="hover"
    >
      <template #header>
        <div class="card-header">
          <span>订单信息</span>
          <!-- 支付倒计时 -->
          <el-tag
            v-if="order.status === 'pending' && remainingTime > 0"
            type="warning"
            effect="dark"
          >
            支付剩余时间：{{ formatRemainingTime(remainingTime) }}
          </el-tag>
        </div>
      </template>
      
      <div class="order-info">
        <div class="info-row">
          <span class="label">订单编号：</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">订单状态：</span>
          <el-tag :type="getStatusTagType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>
        <div class="info-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatDate(order.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="label">支付方式：</span>
          <span class="value">{{ getPaymentMethodText(order.paymentMethod) }}</span>
        </div>
        <div
          v-if="order.paymentTime"
          class="info-row"
        >
          <span class="label">支付时间：</span>
          <span class="value">{{ formatDate(order.paymentTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">总金额：</span>
          <span class="value amount">¥{{ (parseFloat(order.totalAmount) || 0).toFixed(2) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 支付方式选择 -->
    <el-card
      v-if="order.status === 'pending'"
      class="payment-method-card"
      shadow="hover"
      style="margin-top: 20px;"
    >
      <template #header>
        <div class="card-header">
          <span>选择支付方式</span>
        </div>
      </template>
      
      <div class="payment-methods">
        <el-radio-group v-model="selectedPaymentMethod">
          <el-radio-button
            label="alipay"
            class="payment-method-item"
          >
            <div class="payment-method-info">
              <el-icon><Wallet /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio-button>
          <el-radio-button
            label="wechat"
            class="payment-method-item"
          >
            <div class="payment-method-info">
              <el-icon><ChatDotRound /></el-icon>
              <span>微信支付</span>
            </div>
          </el-radio-button>
          <el-radio-button
            label="bank"
            class="payment-method-item"
          >
            <div class="payment-method-info">
              <el-icon><CreditCard /></el-icon>
              <span>银行卡</span>
            </div>
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-card>
    
    <!-- 收货地址信息 -->
    <el-card
      class="shipping-info-card"
      shadow="hover"
      style="margin-top: 20px;"
    >
      <template #header>
        <div class="card-header">
          <span>收货信息</span>
        </div>
      </template>
      
      <div class="shipping-info">
        <div class="info-row">
          <span class="label">收货人：</span>
          <span class="value">{{ order.receiver }}</span>
        </div>
        <div class="info-row">
          <span class="label">联系电话：</span>
          <span class="value">{{ order.phone }}</span>
        </div>
        <div class="info-row">
          <span class="label">收货地址：</span>
          <span class="value">{{ order.address }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 订单商品列表 -->
    <el-card
      class="order-items-card"
      shadow="hover"
      style="margin-top: 20px;"
    >
      <template #header>
        <div class="card-header">
          <span>订单商品</span>
        </div>
      </template>
      
      <div class="order-items">
        <el-table
          :data="order.items"
          style="width: 100%"
        >
          <el-table-column
            prop="productId"
            label="商品ID"
            width="100"
          />
          <el-table-column
            prop="productName"
            label="商品名称"
            width="200"
          />
          <el-table-column
            label="商品图片"
            width="120"
          >
            <template #default="scope">
              <el-image 
                :src="scope.row.image" 
                :fit="'cover'" 
                style="width: 80px; height: 80px"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="price"
            label="单价"
            width="100"
            align="right"
          >
            <template #default="scope">
              <span>¥{{ (parseFloat(scope.row.price) || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="quantity"
            label="数量"
            width="100"
            align="center"
          />
          <el-table-column
            label="小计"
            width="120"
            align="right"
          >
            <template #default="scope">
              <span>¥{{ (parseFloat(scope.row.price) * parseInt(scope.row.quantity) || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 订单操作 -->
    <div
      v-if="canPerformActions"
      class="order-actions"
      style="margin-top: 20px;"
    >
      <el-button 
        v-if="order.status === 'pending'" 
        type="success" 
        size="large" 
        @click="payOrder"
      >
        <el-icon><Money /></el-icon> 去支付
      </el-button>
      
      <el-button 
        v-if="order.status === 'paid'" 
        type="info" 
        size="large" 
        @click="confirmDelivery"
      >
        <el-icon><Check /></el-icon> 确认收货
      </el-button>
      
      <el-button 
        v-if="order.status === 'pending'" 
        type="danger" 
        size="large" 
        @click="cancelOrder"
      >
        <el-icon><Delete /></el-icon> 取消订单
      </el-button>
    </div>
    
    <!-- 订单时间线 -->
    <el-card
      class="order-timeline-card"
      shadow="hover"
      style="margin-top: 20px;"
    >
      <template #header>
        <div class="card-header">
          <span>订单进度</span>
        </div>
      </template>
      
      <div class="order-timeline">
        <el-timeline>
          <el-timeline-item 
            :timestamp="formatDate(order.createdAt)" 
            placement="top"
          >
            订单创建成功
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="order.paymentTime" 
            :timestamp="formatDate(order.paymentTime)" 
            placement="top"
          >
            订单已支付
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="order.status === 'delivered'" 
            timestamp="-" 
            placement="top"
          >
            订单已发货
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="order.status === 'completed'" 
            timestamp="-" 
            placement="top"
          >
            订单已完成
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="order.status === 'cancelled'" 
            :timestamp="formatDate(order.updatedAt)" 
            placement="top"
            type="danger"
          >
            订单已取消
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
    
    <!-- 加载中状态 -->
    <el-skeleton
      v-if="loading"
      :rows="10"
      animated
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../stores/useOrderStore'
import { apiClient } from '../api'
import webSocketService from '../utils/websocket'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Money, Check, Delete, Wallet, ChatDotRound, CreditCard, RefreshLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 订单ID
const orderId = computed(() => route.params.id)

// 订单数据
const order = ref({
  id: '',
  orderNo: '',
  status: '',
  totalAmount: 0,
  address: '',
  phone: '',
  receiver: '',
  paymentMethod: '',
  paymentTime: null,
  createdAt: '',
  updatedAt: '',
  paymentTimeout: null,
  items: []
})

// 加载中状态
const loading = ref(true)
// 支付加载中状态
const paying = ref(false)
// 支付倒计时
const remainingTime = ref(0)
// 倒计时定时器
let countdownTimer = null
// 选择的支付方式
const selectedPaymentMethod = ref('alipay')

// 是否可以执行操作
const canPerformActions = computed(() => {
  const status = order.value.status
  return status === 'pending' || status === 'paid'
})

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化剩余时间
const formatRemainingTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行卡'
  }
  return methodMap[method] || method
}

// 启动支付倒计时
const startCountdown = () => {
  // 清除之前的定时器
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  // 计算剩余时间
  if (order.value.status === 'pending' && order.value.paymentTimeout) {
    const timeoutTime = dayjs(order.value.paymentTimeout)
    const now = dayjs()
    const diffSeconds = Math.max(0, timeoutTime.diff(now, 'second'))
    remainingTime.value = diffSeconds

    // 启动倒计时
    countdownTimer = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        clearInterval(countdownTimer)
        // 检查订单状态
        checkOrderStatus()
      }
    }, 1000)
  }
}

// 检查订单状态
const checkOrderStatus = async () => {
  try {
    const response = await apiClient.order.queryPayStatus(order.value.id)
    if (response.success) {
      const status = response.data.status
      if (status !== order.value.status) {
        await loadOrderDetail()
        ElMessage.info(`订单状态已更新为：${getStatusText(status)}`)
      }
    }
  } catch (error) {
    console.error('检查订单状态失败:', error)
  }
}

// 加载订单详情
const loadOrderDetail = async () => {
  // 检查订单ID是否有效
  if (!orderId.value) {
    console.error('无效的订单ID:', orderId.value)
    ElMessage.error('无效的订单ID')
    router.push('/orders') // 重定向到订单列表页
    return
  }
  
  try {
    loading.value = true
    const orderData = await orderStore.getOrderDetail(orderId.value)
    
    // 确保orderData不为undefined
    const safeOrderData = orderData || {}
    
    // 使用从 store 返回的订单数据，但保留本地已经更新的状态
    // 这是为了避免后端数据更新延迟导致的状态闪回问题
    if (order.value.status === 'cancelled' && safeOrderData.status !== 'cancelled') {
      // 如果本地状态已经是已取消，但后端返回的不是，说明后端数据更新延迟
      // 保留本地状态，并添加重试机制
      console.warn('后端数据更新延迟，保留本地已取消状态');
      // 保留本地状态，只更新其他字段
      order.value = {
        ...safeOrderData,
        status: 'cancelled'
      };
    } else {
      // 正常情况，直接使用后端返回的数据
      order.value = safeOrderData;
    }
    
    // 设置默认支付方式
    if (safeOrderData.paymentMethod) {
      selectedPaymentMethod.value = safeOrderData.paymentMethod
    }
    
    // 启动支付倒计时
    startCountdown()
    
    // 检查是否需要支付
    if (route.query.paymentRequired === 'true' && order.value.status === 'pending') {
      // 自动弹出支付确认
      setTimeout(() => {
        ElMessageBox.confirm('订单已创建成功，是否立即支付？', '支付确认', {
          confirmButtonText: '立即支付',
          cancelButtonText: '稍后支付',
          type: 'warning'
        }).then(() => {
          payOrder()
        }).catch(() => {
          // 取消支付，不做处理
        })
      }, 500)
    } else if (route.query.paymentRequired === 'true' && order.value.status !== 'pending') {
      // 如果订单状态不是待支付，但路由参数仍然存在，清除参数
      router.replace({ query: {} })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 支付重试次数
const retryCount = ref(0)
// 最大重试次数
const maxRetryCount = 3

// 支付状态轮询定时器
let pollTimer = null

// 去支付
const payOrder = async (autoRetry = false) => {
  if (order.value.status !== 'pending') {
    ElMessage.warning('订单状态不正确，无法支付')
    return
  }

  if (remainingTime.value <= 0) {
    ElMessage.warning('支付已超时')
    return
  }

  try {
    paying.value = true
    
    // 调用支付接口，获取支付参数
    const response = await apiClient.order.payOrder(order.value.id, selectedPaymentMethod.value)
    
    if (response.success) {
      const paymentData = response.data
      
      console.log('支付参数:', paymentData)
      
      // 根据支付方式进行不同处理
      if (selectedPaymentMethod.value === 'alipay') {
        // 支付宝PC网页支付 - 提交表单
        handleAlipayPayment(paymentData)
      } else if (selectedPaymentMethod.value === 'alipay_qr') {
        // 支付宝二维码支付
        handleAlipayQRPayment(paymentData)
      } else if (selectedPaymentMethod.value === 'bank') {
        // 银行卡支付（银联）
        handleUnionpayPayment(paymentData)
      } else if (selectedPaymentMethod.value === 'wechat') {
        // 微信支付（模拟处理）
        handleWechatPayment(paymentData)
      }
      
      // 重置重试次数
      retryCount.value = 0
    } else {
      const errorMessage = response.error || '获取支付参数失败'
      ElMessage.error(errorMessage)
      
      // 处理支付失败
      handlePaymentFailure(errorMessage, autoRetry)
    }
  } catch (error) {
    console.error('支付失败:', error)
    const errorMessage = error.message || '网络错误，请稍后重试'
    ElMessage.error('支付失败: ' + errorMessage)
    
    // 处理支付失败
    handlePaymentFailure(errorMessage, autoRetry)
  } finally {
    paying.value = false
  }
}

// 处理支付宝PC网页支付
const handleAlipayPayment = async (paymentData) => {
  try {
    // 创建隐藏表单并提交
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'https://openapi.alipay.com/gateway.do'
    
    // 解析支付宝返回的formData
    const params = new URLSearchParams(paymentData.formData)
    params.forEach((value, key) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })
    
    document.body.appendChild(form)
    form.submit()
  } catch (error) {
    console.error('支付宝支付处理失败:', error)
    ElMessage.error('支付宝支付处理失败')
  }
}

// 处理支付宝二维码支付
const handleAlipayQRPayment = async (paymentData) => {
  try {
    // 使用在线二维码生成服务
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.qrCode)}`
    
    // 显示二维码支付弹窗
    ElMessageBox({
      title: '支付宝扫码支付',
      message: `
        <div style="text-align: center;">
          <p>请使用支付宝扫码支付</p>
          <img src="${qrCodeUrl}" alt="支付二维码" style="width: 200px; height: 200px; margin: 20px auto; display: block;" />
          <p>订单金额: ¥${paymentData.totalAmount}</p>
        </div>
      `,
      dangerouslyUseHTMLString: true,
      confirmButtonText: '支付完成',
      cancelButtonText: '取消支付',
      showCancelButton: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    }).then(() => {
      // 用户点击支付完成，检查订单状态
      startPaymentPolling(paymentData.orderId)
    }).catch(() => {
      // 取消支付
      stopPaymentPolling()
      ElMessage.info('支付已取消')
    })
    
    // 启动轮询检查支付状态
    startPaymentPolling(paymentData.orderId)
  } catch (error) {
    console.error('支付宝二维码支付处理失败:', error)
    ElMessage.error('支付处理失败')
  }
}

// 处理银联支付
const handleUnionpayPayment = async (paymentData) => {
  try {
    // 创建表单提交到银联支付网关
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentData.formAction
    
    // 添加银联支付参数
    for (const [key, value] of Object.entries(paymentData.params)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    }
    
    document.body.appendChild(form)
    form.submit()
  } catch (error) {
    console.error('银联支付处理失败:', error)
    ElMessage.error('银联支付处理失败')
  }
}

// 处理微信支付（模拟）
const handleWechatPayment = async (paymentData) => {
  try {
    // 微信支付需要调用微信JSAPI或跳转微信支付页面
    ElMessage.info('正在跳转到微信支付...')
    
    // 模拟支付流程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 启动轮询检查支付状态
    startPaymentPolling(paymentData.orderId)
  } catch (error) {
    console.error('微信支付处理失败:', error)
    ElMessage.error('微信支付处理失败')
  }
}

// 启动支付状态轮询
const startPaymentPolling = (orderId) => {
  // 清除之前的定时器
  stopPaymentPolling()
  
  // 每3秒检查一次支付状态
  pollTimer = setInterval(async () => {
    try {
      const response = await apiClient.order.pollPayStatus(orderId)
      if (response.success) {
        const data = response.data
        
        if (data.isPaid) {
          // 支付成功
          stopPaymentPolling()
          ElMessage.success('支付成功')
          await loadOrderDetail()
          
          // 关闭可能存在的弹窗
          document.querySelectorAll('.el-message-box__close').forEach(el => el.click())
        } else if (data.isCancelled) {
          // 订单已取消
          stopPaymentPolling()
          ElMessage.warning('订单已取消')
        }
      }
    } catch (error) {
      console.error('轮询支付状态失败:', error)
    }
  }, 3000)
}

// 停止支付状态轮询
const stopPaymentPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 处理支付失败
const handlePaymentFailure = (errorMessage, autoRetry = false) => {
  // 检查是否是网络错误或超时错误
  const isNetworkError = errorMessage.includes('Network Error') || errorMessage.includes('timeout') || errorMessage.includes('网络错误')
  
  // 如果是网络错误且未达到最大重试次数，自动重试
  if (isNetworkError && autoRetry && retryCount.value < maxRetryCount) {
    retryCount.value++
    console.log(`自动重试支付 (${retryCount.value}/${maxRetryCount})`)
    
    // 延迟一段时间后重试
    setTimeout(() => {
      payOrder(true)
    }, 2000 * retryCount.value) // 指数退避
    
    ElMessage.warning(`支付失败，正在自动重试 (${retryCount.value}/${maxRetryCount})...`)
  } else {
    // 重置重试次数
    retryCount.value = 0
    
    // 显示支付失败提示，询问是否重试
    ElMessageBox.confirm(`支付失败: ${errorMessage}\n\n是否重试？`, '支付失败', {
      confirmButtonText: '重试',
      cancelButtonText: '取消',
      type: 'error',
      // 添加详细的错误提示和建议
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    }).then(() => {
      payOrder()
    }).catch(() => {
      // 取消重试，显示取消提示
      ElMessage.info('支付已取消，您可以在订单列表中重新尝试支付')
    })
  }
}

// 支付重试
const retryPayment = async () => {
  await payOrder()
}

// 确认收货
const confirmDelivery = async () => {
  try {
    await orderStore.confirmOrder(order.value.id)
    ElMessage.success('确认收货成功')
    await loadOrderDetail()
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败，请重试')
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消订单吗？', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.cancelOrder(order.value.id)
    ElMessage.success('订单取消成功')
    
    // 先获取最新订单状态
    await loadOrderDetail()
    
    // 然后清除路由参数，避免再次弹出支付确认对话框
    if (route.query.paymentRequired) {
      router.replace({ query: {} })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败，请重试')
    }
  }
}

// 监听订单状态变化
watch(() => order.value.status, (newStatus) => {
  if (newStatus === 'pending') {
    startCountdown()
  } else {
    // 清除倒计时
    if (countdownTimer) {
      clearInterval(countdownTimer)
      remainingTime.value = 0
    }
  }
})

// 处理支付状态更新
const handlePaymentStatusUpdate = (data) => {
  console.log('收到支付状态更新:', data)
  if (data.orderId === order.value.id) {
    const { status, transactionId, payTime } = data
    if (status !== order.value.status) {
      loadOrderDetail()
      ElMessage.info(`订单状态已更新为：${getStatusText(status)}`)
    }
  }
}

// 组件卸载时清除定时器和事件监听
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  // 移除支付状态更新事件监听
  webSocketService.offPaymentStatusUpdate()
})

// 组件挂载时加载数据
onMounted(async () => {
  await loadOrderDetail()
  
  // 初始化WebSocket连接
  try {
    const connected = await webSocketService.ensureConnection()
    if (connected) {
      // 监听支付状态更新事件
      webSocketService.onPaymentStatusUpdate(handlePaymentStatusUpdate)
      
      // 如果订单状态为待支付，发送支付状态查询事件
      if (order.value.status === 'pending') {
        webSocketService.sendPaymentStatusQuery(order.value.id)
      }
    }
  } catch (error) {
    console.error('WebSocket初始化失败:', error)
  }
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info, .shipping-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-row .label {
  font-weight: bold;
  margin-right: 10px;
  width: 100px;
}

.info-row .value {
  flex: 1;
}

.info-row .amount {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.order-timeline {
  padding: 20px 0;
}

/* 支付方式选择样式 */
.payment-methods {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.payment-method-item {
  min-width: 150px;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.payment-method-item:hover {
  background-color: #f5f7fa;
}

.payment-method-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-method-info span {
  font-size: 16px;
}

/* 支付加载状态 */
.paying-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 倒计时样式 */
.countdown {
  font-weight: bold;
  color: #f56c6c;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .order-info,
  .shipping-info {
    grid-template-columns: 1fr;
  }
  
  .payment-methods {
    flex-direction: column;
  }
  
  .payment-method-item {
    width: 100%;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .order-actions button {
    width: 100%;
  }
}
</style>