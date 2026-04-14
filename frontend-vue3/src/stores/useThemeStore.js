import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题：'dark' 或 'light'
    currentTheme: 'dark',
    // 主题样式配置
    themes: {
      dark: {
        primaryColor: '#1890ff',
        backgroundColor: '#0f1419',
        secondaryBackgroundColor: '#1a1f26',
        textColor: '#e5e7eb',
        secondaryTextColor: 'rgba(229, 231, 235, 0.7)',
        borderColor: '#2d3748',
        hoverColor: 'rgba(255, 255, 255, 0.08)',
        activeColor: 'rgba(24, 144, 255, 0.2)',
        inputBackgroundColor: 'rgba(255, 255, 255, 0.08)',
        inputBorderColor: 'rgba(255, 255, 255, 0.15)',
        scrollbarTrackColor: 'rgba(255, 255, 255, 0.05)',
        scrollbarThumbColor: 'rgba(255, 255, 255, 0.25)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      },
      light: {
        primaryColor: '#409eff',
        backgroundColor: '#f5f7fa',
        secondaryBackgroundColor: '#fff',
        textColor: '#303133',
        secondaryTextColor: '#606266',
        borderColor: '#e4e7ed',
        hoverColor: '#f5f7fa',
        activeColor: '#ecf5ff',
        inputBackgroundColor: '#fff',
        inputBorderColor: '#dcdfe6',
        scrollbarTrackColor: '#f1f1f1',
        scrollbarThumbColor: '#c1c1c1',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
      }
    }
  }),
  
  getters: {
    // 获取当前主题的样式配置
    currentThemeConfig: (state) => {
      return state.themes[state.currentTheme]
    },
    
    // 获取当前是否为暗色主题
    isDarkTheme: (state) => {
      return state.currentTheme === 'dark'
    }
  },
  
  actions: {
    // 切换主题
    toggleTheme() {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
      this.saveThemeToLocalStorage()
      this.applyTheme()
    },
    
    // 设置特定主题
    setTheme(theme) {
      if (this.themes[theme]) {
        this.currentTheme = theme
        this.saveThemeToLocalStorage()
        this.applyTheme()
      }
    },
    
    // 保存主题到本地存储
    saveThemeToLocalStorage() {
      try {
        localStorage.setItem('theme', this.currentTheme)
      } catch (error) {
        console.error('保存主题到本地存储失败:', error)
      }
    },
    
    // 从本地存储加载主题
    loadThemeFromLocalStorage() {
      try {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme && this.themes[savedTheme]) {
          this.currentTheme = savedTheme
        }
      } catch (error) {
        console.error('从本地存储加载主题失败:', error)
      }
    },
    
    // 应用主题到DOM
    applyTheme() {
      // 添加或移除body上的dark-theme类
      if (this.currentTheme === 'dark') {
        document.body.classList.add('dark-theme')
        document.body.classList.remove('light-theme')
      } else {
        document.body.classList.add('light-theme')
        document.body.classList.remove('dark-theme')
      }
      
      // 设置CSS变量，方便在组件中使用
      const themeConfig = this.currentThemeConfig
      Object.entries(themeConfig).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--theme-${key}`, value)
      })
    },
    
    // 初始化主题
    initTheme() {
      this.loadThemeFromLocalStorage()
      this.applyTheme()
    }
  }
})