<template>
  <div class="product-detail-container">
    <!-- 退出查看按钮 -->
    <button 
      class="exit-view-button" 
      aria-label="退出查看，返回上一页" 
      tabindex="0"
      @click="exitView"
      @keydown.enter="exitView"
      @keydown.space="exitView"
    >
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
        ><path d="M9 18l-6-6 6-6" /><path d="M15 6h6v12h-6" /></svg>
      </el-icon>
      <span>退出查看</span>
    </button>
    <div class="container">
      <div
        v-if="productStore.loading"
        class="loading"
      >
        <el-icon class="is-loading">
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
          /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        </el-icon>
        <span>加载中...</span>
      </div>
      <div
        v-else-if="!productStore.productDetail"
        class="empty"
      >
        <el-empty description="商品不存在" />
      </div>
      <div
        v-else
        class="product-detail"
      >
        <!-- 商品图片 -->
        <div class="product-images">
          <div class="image-container">
            <el-carousel
              :interval="5000"
              height="500px"
              class="image-carousel"
            >
              <el-carousel-item
                v-for="(image, index) in productStore.productDetail.images"
                :key="index"
                class="carousel-item"
              >
                <img
                  :src="image"
                  :alt="productStore.productDetail.name"
                  class="main-image"
                  @click="openFullscreen(image)"
                >
              </el-carousel-item>
            </el-carousel>
            <!-- 填充屏幕按钮 -->
            <button 
              class="fullscreen-button"
              @click="openFullscreen(productStore.productDetail.images[0])"
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
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </el-icon>
              <span>填充屏幕</span>
            </button>
          </div>
        </div>
        
        <!-- 商品信息 -->
        <div class="product-info">
          <h1 class="product-name">
            {{ productStore.productDetail.name }}
          </h1>
          <div class="product-status">
            <el-tag :type="getStatusType(productStore.productDetail.status)">
              {{ getStatusText(productStore.productDetail.status) }}
            </el-tag>
          </div>
          <p class="product-price">
            ¥{{ formatPrice(productStore.productDetail.price) }}
          </p>
          <div class="product-meta">
            <span class="meta-item">库存: {{ productStore.productDetail.stock }}</span>
            <span class="meta-item">浏览: {{ productStore.productDetail.viewCount }}</span>
            <span class="meta-item">分类: {{ productStore.productDetail.category }}</span>
            <span class="meta-item">发布时间: {{ formatDate(productStore.productDetail.createdAt) }}</span>
          </div>
          
          <!-- 购买选项 -->
          <div class="purchase-options">
            <el-form
              :inline="true"
              class="quantity-form"
            >
              <el-form-item label="数量">
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="Math.max(1, productStore.productDetail.stock || 1)" 
                  size="large"
                />
              </el-form-item>
            </el-form>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                :disabled="productStore.productDetail.stock <= 0 || productStore.productDetail.status !== 'approved'" 
                @click="addToCart"
              >
                加入购物车
              </el-button>
              <el-button 
                type="success" 
                size="large" 
                :disabled="productStore.productDetail.stock <= 0 || productStore.productDetail.status !== 'approved'" 
                @click="buyNow"
              >
                立即购买
              </el-button>
              <el-button 
                type="info" 
                size="large" 
                @click="contactSeller"
              >
                联系商家
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 商品详情 -->
        <div class="product-description">
          <h2>商品详情</h2>
          <div class="description-content">
            {{ productStore.productDetail.description }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 聊天弹窗组件 -->
    <ChatPopup
      :visible="showChatPopup"
      :seller="sellerInfo"
      @close="showChatPopup = false"
    />
    
    <!-- 全屏图片查看覆盖层 -->
    <div 
      v-if="isFullscreen" 
      class="fullscreen-overlay"
      @click="closeFullscreen"
    >
      <button 
        class="close-fullscreen-button"
        @click.stop="closeFullscreen"
      >
        <el-icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </el-icon>
      </button>
      <img 
        :src="currentFullscreenImage" 
        alt="全屏查看"
        class="fullscreen-image"
        @click.stop
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '../stores/useProductStore'
import { useCartStore } from '../stores/useCartStore'
import { useUserStore } from '../stores/useUserStore'
import { useMessageStore } from '../stores/useMessageStore'
import ChatPopup from '../components/ChatPopup.vue'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const messageStore = useMessageStore()

// 购买数量
const quantity = ref(1)

// 聊天弹窗状态
const showChatPopup = ref(false)
const sellerInfo = ref(null)

// 全屏查看图片状态
const isFullscreen = ref(false)
const currentFullscreenImage = ref('')

// 添加调试日志，追踪quantity变量变化
watch(quantity, (newVal, oldVal) => {
  console.log(`quantity变化：${oldVal} → ${newVal}`)
})

// 获取商品详情
const fetchProductDetail = async (id) => {
  try {
    await productStore.getProductDetail(id)
    // 确保商品详情加载后，数量重置为1
    quantity.value = 1
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error('获取商品详情失败')
  }
}

// 监听路由变化，获取商品详情
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchProductDetail(newId)
  }
}, { immediate: true })

// 加入购物车
const addToCart = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    // 确保quantity不小于1
    if (quantity.value < 1) {
      quantity.value = 1
    }
    console.log(`添加到购物车，商品ID：${productStore.productDetail.id}，数量：${quantity.value}`)
    await cartStore.addToCart(productStore.productDetail.id, quantity.value)
    ElMessage.success('加入购物车成功')
  } catch (error) {
    console.error('加入购物车失败：', error)
    ElMessage.error(error.message || '加入购物车失败')
  }
}

// 立即购买
const buyNow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 先加入购物车，然后跳转到结算页
  try {
    // 确保quantity不小于1
    if (quantity.value < 1) {
      quantity.value = 1
    }
    console.log(`立即购买，商品ID：${productStore.productDetail.id}，数量：${quantity.value}`)
    await cartStore.addToCart(productStore.productDetail.id, quantity.value)
    router.push('/checkout')
  } catch (error) {
    console.error('操作失败：', error)
    ElMessage.error(error.message || '操作失败')
  }
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

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'approved': return '已审核'
    case 'pending': return '待审核'
    case 'rejected': return '已拒绝'
    default: return status
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化价格
const formatPrice = (price) => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2);
  }
  
  const parsedPrice = parseFloat(price);
  return isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2);
}

// 联系商家
const contactSeller = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    // 从商品信息中获取商家ID
    const sellerId = productStore.productDetail.sellerId;
    const sellerRole = 'seller';
    
    if (!sellerId) {
      ElMessage.error('获取商家信息失败')
      return
    }
    
    // 初始化WebSocket连接（如果尚未连接）
    if (!messageStore.isWebSocketConnected) {
      messageStore.initWebSocket()
    }
    
    // 创建或获取与该商家的会话
    const conversation = await messageStore.createConversation(sellerId, sellerRole);
    
    // 获取会话列表，以便获取商家名称
    await messageStore.updateConversations();
    
    // 查找对应的会话，获取商家名称
    const targetConversation = messageStore.conversations.find(c => 
      ((c.initiatorId === sellerId && c.initiatorRole === sellerRole) && 
       (c.receiverId === userStore.userInfo.id && c.receiverRole === userStore.userInfo.role)) ||
      ((c.receiverId === sellerId && c.receiverRole === sellerRole) && 
       (c.initiatorId === userStore.userInfo.id && c.initiatorRole === userStore.userInfo.role))
    );
    
    // 设置卖家信息，优先使用服务器返回的商家名称，否则使用用户名或商家+ID格式
    const merchantName = targetConversation?.receiverRole === 'seller' ? 
      (targetConversation.receiverName || `用户${sellerId}`) : 
      (targetConversation?.initiatorName || `用户${sellerId}`);
    
    sellerInfo.value = {
      id: sellerId,
      role: sellerRole,
      name: merchantName
    };
    
    // 显示聊天弹窗
    showChatPopup.value = true;
  } catch (error) {
    console.error('联系商家失败:', error)
    ElMessage.error('联系商家失败，请稍后重试')
  }
}

// 退出查看，返回上一页
const exitView = () => {
  router.back()
}

// 打开全屏查看图片
const openFullscreen = (imageSrc) => {
  currentFullscreenImage.value = imageSrc
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭全屏查看
const closeFullscreen = () => {
  isFullscreen.value = false
  currentFullscreenImage.value = ''
  document.body.style.overflow = ''
}

// 清理样式
onUnmounted(() => {
  document.body.style.overflow = ''
})

onMounted(() => {
  const id = route.params.id
  if (id) {
    fetchProductDetail(id)
  }
  
  // 监听ESC键关闭全屏
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
      closeFullscreen()
    }
  })
})
</script>

<style scoped>
.product-detail-container {
  padding: 20px 0;
  position: relative;
}

/* 退出查看按钮样式 */
.exit-view-button {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.exit-view-button:hover {
  background-color: #e4e7ed;
  color: #409eff;
  border-color: #c6e2ff;
}

.exit-view-button:active {
  background-color: #dcdfe6;
  color: #3a8ee6;
  border-color: #3a8ee6;
}

.exit-view-button:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
  gap: 10px;
}

.empty {
  padding: 100px 0;
}

.product-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* 商品图片 */
.product-images {
  margin-bottom: 30px;
}

.image-container {
  position: relative;
}

.image-carousel {
  width: 100%;
}

.carousel-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

/* 填充屏幕按钮 */
.fullscreen-button {
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
}

.fullscreen-button:hover {
  background-color: rgba(0, 0, 0, 0.85);
  transform: scale(1.05);
}

/* 全屏覆盖层 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-fullscreen-button {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 10000;
}

.close-fullscreen-button:hover {
  background-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

.fullscreen-image {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
}

/* 商品信息 */
.product-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.product-name {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.product-status {
  margin-bottom: 20px;
}

.product-price {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 20px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  padding: 5px 0;
}

/* 购买选项 */
.purchase-options {
  margin-top: 30px;
}

.quantity-form {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 商品详情 */
.product-description {
  margin-top: 30px;
}

.product-description h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.description-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail {
    padding: 15px;
  }
  
  .product-name {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 24px;
  }
  
  .product-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  /* 退出查看按钮响应式设计 */
  .exit-view-button {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    font-size: 12px;
  }
  
  /* 在小屏幕上只显示图标，隐藏文字 */
  .exit-view-button span {
    display: none;
  }
  
  .exit-view-button svg {
    width: 16px;
    height: 16px;
  }
  
  /* 填充屏幕按钮响应式设计 */
  .fullscreen-button {
    bottom: 10px;
    right: 10px;
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .fullscreen-button span {
    display: none;
  }
  
  .close-fullscreen-button {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
}
</style>