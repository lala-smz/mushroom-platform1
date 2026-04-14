<template>
  <transition name="chat-popup">
    <div 
      v-if="visible"
      class="chat-popup"
      :class="{ 'minimized': isMinimized }"
    >
      <!-- 聊天窗口头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="seller-info">
            <div class="seller-avatar">
              <el-avatar
                :size="40"
                :src="seller.avatar || ''"
              >
                {{ seller.name?.charAt(0) || '商' }}
              </el-avatar>
            </div>
            <div class="seller-details">
              <h3 class="seller-name">
                {{ seller.name }}
              </h3>
              <p class="seller-role">
                {{ getSellerRoleText() }}
              </p>
            </div>
          </div>
        </div>
        <div class="header-right">
          <el-button 
            v-if="!isMinimized" 
            type="text" 
            size="small"
            :icon="Minus"
            @click="toggleMinimize"
          />
          <el-button 
            v-else 
            type="text" 
            size="small"
            :icon="Plus"
            @click="toggleMinimize"
          />
          <el-button 
            type="text" 
            size="small"
            :icon="FullScreen"
            @click="toggleMaximize"
          />
          <el-button 
            type="text" 
            size="small"
            :icon="Close"
            @click="handleClose"
          />
        </div>
      </div>
      
      <!-- 聊天内容区域 -->
      <div 
        v-if="!isMinimized" 
        ref="chatContentRef"
        class="chat-content"
      >
        <!-- 提示信息 -->
        <transition name="notification-fade">
          <div 
            v-if="notification.show" 
            class="notification" 
            :class="`notification-${notification.type}`"
            @click="hideNotification"
          >
            <span class="notification-message">{{ notification.message }}</span>
            <el-button 
              type="text" 
              size="small" 
              class="notification-close"
              @click.stop="hideNotification"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </transition>
        
        <!-- 历史消息 -->
        <div
          ref="messageListRef"
          class="message-list"
        >
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message-item"
            :class="{
              'sent': isCurrentUser(message),
              'received': !isCurrentUser(message)
            }"
          >
            <div class="message-bubble">
              {{ message.content }}
            </div>
            <div class="message-meta">
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
              <span
                v-if="isCurrentUser(message)"
                class="message-status"
              >
                <el-icon v-if="message.status === 'sent'">
                  <ChatDotRound />
                </el-icon>
                <el-icon v-else-if="message.status === 'delivered'">
                  <ChatRound />
                </el-icon>
                <el-icon
                  v-else-if="message.status === 'read'"
                  color="#409eff"
                >
                  <ChatRound />
                </el-icon>
              </span>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div
            v-if="messages.length === 0"
            class="empty-messages"
          >
            <el-empty description="暂无聊天记录" />
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="messageInput"
            type="textarea"
            placeholder="输入消息..."
            :rows="3"
            resize="none"
            @keydown.enter.prevent="handleKeyDown($event)"
            @keyup.enter="handleEnterKey"
          />
          <div class="send-button-container">
            <el-button 
              type="primary" 
              :disabled="!messageInput.trim() || messageStore.sending"
              :loading="messageStore.sending"
              size="large"
              @click="sendMessage"
            >
              发送消息
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useUserStore } from '../stores/useUserStore'
import { useMessageStore } from '../stores/useMessageStore'
import { 
  Close, 
  Minus, 
  Plus, 
  FullScreen,
  ChatDotRound,
  ChatRound
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  seller: {
    type: Object,
    default: () => ({
      id: null,
      name: '商家',
      role: 'seller',
      avatar: ''
    })
  }
})

// Emits
const emit = defineEmits(['close'])

// Stores
const userStore = useUserStore()
const messageStore = useMessageStore()

// Refs
const chatContentRef = ref(null)
const messageListRef = ref(null)

// State
const messageInput = ref('')
const isMinimized = ref(false)
const isMaximized = ref(false)
const lastSentMessage = ref('')
const lastSentTime = ref(0)

// 提示信息状态
const notification = ref({
  show: false,
  type: 'info', // success, error, warning, info
  message: ''
})

// Computed
const messages = computed(() => {
  // 获取当前用户与该商家的所有对话
  // 实际项目中应该根据会话ID获取对应消息
  if (!props.seller || !props.seller.id) {
    return []
  }
  return messageStore.messages.filter(msg => 
    (msg.senderId === props.seller.id && msg.senderRole === props.seller.role) ||
    (msg.senderId === userStore.userInfo?.id && msg.senderRole === userStore.userInfo?.role)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
})

// Methods
const handleClose = () => {
  emit('close')
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  if (!isMinimized.value) {
    scrollToBottom()
  }
}

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
  nextTick(() => {
    scrollToBottom()
  })
}

const getSellerRoleText = () => {
  if (!props.seller) {
    return '商家'
  }
  return props.seller.role === 'seller' ? '商家' : '管理员'
}

const formatTime = (time) => {
  return dayjs(time).format('HH:mm')
}

const isCurrentUser = (message) => {
  return message.senderId === userStore.userInfo?.id && message.senderRole === userStore.userInfo?.role
}

// 获取与当前商家的会话ID
const getConversationId = () => {
  // 查找与当前商家的会话
  if (!props.seller || !props.seller.id || !userStore.userInfo?.id) {
    return null
  }
  const conversation = messageStore.conversations.find(conv => 
    ((conv.initiatorId === props.seller.id && conv.initiatorRole === props.seller.role) && 
     (conv.receiverId === userStore.userInfo.id && conv.receiverRole === userStore.userInfo.role)) ||
    ((conv.receiverId === props.seller.id && conv.receiverRole === props.seller.role) && 
     (conv.initiatorId === userStore.userInfo.id && conv.initiatorRole === userStore.userInfo.role))
  )
  return conversation?.id || null
}

// 处理键盘按下事件（用于Shift+Enter换行）
const handleKeyDown = (event) => {
  // Shift+Enter: 换行
  if (event.key === 'Enter' && event.shiftKey) {
    // 允许默认行为，插入换行
    return
  }
  // Enter: 发送消息（在keyup时处理，避免在输入过程中触发）
  if (event.key === 'Enter' && !event.shiftKey) {
    // 阻止默认行为，避免插入换行
    event.preventDefault()
  }
}

// 处理Enter键释放事件（用于发送消息）
const handleEnterKey = async (event) => {
  // 只处理Enter键，不处理Shift+Enter
  if (event.key === 'Enter' && !event.shiftKey) {
    await sendMessage()
  }
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 发送消息（带防抖）
const sendMessage = debounce(async () => {
  if (!messageInput.value.trim()) return
  
  // 检查是否为重复发送
  const currentTime = Date.now()
  const messageContent = messageInput.value.trim()
  
  // 1秒内相同内容的消息视为重复发送
  if (messageContent === lastSentMessage.value && currentTime - lastSentTime.value < 1000) {
    showNotification('warning', '消息已发送，请勿重复发送', 2000)
    return
  }
  
  try {
    // 获取与当前商家的会话ID
    const conversationId = getConversationId()
    if (!conversationId) {
      showNotification('error', '未找到与该商家的会话', 3000)
      console.error('未找到与该商家的会话')
      return
    }
    
    // 发送消息
    await messageStore.sendMessage(
      conversationId,
      messageContent
    )
    
    // 更新最后发送的消息和时间
    lastSentMessage.value = messageContent
    lastSentTime.value = currentTime
    
    // 清空输入框
    messageInput.value = ''
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    showNotification('error', '发送消息失败，请稍后重试', 3000)
  }
}, 500)

const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 显示提示信息
const showNotification = (type, message, duration = 3000) => {
  notification.value = {
    show: true,
    type,
    message
  }
  
  // 自动隐藏
  setTimeout(() => {
    notification.value.show = false
  }, duration)
}

// 隐藏提示信息
const hideNotification = () => {
  notification.value.show = false
}

// Watchers
watch(() => props.visible, (newVal) => {
  if (newVal && !isMinimized.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

watch(() => messages.value, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// Lifecycle
onMounted(() => {
  // 监听窗口大小变化，调整聊天窗口位置
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})

const handleResize = () => {
  // 可以在这里添加窗口大小变化时的处理逻辑
}
</script>

<style scoped>
.chat-popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.chat-popup.minimized {
  height: 60px;
  width: 300px;
}

.chat-popup.maximized {
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
}

/* 聊天窗口头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  cursor: move;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seller-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.seller-role {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 4px;
}

/* 聊天内容区域 */
.chat-content {
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
}

.chat-popup.maximized .chat-content {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 空消息状态 */
.empty-messages {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 消息项 */
.message-item {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-item.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message-item.received {
  align-self: flex-start;
  align-items: flex-start;
}

/* 消息气泡 */
.message-bubble {
  padding: 12px 18px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.5;
  position: relative;
}

.message-item.sent .message-bubble {
  background-color: #409eff;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message-item.received .message-bubble {
  background-color: #fff;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 6px;
}

/* 消息元信息 */
.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-status {
  font-size: 14px;
}

/* 输入区域 */
.input-area {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-area .el-textarea {
  margin-bottom: 0;
  width: 100%;
}

.input-area .el-textarea__inner {
  resize: none;
  border-radius: 18px;
  padding: 12px 18px;
  width: 100%;
}

.send-button-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.send-button-container .el-button {
  border-radius: 20px;
  width: auto;
  min-width: 100px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  padding: 0 24px;
  cursor: pointer;
}

.input-area .el-button {
  border-radius: 20px;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 提示信息样式 */
.notification {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  cursor: pointer;
  font-size: 14px;
  max-width: 80%;
  word-break: break-word;
}

.notification-success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.notification-error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.notification-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.notification-info {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
}

.notification-message {
  flex: 1;
}

.notification-close {
  padding: 0;
  margin: 0;
  min-width: auto;
  height: auto;
  line-height: 1;
}

.notification-close .el-icon {
  font-size: 16px;
}

/* 提示信息动画 */
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* 聊天窗口动画效果 */
.chat-popup-enter-active,
.chat-popup-leave-active {
  transition: all 0.3s ease;
}

.chat-popup-enter-from {
  opacity: 0;
  transform: translate(100%, 100%);
}

.chat-popup-leave-to {
  opacity: 0;
  transform: translate(100%, 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-popup {
    width: calc(100vw - 20px);
    right: 10px;
    left: 10px;
    bottom: 10px;
  }
  
  .message-item {
    max-width: 85%;
  }
  
  .chat-content {
    height: 400px;
  }
}
</style>