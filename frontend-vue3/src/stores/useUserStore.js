import { defineStore } from 'pinia'
import api from '../api/index.js'

// 创建API客户端包装器
const apiClient = {
  user: {
    login: (credentials) => api.post('/users/login', credentials),
    register: (userData) => api.post('/users/register', userData),
    logout: () => api.post('/users/logout'),
    getProfile: () => api.get('/users/info'),
    updateProfile: (userData) => api.put('/users/info', userData),
    updatePassword: (passwordData) => api.put('/users/password', passwordData),
    updateAvatar: (formData) => api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    getList: (params) => api.get('/users/list', { params }),
    getDetail: (id) => api.get(`/users/${id}`),
    updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
    updateRole: (id, data) => api.put(`/users/${id}/role`, data),
    delete: (id) => api.delete(`/users/${id}`)
  }
}

export const useUserStore = defineStore('user', {
  state: () => {
    // 安全地从localStorage获取数据
    let userInfo = null
    let permissions = []
    let token = null
    
    try {
      token = localStorage.getItem('token')
      
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr)
      }
      
      const permissionsStr = localStorage.getItem('permissions')
      if (permissionsStr) {
        permissions = JSON.parse(permissionsStr)
      }
    } catch (error) {
      console.error('解析本地存储数据失败:', error)
      // 解析失败时清空本地存储
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')
      localStorage.removeItem('token')
    }
    
    return {
      userInfo,
      token,
      permissions,
      loading: false,
      error: null,
      tokenValid: !!token
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin',
    isSeller: (state) => state.userInfo?.role === 'seller',
    isUser: (state) => state.userInfo?.role === 'user',
    user: (state) => state.userInfo,
    
    // 检查用户是否具有指定权限
    hasPermission: (state) => (permission) => {
      // 管理员拥有所有权限
      if (state.userInfo?.role === 'admin') {
        return true
      }
      
      // 检查用户是否具有指定权限
      return state.permissions.includes(permission)
    },
    
    // 检查用户是否具有所有指定权限
    hasAllPermissions: (state) => (permissions) => {
      // 管理员拥有所有权限
      if (state.userInfo?.role === 'admin') {
        return true
      }
      
      // 检查用户是否具有所有指定权限
      return permissions.every(permission => state.permissions.includes(permission))
    }
  },
  
  actions: {
    // 登录
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.user.login(credentials)
        // 修正token获取逻辑 - 正确处理后端返回的 { success: true, data: { token, ... } } 格式
        const loginData = response.data || response
        const { token, ...userInfo } = loginData.data || loginData
        
        // 设置默认权限
        let permissions = []
        switch (userInfo.role) {
          case 'seller':
            // 默认卖家权限：商品查看、创建、编辑、删除
            permissions = ['product:read', 'product:create', 'product:update', 'product:delete']
            break
          case 'user':
            // 默认普通用户权限：商品查看
            permissions = ['product:read']
            break
          case 'admin':
            // 管理员拥有所有权限，此处为空数组，在getter中处理
            permissions = []
            break
          default:
            permissions = []
        }
        
        // 存储到本地存储
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('permissions', JSON.stringify(permissions))
        
        // 更新状态
        this.token = token
        this.userInfo = userInfo
        this.permissions = permissions
        this.tokenValid = true
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 注册
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.user.register(userData)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.user.getProfile()
        const userData = response.data || response
        
        this.userInfo = userData
        localStorage.setItem('userInfo', JSON.stringify(userData))
        
        // 设置默认权限
        let permissions = []
        switch (userData.role) {
          case 'seller':
            // 默认卖家权限：商品查看、创建、编辑、删除
            permissions = ['product:read', 'product:create', 'product:update', 'product:delete']
            break
          case 'user':
            // 默认普通用户权限：商品查看
            permissions = ['product:read']
            break
          case 'admin':
            // 管理员拥有所有权限，此处为空数组，在getter中处理
            permissions = []
            break
          default:
            permissions = []
        }
        
        // 存储权限到本地存储
        localStorage.setItem('permissions', JSON.stringify(permissions))
        this.permissions = permissions
        
        return response
      } catch (error) {
        this.error = error.message
        // 如果获取失败，标记 token 无效，但不立即登出
        this.tokenValid = false
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户信息
    async updateUserInfo(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.user.updateProfile(userData)
        const updatedData = response.data || response
        
        this.userInfo = updatedData
        localStorage.setItem('userInfo', JSON.stringify(updatedData))
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.user.updatePassword(passwordData)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 退出登录
    logout() {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('permissions')
      
      // 重置状态
      this.token = null
      this.userInfo = null
      this.permissions = []
      this.error = null
      this.tokenValid = false
      
      // 跳转到登录页
      window.location.href = '/login'
    },
    
    // 初始化用户状态（从localStorage恢复）
    init() {
      try {
        const token = localStorage.getItem('token')
        const userInfoStr = localStorage.getItem('userInfo')
        const permissionsStr = localStorage.getItem('permissions')
        
        if (token && userInfoStr) {
          this.token = token
          this.userInfo = JSON.parse(userInfoStr)
          this.permissions = permissionsStr ? JSON.parse(permissionsStr) : []
          this.tokenValid = true
          
          return { token, userInfo: this.userInfo, permissions: this.permissions }
        }
        
        return null
      } catch (error) {
        console.error('初始化用户状态失败:', error)
        // 清除可能损坏的localStorage数据
        this.clearLocalStorage()
        return null
      }
    },
    
    // 清除本地存储
    clearLocalStorage() {
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('permissions')
        
        // 重置状态
        this.token = null
        this.userInfo = null
        this.permissions = []
        this.tokenValid = false
      } catch (error) {
        console.error('清除本地存储失败:', error)
      }
    },
    
    // 检查并刷新令牌
    async checkAndRefreshToken() {
      if (!this.token) {
        return false
      }
      
      try {
        // 尝试获取用户信息，验证令牌是否有效
        await this.fetchUserInfo()
        this.tokenValid = true
        return true
      } catch (error) {
        console.warn('令牌验证失败:', error)
        this.tokenValid = false
        return false
      }
    }
  }
})