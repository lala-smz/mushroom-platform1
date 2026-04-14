<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">
        404
      </h1>
      <h2 class="error-message">
        页面不存在
      </h2>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被删除
      </p>
      
      <div class="error-actions">
        <el-button
          type="primary"
          size="large"
          @click="$router.push('/')"
        >
          <el-icon><House /></el-icon> 返回首页
        </el-button>
        <el-button
          size="large"
          @click="$router.go(-1)"
        >
          <el-icon><ArrowLeft /></el-icon> 返回上一页
        </el-button>
      </div>
      
      <div class="error-suggestions">
        <h3>可能的原因：</h3>
        <ul>
          <li>URL地址输入错误</li>
          <li>页面已被删除或移动</li>
          <li>网络连接问题</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { House, ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background-color: white;
  padding: 60px 40px;
  border-radius: 10px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  margin: 0 0 20px 0;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.error-description {
  font-size: 16px;
  color: #606266;
  margin: 0 0 30px 0;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
}

.error-suggestions {
  text-align: left;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.error-suggestions h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 15px 0;
}

.error-suggestions ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.error-suggestions li {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.error-suggestions li:last-child {
  margin-bottom: 0;
}
</style>