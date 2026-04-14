import { defineStore } from 'pinia'
import { apiClient } from '../api'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    orderDetail: null,
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    orderStatus: [
      { value: '', label: '全部状态' },
      { value: 'pending', label: '待支付' },
      { value: 'paid', label: '已支付' },
      { value: 'delivered', label: '已发货' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ]
  }),
  
  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.id === id) || state.orderDetail
    },
    
    // 获取订单状态文本
    getStatusText: (state) => (status) => {
      const statusObj = state.orderStatus.find(s => s.value === status)
      return statusObj ? statusObj.label : status
    }
  },
  
  actions: {
    // 创建订单
    async createOrder(orderData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.order.create(orderData)
        // 添加到本地订单列表
        this.orders.unshift(response.data)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取订单列表
    async getOrders(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.order.getList({
          page: params.page || this.page,
          limit: params.limit || this.limit,
          status: params.status || ''
        })
        
        // 处理订单列表，确保数值类型正确
        const orders = response.data.orders.map(order => ({
          ...order,
          totalAmount: parseFloat(order.totalAmount) || 0
        }))
        
        this.orders = orders
        this.total = response.data.total
        this.page = response.data.page
        this.limit = response.data.limit
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取订单详情
    async getOrderDetail(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.order.getDetail(id)
        
        // 处理订单详情，确保数值类型正确
        let orderDetail = response.data || {}
        
        // 转换总金额为数字类型
        orderDetail.totalAmount = parseFloat(orderDetail.totalAmount) || 0
        
        // 转换每个订单项的价格为数字类型
        if (Array.isArray(orderDetail.items)) {
          orderDetail.items = orderDetail.items.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0
          }))
        } else {
          orderDetail.items = []
        }
        
        // 检查本地是否已经有该订单的取消状态
        const localOrder = this.orders.find(order => order.id === id)
        if (localOrder && localOrder.status === 'cancelled' && orderDetail.status !== 'cancelled') {
          // 如果本地状态已经是已取消，但后端返回的不是，说明后端数据更新延迟
          // 保留本地状态
          console.warn('后端数据更新延迟，保留本地已取消状态');
          orderDetail.status = 'cancelled';
        }
        
        // 同样检查orderDetail
        if (this.orderDetail && this.orderDetail.id === id && this.orderDetail.status === 'cancelled' && orderDetail.status !== 'cancelled') {
          orderDetail.status = 'cancelled';
        }
        
        this.orderDetail = orderDetail
        return orderDetail
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新订单状态
    async updateOrderStatus(id, status, paymentTime = null) {
      this.loading = true
      this.error = null
      
      try {
        const updateData = { status }
        if (status === 'paid' && paymentTime) {
          updateData.paymentTime = paymentTime
        }
        
        const response = await apiClient.order.updateStatus(id, updateData)
        // 更新本地订单列表和详情
        const index = this.orders.findIndex(order => order.id === id)
        if (index !== -1) {
          this.orders[index] = response.data
        }
        if (this.orderDetail && this.orderDetail.id === id) {
          this.orderDetail = response.data
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 取消订单
    async cancelOrder(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.order.cancel(id)
        // 更新本地订单列表和详情
        const index = this.orders.findIndex(order => order.id === id)
        if (index !== -1) {
          this.orders[index].status = 'cancelled'
        }
        if (this.orderDetail && this.orderDetail.id === id) {
          this.orderDetail.status = 'cancelled'
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 重置订单详情
    resetOrderDetail() {
      this.orderDetail = null
    },
    
    // 重置错误
    resetError() {
      this.error = null
    }
  }
})