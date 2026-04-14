<template>
  <div class="message-center-container">
    <h2>消息中心</h2>
    
    <div class="message-center-content">
      <!-- 左侧：对话列表 -->
      <div class="conversation-sidebar">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索对话或消息" 
            :prefix-icon="Search" 
            clearable
            @keyup.enter="searchMessages"
          />
        </div>
        
        <!-- 对话列表 -->
        <div class="conversation-list">
          <div 
            v-for="conversation in messageStore.sortedConversations" 
            :key="conversation.id"
            class="conversation-item"
            :class="{
              'active': currentConversationId === conversation.id,
              'has-unread': conversation.unreadCount > 0
            }"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-info">
              <div class="conversation-title">
                {{ getConversationTitle(conversation) }}
                <span
                  v-if="conversation.unreadCount > 0"
                  class="unread-count"
                >{{ conversation.unreadCount }}</span>
              </div>
              <div class="last-message">
                {{ getLastMessage(conversation) }}
              </div>
              <div class="conversation-time">
                {{ formatTime(conversation.updatedAt) }}
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div
            v-if="messageStore.conversations.length === 0"
            class="empty-conversations"
          >
            <el-empty description="暂无对话" />
          </div>
        </div>
      </div>
      
      <!-- 右侧：消息详情 -->
      <div
        v-if="currentConversation"
        class="message-detail"
      >
        <!-- 消息详情头部 -->
        <div class="message-header">
          <h3>{{ getConversationTitle(currentConversation) }}</h3>
        </div>
        
        <!-- 消息列表 -->
        <div
          ref="messageList"
          class="message-list"
        >
          <div 
            v-for="message in messageStore.currentMessages" 
            :key="message.id"
            class="message-item"
            :class="{
              'sent': isCurrentUser(message),
              'received': !isCurrentUser(message),
              'user-message': message.senderRole === 'user',
              'seller-message': message.senderRole === 'seller',
              'admin-message': message.senderRole === 'admin'
            }"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-status">
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
              <span class="message-indicator">
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
            v-if="messageStore.currentMessages.length === 0"
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
            @keydown.enter.prevent="handleKeyDown($event)"
            @keyup.enter="handleEnterKey"
          />
          <div class="send-button-container">
            <el-button 
              type="primary" 
              :loading="messageStore.sending"
              :disabled="!messageInput.trim()"
              size="large"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 右侧：未选择对话状态 -->
      <div
        v-else
        class="no-conversation-selected"
      >
        <el-empty description="请选择一个对话开始聊天" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ChatDotRound, ChatRound, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMessageStore } from '../stores/useMessageStore'
import { useUserStore } from '../stores/useUserStore'
import dayjs from 'dayjs'

const messageStore = useMessageStore()
const userStore = useUserStore()

// 当前选择的对话ID
const currentConversationId = ref(null)

// 当前选择的对话
const currentConversation = computed(() => {
  return messageStore.currentConversation
})

// 搜索关键词
const searchKeyword = ref('')

// 消息输入内容
const messageInput = ref('')

// 消息列表引用
const messageList = ref(null)

// 获取对话标题
const getConversationTitle = (conversation) => {
  // 根据对话角色返回不同的标题
  if (conversation.initiatorRole === userStore.userInfo.role && conversation.initiatorId === userStore.userInfo.id) {
    // 当前用户是发起者，标题显示接收者信息
    if (conversation.receiverRole === 'seller') {
      // 优先使用接收者名称，其次使用商家+ID格式，支持多种可能的商家名称字段
      return conversation.receiverName || conversation.receiverUser?.username || conversation.receiverNickname || `商家${conversation.receiverId}`
    } else if (conversation.receiverRole === 'admin') {
      return '管理员'
    } else {
      // 优先使用接收者名称，其次使用用户+ID格式
      return conversation.receiverName || conversation.receiverUser?.username || conversation.receiverNickname || `用户${conversation.receiverId}`
    }
  } else {
    // 当前用户是接收者，标题显示发起者信息
    if (conversation.initiatorRole === 'seller') {
      // 优先使用发起者名称，其次使用商家+ID格式，支持多种可能的商家名称字段
      return conversation.initiatorName || conversation.initiatorUser?.username || conversation.initiatorNickname || `商家${conversation.initiatorId}`
    } else if (conversation.initiatorRole === 'admin') {
      return '管理员'
    } else {
      // 优先使用发起者名称，其次使用用户+ID格式
      return conversation.initiatorName || conversation.initiatorUser?.username || conversation.initiatorNickname || `用户${conversation.initiatorId}`
    }
  }
}

// 获取最后一条消息
const getLastMessage = (conversation) => {
  // 优先使用对话对象中的messages关联数据（后端返回的最新一条消息）
  if (conversation.messages && conversation.messages.length > 0) {
    return conversation.messages[0].content
  }
  // 其次从本地消息列表中查找
  const lastMessage = messageStore.messages.find(msg => msg.id === conversation.lastMessageId)
  return lastMessage ? lastMessage.content : '暂无消息'
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 判断是否是当前用户发送的消息
const isCurrentUser = (message) => {
  return message.senderId === userStore.userInfo.id && message.senderRole === userStore.userInfo.role
}

// 选择对话
const selectConversation = async (conversation) => {
  currentConversationId.value = conversation.id
  await messageStore.getConversationDetail(conversation.id)
  // 滚动到底部
  await nextTick()
  scrollToBottom()
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

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || !currentConversation.value) {
    return
  }
  
  try {
    await messageStore.sendMessage(
      currentConversation.value.id,
      messageInput.value.trim()
    )
    messageInput.value = ''
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    ElMessage.error('发送消息失败: ' + (error.message || '未知错误'))
  }
}

// 搜索消息
const searchMessages = async () => {
  if (!searchKeyword.value.trim()) {
    return
  }
  
  try {
    await messageStore.searchMessages(searchKeyword.value.trim())
  } catch (error) {
    ElMessage.error('搜索消息失败: ' + (error.message || '未知错误'))
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// 监听当前对话消息变化，自动滚动到底部
watch(() => messageStore.currentMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 定时刷新间隔（毫秒）
const REFRESH_INTERVAL = 30000 // 30秒
let refreshIntervalId = null

// 组件挂载时初始化
onMounted(async () => {
  try {
    // 初始化WebSocket连接
    messageStore.initWebSocket()
    
    // 获取对话列表和未读消息数量
    await messageStore.getConversations()
    await messageStore.getUnreadCount()
    
    // 添加定时刷新逻辑，每30秒刷新一次会话列表
    refreshIntervalId = setInterval(async () => {
      try {
        await messageStore.updateConversations()
      } catch (error) {
        console.error('定时刷新会话列表失败:', error)
      }
    }, REFRESH_INTERVAL)
  } catch (error) {
    console.error('初始化消息中心失败:', error)
    // 提供更详细的错误信息
    let errorMsg = '获取对话列表失败'
    if (error.response) {
      // 服务器返回了错误响应
      if (error.response.status === 500) {
        errorMsg = '服务器内部错误，请稍后重试'
      } else if (error.response.status === 401) {
        errorMsg = '登录已过期，请重新登录'
      } else if (error.response.status === 403) {
        errorMsg = '没有权限访问消息中心'
      } else if (error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMsg = '网络错误，请检查网络连接'
    } else {
      // 请求配置错误
      errorMsg = '请求错误: ' + error.message
    }
    ElMessage.error(errorMsg)
  }
})

// 组件卸载时清除定时任务
onUnmounted(() => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId)
    refreshIntervalId = null
  }
})
</script>

<style scoped>
.message-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: var(--theme-textColor);
}

.message-center-container h2 {
  color: var(--theme-textColor);
}

.message-center-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  min-height: 600px;
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 8px;
  box-shadow: var(--theme-boxShadow);
}

/* 左侧对话列表 */
.conversation-sidebar {
  width: 300px;
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 8px 0 0 8px;
  border-right: 1px solid var(--theme-borderColor);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 15px;
  border-bottom: 1px solid var(--theme-borderColor);
}

.search-bar .el-input__wrapper {
  background-color: var(--theme-inputBackgroundColor);
  border: 1px solid var(--theme-inputBorderColor);
}

.search-bar .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.5) inset;
}

.search-bar .el-input__input {
  color: var(--theme-textColor);
}

.search-bar .el-input__prefix-icon,
.search-bar .el-input__suffix-icon {
  color: var(--theme-secondaryTextColor);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--theme-borderColor);
  transition: all 0.3s;
}

.conversation-item:hover {
  background-color: var(--theme-hoverColor);
}

.conversation-item.active {
  background-color: var(--theme-activeColor);
  border-left: 3px solid var(--theme-primaryColor);
}

.conversation-item.has-unread {
  background-color: var(--theme-activeColor);
}

.conversation-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--theme-textColor);
}

.unread-count {
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.last-message {
  font-size: 14px;
  color: var(--theme-secondaryTextColor);
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 12px;
  color: var(--theme-secondaryTextColor);
  text-align: right;
}

.empty-conversations {
  padding: 50px 0;
  text-align: center;
  color: var(--theme-secondaryTextColor);
}

.empty-conversations .el-empty__description {
  color: var(--theme-secondaryTextColor);
}

/* 右侧消息详情 */
.message-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.no-conversation-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--theme-secondaryBackgroundColor);
  border-radius: 0 8px 8px 0;
  color: var(--theme-secondaryTextColor);
}

.no-conversation-selected .el-empty__description {
  color: var(--theme-secondaryTextColor);
}

.message-header {
  padding: 15px;
  border-bottom: 1px solid var(--theme-borderColor);
}

.message-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--theme-textColor);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--theme-backgroundColor);
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 240px);
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  animation: fadeIn 0.3s ease;
}

.message-item.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message-item.received {
  align-self: flex-start;
  align-items: flex-start;
}

.message-content {
  padding: 12px 18px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.5;
  position: relative;
  max-width: 100%;
}

/* 根据消息类型设置不同的背景色 */
.message-item.user-message .message-content {
  background-color: var(--theme-primaryColor);
  color: #fff;
}

.message-item.seller-message .message-content {
  background-color: #67c23a;
  color: #fff;
}

.message-item.admin-message .message-content {
  background-color: #e6a23c;
  color: #fff;
}

/* 发送者是当前用户时，使用统一的蓝色背景 */
.message-item.sent .message-content {
  background-color: var(--theme-primaryColor) !important;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.message-time {
  font-size: 12px;
  color: var(--theme-secondaryTextColor);
}

.message-indicator {
  display: flex;
  align-items: center;
}

.message-indicator .el-icon {
  font-size: 14px;
  color: var(--theme-secondaryTextColor);
}

.message-indicator .el-icon[color="#409eff"] {
  color: var(--theme-primaryColor);
}

.empty-messages {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--theme-secondaryTextColor);
}

.empty-messages .el-empty__description {
  color: var(--theme-secondaryTextColor);
}

/* 消息输入区域 */
.message-input-area {
  padding: 15px;
  border-top: 1px solid var(--theme-borderColor);
  background-color: var(--theme-secondaryBackgroundColor);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input-area .el-textarea {
  margin-bottom: 0;
}

.message-input-area .el-textarea__wrapper {
  background-color: var(--theme-inputBackgroundColor);
  border: 1px solid var(--theme-inputBorderColor);
}

.message-input-area .el-textarea__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.5) inset;
}

.message-input-area .el-textarea__inner {
  resize: none;
  border-radius: 18px;
  padding: 12px 18px;
  color: var(--theme-textColor);
  background-color: transparent;
}

.send-button-container {
  display: flex;
  justify-content: flex-end;
}

.send-button-container .el-button {
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;
}

.message-input-area .el-button {
  border-radius: 20px;
}

/* 滚动条样式 */
.conversation-list::-webkit-scrollbar,
.message-list::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track,
.message-list::-webkit-scrollbar-track {
  background: var(--theme-scrollbarTrackColor);
  border-radius: 3px;
}

.conversation-list::-webkit-scrollbar-thumb,
.message-list::-webkit-scrollbar-thumb {
  background: var(--theme-scrollbarThumbColor);
  border-radius: 3px;
}

.conversation-list::-webkit-scrollbar-thumb:hover,
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
  .message-center-content {
    flex-direction: column;
    min-height: 700px;
  }
  
  .conversation-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--theme-borderColor);
    border-radius: 8px 8px 0 0;
    max-height: 300px;
  }
  
  .message-detail {
    border-radius: 0 0 8px 8px;
    flex: 1;
  }
  
  .message-list {
    max-height: calc(100vh - 320px);
    padding: 15px;
  }
  
  .message-item {
    max-width: 85%;
  }
  
  .message-center-container {
    padding: 10px;
  }
  
  .message-center-content {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .conversation-sidebar {
    width: 100%;
    max-height: 250px;
  }
  
  .message-list {
    padding: 15px;
    max-height: calc(100vh - 300px);
  }
  
  .message-input-area {
    padding: 10px;
  }
  
  .message-content {
    padding: 10px 15px;
  }
  
  .message-center-content {
    min-height: 600px;
  }
}

/* 小屏幕设备的额外调整 */
@media (max-height: 600px) {
  .message-list {
    max-height: calc(100vh - 200px);
  }
  
  @media (max-width: 768px) {
    .message-list {
      max-height: calc(100vh - 280px);
    }
  }
  
  @media (max-width: 480px) {
    .message-list {
      max-height: calc(100vh - 260px);
    }
  }
}
</style>