import { io } from 'socket.io-client'
import eventBus, { EventTypes } from './eventBus'
import { useUserStore } from '../stores/useUserStore'

// WebSocket客户端类
class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.messageCallbacks = new Map() // 消息回调映射
    this.connectionPromise = null
  }

  // 初始化WebSocket连接
  init() {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')

    if (!token || !userStore.isLoggedIn) {
      console.log('用户未登录，无法初始化WebSocket连接')
      return Promise.resolve(false)
    }

    // 如果已有连接，直接返回
    if (this.isConnected && this.socket) {
      console.log('WebSocket已连接')
      return Promise.resolve(true)
    }

    // 如果已有连接Promise，等待其完成
    if (this.connectionPromise) {
      console.log('WebSocket连接正在建立中，等待完成')
      return this.connectionPromise
    }

    // 创建连接Promise
    this.connectionPromise = new Promise((resolve, reject) => {
      // 创建Socket.IO实例 - 使用Railway后端地址用于生产环境
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://grateful-renewal-production-b1b1.up.railway.app' 
        : 'http://localhost:3003';
      console.log('WebSocket连接地址:', wsUrl);
      
      this.socket = io(wsUrl, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket'],
        autoConnect: true,
        forceNew: false, // 改为false，避免创建多个连接
        // 增加详细的调试信息
        debug: true
      })

      // 连接成功事件
      this.socket.on('connect', () => {
        console.log('WebSocket连接成功')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // 触发连接成功事件
        eventBus.emit('websocket:connected')
        resolve(true)
      })

      // 连接错误事件
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket连接错误:', error)
        console.error('错误详情:', error.message)
        console.error('错误代码:', error.code)
        console.error('错误数据:', error.data)
        this.isConnected = false
        this.reconnectAttempts++
        
        // 触发连接错误事件，附带详细错误信息
        eventBus.emit('websocket:error', {
          message: error.message,
          code: error.code,
          data: error.data,
          fullError: error,
          reconnectAttempts: this.reconnectAttempts
        })
        
        // 如果是初始连接错误，拒绝Promise
        if (!this.isConnected) {
          reject(error)
        }
      })

      // 断开连接事件
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket断开连接:', reason)
        this.isConnected = false
        
        // 清理所有挂起的回调，避免消息端口关闭错误
        this.clearPendingCallbacks()
        
        // 触发断开连接事件
        eventBus.emit('websocket:disconnected', reason)
      })

      // 重连尝试事件
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`WebSocket重连尝试: ${attemptNumber}/${this.maxReconnectAttempts}`)
        eventBus.emit('websocket:reconnect_attempt', attemptNumber)
      })

      // 重连成功事件
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`WebSocket重连成功: 尝试次数 ${attemptNumber}`)
        this.isConnected = true
        this.reconnectAttempts = 0
        eventBus.emit('websocket:reconnect', attemptNumber)
      })

      // 重连失败事件
      this.socket.on('reconnect_failed', () => {
        console.error('WebSocket重连失败，已达到最大尝试次数')
        this.isConnected = false
        eventBus.emit('websocket:reconnect_failed')
      })

      // 收到新消息事件
      this.socket.on('message:new', (message) => {
        console.log('收到新消息:', message)
        
        // 将消息添加到消息列表
        eventBus.emit(EventTypes.MESSAGE_RECEIVED, message)
      })
      
      // 消息发送确认事件
      this.socket.on('message:send:confirmed', (message) => {
        console.log('消息发送确认:', message)
        
        // 触发消息发送确认事件
        eventBus.emit(EventTypes.MESSAGE_SEND_CONFIRMED, message)
        
        // 调用对应的回调函数
        if (message.tempId && this.messageCallbacks.has(message.tempId)) {
          const callback = this.messageCallbacks.get(message.tempId)
          callback(message)
          this.messageCallbacks.delete(message.tempId)
        }
      })

      // 消息发送错误事件
      this.socket.on('message:send:error', (data) => {
        console.error('消息发送错误:', data)
        
        // 调用对应的回调函数，传递错误信息
        if (data.tempId && this.messageCallbacks.has(data.tempId)) {
          const callback = this.messageCallbacks.get(data.tempId)
          try {
            callback({ error: data.error })
          } catch (error) {
            console.error('调用回调函数失败:', error)
          }
          this.messageCallbacks.delete(data.tempId)
        }
      })

      // 消息已读事件
      this.socket.on('message:read', (data) => {
        console.log('消息已读:', data)
        
        // 触发消息已读事件
        eventBus.emit(EventTypes.MESSAGE_READ, data)
      })

      // 消息已送达事件
      this.socket.on('message:delivered', (data) => {
        console.log('消息已送达:', data)
        
        // 触发消息已送达事件
        eventBus.emit(EventTypes.MESSAGE_DELIVERED, data)
      })

      // 欢迎消息事件
      this.socket.on('connected', (data) => {
        console.log('WebSocket欢迎消息:', data)
      })

      // 错误事件
      this.socket.on('error', (error) => {
        console.error('WebSocket错误:', error)
        eventBus.emit('websocket:error', {
          message: error.message,
          fullError: error
        })
      })

      // 超时事件
      this.socket.on('timeout', () => {
        console.error('WebSocket超时')
        eventBus.emit('websocket:timeout')
      })

      // 排行榜更新事件
      this.socket.on('ranking:update', (data) => {
        console.log('收到排行榜更新事件:', data)
        eventBus.emit('ranking:update', data)
      })
    })

    return this.connectionPromise
  }

  // 发送消息
  sendMessage(conversationId, content, type = 'text', tempId = null) {
    const userStore = useUserStore()
    
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送消息')
      return false
    }

    if (!userStore.userInfo || !userStore.userInfo.id) {
      console.error('用户信息不存在，无法发送消息')
      return false
    }

    try {
      const messageData = {
        conversationId,
        senderId: userStore.userInfo.id,
        content,
        type,
        tempId // 添加临时ID，用于消息确认匹配
      }

      this.socket.emit('message:send', messageData)
      return true
    } catch (error) {
      console.error('发送消息失败:', error)
      return false
    }
  }

  // 发送消息并等待确认
  sendMessageWithConfirmation(conversationId, content, type = 'text') {
    return new Promise((resolve, reject) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 设置超时
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(tempId)
        reject(new Error('消息发送超时'))
      }, 30000)

      // 存储回调
      this.messageCallbacks.set(tempId, (message) => {
        clearTimeout(timeout)
        resolve(message)
      })

      // 发送消息
      const success = this.sendMessage(conversationId, content, type, tempId)
      
      if (!success) {
        clearTimeout(timeout)
        this.messageCallbacks.delete(tempId)
        reject(new Error('WebSocket未连接'))
      }
    })
  }

  // 标记消息已读
  markMessageAsRead(messageId, conversationId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法标记消息已读')
      return false
    }

    try {
      this.socket.emit('message:read', {
        messageId,
        conversationId
      })
      return true
    } catch (error) {
      console.error('标记消息已读失败:', error)
      return false
    }
  }
  
  // 标记消息已送达
  markMessageAsDelivered(messageId, conversationId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法标记消息已送达')
      return false
    }

    try {
      this.socket.emit('message:delivered', {
        messageId,
        conversationId
      })
      return true
    } catch (error) {
      console.error('标记消息已送达失败:', error)
      return false
    }
  }

  // 加入对话房间
  joinConversation(conversationId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法加入对话房间')
      return false
    }

    try {
      this.socket.emit('join:conversation', conversationId)
      return true
    } catch (error) {
      console.error('加入对话房间失败:', error)
      return false
    }
  }

  // 离开对话房间
  leaveConversation(conversationId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法离开对话房间')
      return false
    }

    try {
      this.socket.emit('leave:conversation', conversationId)
      return true
    } catch (error) {
      console.error('离开对话房间失败:', error)
      return false
    }
  }

  // 清理挂起的回调函数
  clearPendingCallbacks() {
    if (this.messageCallbacks.size > 0) {
      console.log(`清理 ${this.messageCallbacks.size} 个挂起的回调函数`)
      // 遍历所有回调并调用错误处理
      for (const [tempId, callback] of this.messageCallbacks) {
        try {
          callback({ error: 'WebSocket连接已断开' })
        } catch (error) {
          console.error('调用回调函数失败:', error)
        }
      }
      // 清空回调映射
      this.messageCallbacks.clear()
    }
  }

  // 断开WebSocket连接
  disconnect() {
    if (this.socket) {
      try {
        // 清理所有回调
        this.clearPendingCallbacks()
        
        // 断开连接
        this.socket.disconnect()
        this.socket = null
        this.isConnected = false
        this.connectionPromise = null
        console.log('WebSocket已手动断开连接')
      } catch (error) {
        console.error('断开WebSocket连接失败:', error)
      }
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected
  }

  // 确保连接
  async ensureConnection(maxRetries = 3) {
    if (this.isConnected && this.socket) {
      return true
    }
    
    let retries = 0
    while (retries < maxRetries) {
      try {
        const result = await this.init()
        if (result) {
          return true
        }
      } catch (error) {
        console.error(`确保WebSocket连接失败 (尝试 ${retries + 1}/${maxRetries}):`, error)
      }
      
      retries++
      if (retries < maxRetries) {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }
    
    console.error('确保WebSocket连接失败，已达到最大重试次数')
    return false
  }

  // 发送评分提交事件
  sendRatingSubmit(workId, rating) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送评分提交事件')
      return false
    }

    try {
      this.socket.emit('rating:submit', {
        workId,
        rating
      })
      console.log('发送评分提交事件:', { workId, rating })
      return true
    } catch (error) {
      console.error('发送评分提交事件失败:', error)
      return false
    }
  }

  // 发送支付状态查询事件
  sendPaymentStatusQuery(orderId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送支付状态查询事件')
      return false
    }

    try {
      this.socket.emit('payment:status:query', {
        orderId
      })
      console.log('发送支付状态查询事件:', { orderId })
      return true
    } catch (error) {
      console.error('发送支付状态查询事件失败:', error)
      return false
    }
  }

  // 发送支付成功事件
  sendPaymentSuccess(orderId, transactionId) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送支付成功事件')
      return false
    }

    try {
      this.socket.emit('payment:success', {
        orderId,
        transactionId
      })
      console.log('发送支付成功事件:', { orderId, transactionId })
      return true
    } catch (error) {
      console.error('发送支付成功事件失败:', error)
      return false
    }
  }

  // 发送支付失败事件
  sendPaymentFailure(orderId, errorMessage) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法发送支付失败事件')
      return false
    }

    try {
      this.socket.emit('payment:failure', {
        orderId,
        errorMessage
      })
      console.log('发送支付失败事件:', { orderId, errorMessage })
      return true
    } catch (error) {
      console.error('发送支付失败事件失败:', error)
      return false
    }
  }

  // 监听支付状态更新事件
  onPaymentStatusUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法监听支付状态更新事件')
      return false
    }

    try {
      this.socket.on('payment:status:update', callback)
      console.log('开始监听支付状态更新事件')
      return true
    } catch (error) {
      console.error('监听支付状态更新事件失败:', error)
      return false
    }
  }

  // 移除支付状态更新事件监听
  offPaymentStatusUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法移除支付状态更新事件监听')
      return false
    }

    try {
      if (callback) {
        this.socket.off('payment:status:update', callback)
      } else {
        this.socket.off('payment:status:update')
      }
      console.log('移除支付状态更新事件监听')
      return true
    } catch (error) {
      console.error('移除支付状态更新事件监听失败:', error)
      return false
    }
  }

  // 订阅排行榜更新事件
  subscribeToRankingUpdate() {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法订阅排行榜更新事件')
      return false
    }

    try {
      // 发送订阅请求
      this.socket.emit('ranking:subscribe')
      console.log('订阅排行榜更新事件')
      return true
    } catch (error) {
      console.error('订阅排行榜更新事件失败:', error)
      return false
    }
  }

  // 取消订阅排行榜更新事件
  unsubscribeFromRankingUpdate() {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法取消订阅排行榜更新事件')
      return false
    }

    try {
      // 发送取消订阅请求
      this.socket.emit('ranking:unsubscribe')
      console.log('取消订阅排行榜更新事件')
      return true
    } catch (error) {
      console.error('取消订阅排行榜更新事件失败:', error)
      return false
    }
  }

  // 监听排行榜更新事件
  onRankingUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法监听排行榜更新事件')
      return false
    }

    try {
      this.socket.on('ranking:update', callback)
      console.log('开始监听排行榜更新事件')
      return true
    } catch (error) {
      console.error('监听排行榜更新事件失败:', error)
      return false
    }
  }

  // 移除排行榜更新事件监听
  offRankingUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法移除排行榜更新事件监听')
      return false
    }

    try {
      if (callback) {
        this.socket.off('ranking:update', callback)
      } else {
        this.socket.off('ranking:update')
      }
      console.log('移除排行榜更新事件监听')
      return true
    } catch (error) {
      console.error('移除排行榜更新事件监听失败:', error)
      return false
    }
  }

  // 监听评论更新事件
  onCommentUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法监听评论更新事件')
      return false
    }

    try {
      this.socket.on('comment:update', callback)
      console.log('开始监听评论更新事件')
      return true
    } catch (error) {
      console.error('监听评论更新事件失败:', error)
      return false
    }
  }

  // 移除评论更新事件监听
  offCommentUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法移除评论更新事件监听')
      return false
    }

    try {
      if (callback) {
        this.socket.off('comment:update', callback)
      } else {
        this.socket.off('comment:update')
      }
      console.log('移除评论更新事件监听')
      return true
    } catch (error) {
      console.error('移除评论更新事件监听失败:', error)
      return false
    }
  }

  // 监听评分更新事件
  onRatingUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法监听评分更新事件')
      return false
    }

    try {
      this.socket.on('rating:update', callback)
      console.log('开始监听评分更新事件')
      return true
    } catch (error) {
      console.error('监听评分更新事件失败:', error)
      return false
    }
  }

  // 移除评分更新事件监听
  offRatingUpdate(callback) {
    if (!this.isConnected || !this.socket) {
      console.error('WebSocket未连接，无法移除评分更新事件监听')
      return false
    }

    try {
      if (callback) {
        this.socket.off('rating:update', callback)
      } else {
        this.socket.off('rating:update')
      }
      console.log('移除评分更新事件监听')
      return true
    } catch (error) {
      console.error('移除评分更新事件监听失败:', error)
      return false
    }
  }
}

// 创建WebSocket服务实例
const webSocketService = new WebSocketService()

export default webSocketService
