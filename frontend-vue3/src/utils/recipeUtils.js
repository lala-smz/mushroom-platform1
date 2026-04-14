// 食谱相关的工具函数

/**
 * 格式化难度文本
 * @param {string} difficulty - 难度值
 * @returns {string} 格式化后的难度文本
 */
export const formatDifficulty = (difficulty) => {
  const difficultyMap = {
    beginner: '简单',
    intermediate: '中等',
    advanced: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

/**
 * 获取难度文本（与formatDifficulty功能相同，为了兼容不同调用方式）
 * @param {string} difficulty - 难度值
 * @returns {string} 格式化后的难度文本
 */
export const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    beginner: '初学者',
    intermediate: '中级',
    advanced: '高级'
  }
  return difficultyMap[difficulty] || difficulty
}

/**
 * 格式化烹饪时间
 * @param {number} minutes - 烹饪时间（分钟）
 * @returns {string} 格式化后的烹饪时间
 */
export const formatCookingTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} 分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours} 小时 ${remainingMinutes} 分钟` : `${hours} 小时`
  }
}

/**
 * 处理食材字符串，转换为数组
 * @param {string|Array} ingredients - 食材字符串或数组
 * @returns {Array} 食材数组
 */
export const processIngredients = (ingredients) => {
  if (Array.isArray(ingredients)) {
    return ingredients
  } else if (typeof ingredients === 'string') {
    return ingredients.split(',').map(item => item.trim()).filter(item => item)
  }
  return []
}

/**
 * 处理自定义选项（口味、菜系等）
 * @param {string} value - 选项值
 * @returns {Object} 包含原始值和自定义值的对象
 */
export const processCustomOption = (value) => {
  if (typeof value === 'string' && value.startsWith('其他(') && value.endsWith(')')) {
    return {
      type: '其他',
      customValue: value.substring(3, value.length - 1),
      fullValue: value
    }
  }
  return {
    type: value || '',
    customValue: '',
    fullValue: value || ''
  }
}

/**
 * 构建自定义选项值
 * @param {string} type - 选项类型
 * @param {string} customValue - 自定义值
 * @returns {string} 构建后的选项值
 */
export const buildCustomOption = (type, customValue) => {
  if (type === '其他' && customValue) {
    return `其他(${customValue})`
  }
  return type
}

/**
 * 验证食谱数据
 * @param {Object} recipeData - 食谱数据
 * @returns {Object} 验证结果
 */
export const validateRecipeData = (recipeData) => {
  const errors = []
  
  if (!recipeData.name || recipeData.name.trim() === '') {
    errors.push('请输入食谱名称')
  }
  
  if (!recipeData.description || recipeData.description.trim() === '') {
    errors.push('请输入食谱描述')
  }
  
  if (!recipeData.difficulty) {
    errors.push('请选择难度')
  }
  
  if (!recipeData.totalTime || recipeData.totalTime < 1) {
    errors.push('请输入有效的烹饪时间')
  }
  
  if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
    errors.push('请输入食材')
  }
  
  if (!recipeData.flavorProfile) {
    errors.push('请选择口味')
  }
  
  if (!recipeData.cuisine) {
    errors.push('请选择菜系')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 计算食谱营养成分总和
 * @param {Object} nutritionalInfo - 营养成分信息
 * @returns {Object} 计算结果
 */
export const calculateNutritionalSummary = (nutritionalInfo) => {
  if (!nutritionalInfo) {
    return {
      total: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0
    }
  }
  
  const protein = nutritionalInfo.protein || 0
  const fat = nutritionalInfo.fat || 0
  const carbs = nutritionalInfo.carbs || 0
  const fiber = nutritionalInfo.fiber || 0
  
  // 计算总热量（粗略估算）
  // 蛋白质和碳水化合物每克约4卡路里，脂肪每克约9卡路里
  const totalCalories = protein * 4 + fat * 9 + carbs * 4
  
  return {
    total: totalCalories,
    protein,
    fat,
    carbs,
    fiber
  }
}

/**
 * 生成食谱图片占位符
 * @param {string} recipeName - 食谱名称
 * @returns {string} 占位符图片URL
 */
export const generateRecipeImagePlaceholder = (recipeName) => {
  const encodedName = encodeURIComponent(recipeName || '食谱')
  return `https://via.placeholder.com/300x200?text=${encodedName}`
}

/**
 * 过滤食谱列表
 * @param {Array} recipes - 食谱列表
 * @param {Object} filters - 过滤条件
 * @returns {Array} 过滤后的食谱列表
 */
export const filterRecipes = (recipes, filters = {}) => {
  return recipes.filter(recipe => {
    // 按状态过滤
    if (filters.status && recipe.status !== filters.status) {
      return false
    }
    
    // 按难度过滤
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
      return false
    }
    
    // 按菜系过滤
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) {
      return false
    }
    
    // 按搜索关键词过滤
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchLower))
      )
    }
    
    return true
  })
}

/**
 * 排序食谱列表
 * @param {Array} recipes - 食谱列表
 * @param {string} sortBy - 排序字段
 * @param {string} sortOrder - 排序顺序
 * @returns {Array} 排序后的食谱列表
 */
export const sortRecipes = (recipes, sortBy = 'createdAt', sortOrder = 'desc') => {
  return [...recipes].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    // 处理日期类型
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    // 处理数字类型
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (!isNaN(aValue) && !isNaN(bValue)) {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else {
        // 字符串比较
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
    }
    
    // 数字比较
    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })
}