export const DIFFICULTY_OPTIONS = [
  { label: '简单', value: 'beginner', text: '简单' },
  { label: '中等', value: 'intermediate', text: '中等' },
  { label: '困难', value: 'advanced', text: '困难' }
]

export const CUISINE_OPTIONS = [
  { label: '中式', value: '中式' },
  { label: '西式', value: '西式' },
  { label: '日式', value: '日式' },
  { label: '韩式', value: '韩式' },
  { label: '其他', value: '其他' }
]

export const MEAL_TYPE_OPTIONS = [
  { label: '早餐', value: '早餐' },
  { label: '午餐', value: '午餐' },
  { label: '晚餐', value: '晚餐' },
  { label: '点心', value: '点心' }
]

export const FLAVOR_PROFILE_OPTIONS = [
  { label: '甜', value: 'sweet' },
  { label: '咸鲜', value: 'savory' },
  { label: '酸', value: 'sour' },
  { label: '辣', value: 'spicy' },
  { label: '苦', value: 'bitter' },
  { label: '其他', value: 'other' }
]

export const SPICINESS_OPTIONS = [
  { label: '不辣', value: 'none' },
  { label: '微辣', value: 'mild' },
  { label: '中辣', value: 'medium' },
  { label: '特辣', value: 'hot' },
  { label: '变态辣', value: 'extreme' }
]

export const COOKING_METHOD_OPTIONS = [
  { label: '炒菜', value: 'stirFry' },
  { label: '汤', value: 'soup' },
  { label: '蒸', value: 'steam' },
  { label: '煮', value: 'boil' },
  { label: '煎', value: 'fry' },
  { label: '烤', value: 'bake' },
  { label: '烧烤', value: 'grill' },
  { label: '凉菜', value: 'coldDish' }
]

export const DIETARY_RESTRICTION_OPTIONS = [
  { label: '素食', value: 'vegetarian' },
  { label: '纯素食', value: 'vegan' },
  { label: '无麸质', value: 'glutenFree' },
  { label: '无乳制品', value: 'dairyFree' },
  { label: '无坚果', value: 'nutFree' },
  { label: '无大豆', value: 'soyFree' },
  { label: '无贝类', value: 'shellfishFree' },
  { label: '无猪肉', value: 'porkFree' }
]

export const FLAVOR_PREFERENCE_OPTIONS = [
  { label: '甜', value: 'sweet' },
  { label: '酸', value: 'sour' },
  { label: '咸', value: 'salty' },
  { label: '苦', value: 'bitter' },
  { label: '鲜', value: 'umami' },
  { label: '辣', value: 'spicy' },
  { label: '香', value: 'fragrant' },
  { label: '脆', value: 'crispy' }
]

export const INGREDIENT_PREFERENCE_OPTIONS = [
  { label: '鸡肉', value: 'chicken' },
  { label: '牛肉', value: 'beef' },
  { label: '猪肉', value: 'pork' },
  { label: '鱼肉', value: 'fish' },
  { label: '豆腐', value: 'tofu' },
  { label: '蔬菜', value: 'vegetables' },
  { label: '水果', value: 'fruits' },
  { label: '面条', value: 'noodles' }
]

export const COOKING_TIME_RANGES = [
  { label: '快速 (≤15分钟)', value: 15 },
  { label: '适中 (16-30分钟)', value: 30 },
  { label: '较长 (31-60分钟)', value: 60 },
  { label: '长时间 (>60分钟)', value: 120 }
]

export const getDifficultyText = (difficulty) => {
  const option = DIFFICULTY_OPTIONS.find(o => o.value === difficulty)
  return option ? option.text : difficulty
}

export const getCuisineText = (cuisine) => {
  const option = CUISINE_OPTIONS.find(o => o.value === cuisine)
  return option ? option.label : cuisine
}

export const getMealTypeText = (mealType) => {
  const option = MEAL_TYPE_OPTIONS.find(o => o.value === mealType)
  return option ? option.label : mealType
}

export const getSpicinessText = (spiciness) => {
  const option = SPICINESS_OPTIONS.find(o => o.value === spiciness)
  return option ? option.label : spiciness
}

export const getCookingMethodText = (method) => {
  const option = COOKING_METHOD_OPTIONS.find(o => o.value === method)
  return option ? option.label : method
}

export const formatCookingTime = (minutes) => {
  if (!minutes) return '未知'
  if (minutes < 15) return '快速'
  if (minutes < 30) return '适中'
  if (minutes < 60) return '较长'
  return '长时间'
}

export const validateFilterParams = (params) => {
  const validated = {}
  
  if (params.difficulty) {
    const valid = DIFFICULTY_OPTIONS.some(o => o.value === params.difficulty)
    if (valid) validated.difficulty = params.difficulty
  }
  
  if (params.cuisineType) {
    const valid = CUISINE_OPTIONS.some(o => o.value === params.cuisineType)
    if (valid) validated.cuisineType = params.cuisineType
  }
  
  if (params.mealType) {
    const valid = MEAL_TYPE_OPTIONS.some(o => o.value === params.mealType)
    if (valid) validated.mealType = params.mealType
  }
  
  if (params.prepTime && Number(params.prepTime) > 0) {
    validated.prepTime = Number(params.prepTime)
  }
  
  if (params.cookTime && Number(params.cookTime) > 0) {
    validated.cookTime = Number(params.cookTime)
  }
  
  if (params.search && params.search.trim()) {
    validated.search = params.search.trim()
  }
  
  if (params.page && Number(params.page) > 0) {
    validated.page = Number(params.page)
  }
  
  if (params.limit && Number(params.limit) > 0) {
    validated.limit = Number(params.limit)
  }
  
  if (params.status) {
    validated.status = params.status
  }
  
  return validated
}

export default {
  DIFFICULTY_OPTIONS,
  CUISINE_OPTIONS,
  MEAL_TYPE_OPTIONS,
  FLAVOR_PROFILE_OPTIONS,
  SPICINESS_OPTIONS,
  COOKING_METHOD_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  FLAVOR_PREFERENCE_OPTIONS,
  INGREDIENT_PREFERENCE_OPTIONS,
  COOKING_TIME_RANGES,
  getDifficultyText,
  getCuisineText,
  getMealTypeText,
  getSpicinessText,
  getCookingMethodText,
  formatCookingTime,
  validateFilterParams
}
