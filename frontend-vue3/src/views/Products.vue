<template>
  <div class="products-container">
    <div class="container">
      <h2>商品列表</h2>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-header">
          <h3 class="filter-title">
            筛选条件
          </h3>
        </div>
        <el-form
          :inline="true"
          :model="filterForm"
          class="filter-form"
        >
          <div class="filter-group">
            <span class="filter-label">分类</span>
            <el-select
              v-model="filterForm.categories"
              placeholder="请选择分类"
              size="default"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              class="filter-select"
            >
              <el-option
                v-for="category in categories"
                :key="category.value"
                :value="category.value"
                :label="category.label"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">价格范围</span>
            <div class="price-range-wrapper">
              <el-slider
                v-model="priceRange"
                range
                :min="0"
                :max="1000"
                :step="10"
                size="default"
                class="price-slider"
              />
              <div class="price-display">
                <span class="price-value">¥{{ priceRange[0] }}</span>
                <span class="price-separator">-</span>
                <span class="price-value">¥{{ priceRange[1] }}</span>
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">布局</span>
            <div class="layout-selector">
              <el-button
                v-for="count in [2, 3, 4, 5]"
                :key="count"
                :type="itemsPerRow === count ? 'primary' : 'default'"
                size="small"
                class="layout-btn"
                @click="itemsPerRow = count"
              >
                {{ count }}列
              </el-button>
            </div>
          </div>
          
          <div class="filter-actions">
            <el-button
              type="primary"
              size="default"
              class="filter-btn primary"
              @click="handleFilter"
            >
              <el-icon><Search /></el-icon>
              筛选
            </el-button>
            <el-button
              size="default"
              class="filter-btn reset"
              @click="resetFilter"
            >
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form>
      </div>
      
      <!-- 商品列表 -->
      <div class="products-section">
        <div
          v-if="productStore.loading || isLoadingBoxes"
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
          v-else-if="combinedProducts.length === 0"
          class="empty"
        >
          <el-empty description="暂无商品" />
        </div>
        <div
          v-else
          class="products-grid"
          :style="{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }"
        >
          <div
            v-for="product in combinedProducts"
            :key="product.id"
            class="product-card"
            :class="{ 'box-card': product.isBox }"
          >
            <router-link
              :to="product.isBox ? `/mushroom-boxes/${product.originalId}` : `/product/${product.id}`"
              class="product-link"
            >
              <div class="product-image">
                <img
                  :src="product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder-mushroom-300.svg'"
                  :alt="product.name"
                  @error="(e) => e.target.src = '/images/placeholder-mushroom-300.svg'"
                >
                <div
                  v-if="product.status === 'pending'"
                  class="status-badge pending"
                >
                  待审核
                </div>
                <div
                  v-else-if="product.status === 'rejected'"
                  class="status-badge rejected"
                >
                  已拒绝
                </div>
                <div
                  v-if="product.isBox"
                  class="status-badge box-badge"
                >
                  盲盒
                </div>
              </div>
              <div class="product-info">
                <h3 class="product-name">
                  {{ product.name }}
                </h3>
                <p class="product-description">
                  {{ product.description }}
                </p>
                <p class="product-price">
                  ¥{{ Number(product.price || 0).toFixed(2) }}
                </p>
                <div class="product-stats">
                  <span class="stock">库存: {{ product.stock }}</span>
                  <span class="views">浏览: {{ product.viewCount }}</span>
                </div>
                <div class="product-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="addToCart(product.id, product.isBox, product.originalId)"
                  >
                    {{ product.isBox ? '查看详情' : '加入购物车' }}
                  </el-button>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        
        <!-- 分页 - 只在显示普通商品时显示 -->
        <div
          v-if="filterForm.category !== '盲盒' && productStore.total > 0"
          class="pagination"
        >
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[9, 12, 15, 18, 21, 24, 30]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="productStore.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useProductStore } from '../stores/useProductStore'
import { useCartStore } from '../stores/useCartStore'
import { useUserStore } from '../stores/useUserStore'
import { useMushroomBoxStore } from '../stores/useMushroomBoxStore'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const boxStore = useMushroomBoxStore()

// 合并商品和盲盒数据
const combinedProducts = ref([])
const isLoadingBoxes = ref(false)

// 筛选表单
const filterForm = ref({
  categories: [],
  minPrice: 0,
  maxPrice: 1000
})

// 价格范围
const priceRange = ref([0, 1000])

// 每行商品数
const itemsPerRow = ref(3)

// 分页
const currentPage = ref(1)
const pageSize = ref(9)

// 分类列表
const categories = productStore.categories

// 获取商品列表
const fetchProducts = async () => {
  try {
    // 重置合并数据
    combinedProducts.value = []
    isLoadingBoxes.value = false
    
    const selectedCategories = filterForm.value.categories || []
    const hasBoxCategory = selectedCategories.includes('盲盒')
    const otherCategories = selectedCategories.filter(c => c !== '盲盒')
    
    if (selectedCategories.length === 0) {
      // 没有选择分类：只获取普通商品
      await productStore.getProducts({
        page: currentPage.value,
        limit: pageSize.value,
        category: '',
        minPrice: priceRange.value[0],
        maxPrice: priceRange.value[1]
      })
      combinedProducts.value = productStore.products
    } else if (hasBoxCategory && otherCategories.length === 0) {
      // 只选择了盲盒分类：只获取盲盒数据
      isLoadingBoxes.value = true
      await boxStore.fetchBoxes()
      isLoadingBoxes.value = false
      
      // 转换盲盒数据为商品格式
      const boxProducts = boxStore.activeBoxes.map(box => ({
        id: `box_${box.id}`,
        originalId: box.id,
        name: box.name,
        description: box.description,
        price: box.price,
        stock: box.stock || 999,
        viewCount: box.viewCount || 0,
        status: 'active',
        category: '盲盒',
        images: box.image ? [box.image] : [],
        isBox: true
      }))
      
      combinedProducts.value = boxProducts
    } else {
      // 选择了多个分类：获取普通商品和可能的盲盒
      let allProducts = []
      
      if (otherCategories.length > 0) {
        // 先获取普通商品（不包含盲盒）
        await productStore.getProducts({
          page: currentPage.value,
          limit: pageSize.value,
          categories: otherCategories,
          minPrice: priceRange.value[0],
          maxPrice: priceRange.value[1]
        })
        allProducts = [...productStore.products]
      }
      
      if (hasBoxCategory) {
        // 如果选择了盲盒分类，也获取盲盒
        isLoadingBoxes.value = true
        await boxStore.fetchBoxes()
        isLoadingBoxes.value = false
        
        // 转换盲盒数据为商品格式
        const boxProducts = boxStore.activeBoxes.map(box => ({
          id: `box_${box.id}`,
          originalId: box.id,
          name: box.name,
          description: box.description,
          price: box.price,
          stock: box.stock || 999,
          viewCount: box.viewCount || 0,
          status: 'active',
          category: '盲盒',
          images: box.image ? [box.image] : [],
          isBox: true
        }))
        
        allProducts = [...allProducts, ...boxProducts]
      }
      
      combinedProducts.value = allProducts
    }
  } catch (error) {
    console.error('获取商品列表失败：', error)
  }
}

// 监听路由变化，更新筛选条件
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    // 如果路由中有category参数，转换为数组
    filterForm.value.categories = [newQuery.category]
  }
  fetchProducts()
}, { immediate: true })

// 筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchProducts()
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    categories: [],
    minPrice: 0,
    maxPrice: 1000
  }
  priceRange.value = [0, 1000]
  itemsPerRow.value = 3
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

// 加入购物车或查看盲盒详情
const addToCart = async (productId, isBox = false, originalId = null) => {
  if (isBox && originalId) {
    // 对于盲盒，跳转到盲盒详情页
    router.push(`/mushroom-boxes/${originalId}`)
    return
  }
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    await cartStore.addToCart(productId, 1)
    ElMessage.success('加入购物车成功')
  } catch (error) {
    console.error('加入购物车失败：', error)
    ElMessage.error(error.message || '加入购物车失败')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-container {
  padding: 20px 0;
}

.products-container h2 {
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

.filter-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
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
  align-items: flex-start;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-select {
  width: 100%;
}

.price-range-wrapper {
  width: 100%;
}

.price-slider {
  margin: 10px 0;
}

.price-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.price-separator {
  color: #999;
  font-weight: 500;
}

.layout-selector {
  display: flex;
  gap: 8px;
}

.layout-btn {
  transition: all 0.3s ease;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-top: auto;
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
.products-section {
  min-height: 400px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  gap: 10px;
}

.empty {
  padding: 60px 0;
}

.products-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-link {
  text-decoration: none;
  color: #333;
  display: block;
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #e6a23c;
  color: #fff;
}

.status-badge.rejected {
  background-color: #f56c6c;
  color: #fff;
}

.status-badge.box-badge {
  background-color: #9c27b0;
  color: #fff;
}

.product-card.box-card {
  border: 2px solid #9c27b0;
}

.product-card.box-card:hover {
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.3);
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 500;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 10px;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.product-actions {
  margin-top: 10px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .pagination {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>