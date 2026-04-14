<template>
  <div class="message-icon-container">
    <router-link
      :to="messageCenterPath"
      class="message-icon-wrapper"
      @click="handleClick"
    >
      <!-- 消息图标 -->
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16ZM7 9H17V11H7V9ZM7 13H14V15H7V13Z"
          fill="currentColor"
        />
      </svg>
      
      <!-- 未读通知指示器 -->
      <div
        v-if="unreadCount > 0"
        class="unread-indicator"
      >
        <span
          v-if="unreadCount <= 99"
          class="unread-count"
        >{{ unreadCount }}</span>
        <span
          v-else
          class="unread-count"
        >99+</span>
      </div>
      
      <!-- 小红点（当没有具体数字时） -->
      <div
        v-else-if="hasUnread"
        class="unread-dot"
      />
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessageStore } from '../stores/useMessageStore'
import notificationService from '../utils/notification'
import eventBus from '../utils/eventBus'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()

// 未读计数
const unreadCount = ref(0)
const hasUnread = ref(false)

// 计算消息中心路径
const messageCenterPath = computed(() => {
  return '/message-center'
})

// 更新未读计数
const updateUnreadCount = () => {
  try {
    // 从消息存储获取未读计数
    const messageUnreadCount = messageStore.unreadCount || 0
    // 从通知服务获取未读通知计数
    const notificationUnreadCount = notificationService.getUnreadNotificationCount()
    // 总未读计数
    unreadCount.value = messageUnreadCount + notificationUnreadCount
    hasUnread.value = unreadCount.value > 0
  } catch (error) {
    console.error('更新未读计数失败:', error)
    // 出错时默认未读计数为0
    unreadCount.value = 0
    hasUnread.value = false
  }
}

// 处理点击事件
const handleClick = () => {
  try {
    // 标记所有通知为已读
    notificationService.markAllNotificationsAsRead()
    
    // 标记所有消息为已读（如果有当前对话）
    if (messageStore.currentConversation) {
      messageStore.markConversationAsRead(messageStore.currentConversation.id).catch(error => {
        console.error('标记对话已读失败:', error)
      })
    }
    
    // 延迟更新未读计数，确保标记已读操作完成
    setTimeout(() => {
      updateUnreadCount()
    }, 100)
  } catch (error) {
    console.error('处理消息图标点击失败:', error)
  }
}

// 监听路由变化
const handleRouteChange = () => {
  // 当进入消息中心页面时，更新未读计数
  if (route.path === '/message-center') {
    // 延迟更新未读计数，确保页面加载完成
    setTimeout(() => {
      updateUnreadCount()
    }, 200)
  }
}

// 监听WebSocket消息
const handleNewMessage = () => {
  // 延迟更新未读计数，确保消息处理完成
  setTimeout(() => {
    updateUnreadCount()
  }, 100)
}

// 监听新通知
const handleNewNotification = () => {
  // 延迟更新未读计数，确保通知处理完成
  setTimeout(() => {
    updateUnreadCount()
  }, 100)
}

// 监听未读计数更新事件
const handleUnreadCountUpdated = () => {
  updateUnreadCount()
}

// 组件挂载
onMounted(() => {
  // 初始更新
  updateUnreadCount()
  
  // 监听路由变化
  const removeRouteListener = router.afterEach(handleRouteChange)
  
  // 监听新消息事件
  eventBus.on('NEW_MESSAGE_RECEIVED', handleNewMessage)
  
  // 监听未读计数更新事件
  eventBus.on('UNREAD_COUNT_UPDATED', handleUnreadCountUpdated)
  
  // 监听新通知事件
  notificationService.on('notification', handleNewNotification)
  
  // 组件卸载时移除监听器
  onUnmounted(() => {
    try {
      // 移除路由监听
      removeRouteListener()
      
      // 移除事件监听
      eventBus.off('NEW_MESSAGE_RECEIVED', handleNewMessage)
      eventBus.off('UNREAD_COUNT_UPDATED', handleUnreadCountUpdated)
      
      // 移除通知监听
      notificationService.off('notification', handleNewNotification)
    } catch (error) {
      console.error('Error in unmounted hook:', error)
      console.error('Error stack:', error.stack)
    }
  })
})
</script>

<style scoped>
.message-icon-container {
  position: relative;
  display: inline-block;
}

.message-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #606266;
  text-decoration: none;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.message-icon-wrapper:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* 未读通知指示器 */
.unread-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #f56c6c;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

/* 未读数字 */
.unread-count {
  padding: 0 6px;
  line-height: 1;
}

/* 小红点 */
.unread-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}
</style>