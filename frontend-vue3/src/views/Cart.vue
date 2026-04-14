<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2 class="cart-title">
        <el-icon class="title-icon">
          <ShoppingCart />
        </el-icon>
        我的购物车
      </h2>
      <span class="cart-count">({{ cartItems.length }} 件商品)</span>
    </div>
    
    <!-- 购物车为空时的提示 -->
    <div
      v-if="cartItems.length === 0"
      class="empty-cart"
    >
      <div class="empty-icon">
        <el-icon
          :size="80"
          color="#dcdfe6"
        >
          <ShoppingCart />
        </el-icon>
      </div>
      <p class="empty-text">
        购物车是空的
      </p>
      <p class="empty-subtext">
        快去挑选心仪的商品吧！
      </p>
      <el-button
        type="primary"
        size="large"
        class="go-shopping-btn"
        @click="$router.push('/products')"
      >
        <el-icon><ShoppingBag /></el-icon>
        去购物
      </el-button>
    </div>
    
    <!-- 购物车列表 -->
    <div
      v-else
      class="cart-list"
    >
      <!-- 选择操作栏 -->
      <div class="select-bar">
        <el-checkbox 
          v-model="isAllSelected" 
          class="select-all"
          @change="toggleAllSelected"
        >
          全选
        </el-checkbox>
        <span class="selected-count">已选 {{ selectedCount }} 件</span>
      </div>
      
      <!-- 商品列表 -->
      <div class="cart-items">
        <div 
          v-for="item in cartItems" 
          :key="item.id"
          class="cart-item-card"
          :class="{ 'item-selected': item.selected }"
        >
          <div class="item-select">
            <el-checkbox 
              v-model="item.selected"
              @change="updateItemSelection(item)"
            />
          </div>
          
          <div class="item-image">
            <el-image 
              :src="getItemImageSrc(item)" 
              :fit="'cover'"
              :lazy="true"
              :initial-index="0"
              :preview-src-list="getPreviewImages(item)"
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
            <div class="item-id">
              ID: {{ item.productId }}
            </div>
          </div>
          
          <div class="item-price">
            <span class="price-label">单价</span>
            <span class="price-value">¥{{ Number(item.product.price || 0).toFixed(2) }}</span>
          </div>
          
          <div class="item-quantity">
            <el-input-number 
              v-model="item.quantity" 
              :min="1" 
              :max="Math.max(1, item.product.stock || 999)" 
              :controls-position="right"
              size="large"
              @change="updateQuantity(item)"
            />
          </div>
          
          <div class="item-subtotal">
            <span class="subtotal-label">小计</span>
            <span class="subtotal-value">¥{{ (Number(item.product.price || 0) * item.quantity).toFixed(2) }}</span>
          </div>
          
          <div class="item-actions">
            <el-button 
              type="danger" 
              size="small"
              text
              @click="removeItem(item)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 结算信息 -->
      <div class="cart-summary">
        <div class="summary-left">
          <el-button 
            type="danger" 
            text
            @click="clearCart"
          >
            <el-icon><Delete /></el-icon>
            清空购物车
          </el-button>
        </div>
        
        <div class="summary-right">
          <div class="summary-info">
            <span class="info-label">已选商品：</span>
            <span class="info-value">{{ selectedCount }} 件</span>
          </div>
          <div class="summary-total">
            <span class="total-label">合计：</span>
            <span class="total-value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <el-button
            type="primary"
            size="large"
            class="checkout-btn"
            :disabled="selectedCount === 0"
            @click="goCheckout"
          >
            <el-icon><ShoppingBag /></el-icon>
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, ShoppingBag, Delete } from '@element-plus/icons-vue'
import { useCartStore } from '../stores/useCartStore'
import { useProductStore } from '../stores/useProductStore'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'
import { useUserStore } from '../stores/useUserStore'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()
const boxStore = useMushroomBoxStore()
const userStore = useUserStore()

// 缓存处理后的购物车数据，避免每次都重新创建对象
const cachedCartItems = ref([])

// 处理购物车数据的函数
const processCartItems = () => {
  const validItems = []
  
  for (const item of cartStore.cartItems) {
    // 检查商品/盲盒是否有效
    let isValid = false
    let productData = null
    
    if (item.type === 'box') {
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
    } else {
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
    const existingItem = cachedCartItems.value.find(ci => ci.id === item.id)
    
    // 如果已有相同ID的项，只更新变化的属性，避免创建新对象
    if (existingItem) {
      const productChanged = JSON.stringify(existingItem.product) !== JSON.stringify(productData)
      const otherChanged = 
        existingItem.quantity !== item.quantity ||
        existingItem.selected !== item.selected ||
        existingItem.type !== item.type
      
      if (productChanged || otherChanged) {
        validItems.push({
          ...existingItem,
          quantity: item.quantity,
          selected: item.selected,
          type: item.type,
          product: productChanged ? productData : existingItem.product
        })
      } else {
        validItems.push(existingItem)
      }
    } else {
      // 新项，创建新对象
      validItems.push({
        ...item,
        product: productData
      })
    }
  }
  
  return validItems
}

// 监听store变化，更新缓存
watch(
  () => cartStore.cartItems,
  () => {
    cachedCartItems.value = processCartItems()
  },
  { deep: true, immediate: true }
)

// 暴露给模板使用的购物车商品列表
const cartItems = computed(() => cachedCartItems.value)

// 获取商品图片URL
const getItemImageSrc = (item) => {
  if (item.product && item.product.images && item.product.images.length > 0) {
    const src = item.product.images[0]
    // 确保URL是完整的
    if (src && !src.startsWith('http') && !src.startsWith('/')) {
      return '/' + src
    }
    return src
  }
  return '/images/placeholder-mushroom-300.svg'
}

// 获取预览图片列表
const getPreviewImages = (item) => {
  if (item.product && item.product.images && item.product.images.length > 0) {
    return item.product.images.map(img => {
      if (img && !img.startsWith('http') && !img.startsWith('/')) {
        return '/' + img
      }
      return img
    })
  }
  return ['/images/placeholder-mushroom-300.svg']
}

// 已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

// 是否全选
const isAllSelected = computed({
  get: () => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  },
  set: (value) => {
    cartItems.value.forEach(item => {
      item.selected = value
    })
  }
})

// 计算总金额
const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    if (item.selected) {
      const price = Number(item.product.price || 0)
      return total + (price * item.quantity)
    }
    return total
  }, 0)
})

// 全选/取消全选
const toggleAllSelected = async (value) => {
  try {
    await cartStore.toggleAllSelected(value)
  } catch (error) {
    console.error('全选操作失败:', error)
  }
}

// 更新单个商品选中状态
const updateItemSelection = async (item) => {
  try {
    await cartStore.updateCartItemStatus(item.id, item.selected)
  } catch (error) {
    console.error('更新选中状态失败:', error)
  }
}

// 更新商品数量
const updateQuantity = async (item) => {
  try {
    await cartStore.updateCartItem(item.id, item.quantity)
    ElMessage.success('数量已更新')
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
  }
}

// 删除商品
const removeItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await cartStore.deleteCartItem(item.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 清空购物车
const clearCart = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空购物车吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await cartStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空购物车失败:', error)
    }
  }
}

// 前往结算
const goCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  router.push('/checkout')
}

// 组件挂载时加载数据
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  await cartStore.getCart()
  if (boxStore.boxes.length === 0) {
    await boxStore.fetchBoxes()
  }
})
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 80vh;
}

.cart-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 12px;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.title-icon {
  color: #409eff;
}

.cart-count {
  font-size: 16px;
  color: #909399;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 16px;
}

.empty-icon {
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  font-size: 20px;
  color: #606266;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-subtext {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px 0;
}

.go-shopping-btn {
  padding: 14px 40px;
  font-size: 16px;
  border-radius: 8px;
}

.cart-list {
  margin-top: 20px;
}

.select-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #ebeef5;
}

.select-all {
  font-size: 14px;
}

.selected-count {
  font-size: 14px;
  color: #909399;
}

.cart-items {
  background: #fff;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.cart-item-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f7fa;
  transition: all 0.3s ease;
  position: relative;
}

.cart-item-card:last-child {
  border-bottom: none;
}

.cart-item-card:hover {
  background: #fafafa;
}

.cart-item-card.item-selected {
  background: linear-gradient(90deg, #ecf5ff 0%, #fff 100%);
}

.item-select {
  width: 40px;
  display: flex;
  justify-content: center;
}

.item-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.item-image .el-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.item-image .el-image__error,
.item-image .el-image__placeholder {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
}

.item-info {
  flex: 1;
  min-width: 0;
  margin-right: 20px;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-id {
  font-size: 12px;
  color: #c0c4cc;
}

.item-price,
.item-subtotal {
  width: 160px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px;
}

.price-label,
.subtotal-label {
  font-size: 12px;
  color: #909399;
}

.price-value,
.subtotal-value {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.item-quantity {
  width: 180px;
  display: flex;
  justify-content: center;
  padding: 0 10px;
}

.item-actions {
  width: 100px;
  display: flex;
  justify-content: center;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 24px 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.summary-left {
  display: flex;
  align-items: center;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.summary-info {
  font-size: 14px;
  color: #606266;
}

.info-label {
  color: #909399;
}

.info-value {
  font-weight: 600;
  color: #303133;
}

.summary-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 16px;
  color: #303133;
}

.total-value {
  font-size: 28px;
  font-weight: 700;
  color: #f56c6c;
}

.checkout-btn {
  padding: 14px 40px;
  font-size: 16px;
  border-radius: 8px;
}

.checkout-btn:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
}
</style>
