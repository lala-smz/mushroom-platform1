<template>
  <div
    ref="containerRef"
    class="global-notification-container"
  >
    <!-- 通知列表 -->
    <transition-group
      name="notification"
      tag="div"
      class="notification-list"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="notification.type || 'info'"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <h4 class="notification-title">
            {{ notification.title }}
          </h4>
          <p class="notification-message">
            {{ notification.message }}
          </p>
          <span class="notification-time">{{ formatTime(notification.time) }}</span>
        </div>
        <button
          class="notification-close"
          aria-label="关闭通知"
          @click.stop="removeNotification(notification.id)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L9.41421 8L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L8 9.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L6.58579 8L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L8 6.58579L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import notificationService from '../utils/notification'

// 注册dayjs插件
 dayjs.extend(relativeTime)

// 通知列表
const notifications = ref([])
const containerRef = ref(null)

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).fromNow()
}

// 处理通知点击
const handleNotificationClick = (notification) => {
  // 如果有链接，跳转
  if (notification.link) {
    window.location.href = notification.link
  } else if (notification.data?.conversationId) {
    // 如果是消息通知，跳转到消息中心对应对话
    window.location.href = `/message-center?conversationId=${notification.data.conversationId}`
  }
  
  // 标记为已读
  notificationService.markNotificationAsRead(notification.id)
  
  // 移除通知
  removeNotification(notification.id)
}

// 移除通知
const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// 添加通知
const addNotification = (notification) => {
  // 生成唯一ID
  const newNotification = {
    id: notification.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    time: new Date().toISOString(),
    type: 'info',
    ...notification
  }
  
  // 添加到列表
  notifications.value.push(newNotification)
  
  // 设置自动关闭
  if (notification.autoClose !== false) {
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, notification.autoCloseDelay || 5000)
  }
}

// 监听通知事件
const handleNewNotification = (data) => {
  addNotification(data)
}

// 组件挂载
onMounted(() => {
  // 监听通知服务的通知事件
  notificationService.on('notification', handleNewNotification)
})

// 组件卸载
onUnmounted(() => {
  // 移除事件监听
  notificationService.off('notification', handleNewNotification)
})

// 导出方法供外部调用
defineExpose({
  addNotification,
  removeNotification
})
</script>

<style scoped>
.global-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  pointer-events: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: auto;
}

.notification-item {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #409eff;
  pointer-events: auto;
}

/* 通知类型样式 */
.notification-item.info {
  border-left-color: #409eff;
}

.notification-item.success {
  border-left-color: #67c23a;
}

.notification-item.warning {
  border-left-color: #e6a23c;
}

.notification-item.error {
  border-left-color: #f56c6c;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification-content {
  margin-right: 24px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.notification-message {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background-color: #f5f7fa;
  color: #606266;
}

/* 动画效果 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification-item {
    padding: 12px;
  }
  
  .notification-title {
    font-size: 14px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>