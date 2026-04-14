<template>
  <div class="checkout-container">
    <h2>结算</h2>
    
    <div class="checkout-content">
      <!-- 左侧：收货地址和订单信息 -->
      <div class="checkout-left">
        <!-- 收货地址 -->
        <el-card
          class="address-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>收货地址</span>
              <div class="header-actions">
                <el-button
                  type="text"
                  size="small"
                  @click="goToAddressManage"
                >
                  管理地址
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="showAddAddress = true"
                >
                  添加地址
                </el-button>
              </div>
            </div>
          </template>
          
          <div
            v-if="selectedAddress"
            class="selected-address-preview"
          >
            <div class="preview-title">
              <el-icon class="check-icon">
                <Check />
              </el-icon>
              <span>已选收货地址</span>
              <el-tag
                v-if="selectedAddress.isDefault"
                type="success"
                size="small"
                class="preview-tag"
              >
                默认
              </el-tag>
            </div>
            <div class="preview-content">
              <div class="preview-row">
                <div class="preview-icon-wrapper">
                  <el-icon class="preview-icon">
                    <House />
                  </el-icon>
                </div>
                <div class="preview-text">
                  <span class="preview-label">收货人</span>
                  <span class="preview-value">{{ selectedAddress.receiver }}</span>
                </div>
              </div>
              <div class="preview-row">
                <div class="preview-icon-wrapper">
                  <el-icon class="preview-icon">
                    <Phone />
                  </el-icon>
                </div>
                <div class="preview-text">
                  <span class="preview-label">联系电话</span>
                  <span class="preview-value">{{ selectedAddress.phone }}</span>
                </div>
              </div>
              <div class="preview-row">
                <div class="preview-icon-wrapper">
                  <el-icon class="preview-icon">
                    <Location />
                  </el-icon>
                </div>
                <div class="preview-text">
                  <span class="preview-label">所在地区</span>
                  <span class="preview-value region-full">{{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }}</span>
                </div>
              </div>
              <div class="preview-row detail-row">
                <div class="preview-icon-wrapper">
                  <el-icon class="preview-icon">
                    <Location />
                  </el-icon>
                </div>
                <div class="preview-text">
                  <span class="preview-label">详细地址</span>
                  <span class="preview-value">{{ selectedAddress.detail }}</span>
                </div>
              </div>
              <div
                v-if="selectedAddress.postalCode"
                class="preview-row"
              >
                <div class="preview-icon-wrapper">
                  <el-icon class="preview-icon">
                    <Location />
                  </el-icon>
                </div>
                <div class="preview-text">
                  <span class="preview-label">邮政编码</span>
                  <span class="preview-value">{{ selectedAddress.postalCode }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div
            v-else
            class="no-address-tip"
          >
            <el-empty description="暂无收货地址">
              <el-button
                type="primary"
                @click="goToAddressManage"
              >
                去添加地址
              </el-button>
            </el-empty>
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
            <div 
              v-for="item in orderItems" 
              :key="item.id" 
              class="order-item"
            >
              <div class="item-image">
                <el-image 
                  :src="item.product.images && item.product.images.length > 0 ? item.product.images[0] : ''" 
                  :fit="'cover'" 
                  style="width: 80px; height: 80px"
                />
                <el-tag 
                  v-if="item.type === 'box'"
                  type="warning"
                  size="small"
                  class="item-type-tag"
                >
                  盲盒
                </el-tag>
                <el-tag 
                  v-else
                  type="success"
                  size="small"
                  class="item-type-tag"
                >
                  商品
                </el-tag>
              </div>
              <div class="item-info">
                <div class="item-name">
                  {{ item.product.name }}
                </div>
                <div class="item-price">
                  ¥{{ Number(item.product.price || 0).toFixed(2) }}
                </div>
              </div>
              <div class="item-quantity">
                x{{ item.quantity }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 右侧：订单总计和支付方式 -->
      <div class="checkout-right">
        <el-card
          class="order-summary-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>订单总计</span>
            </div>
          </template>
          
          <div class="order-summary">
            <div class="summary-item">
              <span>商品总价</span>
              <span>¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>运费</span>
              <span>¥{{ shippingFee.toFixed(2) }}</span>
            </div>
            <div class="summary-item total">
              <span>实付金额</span>
              <span class="total-amount">¥{{ (totalAmount + shippingFee).toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- 支付方式 -->
          <div
            class="payment-method"
            style="margin-top: 20px;"
          >
            <h3>支付方式</h3>
            <el-radio-group
              v-model="selectedPayment"
              @change="onPaymentMethodChange"
            >
              <el-radio-button
                label="alipay"
                class="payment-option"
              >
                <div class="payment-option-content">
                  <el-icon class="payment-icon">
                    <Wallet />
                  </el-icon>
                  <span>支付宝</span>
                </div>
              </el-radio-button>
              <el-radio-button
                label="wechat"
                class="payment-option"
              >
                <div class="payment-option-content">
                  <el-icon class="payment-icon">
                    <ChatDotRound />
                  </el-icon>
                  <span>微信支付</span>
                </div>
              </el-radio-button>
              <el-radio-button
                label="bank"
                class="payment-option"
              >
                <div class="payment-option-content">
                  <el-icon class="payment-icon">
                    <CreditCard />
                  </el-icon>
                  <span>银行卡</span>
                </div>
              </el-radio-button>
            </el-radio-group>
            
            <!-- 支付方式说明 -->
            <div
              class="payment-method-info"
              style="margin-top: 10px;"
            >
              <el-alert
                v-if="selectedPayment === 'alipay'"
                title="支付宝支付"
                type="success"
                description="使用支付宝APP扫码支付或支付宝账号登录支付"
                show-icon
                :closable="false"
              />
              <el-alert
                v-else-if="selectedPayment === 'wechat'"
                title="微信支付"
                type="success"
                description="使用微信APP扫码支付"
                show-icon
                :closable="false"
              />
              <el-alert
                v-else-if="selectedPayment === 'bank'"
                title="银行卡支付"
                type="success"
                description="使用银行卡号和密码支付"
                show-icon
                :closable="false"
              />
            </div>
          </div>
          
          <!-- 提交订单按钮 -->
          <div
            class="submit-order"
            style="margin-top: 20px;"
          >
            <el-button 
              type="primary" 
              size="large" 
              style="width: 100%;" 
              :loading="submitting"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 添加地址对话框 -->
    <el-dialog
      v-model="showAddAddress"
      title="添加收货地址"
      width="500px"
    >
      <el-form
        ref="addressForm"
        :model="newAddress"
        :rules="addressRules"
      >
        <el-form-item
          label="收货人"
          prop="receiver"
        >
          <el-input v-model="newAddress.receiver" />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input v-model="newAddress.phone" />
        </el-form-item>
        <el-form-item
          label="省份"
          prop="province"
        >
          <el-input v-model="newAddress.province" />
        </el-form-item>
        <el-form-item
          label="城市"
          prop="city"
        >
          <el-input v-model="newAddress.city" />
        </el-form-item>
        <el-form-item
          label="区县"
          prop="district"
        >
          <el-input v-model="newAddress.district" />
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="detail"
        >
          <el-input
            v-model="newAddress.detail"
            type="textarea"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddAddress = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="addAddress"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useProductStore } from '../stores/useProductStore'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'
import { useOrderStore } from '../stores/useOrderStore'
import { useAddressStore } from '../stores/useAddressStore'
import { useUserStore } from '../stores/useUserStore'
import { ElMessage } from 'element-plus'
import { Wallet, ChatDotRound, CreditCard, Location, Edit, Check, Phone, House } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const productStore = useProductStore()
const boxStore = useMushroomBoxStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()
const userStore = useUserStore()

// 表单引用
const addressForm = ref(null)

// 显示添加地址对话框
const showAddAddress = ref(false)

// 跳转到地址管理页面
const goToAddressManage = () => {
  router.push('/address')
}

// 地址列表
const addresses = ref([])

// 选中的地址
const selectedAddress = ref(null)

// 订单商品
const orderItems = ref([])

// 选中的支付方式
const selectedPayment = ref('alipay')

// 商品总价
const totalAmount = computed(() => {
  return orderItems.value.reduce((total, item) => {
    if (item.selected) {
      const price = Number(item.product.price || 0)
      return total + (price * item.quantity)
    }
    return total
  }, 0)
})

// 运费
const shippingFee = ref(10)

// 提交中状态
const submitting = ref(false)

// 新地址表单
const newAddress = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: ''
})

// 地址表单验证规则
const addressRules = {
  receiver: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 缓存处理后的订单项，避免频繁重新创建对象
const cachedOrderItems = ref([])

// 处理订单项的函数
const processOrderItems = () => {
  const validItems = []
  
  for (const item of cartStore.cartItems) {
    // 检查商品/盲盒是否有效
    let isValid = false
    let productData = null
    let itemType = item.type || 'product'
    
    // 处理盲盒类型
    if (itemType === 'box') {
      if (item.box && item.box.name) {
        productData = {
          name: item.box.name,
          price: item.box.price,
          stock: item.box.stock,
          images: [item.box.image]
        }
        isValid = true
      } else {
        const box = boxStore.boxes.find(b => b.id === item.productId)
        if (box) {
          productData = {
            name: box.name,
            price: box.price,
            stock: box.stock,
            images: [box.image]
          }
          isValid = true
        } else {
          console.warn(`购物车中的盲盒ID ${item.productId} 不存在，将跳过`)
        }
      }
    } 
    // 处理普通商品类型
    else {
      if (item.product && item.product.name) {
        productData = item.product
        isValid = true
      } else {
        const product = productStore.getProductById(item.productId)
        if (product) {
          productData = product
          isValid = true
        } else {
          console.warn(`购物车中的商品ID ${item.productId} 不存在，将跳过`)
        }
      }
    }
    
    if (!isValid) {
      continue
    }
    
    // 检查缓存中是否已有相同ID的项
    const existingItem = cachedOrderItems.value.find(oi => oi.id === item.id)
    
    // 如果已有相同ID的项，只更新变化的属性
    if (existingItem) {
      const productChanged = JSON.stringify(existingItem.product) !== JSON.stringify(productData)
      const otherChanged = 
        existingItem.quantity !== item.quantity ||
        existingItem.selected !== item.selected ||
        existingItem.type !== itemType
      
      if (productChanged || otherChanged) {
        validItems.push({
          ...existingItem,
          quantity: item.quantity,
          selected: item.selected !== false,
          type: itemType,
          product: productChanged ? productData : existingItem.product
        })
      } else {
        validItems.push(existingItem)
      }
    } else {
      // 新项，创建新对象
      validItems.push({
        ...item,
        type: itemType,
        product: productData,
        selected: item.selected !== false
      })
    }
  }
  
  return validItems
}

// 监听购物车变化，更新缓存
watch(
  () => cartStore.cartItems,
  () => {
    cachedOrderItems.value = processOrderItems()
  },
  { deep: true, immediate: true }
)

// 加载购物车数据作为订单商品
const loadOrderItems = async () => {
  await cartStore.getCart()
  // 确保盲盒数据已加载
  if (boxStore.boxes.length === 0) {
    await boxStore.fetchBoxes()
  }
  // 从缓存获取订单项
  orderItems.value = [...cachedOrderItems.value]
}

// 加载地址列表
const loadAddresses = async () => {
  try {
    await addressStore.getAddressList()
    addresses.value = addressStore.addresses
    
    // 检查 URL 中是否有指定的地址 ID
    const selectedAddressId = route.query.selectedAddressId
    if (selectedAddressId && addresses.value.length > 0) {
      const targetAddress = addresses.value.find(addr => addr.id === Number(selectedAddressId))
      if (targetAddress) {
        selectedAddress.value = targetAddress
        // 清除 URL 参数
        router.replace({ query: {} })
        return
      }
    }
    
    // 如果没有指定地址或找不到，使用默认地址
    if (addresses.value.length > 0) {
      selectedAddress.value = addressStore.defaultAddress
    }
  } catch (error) {
    ElMessage.error('获取地址列表失败: ' + (error.message || '未知错误'))
  }
}

// 地址选择变化
const onAddressChange = () => {
  console.log('选中的地址:', selectedAddress.value)
}

// 支付方式选择变化
const onPaymentMethodChange = (value) => {
  console.log('选中的支付方式:', value)
  // 这里可以添加不同支付方式的特殊处理逻辑
  // 例如：显示不同的支付提示、加载不同的支付组件等
  switch (value) {
    case 'alipay':
      // 支付宝支付处理
      break
    case 'wechat':
      // 微信支付处理
      break
    case 'bank':
      // 银行卡支付处理
      break
    default:
      break
  }
}

// 添加地址
const addAddress = async () => {
  await addressForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await addressStore.addAddress(newAddress.value)
        ElMessage.success('添加地址成功')
        showAddAddress.value = false
        
        // 重置表单
        Object.keys(newAddress.value).forEach(key => {
          newAddress.value[key] = ''
        })
        
        // 重新加载地址列表
        await loadAddresses()
      } catch (error) {
        ElMessage.error('添加地址失败: ' + (error.message || '未知错误'))
      }
    }
  })
}

// 监听addressStore.addresses的变化，更新本地addresses状态
watch(
  () => addressStore.addresses,
  (newAddresses) => {
    addresses.value = newAddresses
    // 如果当前选中的地址不存在于新列表中，重新设置默认地址
    if (selectedAddress.value && !newAddresses.some(addr => addr.id === selectedAddress.value.id)) {
      selectedAddress.value = addressStore.defaultAddress
    }
  },
  { deep: true }
)

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (orderItems.value.length === 0) {
    ElMessage.warning('订单商品为空')
    return
  }
  
  submitting.value = true
  
  try {
    // 过滤出选中的商品
    const selectedItems = orderItems.value.filter(item => item.selected)
    
    if (selectedItems.length === 0) {
      ElMessage.warning('请选择要购买的商品')
      submitting.value = false
      return
    }
    
    // 构建订单数据
    const orderData = {
      address: selectedAddress.value.detail,
      phone: selectedAddress.value.phone,
      receiver: selectedAddress.value.receiver,
      paymentMethod: selectedPayment.value,
      cartItems: selectedItems.map(item => ({
        cartId: item.id,
        productId: item.productId,
        quantity: item.quantity,
        type: item.type || 'product'
      }))
    }
    
    // 提交订单
      const response = await orderStore.createOrder(orderData)
      
      // 清空购物车
      await cartStore.clearCart()
      
      // 跳转到订单详情页
      // 修复：从响应中获取订单ID
      const orderId = response.data.id || response.data.orderId;
      if (orderId) {
        // 检查是否有支付参数
        if (response.data.paymentParams) {
          // 跳转到订单详情页，并传递支付参数
          router.push({
            path: `/order/${orderId}`,
            query: { paymentRequired: 'true' }
          })
        } else {
          router.push(`/order/${orderId}`)
        }
      } else {
        // 如果无法获取订单ID，跳转到订单列表页
        router.push('/orders')
      }
      
      ElMessage.success('订单提交成功，请尽快完成支付')
  } catch (error) {
    // 修复：显示具体错误信息，并提供更友好的提示
    console.error('订单提交失败:', error)
    let errorMessage = '订单提交失败，请重试'
    
    // 根据不同的错误类型提供更具体的提示
    if (error.message) {
      if (error.message.includes('请求的资源不存在') || error.message.includes('404')) {
        errorMessage = '服务器连接失败，请稍后重试。如果问题持续存在，请联系管理员。'
      } else if (error.message.includes('网络错误') || error.message.includes('timeout')) {
        errorMessage = '网络连接超时，请检查您的网络连接后重试。'
      } else if (error.message.includes('未登录') || error.message.includes('登录已过期')) {
        errorMessage = '登录已过期，请重新登录后再提交订单。'
      } else if (error.message.includes('库存不足')) {
        errorMessage = error.message
      } else if (error.message.includes('商品')) {
        errorMessage = error.message
      } else {
        errorMessage = error.message
      }
    }
    
    ElMessage.error({
      message: errorMessage,
      duration: 6000,
      showClose: true
    })
  } finally {
    submitting.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  await loadAddresses()
  await loadOrderItems()
  // 同时加载盲盒数据
  if (boxStore.boxes.length === 0) {
    await boxStore.fetchBoxes()
  }
})
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-content {
  display: flex;
  gap: 20px;
}

.checkout-left {
  flex: 1;
}

.checkout-right {
  width: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.no-address-tip {
  padding: 40px 0;
}

.selected-address-preview {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
}

.check-icon {
  font-size: 20px;
}

.preview-tag {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.preview-content {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 18px;
  backdrop-filter: blur(12px);
}

.preview-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
  line-height: 1.8;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-row.detail-row {
  margin-bottom: 16px;
}

.preview-icon-wrapper {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.preview-icon {
  font-size: 16px;
}

.preview-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 400;
}

.preview-value {
  font-size: 15px;
  font-weight: 500;
  word-break: break-all;
}

.region-full {
  letter-spacing: 0.3px;
}

.order-items {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  margin-right: 15px;
  position: relative;
}

.item-type-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
}

.item-info {
  flex: 1;
}

.item-name {
  margin-bottom: 5px;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
}

.item-quantity {
  font-weight: bold;
}

.order-summary {
  padding: 10px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.total {
  font-weight: bold;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
}

.payment-method h3 {
  margin-bottom: 15px;
  font-size: 16px;
}

.payment-option {
  min-width: 120px;
  padding: 10px;
  transition: all 0.3s ease;
}

.payment-option:hover {
  background-color: #f5f7fa;
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.payment-icon {
  font-size: 18px;
}

.payment-method-info {
  margin-top: 15px;
}

.payment-method-info .el-alert {
  margin-bottom: 10px;
}
</style>