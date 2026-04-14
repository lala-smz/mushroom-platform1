import { defineStore } from 'pinia'
import api from '../api/index.js'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categoryTree: [],
    loading: false,
    error: null,
    treeVersion: 0
  }),

  getters: {
    hasCategories: (state) => state.categoryTree.length > 0,
    isLoading: (state) => state.loading
  },

  actions: {
    async loadCategoryTree() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/products/categories/tree')
        if (response.success && response.data) {
          this.categoryTree = JSON.parse(JSON.stringify(response.data))
          this.treeVersion++
        } else {
          this.categoryTree = []
        }
        return this.categoryTree
      } catch (error) {
        console.error('获取分类树失败:', error)
        this.error = error.message || '获取分类树失败'
        return []
      } finally {
        this.loading = false
      }
    },

    async createLevel1Category(data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/products/categories/level1', data)
        if (response.success && response.data) {
          const newCategory = response.data
          this.categoryTree.push({ ...newCategory })
          this.treeVersion++
          return newCategory
        } else {
          this.error = '创建一级分类失败：响应格式错误'
          return null
        }
      } catch (error) {
        console.error('创建一级分类失败:', error)
        this.error = error.message || '创建一级分类失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLevel2Category(parentKey, data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(`/products/categories/level2/${parentKey}`, data)
        if (response.success && response.data) {
          const newCategory = response.data
          const parentIndex = this.categoryTree.findIndex(
            cat => String(cat.key) === String(parentKey) || String(cat.id) === String(parentKey)
          )
          if (parentIndex !== -1) {
            if (!this.categoryTree[parentIndex].children) {
              this.categoryTree[parentIndex].children = []
            }
            this.categoryTree[parentIndex].children.push({ ...newCategory })
            this.categoryTree = [...this.categoryTree]
            this.treeVersion++
          }
          return newCategory
        } else {
          this.error = '创建二级分类失败：响应格式错误'
          return null
        }
      } catch (error) {
        console.error('创建二级分类失败:', error)
        this.error = error.message || '创建二级分类失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLevel3Category(parentKey, data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(`/products/categories/level3/${parentKey}`, data)
        if (response.success && response.data) {
          const newCategory = response.data
          for (let i = 0; i < this.categoryTree.length; i++) {
            const level1 = this.categoryTree[i]
            if (level1.children) {
              const parentIndex = level1.children.findIndex(
                cat => String(cat.key) === String(parentKey) || String(cat.id) === String(parentKey)
              )
              if (parentIndex !== -1) {
                if (!level1.children[parentIndex].children) {
                  level1.children[parentIndex].children = []
                }
                level1.children[parentIndex].children.push({ ...newCategory })
                this.categoryTree = [...this.categoryTree]
                this.treeVersion++
                break
              }
            }
          }
          return newCategory
        } else {
          this.error = '创建三级分类失败：响应格式错误'
          return null
        }
      } catch (error) {
        console.error('创建三级分类失败:', error)
        this.error = error.message || '创建三级分类失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCategory(level, key, data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/products/categories/level${level}/${key}`, data)
        if (response.success && response.data) {
          const updatedCategory = response.data
          this.updateCategoryInTree(updatedCategory)
          return updatedCategory
        } else {
          this.error = '更新分类失败：响应格式错误'
          return null
        }
      } catch (error) {
        console.error('更新分类失败:', error)
        this.error = error.message || '更新分类失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    updateCategoryInTree(updatedCategory) {
      if (updatedCategory.level === 1) {
        const index = this.categoryTree.findIndex(
          cat => cat.id === updatedCategory.id || cat.key === updatedCategory.key
        )
        if (index !== -1) {
          this.categoryTree[index] = { ...this.categoryTree[index], ...updatedCategory }
          this.categoryTree = [...this.categoryTree]
          this.treeVersion++
        }
      } else if (updatedCategory.level === 2) {
        for (let i = 0; i < this.categoryTree.length; i++) {
          const level1 = this.categoryTree[i]
          if (level1.children) {
            const index = level1.children.findIndex(
              cat => cat.id === updatedCategory.id || cat.key === updatedCategory.key
            )
            if (index !== -1) {
              level1.children[index] = { ...level1.children[index], ...updatedCategory }
              this.categoryTree = [...this.categoryTree]
              this.treeVersion++
              break
            }
          }
        }
      } else if (updatedCategory.level === 3) {
        for (let i = 0; i < this.categoryTree.length; i++) {
          const level1 = this.categoryTree[i]
          if (level1.children) {
            for (let j = 0; j < level1.children.length; j++) {
              const level2 = level1.children[j]
              if (level2.children) {
                const index = level2.children.findIndex(
                  cat => cat.id === updatedCategory.id || cat.key === updatedCategory.key
                )
                if (index !== -1) {
                  level2.children[index] = { ...level2.children[index], ...updatedCategory }
                  this.categoryTree = [...this.categoryTree]
                  this.treeVersion++
                  return
                }
              }
            }
          }
        }
      }
    },

    async deleteCategory(level, id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`/products/categories/level${level}/${id}`)
        if (response.success) {
          this.removeCategoryFromTree(level, id)
          return true
        } else {
          this.error = response.error || '删除分类失败'
          
          if (response.data && response.data.includes('不存在')) {
            this.removeCategoryFromTree(level, id)
          }
          
          return false
        }
      } catch (error) {
        console.error('删除分类失败:', error)
        this.error = error.message || '删除分类失败'
        
        if (error.response && error.response.status === 404) {
          this.removeCategoryFromTree(level, id)
        }
        
        return false
      } finally {
        this.loading = false
      }
    },

    removeCategoryFromTree(level, id) {
      if (level === 1) {
        this.categoryTree = this.categoryTree.filter(cat => cat.id !== id)
        this.treeVersion++
      } else if (level === 2) {
        for (let i = 0; i < this.categoryTree.length; i++) {
          if (this.categoryTree[i].children) {
            this.categoryTree[i].children = this.categoryTree[i].children.filter(cat => cat.id !== id)
          }
        }
        this.categoryTree = [...this.categoryTree]
        this.treeVersion++
      } else if (level === 3) {
        for (let i = 0; i < this.categoryTree.length; i++) {
          const level1 = this.categoryTree[i]
          if (level1.children) {
            for (let j = 0; j < level1.children.length; j++) {
              const level2 = level1.children[j]
              if (level2.children) {
                level2.children = level2.children.filter(cat => cat.id !== id)
              }
            }
          }
        }
        this.categoryTree = [...this.categoryTree]
        this.treeVersion++
      }
    },

    clearError() {
      this.error = null
    }
  }
})