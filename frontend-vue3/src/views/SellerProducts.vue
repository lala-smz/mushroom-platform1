<template>
  <div class="seller-products-container">
    <div class="container">
      <h2>我的商品管理</h2>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form
          :inline="true"
          :model="filterForm"
          class="filter-form"
        >
          <el-form-item label="分类">
            <el-select
              v-model="filterForm.category"
              placeholder="请选择分类"
              size="large"
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
          </el-form-item>
          <el-form-item label="状态">
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
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              @click="handleFilter"
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
      
      <!-- 操作按钮 -->
      <div class="action-section">
        <router-link to="/admin/product/upload">
          <el-button
            type="primary"
            size="large"
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
              ><line
                x1="12"
                y1="5"
                x2="12"
                y2="19"
              /><line
                x1="5"
                y1="12"
                x2="19"
                y2="12"
              /></svg>
            </el-icon>
            上传新商品
          </el-button>
        </router-link>
      </div>
      
      <!-- 商品列表 -->
      <div class="products-section">
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
          v-else-if="productStore.products.length === 0"
          class="empty"
        >
          <el-empty description="暂无商品" />
        </div>
        <div
          v-else
          class="products-grid"
        >
          <div
            v-for="product in productStore.products"
            :key="product.id"
            class="product-card"
          >
            <router-link
              :to="`/product/${product.id}`"
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
                  v-else-if="product.status === 'approved'"
                  class="status-badge approved"
                >
                  已审核
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
                    @click.stop="editProduct(product.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click.stop="deleteProduct(product.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        
        <!-- 分页 -->
        <div
          v-if="productStore.total > 0"
          class="pagination"
        >
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '../stores/useProductStore'

const router = useRouter()
const productStore = useProductStore()

// 筛选表单
const filterForm = ref({
  category: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 分类列表
const categories = productStore.categories

// 获取商品列表
const fetchProducts = async () => {
  try {
    await productStore.getSellerProducts({
      page: currentPage.value,
      limit: pageSize.value,
      category: filterForm.value.category,
      status: filterForm.value.status
    })
  } catch (error) {
    console.error('获取商品列表失败：', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchProducts()
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

// 编辑商品
const editProduct = (productId) => {
  // 跳转到商品编辑页面
  router.push(`/admin/product/upload?id=${productId}`)
}

// 删除商品
const deleteProduct = async (productId) => {
  try {
    await productStore.deleteProduct(productId)
    ElMessage.success('商品删除成功')
    // 重新获取商品列表
    fetchProducts()
  } catch (error) {
    console.error('删除商品失败：', error)
    ElMessage.error(error.message || '删除商品失败')
  }
}

onMounted(() => {
  // 获取商品列表
  fetchProducts()
})
</script>

<style scoped>
.seller-products-container {
  padding: 20px 0;
}

.seller-products-container h2 {
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

/* 操作按钮 */
.action-section {
  margin-bottom: 20px;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.status-badge.approved {
  background-color: #67c23a;
  color: #fff;
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
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .pagination {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>