<template>
  <div class="home-container">
    <!-- 蘑菇背景粒子 -->
    <div class="mushroom-background">
      <div
        v-for="i in particleCount"
        :key="i"
        class="mushroom-particle"
        :style="getParticleStyle(i)"
      >
        🍄
      </div>
    </div>
    
    <!-- 轮播图 -->
    <el-carousel
      :interval="5000"
      type="card"
      height="400px"
      class="home-carousel"
    >
      <el-carousel-item
        v-for="item in carouselItems"
        :key="item.id"
      >
        <div
          class="carousel-item"
          :style="{ backgroundImage: `url(${item.image})` }"
        >
          <div class="carousel-overlay" />
          <div class="carousel-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <el-button
              type="primary"
              size="large"
            >
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 热门商品 -->
    <div class="hot-products">
      <div class="container">
        <h2>热门商品</h2>
        <div class="products-grid">
          <div
            v-for="product in hotProducts"
            :key="product.id"
            class="product-card"
          >
            <router-link
              :to="`/product/${product.id}`"
              class="product-link"
            >
              <div class="product-image">
                <img
                  :src="product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : DEFAULT_PLACEHOLDER_URL"
                  :alt="product.name"
                  @error="(e) => e.target.src = DEFAULT_PLACEHOLDER_URL"
                >
              </div>
              <div class="product-info">
                <h3 class="product-name">
                  {{ product.name }}
                </h3>
                <p class="product-price">
                  ¥{{ Number(product.price || 0).toFixed(2) }}
                </p>
                <div class="product-stats">
                  <span class="stock">库存: {{ product.stock }}</span>
                  <span class="views">浏览: {{ product.viewCount }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品分类 -->
    <div class="categories">
      <div class="container">
        <h2>商品分类</h2>
        <div class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.value"
            class="category-card"
          >
            <router-link
              :to="`/products?category=${category.value}`"
              class="category-link"
            >
              <div class="category-icon">
                {{ category.icon }}
              </div>
              <h3>{{ category.label }}</h3>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 盲盒抽取入口 -->
    <div class="mushroom-box-entrance">
      <div class="container">
        <div class="entrance-content">
          <div class="entrance-text">
            <h2>✨ 时令菌菇盲盒抽取 ✨</h2>
            <p>抽取您的专属菌菇盲盒，开启美味之旅！</p>
            <p class="highlight">
              每个盲盒都包含精选当季新鲜菌菇，从菌包培育到收获的全程指导
            </p>
            <router-link
              to="/mushroom-box-draw"
              class="draw-button"
            >
              <el-button
                type="primary"
                size="large"
              >
                立即抽取
              </el-button>
            </router-link>
          </div>
          <div class="entrance-image">
            <div class="box-animation">
              <div class="floating-box">
                <el-icon class="box-icon">
                  <Box />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 网站特色 -->
    <div class="features">
      <div class="container">
        <h2>我们的特色</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              🛒
            </div>
            <h3>优质商品</h3>
            <p>精选各类蘑菇产品，品质保证</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              🚚
            </div>
            <h3>快速配送</h3>
            <p>全国配送，快速送达</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              💯
            </div>
            <h3>品质保证</h3>
            <p>严格的质量控制体系</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              📞
            </div>
            <h3>优质服务</h3>
            <p>专业的客服团队，随时为您服务</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useProductStore } from '../stores/useProductStore'
import { ElMessage } from 'element-plus'
import { Box } from '@element-plus/icons-vue'
import { getImageUrl, DEFAULT_PLACEHOLDER_URL } from '../utils/imageUtils'

const productStore = useProductStore()
const hotProducts = ref([])
const windowWidth = ref(window.innerWidth)

// 响应式粒子数量
const particleCount = computed(() => {
  if (windowWidth.value < 480) return 8
  if (windowWidth.value < 768) return 12
  if (windowWidth.value < 1024) return 16
  return 20
})

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  fetchHotProducts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 轮播图数据
const carouselItems = [
  {
    id: 1,
    title: '欢迎来到蘑菇网',
    description: '专业的蘑菇交易平台，提供优质的蘑菇产品',
    buttonText: '立即选购',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20mushrooms%20family%20armillaria%20mellea%20honey%20fungus%20natural%20light%20wooden%20surface%20high%20quality%20photography&image_size=landscape_16_9'
  },
  {
    id: 2,
    title: '新鲜蘑菇，直达您家',
    description: '从产地到餐桌，新鲜直达',
    buttonText: '了解更多',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20mushrooms%20close%20up%20macro%20photography%20beautiful%20mushroom%20gills%20texture%20high%20quality&image_size=landscape_16_9'
  },
  {
    id: 3,
    title: '菌类知识百科',
    description: '丰富的菌类知识，让您更了解蘑菇',
    buttonText: '探索知识',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=variety%20of%20mushrooms%20assortment%20different%20types%20of%20mushrooms%20wooden%20background%20high%20quality%20food%20photography&image_size=landscape_16_9'
  }
]

// 分类数据
const categories = [
  { value: '食用菌', label: '食用菌', icon: '🍄' },
  { value: '药用菌', label: '药用菌', icon: '💊' },
  { value: '野生菌', label: '野生菌', icon: '🌲' },
  { value: '菌包', label: '菌包', icon: '📦' },
  { value: '菌种', label: '菌种', icon: '🌱' },
  { value: '盲盒', label: '时令菌菇盲盒', icon: '🎁' }
]

// 获取热门商品
const fetchHotProducts = async () => {
  try {
    // 添加详细的日志记录
    console.log('开始获取热门商品...')
    await productStore.getHotProducts(10, true)
    hotProducts.value = [...productStore.hotProducts]
    console.log('获取热门商品成功，共', hotProducts.value.length, '个商品')
  } catch (error) {
    // 详细的错误日志记录
    console.error('获取热门商品失败：', error)
    console.error('错误详情：', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    })
    
    // 根据错误类型显示不同的提示信息
    let errorMessage = '获取热门商品失败，请稍后重试'
    if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，获取热门商品失败'
    } else if (error.response?.status === 400) {
      errorMessage = '请求参数错误，获取热门商品失败'
    } else if (error.response?.status === 404) {
      errorMessage = '未找到热门商品数据'
    } else if (error.response?.status === 429) {
      errorMessage = '请求过于频繁，请稍候再试'
    } else if (error.message.includes('timeout')) {
      errorMessage = '请求超时，请稍后重试'
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    }
    
    // 显示错误提示
    ElMessage.error(errorMessage)
    
    // 可以选择显示默认数据或空状态
    hotProducts.value = []
  }
}

// 获取粒子样式
const getParticleStyle = (index) => {
  const left = Math.random() * 100
  const delay = Math.random() * 30
  const duration = 20 + Math.random() * 20
  const size = 20 + Math.random() * 40
  const opacity = 0.2 + Math.random() * 0.4
  
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}px`,
    opacity: opacity
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 蘑菇背景粒子 */
.mushroom-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.03) 0%,
    rgba(118, 75, 162, 0.03) 50%,
    rgba(76, 175, 80, 0.03) 100%
  );
}

.mushroom-particle {
  position: absolute;
  top: -100px;
  will-change: transform, opacity;
  animation: float-up linear infinite;
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg) scale(0.8);
    opacity: 0;
  }
}

/* 确保内容在背景之上 */
.home-container > *:not(.mushroom-background) {
  position: relative;
  z-index: 1;
}

/* 轮播图样式 */
.home-carousel {
  margin-bottom: 40px;
}

.carousel-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  color: #fff;
  padding: 0 20px;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.7) 0%,
    rgba(118, 75, 162, 0.7) 50%,
    rgba(76, 175, 80, 0.7) 100%
  );
  z-index: 1;
}

.carousel-content {
  position: relative;
  z-index: 2;
}

.carousel-item h3 {
  font-size: 36px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-item p {
  font-size: 18px;
  margin-bottom: 30px;
  max-width: 600px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 热门商品样式 */
.hot-products {
  padding: 40px 0;
  background-color: #f9f9f9;
}

.hot-products h2,
.categories h2,
.features h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
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

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 500;
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
}

/* 分类样式 */
.categories {
  padding: 40px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.category-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-link {
  text-decoration: none;
  color: #333;
  display: block;
}

.category-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.category-card h3 {
  font-size: 16px;
  font-weight: 500;
}

/* 特色样式 */
.features {
  padding: 40px 0;
  background-color: #f9f9f9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 500;
}

.feature-card p {
  color: #666;
  font-size: 14px;
}

/* 盲盒抽取入口样式 */
.mushroom-box-entrance {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 40px 0;
  border-radius: 12px;
  overflow: hidden;
}

.entrance-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.entrance-text {
  flex: 1;
  min-width: 300px;
}

.entrance-text h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.entrance-text p {
  font-size: 1.2rem;
  margin-bottom: 15px;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.entrance-text .highlight {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  font-weight: 500;
  border-left: 4px solid white;
}

.draw-button {
  margin-top: 20px;
  display: inline-block;
}

.draw-button .el-button {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 12px 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.draw-button .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.entrance-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  height: 300px;
  position: relative;
}

.box-animation {
  width: 200px;
  height: 200px;
  position: relative;
}

.floating-box {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotateY(0deg);
  }
  33% {
    transform: translateY(-20px) rotateY(10deg);
  }
  66% {
    transform: translateY(10px) rotateY(-10deg);
  }
}

.box-icon {
  font-size: 4rem;
  color: #667eea;
  animation: spin 4s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-item h3 {
    font-size: 24px;
  }
  
  .carousel-item p {
    font-size: 14px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .entrance-content {
    flex-direction: column;
    text-align: center;
  }
  
  .entrance-text h2 {
    font-size: 2rem;
  }
  
  .entrance-text p {
    font-size: 1rem;
  }
}

/* 响应式蘑菇背景 - 调整小屏幕上的粒子效果 */
@media (max-width: 768px) {
  .mushroom-particle {
    filter: drop-shadow(0 0 5px rgba(102, 126, 234, 0.2));
  }
}

@media (max-width: 480px) {
  .mushroom-particle {
    filter: drop-shadow(0 0 3px rgba(102, 126, 234, 0.15));
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr));
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr));
  }
  
  .entrance-content {
    flex-direction: column;
    text-align: center;
  }
  
  .entrance-text h2 {
    font-size: 2rem;
  }
  
  .entrance-text p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr));
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .entrance-text {
    min-width: 100%;
  }
  
  .entrance-text h2 {
    font-size: 1.8rem;
  }
  
  .floating-box {
    width: 120px;
    height: 120px;
  }
  
  .box-icon {
    font-size: 3rem;
  }
}
</style>