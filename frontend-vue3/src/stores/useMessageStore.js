import { defineStore } from 'pinia'
import { apiClient } from '../api'
import eventBus, { EventTypes } from '../utils/eventBus'
import webSocketService from '../utils/websocket'
import notificationService from '../utils/notification'

export const useMessageStore = defineStore('message', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    error: null,
    unreadCount: 0,
    sending: false,
    isWebSocketConnected: false,
    lastSentMessages: {} // 存储每个会话的最后发送消息，格式：{ conversationId: { content: '消息内容', time: 时间戳 } }
  }),
  
  getters: {
    // 获取当前对话的消息
    currentMessages: (state) => {
      return state.messages.filter(msg => msg.conversationId === state.currentConversation?.id)
    },
    
    // 获取按时间排序的对话列表
    sortedConversations: (state) => {
      return [...state.conversations].sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
    }
  },
  
  actions: {
    // 初始化WebSocket连接
    initWebSocket() {
      // 初始化WebSocket服务
      webSocketService.init()
      
      // 监听WebSocket连接状态
      eventBus.on('websocket:connected', () => {
        try {
          this.isWebSocketConnected = true
          // 连接成功后，立即获取最新的对话列表
          this.updateConversations().catch(error => {
            console.error('WebSocket连接成功后更新会话列表失败:', error)
          })
        } catch (error) {
          console.error('处理WebSocket连接成功事件失败:', error)
        }
      })
      
      eventBus.on('websocket:disconnected', () => {
        try {
          this.isWebSocketConnected = false
        } catch (error) {
          console.error('处理WebSocket断开连接事件失败:', error)
        }
      })
      
      // 监听WebSocket错误事件
      eventBus.on('websocket:error', (error) => {
        try {
          console.error('WebSocket错误:', error)
          this.error = error.message
        } catch (error) {
          console.error('处理WebSocket错误事件失败:', error)
        }
      })
      
      // 监听新消息事件
      eventBus.on(EventTypes.MESSAGE_RECEIVED, async (message) => {
        try {
          // 检查消息是否已存在，避免重复添加
          const existingMessage = this.messages.find(m => m.id === message.id)
          if (existingMessage) {
            return
          }
          
          // 添加到消息列表
          this.messages.push(message)
          
          // 更新对话的最后一条消息
          let conversationIndex = this.conversations.findIndex(c => c.id === message.conversationId)
          
          if (conversationIndex !== -1) {
            // 找到对话，更新对话信息
            this.conversations[conversationIndex].lastMessageId = message.id
            this.conversations[conversationIndex].updatedAt = message.createdAt
            this.conversations[conversationIndex].unreadCount++
          } else {
            // 找不到对话，更新会话列表
            console.log('收到新消息，但未找到对应的会话，正在更新会话列表...')
            await this.updateConversations()
            // 重新查找会话索引
            conversationIndex = this.conversations.findIndex(c => c.id === message.conversationId)
          }
          
          // 更新未读计数
          await this.getUnreadCount()
          
          // 发送新消息通知
          const conversation = this.conversations[conversationIndex]
          let senderName = '商家'
          
          if (message.senderRole === 'seller') {
            senderName = conversation?.initiatorRole === 'seller' ? conversation?.initiatorName : conversation?.receiverName || `商家${conversation?.receiverId || message.senderId}`
          } else if (message.senderRole === 'admin') {
            senderName = '管理员'
          } else {
            senderName = conversation?.initiatorName || conversation?.receiverName || `用户${conversation?.receiverId || message.senderId}`
          }
          
          // 发送增强的新消息通知
          notificationService.sendNotification('新消息', {
            title: '新消息',
            body: `${senderName}: ${message.content}`,
            icon: '/favicon.ico',
            data: {
              conversationId: message.conversationId,
              messageId: message.id,
              type: 'message'
            },
            link: `/message-center?conversationId=${message.conversationId}`,
            type: 'info',
            soundType: 'default'
          })
          
          // 如果当前未选择对话，自动选择收到新消息的对话
          if (!this.currentConversation || this.currentConversation.id !== message.conversationId) {
            // 发布新消息事件，供UI组件处理
            eventBus.emit(EventTypes.NEW_MESSAGE_RECEIVED, {
              message,
              conversation
            })
          }
        } catch (error) {
          console.error('处理新消息事件失败:', error)
        }
      })
      
      // 监听消息已读事件
      eventBus.on(EventTypes.MESSAGE_READ, (message) => {
        try {
          const messageIndex = this.messages.findIndex(m => m.id === message.id)
          if (messageIndex !== -1) {
            this.messages[messageIndex].status = 'read'
          }
        } catch (error) {
          console.error('处理消息已读事件失败:', error)
        }
      })
      
      // 监听消息已送达事件
      eventBus.on(EventTypes.MESSAGE_DELIVERED, (message) => {
        try {
          const messageIndex = this.messages.findIndex(m => m.id === message.id)
          if (messageIndex !== -1) {
            this.messages[messageIndex].status = 'delivered'
          }
        } catch (error) {
          console.error('处理消息已送达事件失败:', error)
        }
      })
      
      // 监听WebSocket消息发送确认事件
      eventBus.on(EventTypes.MESSAGE_SEND_CONFIRMED, (confirmedMessage) => {
        try {
          // 更新本地消息状态，只使用tempId作为唯一匹配条件，避免重复
          const messageIndex = this.messages.findIndex(m => m.id === confirmedMessage.tempId)
          if (messageIndex !== -1) {
            // 替换临时消息为确认后的消息
            this.messages[messageIndex] = {
              ...confirmedMessage,
              id: confirmedMessage.id, // 使用服务器返回的真实ID
              status: 'sent' // 更新状态为已发送
            }
            
            // 更新对话的最后一条消息
            const conversationIndex = this.conversations.findIndex(c => c.id === confirmedMessage.conversationId)
            if (conversationIndex !== -1) {
              this.conversations[conversationIndex].lastMessageId = confirmedMessage.id
              this.conversations[conversationIndex].updatedAt = confirmedMessage.createdAt
            }
          }
          // 不再直接添加消息，只处理已存在的临时消息替换，避免重复
        } catch (error) {
          console.error('处理消息发送确认事件失败:', error)
        }
      })
    },
    
    // 获取对话列表
    async getConversations() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.message.getConversations()
        this.conversations = response.data
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新对话列表（用于定时刷新或手动更新）
    async updateConversations() {
      try {
        const response = await apiClient.message.getConversations()
        this.conversations = response.data
        
        return response
      } catch (error) {
        this.error = error.message
        console.error('更新对话列表失败:', error)
        // 不抛出错误，避免影响用户体验
        return null
      }
    },
    
    // 获取对话详情
    async getConversationDetail(conversationId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.message.getConversationDetail(conversationId)
        this.currentConversation = response.data.conversation
        this.messages = response.data.messages
        
        // 加入对话WebSocket房间
        if (this.isWebSocketConnected) {
          webSocketService.joinConversation(conversationId)
        }
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 创建新对话
    async createConversation(receiverId, receiverRole) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.message.createConversation(receiverId, receiverRole)
        // 如果对话已存在，将其添加到对话列表
        const existingIndex = this.conversations.findIndex(c => c.id === response.data.id)
        if (existingIndex === -1) {
          this.conversations.push(response.data)
        } else {
          this.conversations[existingIndex] = response.data
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 发送消息
    async sendMessage(conversationId, content, type = 'text', fileUrl = null) {
      // 防止重复发送
      if (this.sending) {
        console.log('正在发送消息中，请勿重复发送')
        return
      }
      
      // 检查内容是否为空
      if (!content || !content.trim()) {
        return
      }
      
      // 检查是否为重复发送（服务器端去重）
      const currentTime = Date.now()
      const trimmedContent = content.trim()
      const lastSent = this.lastSentMessages[conversationId] || { content: '', time: 0 }
      
      // 1秒内相同内容的消息视为重复发送
      if (trimmedContent === lastSent.content && currentTime - lastSent.time < 1000) {
        console.log('重复发送，已忽略')
        return
      }
      
      this.sending = true
      this.error = null
      
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        
        // 创建本地消息对象，立即显示在界面上
        const localMessage = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 增加随机后缀防止ID冲突
          conversationId,
          senderId: userInfo.id,
          senderRole: userInfo.role,
          content,
          type,
          status: 'sending',
          createdAt: new Date().toISOString()
        }
        
        // 添加到消息列表，确保立即显示
        this.messages.push(localMessage)
        
        // 更新对话的最后一条消息
        const conversationIndex = this.conversations.findIndex(c => c.id === conversationId)
        if (conversationIndex !== -1) {
          this.conversations[conversationIndex].lastMessageId = localMessage.id
          this.conversations[conversationIndex].updatedAt = localMessage.createdAt
        }
        
        // 优先使用WebSocket发送消息
        if (this.isWebSocketConnected) {
          // 使用WebSocket发送消息，传递临时ID
          const messageSent = webSocketService.sendMessage(conversationId, content, type, localMessage.id)
          
          if (messageSent) {
            // WebSocket发送成功，更新最后发送消息记录
            this.lastSentMessages[conversationId] = {
              content: trimmedContent,
              time: currentTime
            }
            // WebSocket发送成功，只需要等待服务器确认，不需要再使用REST API
            return { data: localMessage }
          } else {
            // WebSocket发送失败，回退到REST API
            const result = await this.sendRestMessage(conversationId, content, type, fileUrl, localMessage)
            // 更新最后发送消息记录
            this.lastSentMessages[conversationId] = {
              content: trimmedContent,
              time: currentTime
            }
            return result
          }
        } else {
          // 未连接WebSocket，使用REST API发送
          const result = await this.sendRestMessage(conversationId, content, type, fileUrl, localMessage)
          // 更新最后发送消息记录
          this.lastSentMessages[conversationId] = {
            content: trimmedContent,
            time: currentTime
          }
          return result
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        // 确保发送状态被重置
        this.sending = false
      }
    },
    
    // 使用REST API发送消息
    async sendRestMessage(conversationId, content, type = 'text', fileUrl = null, localMessage = null) {
      try {
        // 使用REST API发送消息
        const response = await apiClient.message.sendMessage({
          conversationId,
          content,
          type,
          fileUrl
        })
        
        // 如果有本地临时消息，替换它
        if (localMessage) {
          const messageIndex = this.messages.findIndex(m => m.id === localMessage.id)
          if (messageIndex !== -1) {
            // 替换临时消息为服务器返回的实际消息
            this.messages[messageIndex] = response.data
          } else {
            // 如果临时消息不存在，直接添加
            this.messages.push(response.data)
          }
        } else {
          // 没有临时消息，直接添加
          this.messages.push(response.data)
        }
        
        // 更新对话的最后一条消息
        const conversationIndex = this.conversations.findIndex(c => c.id === conversationId)
        if (conversationIndex !== -1) {
          this.conversations[conversationIndex].lastMessageId = response.data.id
          this.conversations[conversationIndex].updatedAt = response.data.createdAt
        }
        
        // 发布消息发送事件
        eventBus.emit(EventTypes.MESSAGE_SENT, response.data)
        
        return response
      } catch (error) {
        // 如果有本地临时消息，更新状态为发送失败
        if (localMessage) {
          const messageIndex = this.messages.findIndex(m => m.id === localMessage.id)
          if (messageIndex !== -1) {
            this.messages[messageIndex].status = 'failed'
          }
        }
        throw error
      }
    },
    
    // 获取未读消息数量
    async getUnreadCount() {
      try {
        const response = await apiClient.message.getUnreadCount()
        const previousCount = this.unreadCount
        this.unreadCount = response.data.unreadCount
        
        // 发布未读计数更新事件（仅当数量变化时）
        if (previousCount !== this.unreadCount) {
          eventBus.emit(EventTypes.UNREAD_COUNT_UPDATED, this.unreadCount)
        }
        
        return response
      } catch (error) {
        this.error = error.message
        // 不抛出错误，避免影响用户体验
        return { data: { unreadCount: 0 } }
      }
    },
    
    // 标记对话已读
    async markConversationAsRead(conversationId) {
      try {
        // 优先使用WebSocket标记已读
        if (this.isWebSocketConnected) {
          webSocketService.markMessageAsRead(null, conversationId)
        }
        
        // 调用API更新服务器状态
        const response = await apiClient.message.markConversationAsRead(conversationId)
        
        // 更新本地对话的未读计数
        const conversationIndex = this.conversations.findIndex(c => c.id === conversationId)
        if (conversationIndex !== -1) {
          this.conversations[conversationIndex].unreadCount = 0
        }
        
        // 更新本地消息状态
        this.messages.forEach(msg => {
          if (msg.conversationId === conversationId && msg.status !== 'read') {
            msg.status = 'read'
            // 发布消息已读事件
            eventBus.emit(EventTypes.MESSAGE_READ, msg)
          }
        })
        
        // 更新未读计数
        await this.getUnreadCount()
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    // 更新消息状态
    async updateMessageStatus(messageId, status) {
      try {
        // 优先使用WebSocket更新消息状态
        if (this.isWebSocketConnected) {
          // 根据状态发布相应事件
          const messageIndex = this.messages.findIndex(msg => msg.id === messageId)
          if (messageIndex !== -1) {
            const message = this.messages[messageIndex]
            message.status = status
            
            switch (status) {
              case 'delivered':
                webSocketService.markMessageAsDelivered(messageId, message.conversationId)
                eventBus.emit(EventTypes.MESSAGE_DELIVERED, message)
                break
              case 'read':
                webSocketService.markMessageAsRead(messageId, message.conversationId)
                eventBus.emit(EventTypes.MESSAGE_READ, message)
                break
            }
          }
        }
        
        // 调用API更新服务器状态
        const response = await apiClient.message.updateMessageStatus(messageId, status)
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    // 搜索消息
    async searchMessages(keyword) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.message.search(keyword)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 设置当前对话
    setCurrentConversation(conversation) {
      this.currentConversation = conversation
    },
    
    // 重置当前对话
    resetCurrentConversation() {
      this.currentConversation = null
      this.messages = []
    },
    
    // 重置错误
    resetError() {
      this.error = null
    }
  }
})