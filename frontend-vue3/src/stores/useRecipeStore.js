import { defineStore } from 'pinia'
import api from '../api/index.js'
import { validateFilterParams } from '../utils/recipeOptions'

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    recommendedRecipes: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 12,
    searchQuery: '',
    userPreferences: null
  }),

  getters: {
    activeRecipes: (state) => state.recipes.filter(recipe => recipe.status === 'active'),
    hasRecipes: (state) => state.recipes.length > 0,
    isLoading: (state) => state.loading
  },

  actions: {
    // 获取食谱列表（主要方法）
    async fetchRecipes(params = {}) {
      this.loading = true
      this.error = null
      try {
        const validatedParams = validateFilterParams(params)
        const response = await api.get('/recipes', {
          params: {
            page: validatedParams.page || this.page,
            limit: validatedParams.limit || this.pageSize,
            ...validatedParams
          }
        })
        
        if (response.success && response.data) {
          this.recipes = response.data.recipes || []
          this.total = response.data.total || 0
        } else {
          this.recipes = []
          this.total = 0
        }
        
        this.page = validatedParams.page || this.page
        this.pageSize = validatedParams.limit || this.pageSize
        this.searchQuery = validatedParams.search || ''
        return this.recipes
      } catch (error) {
        console.error('获取食谱失败:', error)
        this.error = error.message || '获取食谱失败'
        return []
      } finally {
        this.loading = false
      }
    },

    // 加载食谱列表（别名，保持向后兼容）
    async loadRecipes(params = {}) {
      return this.fetchRecipes(params)
    },

    // 获取食谱详情
    async getRecipeDetail(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/recipes/${id}`)
        this.currentRecipe = (response.success && response.data) ? response.data : response
        return this.currentRecipe
      } catch (error) {
        console.error('获取食谱详情失败:', error)
        this.error = error.message || '获取食谱详情失败'
        return null
      } finally {
        this.loading = false
      }
    },

    // 获取食谱详情（别名）
    async fetchRecipeById(id) {
      return this.getRecipeDetail(id)
    },

    // 创建食谱
    async createRecipe(recipeData) {
      this.loading = true
      this.error = null
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (!userInfoStr) {
          this.error = '用户未登录'
          return null
        }
        
        let userInfo
        try {
          userInfo = JSON.parse(userInfoStr)
        } catch (parseError) {
          this.error = '用户信息格式错误'
          return null
        }
        
        if (!userInfo || userInfo.role !== 'admin') {
          this.error = '需要管理员权限才能创建食谱'
          return null
        }
        
        const response = await api.post('/recipes', recipeData)
        if (response.success && response.data) {
          const newRecipe = response.data
          this.recipes.unshift(newRecipe)
          this.total++
          return newRecipe
        } else {
          this.error = '创建食谱失败：响应格式错误'
          return null
        }
      } catch (error) {
        console.error('创建食谱失败:', error)
        this.error = error.message || '创建食谱失败'
        console.error('详细错误信息:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    // 更新食谱
    async updateRecipe(id, recipeData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/recipes/${id}`, recipeData)
        const updatedRecipe = response.data || null
        if (updatedRecipe) {
          const index = this.recipes.findIndex(recipe => recipe.id === id)
          if (index !== -1) {
            if (updatedRecipe.id) {
              this.recipes[index] = updatedRecipe
            } else {
              this.recipes[index] = { ...this.recipes[index], ...recipeData }
            }
          }
          if (this.currentRecipe && this.currentRecipe.id === id) {
            this.currentRecipe = updatedRecipe
          }
        }
        return updatedRecipe
      } catch (error) {
        console.error('更新食谱失败:', error)
        this.error = error.message || '更新食谱失败'
        return null
      } finally {
        this.loading = false
      }
    },

    // 删除食谱
    async deleteRecipe(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/recipes/${id}`)
        const index = this.recipes.findIndex(recipe => recipe.id === id)
        if (index !== -1) {
          this.recipes.splice(index, 1)
          this.total--
        }
        if (this.currentRecipe && this.currentRecipe.id === id) {
          this.currentRecipe = null
        }
        return true
      } catch (error) {
        console.error('删除食谱失败:', error)
        this.error = error.message || '删除食谱失败'
        return false
      } finally {
        this.loading = false
      }
    },

    // 批量删除食谱
    async batchDeleteRecipes(ids) {
      this.loading = true
      this.error = null
      console.log('Store: 开始批量删除，ID:', ids)
      try {
        const response = await api.post('/recipes/batch/delete', { ids })
        console.log('Store: 批量删除响应:', response)
        if (response.success) {
          this.recipes = this.recipes.filter(recipe => !ids.includes(recipe.id))
          this.total -= response.data?.deletedCount || ids.length
          return true
        }
        return false
      } catch (error) {
        console.error('Store: 批量删除食谱失败:', error)
        this.error = error.message || '批量删除食谱失败'
        return false
      } finally {
        this.loading = false
      }
    },

    // 批量更新食谱状态
    async batchUpdateRecipeStatus(ids, status) {
      this.loading = true
      this.error = null
      console.log('Store: 开始批量更新状态，ID:', ids, '状态:', status)
      try {
        const response = await api.put('/recipes/batch/status', { ids, status })
        console.log('Store: 批量更新响应:', response)
        if (response.success) {
          this.recipes = this.recipes.map(recipe => {
            if (ids.includes(recipe.id)) {
              return { ...recipe, status }
            }
            return recipe
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Store: 批量更新食谱状态失败:', error)
        this.error = error.message || '批量更新食谱状态失败'
        return false
      } finally {
        this.loading = false
      }
    },

    // 获取推荐食谱
    async fetchRecommendedRecipes(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/recipes/recommended', {
          params
        })
        this.recommendedRecipes = response.data?.data || response.data || []
        return this.recommendedRecipes
      } catch (error) {
        console.error('获取推荐食谱失败:', error)
        this.error = error.message || '获取推荐食谱失败'
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取推荐食谱（别名）
    async getRecommendedRecipes(params = {}) {
      return this.fetchRecommendedRecipes(params)
    },

    // 获取用户偏好设置
    async fetchUserPreferences() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/user/preferences')
        if (response.success && response.data) {
          this.userPreferences = response.data
        }
        return this.userPreferences
      } catch (error) {
        console.error('获取用户偏好失败:', error)
        this.error = error.message || '获取用户偏好失败'
        return null
      } finally {
        this.loading = false
      }
    },

    // 更新用户偏好设置
    async updateUserPreferences(preferences) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put('/user/preferences', preferences)
        if (response.success && response.data) {
          this.userPreferences = response.data
        }
        return this.userPreferences
      } catch (error) {
        console.error('更新用户偏好失败:', error)
        this.error = error.message || '更新用户偏好失败'
        return null
      } finally {
        this.loading = false
      }
    },

    // 重置状态
    resetState() {
      this.recipes = []
      this.currentRecipe = null
      this.recommendedRecipes = []
      this.loading = false
      this.error = null
      this.total = 0
      this.page = 1
      this.pageSize = 12
      this.searchQuery = ''
      this.userPreferences = null
    },

    // 设置搜索参数
    setSearchQuery(query) {
      this.searchQuery = query
    },

    // 设置分页参数
    setPagination(page, pageSize) {
      this.page = page
      this.pageSize = pageSize
    },

    // 根据菌菇ID获取食谱
    async fetchRecipesByMushroomId(mushroomId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/recipes', {
          params: {
            mushroomId,
            ...params
          }
        })
        if (response.success && response.data) {
          return response.data.recipes || []
        }
        return []
      } catch (error) {
        console.error('根据菌菇ID获取食谱失败:', error)
        this.error = error.message || '获取食谱失败'
        return []
      } finally {
        this.loading = false
      }
    },

    // 根据盲盒ID获取推荐食谱
    async fetchRecipesByBoxId(boxId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/recipes/box/${boxId}`, {
          params
        })
        let recipes = []
        if (response.success && response.data) {
          recipes = response.data.recipes || []
        } else if (Array.isArray(response)) {
          recipes = response
        } else if (response.data && Array.isArray(response.data)) {
          recipes = response.data
        }
        
        // 统一数据格式，确保字段映射正确
        return recipes.map(recipe => ({
          ...recipe,
          cuisine: recipe.cuisine || recipe.cuisineType,
          // 确保ingredients是数组
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : (recipe.ingredients ? [recipe.ingredients] : [])
        }))
      } catch (error) {
        console.error('根据盲盒ID获取食谱失败:', error)
        this.error = error.message || '获取食谱失败'
        return []
      } finally {
        this.loading = false
      }
    }
  }
})