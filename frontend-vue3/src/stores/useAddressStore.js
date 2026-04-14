import { defineStore } from 'pinia'
import { apiClient } from '../api'

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [],
    loading: false,
    error: null
  }),
  
  getters: {
    // 获取默认地址
    defaultAddress: (state) => {
      return state.addresses.find(address => address.isDefault) || state.addresses[0] || null
    },
    
    // 是否有地址
    hasAddresses: (state) => {
      return state.addresses.length > 0
    }
  },
  
  actions: {
    // 获取地址列表
    async getAddressList() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.address.getList()
        this.addresses = response.data
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 添加地址
    async addAddress(addressData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.address.add(addressData)
        this.addresses.push(response.data)
        // 如果是默认地址，更新其他地址的默认状态
        if (addressData.isDefault) {
          this.addresses.forEach(addr => {
            if (addr.id !== response.data.id) {
              addr.isDefault = false
            }
          })
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新地址
    async updateAddress(id, addressData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.address.update(id, addressData)
        const index = this.addresses.findIndex(addr => addr.id === id)
        if (index !== -1) {
          this.addresses[index] = response.data
          // 如果是默认地址，更新其他地址的默认状态
          if (response.data.isDefault) {
            this.addresses.forEach((addr, i) => {
              if (i !== index) {
                addr.isDefault = false
              }
            })
          }
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除地址
    async deleteAddress(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.address.delete(id)
        this.addresses = this.addresses.filter(addr => addr.id !== id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 设置默认地址
    async setDefaultAddress(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.address.setDefault(id)
        // 更新所有地址的默认状态
        this.addresses.forEach(addr => {
          addr.isDefault = addr.id === id
        })
        return response
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