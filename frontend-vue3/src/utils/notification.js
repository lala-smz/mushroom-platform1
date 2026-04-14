// 消息通知工具类
class NotificationService {
  constructor() {
    this.isEnabled = this.checkPermission() === 'granted'
    this.notificationQueue = []
    this.eventListeners = {} // 初始化事件监听器对象
  }

  // 检查通知权限
  checkPermission() {
    if (!('Notification' in window)) {
      return 'not_supported'
    }
    return Notification.permission
  }

  // 请求通知权限
  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('浏览器不支持通知功能')
      return false
    }

    if (Notification.permission === 'granted') {
      this.isEnabled = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.isEnabled = permission === 'granted'
      return this.isEnabled
    }

    return false
  }

  // 发送浏览器通知
  sendBrowserNotification(title, options = {}) {
    try {
      if (!('Notification' in window)) {
        console.error('浏览器不支持通知功能')
        return false
      }

      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: options.body || '',
            icon: options.icon || '/favicon.ico',
            badge: options.badge || '/favicon.ico',
            data: options.data || {},
            tag: options.tag || '',
            ...options
          })
          return true
        } catch (error) {
          console.error('发送通知失败:', error)
          return false
        }
      } else if (Notification.permission !== 'denied') {
        // 如果用户还没有选择是否允许通知，先请求权限
        this.requestPermission().then(granted => {
          if (granted) {
            this.sendBrowserNotification(title, options)
          }
        }).catch(error => {
          console.error('请求通知权限失败:', error)
        })
      }
    } catch (error) {
      console.error('发送浏览器通知时发生错误:', error)
    }

    return false
  }

  // 发送应用内通知
  sendAppNotification(message, options = {}) {
    // 这里可以实现应用内通知，例如在页面顶部显示通知条
    // 或者将通知添加到通知中心列表
    console.log('应用内通知:', message, options)
    
    // 触发应用内通知事件
    this.emit('notification', { message, options })
    
    return true
  }

  // 发送通知（根据配置选择浏览器通知或应用内通知）
  sendNotification(title, options = {}) {
    // 优先使用浏览器通知
    if (this.isEnabled && options.useBrowserNotification !== false) {
      const browserSent = this.sendBrowserNotification(title, options)
      if (browserSent) {
        return true
      }
    }
    
    // 如果浏览器通知发送失败，使用应用内通知
    return this.sendAppNotification(title, options)
  }

  // 注册事件监听器
  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = {}
    }
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    
    this.eventListeners[event].push(callback)
  }

  // 触发事件
  emit(event, data) {
    try {
      if (this.eventListeners && this.eventListeners[event]) {
        this.eventListeners[event].forEach(callback => {
          if (typeof callback === 'function') {
            callback(data)
          }
        })
      }
    } catch (error) {
      console.error('触发事件失败:', error)
    }
  }

  // 移除事件监听器
  off(event, callback) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  // 清除所有事件监听器
  clearListeners() {
    this.eventListeners = {}
  }

  // 保存通知设置到本地存储
  saveSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  }

  // 从本地存储加载通知设置
  loadSettings() {
    const settings = localStorage.getItem('notificationSettings')
    return settings ? JSON.parse(settings) : {
      enabled: this.isEnabled,
      browserNotifications: true,
      appNotifications: true,
      sound: true,
      vibration: true
    }
  }

  // 获取未读通知计数
  getUnreadNotificationCount() {
    try {
      // 从本地存储获取未读通知计数
      const unreadCount = localStorage.getItem('unreadNotificationCount')
      return unreadCount ? parseInt(unreadCount, 10) : 0
    } catch (error) {
      console.error('获取未读通知计数失败:', error)
      return 0
    }
  }

  // 标记所有通知为已读
  markAllNotificationsAsRead() {
    try {
      // 清空本地存储中的未读通知计数
      localStorage.setItem('unreadNotificationCount', '0')
      // 触发通知已读事件
      this.emit('notifications_marked_as_read')
      return true
    } catch (error) {
      console.error('标记所有通知为已读失败:', error)
      return false
    }
  }
}

// 创建通知服务实例
const notificationService = new NotificationService()

export default notificationService