import { defineStore } from 'pinia'
import { apiClient } from '../api'

// 缓存管理
const cache = {
  data: {},
  cacheTimes: {},
  CACHE_DURATION: 60000, // 缓存时间 60秒
  
  isCached(key, id = null) {
    if (id) {
      key = `${key}_${id}`
    }
    return this.data[key] && (Date.now() - this.cacheTimes[key] < this.CACHE_DURATION)
  },
  
  set(key, data, id = null) {
    if (id) {
      key = `${key}_${id}`
    }
    this.data[key] = data
    this.cacheTimes[key] = Date.now()
  },
  
  get(key, id = null) {
    if (id) {
      key = `${key}_${id}`
    }
    return this.data[key]
  },
  
  clear(key, id = null) {
    if (id) {
      key = `${key}_${id}`
      delete this.data[key]
      delete this.cacheTimes[key]
    } else if (key) {
      delete this.data[key]
      delete this.cacheTimes[key]
    } else {
      this.data = {}
      this.cacheTimes = {}
    }
  },
  
  // 按前缀清除缓存
  clearByPrefix(prefix) {
    Object.keys(this.data).forEach(key => {
      if (key.startsWith(prefix)) {
        delete this.data[key]
        delete this.cacheTimes[key]
      }
    })
  }
}

// 节流函数
function throttle(fn, delay) {
  let lastCall = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastCall < delay) {
      return Promise.resolve(null)
    }
    lastCall = now
    return fn.apply(this, args)
  }
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    productDetail: null,
    hotProducts: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    categories: [
      { value: '', label: '全部分类' },
      { value: '食用菌', label: '食用菌' },
      { value: '药用菌', label: '药用菌' },
      { value: '野生菌', label: '野生菌' },
      { value: '菌包', label: '菌包' },
      { value: '菌种', label: '菌种' },
      { value: '盲盒', label: '时令菌菇盲盒' },
      { value: '菌菇', label: '菌菇' }
    ],
    lastRequestTime: 0,
    requestDelay: 1000 // 请求间隔 1秒
  }),
  
  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id) || state.productDetail || cache.get('productDetails', id)
    },
    canMakeRequest: (state) => {
      return Date.now() - state.lastRequestTime >= state.requestDelay
    }
  },
  
  actions: {
    // 检查是否可以发起请求
    checkRequestInterval() {
      const now = Date.now()
      if (now - this.lastRequestTime < this.requestDelay) {
        return false
      }
      this.lastRequestTime = now
      return true
    },
    
    // 获取商品列表（公开）
    async getProducts(params = {}) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      // 检查缓存（使用与后端一致的缓存键格式）
      const cacheKey = `product:list:${params.category || ''}:${params.page || 1}:${params.limit || 10}`
      if (cache.isCached(cacheKey) && !params.category && !params.status) {
        const cachedData = cache.get(cacheKey)
        this.products = cachedData.products
        this.total = cachedData.total
        this.page = cachedData.page
        this.limit = cachedData.limit
        return { data: cachedData }
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.product.getList({
          page: params.page || this.page,
          limit: params.limit || this.limit,
          category: params.category || '',
          status: params.status || ''
        })
        
        console.log('getProducts response:', response)
        
        // The API interceptor returns { success: true, data: {...} }
        // The actual product data is inside response.data
        const apiData = response?.data || {}
        this.products = apiData?.products || []
        this.total = apiData?.total || 0
        this.page = apiData?.page || 1
        this.limit = apiData?.limit || 10
        
        console.log('Updated products count:', this.products.length)
        
        // 缓存数据（使用与后端一致的缓存键格式）
        if (!params.category && !params.status) {
          cache.set(cacheKey, apiData)
        }
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取卖家自己的商品列表
    async getSellerProducts(params = {}) {
    // 检查请求间隔
    if (!this.checkRequestInterval()) {
      console.log('请求过于频繁，请稍后再试')
      return null
    }
    
    this.loading = true
    this.error = null
    
    try {
      console.log('Calling getSellerProducts with params:', params)
      const response = await apiClient.product.getSellerProducts({
        page: params.page || this.page,
        limit: params.limit || this.limit,
        category: params.category || '',
        status: params.status || ''
      })
      
      console.log('getSellerProducts response:', response)
      
      // The API interceptor returns { success: true, data: {...} }
      // The actual product data is inside response.data
      const apiData = response?.data || {} // This is the inner data object { products: [...], total: 10, ... }
      this.products = apiData?.products || []
      this.total = apiData?.total || 0
      this.page = apiData?.page || 1
      this.limit = apiData?.limit || 10
      
      console.log('Updated products:', this.products.map(p => ({ id: p.id, name: p.name, status: p.status })))
      return response
    } catch (error) {
      console.error('getSellerProducts error:', error)
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  },
    
    // 获取商品详情
    async getProductDetail(id) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      // 检查缓存
      if (cache.isCached('productDetails', id)) {
        const cachedData = cache.get('productDetails', id)
        this.productDetail = cachedData
        return { data: cachedData }
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.product.getDetail(id)
        this.productDetail = response.data
        
        // 缓存数据
        cache.set('productDetails', response.data, id)
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取热门商品
    async getHotProducts(limit = 10, forceRefresh = false) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      // 检查缓存（如果不是强制刷新，使用与后端一致的缓存键格式）
      const cacheKey = `product:hot:${limit}`
      if (!forceRefresh && cache.isCached(cacheKey)) {
        const cachedData = cache.get(cacheKey)
        console.log('[热门商品] 使用缓存数据，数量:', cachedData?.length || 0)
        this.hotProducts = cachedData
        return { data: cachedData }
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('[热门商品] 从API获取数据...')
        const response = await apiClient.product.getHot({ limit })
        console.log('[热门商品] API响应:', response)
        if (response.success && response.data) {
          this.hotProducts = response.data
          // 缓存数据（使用与后端一致的缓存键格式）
          cache.set(cacheKey, response.data)
          console.log('[热门商品] 数据获取成功，数量:', response.data.length)
        } else {
          this.hotProducts = []
          console.warn('[热门商品] API返回数据为空或格式错误')
        }
        
        return response
      } catch (error) {
        console.error('[热门商品] 获取失败:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 创建商品
    async createProduct(productData) {
    // 检查请求间隔
    if (!this.checkRequestInterval()) {
      console.log('请求过于频繁，请稍后再试')
      return null
    }
    
    this.loading = true
    this.error = null
    
    try {
      console.log('Creating product with data:', productData)
      const response = await apiClient.product.create(productData)
      console.log('Create product response:', response)
      // 清除缓存 - 使用按前缀清除的方式，确保清除所有相关缓存
      cache.clearByPrefix('products_')
      cache.clearByPrefix('hotProducts_')
      // 重新获取卖家商品列表，确保能看到所有状态的商品
      await this.getSellerProducts()
      return response
    } catch (error) {
      console.error('Create product error:', error)
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  },
    
    // 更新商品
    async updateProduct(id, productData) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.product.update(id, productData)
        // 更新本地商品列表和详情
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail = response.data
        }
        // 清除缓存 - 使用按前缀清除的方式，确保清除所有相关缓存
        cache.clearByPrefix('products_')
        cache.clearByPrefix('hotProducts_')
        cache.clear('productDetails', id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除商品
    async deleteProduct(id) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log(`[商品删除] 开始删除商品，ID: ${id}`)
        const response = await apiClient.product.delete(id)
        console.log(`[商品删除] API响应成功:`, response)
        
        // 从本地商品列表中移除
        const initialLength = this.products.length
        this.products = this.products.filter(p => p.id !== id)
        console.log(`[商品删除] 本地列表已更新，移除前: ${initialLength} 条，移除后: ${this.products.length} 条`)
        
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail = null
          console.log(`[商品删除] 商品详情已清空`)
        }
        
        // 清除缓存 - 使用按前缀清除的方式，确保清除所有相关缓存（与后端保持一致）
        cache.clearByPrefix('product:list:')
        cache.clearByPrefix('product:hot:')
        cache.clearByPrefix('productDetails_')
        cache.clear('productDetails', id)
        console.log(`[商品删除] 相关缓存已清除`)
        
        return response
      } catch (error) {
        console.error(`[商品删除] 删除失败，ID: ${id}，错误:`, error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 审核商品
    async approveProduct(id, approveData) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.product.approve(id, approveData)
        // 更新本地商品状态和拒绝详情
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index].status = approveData.status
          if (approveData.status === 'rejected') {
            this.products[index].rejectReason = approveData.rejectReason
            this.products[index].rejectType = approveData.rejectType
            this.products[index].rejectRule = approveData.rejectRule
            this.products[index].rejectedAt = new Date()
          } else {
            this.products[index].rejectReason = null
            this.products[index].rejectType = null
            this.products[index].rejectRule = null
            this.products[index].rejectedAt = null
          }
        }
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail.status = approveData.status
          if (approveData.status === 'rejected') {
            this.productDetail.rejectReason = approveData.rejectReason
            this.productDetail.rejectType = approveData.rejectType
            this.productDetail.rejectRule = approveData.rejectRule
            this.productDetail.rejectedAt = new Date()
          } else {
            this.productDetail.rejectReason = null
            this.productDetail.rejectType = null
            this.productDetail.rejectRule = null
            this.productDetail.rejectedAt = null
          }
        }
        // 清除缓存 - 使用按前缀清除的方式，确保清除所有相关缓存
        cache.clearByPrefix('products_')
        cache.clearByPrefix('hotProducts_')
        cache.clear('productDetails', id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 设置热门商品
    async setHotProduct(id, isHot) {
      // 检查请求间隔
      if (!this.checkRequestInterval()) {
        console.log('请求过于频繁，请稍后再试')
        return null
      }

      this.loading = true
      this.error = null

      try {
        const response = await apiClient.product.setHot(id, isHot)
        // 更新本地商品的isHot状态
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index].isHot = isHot
        }
        if (this.productDetail && this.productDetail.id === id) {
          this.productDetail.isHot = isHot
        }
        // 清除缓存 - 使用按前缀清除的方式，确保清除所有相关缓存
        cache.clearByPrefix('products_')
        cache.clearByPrefix('hotProducts_')
        cache.clear('productDetails', id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 上传图片
    async uploadImage(formData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.upload(formData)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 重置商品详情
    resetProductDetail() {
      this.productDetail = null
    },
    
    // 重置错误
    resetError() {
      this.error = null
    }
  }
})