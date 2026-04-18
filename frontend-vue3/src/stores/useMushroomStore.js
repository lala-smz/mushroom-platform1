import { defineStore } from 'pinia'
import api from '../api/index.js'

export const useMushroomStore = defineStore('mushroom', {
  state: () => ({
    mushrooms: [],
    currentMushroom: null,
    seasons: [
      { value: 'spring', label: '春季' },
      { value: 'summer', label: '夏季' },
      { value: 'autumn', label: '秋季' },
      { value: 'winter', label: '冬季' }
    ],
    loading: false,
    error: null
  }),

  getters: {
    mushroomsBySeason: (state) => (season) => {
      if (!season) return state.mushrooms
      return state.mushrooms.filter(mushroom => mushroom.seasons.includes(season))
    },
    getMushroomById: (state) => (id) => {
      return state.mushrooms.find(mushroom => mushroom.id === id) || state.currentMushroom
    }
  },

  actions: {
    // 获取所有蘑菇数据
    async fetchMushrooms() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/mushrooms')
        this.mushrooms = response.data?.data || response.data || []
      } catch (err) {
        this.error = err.message
        console.error('获取蘑菇数据失败:', err)
        // 不使用模拟数据，避免始终显示"香菇"
        this.mushrooms = []
      } finally {
        this.loading = false
      }
    },

    // 获取蘑菇详情
    async fetchMushroomById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/mushrooms/${id}`)
        this.currentMushroom = response.data?.data || response.data || null
        return this.currentMushroom
      } catch (err) {
        this.error = err.message
        console.error('获取蘑菇详情失败:', err)
        // 不使用模拟数据，避免始终显示"香菇"
        this.currentMushroom = null
        return null
      } finally {
        this.loading = false
      }
    },

    // 创建蘑菇数据
    async createMushroom(mushroomData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/mushrooms', mushroomData)
        this.mushrooms.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.message
        console.error('创建蘑菇数据失败:', err)
        // 模拟创建
        const newMushroom = {
          id: Date.now(),
          ...mushroomData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.mushrooms.push(newMushroom)
        return newMushroom
      } finally {
        this.loading = false
      }
    },

    // 更新蘑菇数据
    async updateMushroom(id, mushroomData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(`/api/mushrooms/${id}`, mushroomData)
        const index = this.mushrooms.findIndex(m => m.id === id)
        if (index !== -1) {
          this.mushrooms[index] = response.data
        }
        if (this.currentMushroom && this.currentMushroom.id === id) {
          this.currentMushroom = response.data
        }
        return response.data
      } catch (err) {
        this.error = err.message
        console.error('更新蘑菇数据失败:', err)
        // 模拟更新
        const index = this.mushrooms.findIndex(m => m.id === id)
        if (index !== -1) {
          this.mushrooms[index] = {
            ...this.mushrooms[index],
            ...mushroomData,
            updatedAt: new Date().toISOString()
          }
          if (this.currentMushroom && this.currentMushroom.id === id) {
            this.currentMushroom = this.mushrooms[index]
          }
          return this.mushrooms[index]
        }
      } finally {
        this.loading = false
      }
    },

    // 删除蘑菇数据
    async deleteMushroom(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/mushrooms/${id}`)
        this.mushrooms = this.mushrooms.filter(m => m.id !== id)
        if (this.currentMushroom && this.currentMushroom.id === id) {
          this.currentMushroom = null
        }
      } catch (err) {
        this.error = err.message
        console.error('删除蘑菇数据失败:', err)
        // 模拟删除
        this.mushrooms = this.mushrooms.filter(m => m.id !== id)
        if (this.currentMushroom && this.currentMushroom.id === id) {
          this.currentMushroom = null
        }
      } finally {
        this.loading = false
      }
    },

    // 模拟蘑菇数据
    getMockMushrooms() {
      return [
        {
          id: 1,
          name: '香菇',
          scientificName: 'Lentinula edodes',
          seasons: ['spring', 'autumn'],
          characteristics: '菌盖扁平半球形，表面褐色至深褐色，有鳞片。菌褶白色，稠密。菌柄中生或偏生，白色至淡褐色。',
          environment: '生于阔叶树倒木上，群生或丛生。',
          edibility: '食用，味道鲜美，营养丰富。',
          difficulty: 'easy',
          image: 'https://placehold.co/300x200?text=香菇',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: '平菇',
          scientificName: 'Pleurotus ostreatus',
          seasons: ['spring', 'summer', 'autumn', 'winter'],
          characteristics: '菌盖扇形或贝壳形，表面灰白色至灰褐色。菌褶白色，延生。菌柄侧生，白色。',
          environment: '生于阔叶树倒木上，群生。',
          edibility: '食用，味道鲜美，是最常见的栽培食用菌之一。',
          difficulty: 'easy',
          image: 'https://placehold.co/300x200?text=平菇',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          name: '金针菇',
          scientificName: 'Flammulina velutipes',
          seasons: ['winter', 'spring'],
          characteristics: '菌盖小，半球形，表面淡黄色至黄褐色。菌褶白色，延生。菌柄细长，白色至淡黄色。',
          environment: '生于阔叶树倒木上，丛生。',
          edibility: '食用，味道鲜美，口感独特。',
          difficulty: 'medium',
          image: 'https://placehold.co/300x200?text=金针菇',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 4,
          name: '杏鲍菇',
          scientificName: 'Pleurotus eryngii',
          seasons: ['spring', 'autumn'],
          characteristics: '菌盖半球形至扁平，表面灰白色至灰褐色。菌褶白色，延生。菌柄粗壮，白色。',
          environment: '生于伞形科植物的根上或枯茎上。',
          edibility: '食用，味道鲜美，肉质肥厚。',
          difficulty: 'medium',
          image: 'https://placehold.co/300x200?text=杏鲍菇',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 5,
          name: '松茸',
          scientificName: 'Tricholoma matsutake',
          seasons: ['autumn'],
          characteristics: '菌盖半球形至扁平，表面褐色至深褐色，有纤维状鳞片。菌褶白色，稠密。菌柄粗壮，白色至淡褐色。',
          environment: '生于松林或针阔混交林中，散生或群生。',
          edibility: '食用，珍稀名贵，味道极其鲜美。',
          difficulty: 'hard',
          image: 'https://placehold.co/300x200?text=松茸',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  }
})