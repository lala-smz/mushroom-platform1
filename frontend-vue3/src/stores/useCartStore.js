import { defineStore } from 'pinia'
import { apiClient } from '../api'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    loading: false,
    error: null
  }),
  
  getters: {
    // 购物车商品总数
    totalItems: (state) => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0)
    },
    
    // 购物车总价
    totalPrice: (state) => {
      return state.cartItems.reduce((total, item) => {
        if (item.selected && item.product) {
          const price = Number(item.product.price || 0)
          return total + item.quantity * price
        }
        return total
      }, 0)
    },
    
    // 选中的商品
    selectedItems: (state) => {
      return state.cartItems.filter(item => item.selected)
    },
    
    // 是否全选
    isAllSelected: (state) => {
      return state.cartItems.length > 0 && state.cartItems.every(item => item.selected)
    }
  },
  
  actions: {
    // 获取购物车列表
    async getCart() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.getList()
        this.cartItems = response.data
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 添加商品到购物车
    async addToCart(productId, quantity = 1, type = 'product') {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.add({ productId, quantity, type })
        
        // 重新获取整个购物车，确保数据一致性
        await this.getCart()
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新购物车商品数量
    async updateCartItem(id, quantity) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.update(id, { quantity })
        // 更新本地购物车数据
        const index = this.cartItems.findIndex(item => item.id === id)
        if (index !== -1) {
          this.cartItems[index].quantity = quantity
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除购物车商品
    async deleteCartItem(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.delete(id)
        // 从本地购物车中移除
        this.cartItems = this.cartItems.filter(item => item.id !== id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 清空购物车
    async clearCart() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.clear()
        // 清空本地购物车
        this.cartItems = []
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新购物车商品选中状态
    async updateCartItemStatus(id, selected) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.cart.updateStatus(id, { selected })
        // 更新本地购物车数据
        const index = this.cartItems.findIndex(item => item.id === id)
        if (index !== -1) {
          this.cartItems[index].selected = selected
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 全选/取消全选
    async toggleAllSelected(selected) {
      this.loading = true
      this.error = null
      
      try {
        // 并行更新所有商品状态
        const promises = this.cartItems.map(item => {
          if (item.selected !== selected) {
            return this.updateCartItemStatus(item.id, selected)
          }
          return Promise.resolve()
        })
        
        await Promise.all(promises)
        return { success: true }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 批量删除选中商品
    async deleteSelectedItems() {
      this.loading = true
      this.error = null
      
      try {
        const selectedIds = this.cartItems.filter(item => item.selected).map(item => item.id)
        if (selectedIds.length === 0) {
          throw new Error('请选择要删除的商品')
        }
        
        // 并行删除所有选中商品
        const promises = selectedIds.map(id => this.deleteCartItem(id))
        await Promise.all(promises)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 重置错误
    resetError() {
      this.error = null
    }
  }
})