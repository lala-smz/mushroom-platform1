import { ref } from 'vue'

/**
 * 标签页管理组合式函数
 * @param {Object} initialTabs - 初始标签页配置
 * @returns {Object} 标签页管理相关的状态和方法
 */
export function useTabManagement(initialTabs = {
  recommended: false,
  latest: false,
  following: false
}) {
  // 激活的标签页
  const activeTab = ref('recommended')
  
  // 标签页加载状态
  const tabLoading = ref({ ...initialTabs })
  
  /**
   * 处理标签页切换
   * @param {string} tabName - 标签页名称
   * @param {Function} loadDataFn - 加载数据的函数
   * @returns {Promise<void>}
   */
  const handleTabChange = async (tabName, loadDataFn) => {
    // 避免重复加载
    if (tabLoading.value[tabName]) return
    
    tabLoading.value[tabName] = true
    
    try {
      await loadDataFn(tabName)
    } catch (error) {
      console.error(`获取${tabName}数据失败:`, error)
    } finally {
      tabLoading.value[tabName] = false
    }
  }
  
  /**
   * 设置激活的标签页
   * @param {string} tabName - 标签页名称
   */
  const setActiveTab = (tabName) => {
    activeTab.value = tabName
  }
  
  /**
   * 重置标签页状态
   */
  const resetTabState = () => {
    activeTab.value = 'recommended'
    Object.keys(tabLoading.value).forEach(tab => {
      tabLoading.value[tab] = false
    })
  }
  
  return {
    activeTab,
    tabLoading,
    handleTabChange,
    setActiveTab,
    resetTabState
  }
}