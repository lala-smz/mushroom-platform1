import { defineStore } from 'pinia'
import api from '../api/index.js'
import eventBus, { EventTypes } from '../utils/eventBus.js'

export const useMushroomBoxStore = defineStore('mushroomBox', {
  state: () => ({
    boxes: [],
    currentBox: null,
    orders: [],
    currentOrder: null,
    drawHistory: [],
    loading: false,
    error: null,
    lastSyncTime: null,
    // 请求状态管理
    requestStatus: {
      fetchingBoxes: false,
      fetchingUserOrders: false,
      fetchingDrawHistory: false,
      fetchingBoxById: false
    },
    // 本地缓存
    cache: {
      boxes: null,
      orders: null,
      drawHistory: null,
      cacheTimes: {
        boxes: 0,
        orders: 0,
        drawHistory: 0
      }
    },
    // 防抖计时器
    debounceTimers: {
      syncData: null
    }
  }),

  getters: {
    activeBoxes: (state) => state.boxes.filter(box => box.status === 'active'),
    userOrders: (state) => state.orders,
    hasActiveBoxes: (state) => state.boxes.some(box => box.status === 'active'),
    totalDraws: (state) => state.drawHistory.length
  },

  actions: {
    // 防抖函数
    debounce(func, wait, key) {
      if (this.debounceTimers[key]) {
        clearTimeout(this.debounceTimers[key])
      }
      return new Promise((resolve) => {
        this.debounceTimers[key] = setTimeout(async () => {
          const result = await func()
          resolve(result)
        }, wait)
      })
    },

    // 获取所有盲盒列表
    async fetchBoxes(force = false) {
      // 避免重复请求
      if (this.requestStatus.fetchingBoxes) {
        return
      }

      // 检查本地缓存（如果强制刷新，则忽略缓存）
      const now = Date.now()
      if (!force && this.cache.boxes && (now - this.cache.cacheTimes.boxes) < 300000) { // 缓存5分钟
        this.boxes = this.cache.boxes
        return
      }

      this.requestStatus.fetchingBoxes = true
      this.loading = true
      this.error = null
      try {
        // 不传递分页参数，获取所有盲盒
        const response = await api.get('/boxes')
        // 处理返回的数据，确保每个盲盒都有 items 字段
        if (response && response.data) {
          const boxesData = Array.isArray(response.data) ? response.data : (response.data.data || [])
          this.boxes = boxesData.map(box => {
            // 处理 items 数组，确保每个项都有完整的结构
            if (box.items && Array.isArray(box.items)) {
              box.items = box.items.map(item => {
                // 为图片URL添加时间戳来强制刷新缓存
                let imageUrl = item.image || item.mushroom?.image || '';
                if (imageUrl && !imageUrl.includes('placeholder')) {
                  const separator = imageUrl.includes('?') ? '&' : '?';
                  imageUrl = `${imageUrl}${separator}t=${Date.now()}`;
                }
                
                return {
                  ...item,
                  id: item.id || Math.random().toString(36).substr(2, 9),
                  mushroomId: item.mushroomId,
                  quantity: item.quantity || 1,
                  minQuantity: item.minQuantity || 1,
                  maxQuantity: item.maxQuantity || 1,
                  probability: item.probability || 0,
                  mushroomName: item.mushroomName || item.mushroom?.name || '菌菇',
                  mushroomType: item.mushroomType || item.mushroom?.type || 'common',
                  image: imageUrl,
                  mushroom: item.mushroom || {
                    id: item.mushroomId,
                    name: item.mushroomName || '菌菇',
                    scientificName: '',
                    description: '',
                    image: imageUrl,
                    type: item.mushroomType || 'common'
                  }
                };
              });
            } else {
              // 如果没有 items 字段，添加一个空数组
              box.items = []
            }
            return box
          })
          // 更新缓存
          this.cache.boxes = this.boxes
          this.cache.cacheTimes.boxes = now
          this.lastSyncTime = new Date().toISOString()
          // 触发数据同步事件
          eventBus.emit(EventTypes.BOXES_DATA_UPDATED, this.boxes)
        } else {
          this.boxes = []
          console.warn('API返回格式错误，未获取到盲盒数据')
        }
      } catch (err) {
        this.error = err.message
        this.boxes = []
        console.error('获取盲盒列表失败:', err)
      } finally {
        this.requestStatus.fetchingBoxes = false
        this.loading = false
      }
    },

    // 获取盲盒详情
    async fetchBoxById(id, force = false) {
      // 避免重复请求
      if (this.requestStatus.fetchingBoxById) {
        return
      }

      this.requestStatus.fetchingBoxById = true
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/boxes/${id}`)
        if (response && response.data) {
          let boxData = response.data.data || response.data
          
          // 确保返回的数据结构完整
          boxData = {
            ...boxData,
            id: boxData.id,
            name: boxData.name || '盲盒',
            description: boxData.description || '',
            price: boxData.price || 0,
            season: boxData.season || '时令',
            image: boxData.image || '',
            status: boxData.status || 'inactive',
            stock: boxData.stock || 999,
            viewCount: boxData.viewCount || 0,
            createdAt: boxData.createdAt || new Date().toISOString(),
            items: boxData.items || [],
            cultivationService: boxData.cultivationService || false,
            cultivationPrice: boxData.cultivationPrice || 0,
            cultivationDuration: boxData.cultivationDuration || 0,
            cultivationInclusions: boxData.cultivationInclusions || '',
            cultivationDescription: boxData.cultivationDescription || ''
          }
          
          // 确保 items 数组中的每个项都有完整的结构
          if (Array.isArray(boxData.items)) {
            boxData.items = boxData.items.map(item => {
              // 为图片URL添加时间戳来强制刷新缓存
              let imageUrl = item.image || item.mushroom?.image || '';
              if (imageUrl && !imageUrl.includes('placeholder')) {
                const separator = imageUrl.includes('?') ? '&' : '?';
                imageUrl = `${imageUrl}${separator}t=${Date.now()}`;
              }
              
              return {
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9),
                mushroomId: item.mushroomId,
                quantity: item.quantity || 1,
                minQuantity: item.minQuantity || 1,
                maxQuantity: item.maxQuantity || 1,
                probability: item.probability || 0,
                mushroomName: item.mushroomName || item.mushroom?.name || '菌菇',
                mushroomType: item.mushroomType || item.mushroom?.type || 'common',
                image: imageUrl,
                mushroom: item.mushroom || {
                  id: item.mushroomId,
                  name: item.mushroomName || '菌菇',
                  scientificName: '',
                  description: '',
                  image: imageUrl,
                  type: item.mushroomType || 'common'
                }
              };
            })
          }
          
          this.currentBox = boxData
          return boxData
        } else {
          this.currentBox = null
          this.error = '未获取到盲盒详情数据'
          return null
        }
      } catch (err) {
        this.error = err.message
        this.currentBox = null
        console.error('获取盲盒详情失败:', err)
        return null
      } finally {
        this.requestStatus.fetchingBoxById = false
        this.loading = false
      }
    },

    // 创建盲盒订单
    async createBoxOrder(boxId, orderData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/boxes/orders', {
          boxId,
          ...orderData
        })
        this.orders.unshift(response.data.data)
        // 清除订单缓存
        this.cache.orders = null
        this.cache.cacheTimes.orders = 0
        return response.data.data
      } catch (err) {
        this.error = err.message
        console.error('创建盲盒订单失败:', err)
      } finally {
        this.loading = false
      }
    },

    // 获取用户的盲盒订单
    async fetchUserOrders(force = false) {
      // 避免重复请求
      if (this.requestStatus.fetchingUserOrders) {
        return
      }

      // 检查本地缓存
      const now = Date.now()
      if (!force && this.cache.orders && (now - this.cache.cacheTimes.orders) < 300000) { // 缓存5分钟
        this.orders = this.cache.orders
        return
      }

      this.requestStatus.fetchingUserOrders = true
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/boxes/orders/user')
        this.orders = response.data.data
        // 更新缓存
        this.cache.orders = this.orders
        this.cache.cacheTimes.orders = now
      } catch (err) {
        this.error = err.message
        console.error('获取用户盲盒订单失败:', err)
      } finally {
        this.requestStatus.fetchingUserOrders = false
        this.loading = false
      }
    },

    // 获取盲盒订单详情
    async fetchOrderById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/boxes/orders/${id}`)
        this.currentOrder = response.data.data
        return response.data.data
      } catch (err) {
        this.error = err.message
        console.error('获取盲盒订单详情失败:', err)
      } finally {
        this.loading = false
      }
    },

    // 获取抽取历史
    async fetchDrawHistory(force = false) {
      // 避免重复请求
      if (this.requestStatus.fetchingDrawHistory) {
        return
      }

      // 检查本地缓存
      const now = Date.now()
      if (!force && this.cache.drawHistory && (now - this.cache.cacheTimes.drawHistory) < 300000) { // 缓存5分钟
        this.drawHistory = this.cache.drawHistory
        return
      }

      this.requestStatus.fetchingDrawHistory = true
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/boxes/draw/history')
        if (response && (response.data?.data || Array.isArray(response.data))) {
          this.drawHistory = response.data?.data || response.data
          // 更新缓存
          this.cache.drawHistory = this.drawHistory
          this.cache.cacheTimes.drawHistory = now
        }
      } catch (err) {
        this.error = err.message
        console.error('获取抽取历史失败:', err)
        this.drawHistory = []
      } finally {
        this.requestStatus.fetchingDrawHistory = false
        this.loading = false
      }
    },

    // 保存抽取结果
    async saveDrawResult(boxId, mushroom) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/boxes/draw/save', {
          boxId
        })
        if (response) {
          // 添加到抽取历史
          const newDraw = {
            id: Date.now(),
            boxId,
            mushroom,
            createdAt: new Date().toISOString(),
            status: 'completed'
          }
          this.drawHistory.unshift(newDraw)
          // 清除抽取历史缓存
          this.cache.drawHistory = null
          this.cache.cacheTimes.drawHistory = 0
          // 触发抽取完成事件
          eventBus.emit(EventTypes.BOX_DRAW_COMPLETED, newDraw)
          return response
        }
      } catch (err) {
        this.error = err.message
        console.error('保存抽取结果失败:', err)
      } finally {
        this.loading = false
      }
    },

    // 强制数据同步
    async syncData(force = false) {
      // 如果是强制刷新，直接执行，不使用防抖
      if (force) {
        try {
          await this.fetchBoxes(true)
          await this.fetchUserOrders(true)
          await this.fetchDrawHistory(true)
          
          this.lastSyncTime = new Date().toISOString()
          eventBus.emit(EventTypes.DATA_SYNC_COMPLETED, {
            timestamp: this.lastSyncTime,
            boxes: this.boxes,
            orders: this.orders,
            drawHistory: this.drawHistory
          })
          return Promise.resolve()
        } catch (err) {
          console.error('数据同步失败:', err)
          this.error = '数据同步失败'
          return Promise.reject(err)
        }
      }
      
      // 使用防抖，避免短时间内重复调用
      return this.debounce(async () => {
        try {
          await this.fetchBoxes(false)
          await this.fetchUserOrders(false)
          await this.fetchDrawHistory(false)
          
          this.lastSyncTime = new Date().toISOString()
          eventBus.emit(EventTypes.DATA_SYNC_COMPLETED, {
            timestamp: this.lastSyncTime,
            boxes: this.boxes,
            orders: this.orders,
            drawHistory: this.drawHistory
          })
        } catch (err) {
          console.error('数据同步失败:', err)
          this.error = '数据同步失败'
        }
      }, 1000, 'syncData')
    },

    // 定期同步数据
    setupPeriodicSync(interval = 300000) { // 默认5分钟同步一次
      setInterval(() => {
        this.syncData()
      }, interval)
    }
  }
})
