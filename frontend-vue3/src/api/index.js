import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3303/api',
  timeout: 90000, // 增加超时时间到90秒
  headers: {
    'Content-Type': 'application/json'
  },
  retry: 3, // 重试次数
  retryDelay: (retryCount) => Math.min(2000 * 2 ** retryCount, 20000), // 指数退避重试延迟，从2秒开始
  // 请求状态管理
  requestState: {
    isRateLimited: false,
    rateLimitResetTime: 0
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 检查是否处于速率限制状态
    const now = Date.now()
    if (api.defaults.requestState.isRateLimited && now < api.defaults.requestState.rateLimitResetTime) {
      const waitTime = Math.ceil((api.defaults.requestState.rateLimitResetTime - now) / 1000)
      console.warn(`[Rate Limit] 请求被暂时阻止，需要等待 ${waitTime} 秒`)
      return Promise.reject(new Error(`请求过于频繁，请等待 ${waitTime} 秒后重试`))
    }

    // 从本地存储获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID
    config.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[${config.requestId}] 发送请求: ${config.method.toUpperCase()} ${config.url}`)
    
    // 如果是 boxes 相关的 POST 或 PUT 请求，记录完整的数据
    if (config.url && config.url.includes('/boxes') && 
        (config.method === 'post' || config.method === 'put') && 
        config.data) {
      console.log(`[${config.requestId}] === 发送给后端的完整数据 ===`)
      console.log(`[${config.requestId}] URL:`, config.url)
      console.log(`[${config.requestId}] 方法:`, config.method)
      console.log(`[${config.requestId}] 数据类型:`, typeof config.data)
      console.log(`[${config.requestId}] 完整数据:`, JSON.parse(JSON.stringify(config.data)))
      console.log(`[${config.requestId}] items长度:`, config.data.items?.length || 0)
      if (Array.isArray(config.data.items)) {
        config.data.items.forEach((item, idx) => {
          console.log(`[${config.requestId}]   items[${idx}]:`, item)
        })
      }
      console.log(`[${config.requestId}] ==============================`)
    }
    
    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const config = response.config
    console.log(`[${config.requestId}] 收到响应: ${config.method.toUpperCase()} ${config.url} - ${response.status}`)
    
    // 统一处理响应数据
    if (response.data && typeof response.data === 'object') {
      // 如果响应数据包含success字段，按照成功/失败处理
      if ('success' in response.data) {
        if (response.data.success) {
          return response.data
        } else {
          return Promise.reject(new Error(response.data.error || '请求失败'))
        }
      } else {
        // 如果响应数据不包含success字段，直接返回数据
        return response.data
      }
    } else {
      // 如果响应数据不是对象，直接返回
      return response.data
    }
  },
  error => {
    const config = error.config
    const requestId = config?.requestId || 'unknown'
    
    console.error(`[${requestId}] 请求失败:`, error)
    
    // 统一处理错误
    let errorMessage = '请求失败，请稍后重试'
    
    if (error.response) {
      const { status, data } = error.response
      console.error(`[${requestId}] 服务器响应错误:`, {
        status,
        data: data.error || data.message || data,
        url: config?.url
      })
      
      switch (status) {
        case 401:
          // 未授权，提示用户重新登录，但不立即跳转，避免数据丢失
          errorMessage = '登录已过期，请重新登录'
          // 显示登录过期提示，让用户手动选择是否跳转
          const userConfirmed = window.confirm('登录已过期，请重新登录。点击确定跳转到登录页，点击取消可以继续保存当前数据（但可能失败）')
          if (userConfirmed) {
            // 只有在用户确认后才清除localStorage并跳转到登录页
            try {
              localStorage.removeItem('token')
              localStorage.removeItem('userInfo')
              localStorage.removeItem('permissions')
            } catch (error) {
              console.error('清除本地存储失败:', error)
            }
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          } else {
            // 用户选择取消，保持当前状态，允许继续操作
            console.warn('用户选择继续使用过期的登录状态')
          }
          break
        case 403:
          errorMessage = '权限不足，无法执行此操作'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = data.error || '服务器内部错误，请稍后重试'
          break
        case 502:
          errorMessage = '网关错误，请稍后重试'
          break
        case 503:
          errorMessage = '服务暂时不可用，请稍后重试'
          break
        case 504:
          errorMessage = '网关超时，请稍后重试'
          break
        case 429:
          errorMessage = '请求过于频繁，请稍后重试'
          // 设置速率限制状态
          api.defaults.requestState.isRateLimited = true
          // 设置重置时间为30秒后
          api.defaults.requestState.rateLimitResetTime = Date.now() + 30000
          console.warn(`[Rate Limit] 触发429错误，将在30秒后恢复请求`)
          break
        default:
          errorMessage = data.error || '请求失败'
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接后重试'
    } else if (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      errorMessage = '网络错误，请检查网络连接或稍后重试'
    } else {
      errorMessage = error.message
    }
    
    // 显示错误提示（只有当没有设置 skipErrorDisplay 时才显示）
    if (window.ElMessage && !config?.skipErrorDisplay) {
      window.ElMessage.error({
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
    }
    
    // 实现重试逻辑
    if (config && config.retry > 0) {
      // 对于429错误和网络错误进行重试
      if (!error.response || error.response.status === 429 || error.message.includes('Network Error')) {
        config.retry--
        const retryDelay = config.retryDelay(config.retry)
        
        // 对于429错误，增加额外的延迟
        const finalDelay = error.response?.status === 429 ? retryDelay * 2 : retryDelay
        
        console.log(`[${requestId}] 重试请求 (${config.retry + 1}/${config.retry + config.retry + 1})，延迟 ${finalDelay}ms`)
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(config))
          }, finalDelay)
        })
      }
    }
    
    const errorWithResponse = new Error(errorMessage)
      errorWithResponse.response = error.response
      return Promise.reject(errorWithResponse)
  }
)

// API接口定义
export const apiClient = {
  // 用户相关
  user: {
    register: (data) => api.post('/users/register', data),
    login: (data) => api.post('/users/login', data),
    getInfo: () => api.get('/users/info'),
    updateInfo: (data) => api.put('/users/info', data),
    changePassword: (data) => api.put('/users/password', data),
    follow: (data) => api.post('/users/follow', data),
    unfollow: (data) => api.post('/users/unfollow', data),
    getFollowStatus: (followingId) => api.get('/users/follow/status', { params: { followingId } }),
    getUserById: (userId) => api.get(`/users/${userId}`)
  },
  
  // 商品相关
  product: {
    getList: (params) => api.get('/products/list', { params }),
    getSellerProducts: (params) => api.get('/products/seller/list', { params }),
    getDetail: (id) => api.get(`/products/detail/${id}`),
    getHot: (params) => api.get('/products/hot', { params }),
    create: (data) => api.post('/products/create', data),
    update: (id, data) => api.put(`/products/update/${id}`, data),
    delete: (id) => api.delete(`/products/delete/${id}`),
    approve: (id, data) => api.put(`/products/approve/${id}`, data),
    setHot: (id, isHot) => api.put(`/products/set-hot/${id}`, { isHot }),
    getStats: () => api.get('/products/stats'),
    // 分类相关
    getCategories: () => api.get('/products/categories'),
    getLevel2Categories: (level1) => api.get('/products/categories/level2', { params: { level1 } }),
    getLevel3Categories: (level2) => api.get('/products/categories/level3', { params: { level2 } })
  },
  
  // 购物车相关
  cart: {
    getList: () => api.get('/carts/list'),
    add: (data) => api.post('/carts/add', data),
    update: (id, data) => api.put(`/carts/update/${id}`, data),
    delete: (id) => api.delete(`/carts/delete/${id}`),
    clear: () => api.delete('/carts/clear'),
    updateStatus: (id, data) => api.put(`/carts/status/${id}`, data)
  },
  
  // 订单相关
  order: {
    create: (data) => api.post('/order/create', data),
    getList: (params) => api.get('/order/list', { params }),
    getDetail: (id) => api.get(`/order/detail/${id}`),
    updateStatus: (id, data) => api.put(`/order/update/${id}`, data),
    cancel: (id) => api.put(`/order/cancel/${id}`),
    // 支付相关
    queryPayStatus: (id) => api.get(`/order/pay/status/${id}`),
    retryPay: (id) => api.post(`/order/pay/retry/${id}`),
    payNotify: (data) => api.post('/order/pay/notify', data),
    // 新增支付接口
    payOrder: (id, paymentMethod) => api.post(`/order/pay/${id}`, { paymentMethod }),
    pollPayStatus: (id) => api.get(`/order/pay/poll/${id}`)
  },
  
  // 地址相关
  address: {
    getList: () => api.get('/address/list'),
    add: (data) => api.post('/address/add', data),
    update: (id, data) => api.put(`/address/update/${id}`, data),
    delete: (id) => api.delete(`/address/delete/${id}`),
    setDefault: (id) => api.put(`/address/setDefault/${id}`)
  },
  
  // 消息相关
  message: {
    getConversations: () => api.get('/messages/conversations'),
    getConversationDetail: (id) => api.get(`/messages/conversations/${id}`),
    createConversation: (receiverId, receiverRole) => api.post('/messages/conversations', { receiverId, receiverRole }),
    sendMessage: (data) => api.post('/messages', data),
    getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages`),
    updateMessageStatus: (messageId, status) => api.put(`/messages/messages/${messageId}/status`, { status }),
    getUnreadCount: () => api.get('/messages/unread-count'),
    markConversationAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
    search: (keyword) => api.get('/messages/search', { params: { keyword } })
  },
  
  // 管理员相关
    admin: {
      getUsers: (params) => api.get('/admin/users', { params }),
      getProducts: (params) => api.get('/admin/products', { params }),
      getOrders: (params) => api.get('/admin/orders', { params }),
      getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
      updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
      getStats: () => api.get('/admin/stats'),
      updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
      updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
      updateUserInfo: (id, data) => api.put(`/admin/users/${id}/info`, data),
      deleteUser: (id) => api.delete(`/admin/users/${id}`)
    },
    
    // 卖家相关
    seller: {
      getOrders: (params) => api.get('/order/seller/list', { params }),
      getOrderDetail: (id) => api.get(`/order/detail/${id}`),
      updateOrderStatus: (id, data) => api.put(`/order/seller/update/${id}`, data),
      getStats: () => api.get('/order/seller/stats')
    },
  
  // 文件上传
  upload: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 90000 // 上传文件超时时间90秒
  }),
  
  // 作品相关
  work: {
    upload: (formData, config = {}) => api.post('/works/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 90000, // 上传文件超时时间90秒
      ...config
    }),
    update: (id, formData) => {
      // 根据数据类型自动设置Content-Type
      const config = {
        timeout: 90000 // 上传文件超时时间90秒
      }
      
      // 如果是FormData对象，设置multipart/form-data
      if (formData instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      return api.put(`/works/${id}`, formData, config)
    },
    delete: (id, data) => {
      // 优先使用查询参数，因为 DELETE 请求的 body 在某些服务器上可能不被支持
      return api.delete(`/works/${id}`, {
        params: data
      })
    },
    like: (data) => api.post('/works/like', data, { skipErrorDisplay: true }),
    unlike: (data) => api.post('/works/unlike', data, { skipErrorDisplay: true }),
    favorite: (data) => api.post('/works/favorite', data),
    unfavorite: (data) => api.post('/works/unfavorite', data),
    checkFavorite: (data) => api.get('/works/check-favorite', { params: data }),
    checkLike: (data) => api.get('/works/check-like', { params: data }),
    getDetail: (id) => api.get(`/works/${id}`),
    getRecommended: (params) => api.get('/works/recommended', { params }),
    getLatest: (params) => api.get('/works/latest', { params }),
    getFollowing: (params) => api.get('/works/following', { params }),
    getUserWorks: (userId, params) => api.get(`/works/user/${userId}`, { params }),
    getUserFavorites: (userId, params) => api.get(`/works/user/${userId}/favorites`, { params }),
    getAllWorks: (params) => api.get('/works/admin/all', { params }),
    getRanking: (params) => api.get('/works/ranking', { params }),
    getScoreConfig: () => api.get('/works/score/config'),
    updateScoreConfig: (data) => api.put('/works/score/config', data),
    updateAllScores: () => api.post('/works/score/update-all'),
    getScoreConfigLogs: () => api.get('/works/score/config/logs'),
    addComment: (data) => api.post('/works/comment', data),
    deleteComment: (id, data) => api.delete(`/works/comment/${id}`, { data }),
    getComments: (workId, params) => api.get(`/works/${workId}/comments`, { params }),
    // 添加评分
    addRating: (data) => api.post('/ratings', data),
    getWorkRatings: (workId) => api.get(`/ratings/work/${workId}`),
    updateRating: (id, data) => api.put(`/ratings/${id}`, data),
    deleteRating: (id, data) => api.delete(`/ratings/${id}`, { data })
  },
  
  // 烹饪视频相关
  cookingVideo: {
    recommendByUser: (params) => api.get('/cooking-videos/recommend', { params }),
    getForRecipe: (recipeId, params) => api.get(`/cooking-videos/recipe/${recipeId}`, { params }),
    recommendByMushroom: (mushroomName, params) => api.get(`/cooking-videos/mushroom/${mushroomName}`, { params }),
    search: (params) => api.get('/cooking-videos/search', { params }),
    getByMushroomBoxId: (mushroomBoxId, params) => api.get(`/cooking-videos/mushroom-box/${mushroomBoxId}`, { params }),
    incrementViews: (videoId) => api.post(`/cooking-videos/${videoId}/view`)
  },
  
  // 内容管理相关（视频上传）
  contentManagement: {
    // 上传烹饪视频
    uploadVideo: (formData) => api.post('/content-management/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 90000 // 上传文件超时时间90秒
    }),
    // 删除烹饪视频
    deleteVideo: (id) => api.delete(`/content-management/videos/${id}`),
    // 筛选烹饪视频
    filterVideos: (params) => api.get('/content-management/videos/filter', { params })
  }
}

// 创建取消令牌工厂
const createCancelToken = () => {
  const source = axios.CancelToken.source()
  return {
    token: source.token,
    cancel: source.cancel
  }
}

// 导出取消令牌工厂
export { createCancelToken }

export default api