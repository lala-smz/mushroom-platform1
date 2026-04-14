<template>
  <div class="category-section">
    <h2>按菌菇种类浏览</h2>
    <div class="categories">
      <el-button 
        v-for="category in mushroomCategories" 
        :key="category.value"
        type="primary" 
        :plain="currentCategory !== category.value"
        :class="{ 'active': currentCategory === category.value }"
        :loading="loading"
        @click="handleFilter(category.value)"
      >
        {{ category.label }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter', 'update:modelValue'])

// 当前选中的分类
const currentCategory = ref(props.modelValue)

// 菌菇种类分类
const mushroomCategories = [
  { value: 'all', label: '全部' },
  { value: 'shiitake', label: '香菇' },
  { value: 'oyster', label: '平菇' },
  { value: 'enoki', label: '金针菇' },
  { value: 'king', label: '杏鲍菇' },
  { value: 'matsutake', label: '松茸' },
  { value: 'other', label: '其他' }
]

// 监听外部传入的modelValue变化
watch(() => props.modelValue, (newValue) => {
  currentCategory.value = newValue
})

// 处理筛选
const handleFilter = (categoryValue) => {
  currentCategory.value = categoryValue
  emit('filter', categoryValue)
  emit('update:modelValue', categoryValue)
}
</script>

<style scoped>
.category-section {
  margin-bottom: 40px;
  animation: fadeInUp 0.6s ease-out;
}

.category-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4rem;
  font-weight: 600;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

/* 选中状态样式 */
.active {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* 按钮悬停效果 */
.categories .el-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.categories .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-section {
    margin-bottom: 30px;
  }
  
  .category-section h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
  
  .categories {
    gap: 8px;
  }
  
  .categories .el-button {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
  
  .categories .el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }
}

@media (max-width: 480px) {
  .category-section h2 {
    font-size: 1.1rem;
  }
  
  .categories {
    gap: 6px;
  }
  
  .categories .el-button {
    font-size: 0.85rem;
    padding: 5px 10px;
  }
  
  .categories .el-button:hover {
    transform: none;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  }
}
</style>