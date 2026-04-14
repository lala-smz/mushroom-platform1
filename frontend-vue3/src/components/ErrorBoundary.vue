<template>
  <div
    v-if="hasError"
    class="error-boundary"
  >
    <h2>页面出错了</h2>
    <p>{{ errorMessage }}</p>
    <div class="error-actions">
      <el-button
        type="primary"
        @click="resetError"
      >
        刷新页面
      </el-button>
      <el-button @click="navigateHome">
        返回首页
      </el-button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref(null)

const hasError = computed(() => error.value !== null)
const errorMessage = computed(() => error.value?.message || '未知错误')

const resetError = () => {
  error.value = null
  window.location.reload()
}

const navigateHome = () => {
  error.value = null
  router.push('/')
}

onErrorCaptured((err, instance, info) => {
  error.value = err
  console.error('Error Boundary caught:', err, info)
  // 阻止错误继续向上传播，但允许组件继续渲染
  return false
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
  background-color: #f0f2f5;
}

.error-boundary h2 {
  color: #f56c6c;
  margin-bottom: 15px;
  font-size: 24px;
}

.error-boundary p {
  color: #606266;
  margin-bottom: 25px;
  font-size: 16px;
  max-width: 600px;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 15px;
}
</style>