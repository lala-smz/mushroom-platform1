<template>
  <div class="hero-section">
    <h1>我的菌菇厨房</h1>
    <p>分享你的菌菇美食创意，发现更多美味食谱</p>
    <el-button
      type="primary"
      size="large"
      @click="navigateToUpload"
    >
      上传作品
    </el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到上传页面
const navigateToUpload = () => {
  router.push('/mushroom-kitchen/upload')
}
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.hero-section p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 15px;
  }

  .hero-section h1 {
    font-size: 2rem;
  }
}
</style>