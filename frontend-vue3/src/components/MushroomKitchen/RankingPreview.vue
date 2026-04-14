<template>
  <div class="ranking-entrance">
    <div class="ranking-header">
      <h2>菌菇美食榜</h2>
      <el-button
        type="primary"
        @click="navigateToRanking"
      >
        查看完整榜单
      </el-button>
    </div>
    <div class="ranking-preview">
      <div 
        v-for="(work, index) in topWorks" 
        :key="work.id"
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank-number">
          {{ index + 1 }}
        </div>
        <img
          :src="work.imageUrl"
          :alt="work.title"
          class="work-image"
        >
        <div class="work-info">
          <h3 class="work-title">
            {{ work.title }}
          </h3>
          <div class="work-meta">
            <span class="author">{{ work.authorName }}</span>
            <span class="rating">{{ work.rating }}星</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  topWorks: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// 导航到排行榜页面
const navigateToRanking = () => {
  router.push('/mushroom-kitchen/ranking')
}
</script>

<style scoped>
.ranking-entrance {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ranking-header h2 {
  margin: 0;
  color: #2c3e50;
}

.ranking-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.ranking-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.ranking-item.top-three {
  border: 2px solid #ffd700;
}

.rank-number {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.ranking-item:nth-child(1) .rank-number {
  background: #ffd700;
}

.ranking-item:nth-child(2) .rank-number {
  background: #c0c0c0;
}

.ranking-item:nth-child(3) .rank-number {
  background: #cd7f32;
}

.work-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
}

.work-info {
  flex: 1;
}

.work-title {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #2c3e50;
}

.work-meta {
  font-size: 0.85rem;
  color: #7f8c8d;
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .ranking-preview {
    grid-template-columns: 1fr;
  }
}
</style>