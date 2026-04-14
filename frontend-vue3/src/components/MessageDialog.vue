<template>
  <div
    ref="messageDialogRef"
    class="message-dialog"
  >
    <!-- 对话框头部 -->
    <div class="message-dialog-header">
      <h3 class="dialog-title">
        {{ dialogTitle }}
      </h3>
      <el-button
        type="text"
        class="close-button"
        @click="handleClose"
      >
        <el-icon>
          <Close />
        </el-icon>
      </el-button>
    </div>
    
    <!-- 消息列表 -->
    <div
      ref="messageListRef"
      class="message-list"
      :style="{ height: messageListHeight || 'auto' }"
    >
      <div
        v-if="messages.length > 0"
        class="message-content"
      >
        <!-- 消息项 -->
        <div
          v-for="(message, index) in paginatedMessages"
          :key="message.id"
          :class="[
            'message-item',
            { 'own-message': isOwnMessage(message), 'other-message': !isOwnMessage(message) }
          ]"
        >
          <div class="message-avatar">
            <el-avatar :size="36">
              {{ getSenderInitials(message) }}
            </el-avatar>
          </div>
          <div class="message-body">
            <div class="message-sender">
              {{ getSenderName(message) }}
            </div>
            <div class="message-content-text">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatMessageTime(message.createdAt) }}
            </div>
          </div>
        </div>
        
        <!-- 分页加载提示 -->
        <div
          v-if="loadingMore"
          class="loading-more"
        >
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          <span>加载更多消息...</span>
        </div>
        
        <!-- 没有更多消息提示 -->
        <div
          v-if="!loadingMore && hasMoreMessages === false"
          class="no-more-messages"
        >
          没有更多消息了
        </div>
      </div>
      
      <!-- 空状态 -->
      <div
        v-else
        class="empty-messages"
      >
        <el-empty description="暂无消息" />
      </div>
    </div>
    
    <!-- 消息输入框 -->
    <div class="message-input-area">
      <el-input
        v-model="messageInput"
        type="textarea"
        placeholder="输入消息..."
        :rows="3"
        resize="none"
        @keydown.enter.prevent="handleKeyDown"
        @keyup.enter="handleEnterKey"
      />
      <div class="send-button-container">
        <el-button 
          type="primary" 
          :loading="sending"
          :disabled="!messageInput.trim()"
          size="large"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMessageStore } from '../stores/useMessageStore'
import { Close, Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '消息对话框'
  }
})

// Emits
const emit = defineEmits(['close', 'message-sent'])

// Store
const messageStore = useMessageStore()

// Refs
const messageListRef = ref(null)
const messageDialogRef = ref(null)
const messageInput = ref('')
const sending = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const loadingMore = ref(false)
const hasMoreMessages = ref(true)
const messageListHeight = ref('')

// Computed
const dialogTitle = computed(() => props.title)

const messages = computed(() => {
  if (!props.conversationId) return []
  return messageStore.messages
    .filter(msg => msg.conversationId === props.conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
})

const paginatedMessages = computed(() => {
  const startIndex = 0
  const endIndex = currentPage.value * pageSize.value
  return messages.value.slice(startIndex, endIndex)
})

// Methods
const isOwnMessage = (message) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  return message.senderId === userInfo?.id
}

const getSenderInitials = (message) => {
  if (isOwnMessage(message)) {
    return '我'
  }
  return message.senderRole === 'seller' ? '商' : message.senderRole === 'admin' ? '管' : '用'
}

const getSenderName = (message) => {
  if (isOwnMessage(message)) {
    return '我'
  }
  return message.senderRole === 'seller' ? '商家' : message.senderRole === 'admin' ? '管理员' : '用户'
}

const formatMessageTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

const handleClose = () => {
  emit('close')
}

const handleKeyDown = (event) => {
  if (event.ctrlKey || event.metaKey) {
    // Ctrl+Enter 发送消息
    if (event.key === 'Enter') {
      sendMessage()
    }
  }
}

const handleEnterKey = () => {
  // 普通 Enter 键发送消息
  sendMessage()
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || !props.conversationId) return
  
  sending.value = true
  
  try {
    await messageStore.sendMessage(props.conversationId, messageInput.value)
    messageInput.value = ''
    emit('message-sent')
    // 发送消息后滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messageListRef.value) {
    const messageList = messageListRef.value
    messageList.scrollTop = messageList.scrollHeight
  }
}

const loadMoreMessages = () => {
  if (!loadingMore.value && hasMoreMessages.value && messages.value.length > currentPage.value * pageSize.value) {
    loadingMore.value = true
    currentPage.value++
    
    // 模拟加载延迟
    setTimeout(() => {
      loadingMore.value = false
      if (currentPage.value * pageSize.value >= messages.value.length) {
        hasMoreMessages.value = false
      }
    }, 500)
  }
}

const handleScroll = () => {
  if (messageListRef.value) {
    const messageList = messageListRef.value
    const scrollTop = messageList.scrollTop
    
    // 当滚动到顶部时加载更多消息
    if (scrollTop < 50 && hasMoreMessages.value && !loadingMore.value) {
      loadMoreMessages()
    }
  }
}

// 计算消息列表高度
const calculateMessageListHeight = () => {
  if (messageDialogRef.value) {
    const dialogHeight = messageDialogRef.value.offsetHeight
    const headerHeight = messageDialogRef.value.querySelector('.message-dialog-header')?.offsetHeight || 60
    const inputAreaHeight = messageDialogRef.value.querySelector('.message-input-area')?.offsetHeight || 120
    
    const newHeight = dialogHeight - headerHeight - inputAreaHeight - 40 // 40px for padding
    messageListHeight.value = `${Math.max(newHeight, 200)}px` // 最小高度200px
  }
}

// 处理窗口大小变化
const handleResize = () => {
  calculateMessageListHeight()
}

// Watch
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // 对话框显示时计算高度并滚动到底部
    setTimeout(() => {
      calculateMessageListHeight()
      scrollToBottom()
    }, 100)
  }
})

watch(() => messages.value.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // 有新消息时滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
})

// Lifecycle
onMounted(() => {
  if (messageListRef.value) {
    messageListRef.value.addEventListener('scroll', handleScroll)
  }
  
  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize)
  
  // 初始计算高度
  if (props.visible) {
    setTimeout(() => {
      calculateMessageListHeight()
    }, 100)
  }
})

onUnmounted(() => {
  if (messageListRef.value) {
    messageListRef.value.removeEventListener('scroll', handleScroll)
  }
  
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.message-dialog {
  width: 100%;
  max-width: 600px;
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 8px;
  box-shadow: var(--theme-boxShadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  transition: all 0.3s ease;
}

/* 对话框头部 */
.message-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--theme-borderColor);
  background-color: var(--theme-secondaryBackgroundColor);
  transition: all 0.3s ease;
}

.dialog-title {
  color: var(--theme-textColor);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  transition: all 0.3s ease;
}

.close-button {
  color: var(--theme-secondaryTextColor);
  transition: all 0.3s ease;
}

.close-button:hover {
  color: var(--theme-textColor);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--theme-backgroundColor);
  display: flex;
  flex-direction: column;
  min-height: 200px;
  transition: all 0.3s ease;
}

.message-content {
  flex: 1;
}

/* 消息项 */
.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

.own-message {
  flex-direction: row-reverse;
}

.other-message {
  flex-direction: row;
}

.message-avatar {
  margin: 0 10px;
}

.message-body {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--theme-hoverColor);
  transition: all 0.3s ease;
}

.own-message .message-body {
  background-color: var(--theme-primaryColor);
  color: #fff;
}

.other-message .message-body {
  background-color: var(--theme-hoverColor);
  color: var(--theme-textColor);
}

.message-sender {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--theme-secondaryTextColor);
  transition: all 0.3s ease;
}

.own-message .message-sender {
  color: rgba(255, 255, 255, 0.8);
}

.message-content-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.message-time {
  font-size: 12px;
  color: var(--theme-secondaryTextColor);
  text-align: right;
  transition: all 0.3s ease;
}

/* 空状态 */
.empty-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-secondaryTextColor);
  transition: all 0.3s ease;
}

/* 加载更多 */
.loading-more {
  text-align: center;
  padding: 10px;
  color: var(--theme-secondaryTextColor);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.no-more-messages {
  text-align: center;
  padding: 10px;
  color: var(--theme-secondaryTextColor);
  font-size: 14px;
  transition: all 0.3s ease;
}

/* 消息输入区域 */
.message-input-area {
  padding: 20px;
  border-top: 1px solid var(--theme-borderColor);
  background-color: var(--theme-secondaryBackgroundColor);
  transition: all 0.3s ease;
}

.message-input-area .el-textarea__wrapper {
  background-color: var(--theme-inputBackgroundColor);
  border: 1px solid var(--theme-inputBorderColor);
  transition: all 0.3s ease;
}

.message-input-area .el-textarea__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.5) inset;
}

.message-input-area .el-textarea__inner {
  color: var(--theme-textColor);
  background-color: transparent;
  transition: all 0.3s ease;
}

.send-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: var(--theme-scrollbarTrackColor);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: var(--theme-scrollbarThumbColor);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: var(--theme-scrollbarThumbColor);
  opacity: 0.8;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-dialog {
    max-width: 90vw;
    max-height: 85vh;
  }
  
  .message-body {
    max-width: 80%;
  }
  
  .message-dialog-header {
    padding: 12px 16px;
  }
  
  .message-list {
    padding: 16px;
  }
  
  .message-input-area {
    padding: 16px;
  }
  
  .dialog-title {
    font-size: 15px;
  }
  
  .message-content-text {
    font-size: 13px;
  }
  
  .message-time {
    font-size: 11px;
  }
  
  .message-sender {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .message-dialog {
    max-width: 95vw;
    max-height: 90vh;
  }
  
  .message-body {
    max-width: 85%;
    padding: 10px 14px;
  }
  
  .message-avatar {
    margin: 0 8px;
  }
  
  .el-avatar {
    --el-avatar-size: 32px !important;
  }
  
  .dialog-title {
    font-size: 14px;
  }
  
  .message-content-text {
    font-size: 12px;
  }
}
</style>