import { computed } from 'vue'
import { useWorkStore } from '../stores/useWorkStore'

/**
 * 作品数据管理组合式函数
 * @returns {Object} 作品数据相关的状态和方法
 */
export function useWorkData() {
  const workStore = useWorkStore()
  
  // 从状态管理获取作品数据
  const recommendedWorks = computed(() => workStore.recommendedWorks)
  const latestWorks = computed(() => workStore.latestWorks)
  const followingWorks = computed(() => workStore.followingWorks)
  const topWorks = computed(() => workStore.topThreeWorks)
  const isLoading = computed(() => workStore.isLoading)
  
  /**
   * 加载推荐作品
   * @returns {Promise<void>}
   */
  const loadRecommendedWorks = async () => {
    await workStore.fetchRecommendedWorks()
  }
  
  /**
   * 加载最新作品
   * @returns {Promise<void>}
   */
  const loadLatestWorks = async () => {
    await workStore.fetchLatestWorks()
  }
  
  /**
   * 加载关注作品
   * @returns {Promise<void>}
   */
  const loadFollowingWorks = async () => {
    await workStore.fetchFollowingWorks()
  }
  
  /**
   * 加载排行榜数据
   * @param {string} timeRange - 时间范围
   * @returns {Promise<void>}
   */
  const loadRankingData = async (timeRange = 'weekly') => {
    await workStore.fetchRankingData(timeRange)
  }
  
  /**
   * 按分类筛选作品
   * @param {string} category - 分类名称
   */
  const filterByCategory = async (category) => {
    workStore.setFilters({ mushroomType: category })
    // 并行加载所有相关数据，提高性能
    await Promise.all([
      loadRecommendedWorks(),
      loadLatestWorks(),
      loadFollowingWorks(),
      loadRankingData('weekly')
    ])
  }
  
  /**
   * 初始化数据
   * @returns {Promise<void>}
   */
  const initializeData = async () => {
    await workStore.fetchRecommendedWorks()
    await workStore.fetchRankingData('weekly')
  }
  
  return {
    // 作品数据
    recommendedWorks,
    latestWorks,
    followingWorks,
    topWorks,
    isLoading,
    
    // 数据加载方法
    loadRecommendedWorks,
    loadLatestWorks,
    loadFollowingWorks,
    loadRankingData,
    filterByCategory,
    initializeData
  }
}