const axios = require('axios');
const { sequelize } = require('../config/db');
const Recipe = require('../models/Recipe');
const UserPreference = require('../models/UserPreference');

/**
 * 烹饪视频服务类，用于获取和推荐蘑菇烹饪视频
 */
class CookingVideoService {
  constructor() {
    // 视频源配置
    this.videoSourceConfig = {
      // 主要视频源（模拟配置，实际项目中应替换为真实API）
      primarySource: {
        name: '蘑菇烹饪视频库',
        baseUrl: 'https://api.example-cooking-videos.com/v1',
        apiKey: process.env.COOKING_VIDEO_API_KEY || 'your-video-api-key',
        timeout: 30000,
        category: 'mushroom-cooking'
      },
      // 备用视频源
      fallbackSource: {
        name: '通用烹饪视频平台',
        baseUrl: 'https://api.example-general-videos.com/v1',
        apiKey: process.env.GENERAL_VIDEO_API_KEY || 'your-general-video-api-key',
        timeout: 30000
      }
    };
    
    // 视频质量标准
    this.videoQualityStandards = {
      minResolution: '720p',
      maxDuration: 1800, // 30分钟
      minDuration: 60, // 1分钟
      requiredMetadata: ['title', 'description', 'duration', 'thumbnail', 'category']
    };
    
    // 视频与食谱匹配权重
    this.videoRecipeMatchingWeights = {
      titleMatch: 0.4,
      ingredientMatch: 0.3,
      cuisineMatch: 0.15,
      difficultyMatch: 0.15
    };
    
    // 口味偏好与视频风格映射
    this.flavorToVideoStyle = {
      '香辣': ['spicy', 'hot', 'chili'],
      '酸甜': ['sweet', 'sour', 'tangy'],
      '清淡': ['light', 'fresh', 'healthy'],
      '浓郁': ['rich', 'creamy', 'heavy'],
      '鲜美': ['delicious', 'tasty', 'flavorful']
    };
    
    // 视频缓存配置
    this.cacheConfig = {
      ttl: 3600000, // 1小时
      maxSize: 1000
    };
    
    // 初始化视频缓存
    this.videoCache = new Map();
  }

  /**
   * 从视频源获取蘑菇烹饪视频
   * @param {Object} params 查询参数
   * @returns {Promise<Array>} 视频列表
   */
  async fetchCookingVideos(params = {}) {
    try {
      console.log('开始从视频源获取烹饪视频...');
      
      const { mushroomName, recipeId, limit = 10, page = 1 } = params;
      
      // 构建查询参数
      const queryParams = {
        category: this.videoSourceConfig.primarySource.category,
        limit: limit,
        page: page
      };
      
      if (mushroomName) {
        queryParams.keywords = mushroomName;
      }
      
      // 模拟从视频源获取数据
      // 实际项目中，这里应该调用真实的API
      const mockVideos = this.generateMockVideos(params);
      
      console.log(`成功获取 ${mockVideos.length} 条烹饪视频`);
      return mockVideos;
    } catch (error) {
      console.error('从视频源获取烹饪视频失败:', error);
      // 尝试从备用源获取
      try {
        console.log('尝试从备用视频源获取...');
        // 备用源逻辑（这里同样使用模拟数据）
        return this.generateMockVideos(params);
      } catch (fallbackError) {
        console.error('从备用视频源获取失败:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * 生成模拟视频数据（实际项目中应替换为真实API调用）
   * @param {Object} params 查询参数
   * @returns {Array} 模拟视频数据
   */
  generateMockVideos(params = {}) {
    const allVideos = [
      {
        id: 'video_1',
        title: '香菇炖鸡的家常做法',
        description: '教你如何制作美味的香菇炖鸡，营养丰富，味道鲜美',
        url: 'https://example-videos.com/mushroom-chicken.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/mushroom-chicken.jpg',
        duration: 360, // 6分钟
        category: 'mushroom-cooking',
        cuisine: '中式',
        difficulty: 'beginner',
        ingredients: ['香菇', '鸡肉', '生姜', '料酒', '盐'],
        flavorProfile: ['鲜美', '清淡'],
        tags: ['香菇', '鸡肉', '家常', '炖菜'],
        uploadDate: '2026-01-01',
        viewCount: 10000,
        rating: 4.8
      },
      {
        id: 'video_2',
        title: '杏鲍菇炒牛肉的技巧',
        description: '掌握这几个技巧，轻松做出嫩滑美味的杏鲍菇炒牛肉',
        url: 'https://example-videos.com/king-oyster-beef.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/king-oyster-beef.jpg',
        duration: 480, // 8分钟
        category: 'mushroom-cooking',
        cuisine: '中式',
        difficulty: 'intermediate',
        ingredients: ['杏鲍菇', '牛肉', '青椒', '生姜', '生抽', '淀粉'],
        flavorProfile: ['浓郁', '鲜美'],
        tags: ['杏鲍菇', '牛肉', '炒菜', '技巧'],
        uploadDate: '2026-01-15',
        viewCount: 8500,
        rating: 4.7
      },
      {
        id: 'video_3',
        title: '平菇鸡蛋汤的营养做法',
        description: '简单易做的平菇鸡蛋汤，营养丰富，适合全家食用',
        url: 'https://example-videos.com/oyster-egg-soup.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/oyster-egg-soup.jpg',
        duration: 300, // 5分钟
        category: 'mushroom-cooking',
        cuisine: '中式',
        difficulty: 'beginner',
        ingredients: ['平菇', '鸡蛋', '葱花', '盐', '香油'],
        flavorProfile: ['清淡', '鲜美'],
        tags: ['平菇', '鸡蛋', '汤', '家常'],
        uploadDate: '2025-12-20',
        viewCount: 12000,
        rating: 4.9
      },
      {
        id: 'video_4',
        title: '金针菇豆腐煲的制作方法',
        description: '教你制作暖胃又营养的金针菇豆腐煲',
        url: 'https://example-videos.com/enoki-tofu.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/enoki-tofu.jpg',
        duration: 420, // 7分钟
        category: 'mushroom-cooking',
        cuisine: '中式',
        difficulty: 'intermediate',
        ingredients: ['金针菇', '豆腐', '猪肉末', '豆瓣酱', '生抽'],
        flavorProfile: ['香辣', '浓郁'],
        tags: ['金针菇', '豆腐', '煲', '香辣'],
        uploadDate: '2026-01-10',
        viewCount: 9500,
        rating: 4.6
      },
      {
        id: 'video_5',
        title: '猴头菇炖排骨的滋补做法',
        description: '秋冬季节的滋补佳品，猴头菇炖排骨的详细做法',
        url: 'https://example-videos.com/hericium-ribs.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/hericium-ribs.jpg',
        duration: 600, // 10分钟
        category: 'mushroom-cooking',
        cuisine: '中式',
        difficulty: 'advanced',
        ingredients: ['猴头菇', '排骨', '红枣', '枸杞', '生姜'],
        flavorProfile: ['鲜美', '滋补'],
        tags: ['猴头菇', '排骨', '炖菜', '滋补'],
        uploadDate: '2025-12-05',
        viewCount: 7800,
        rating: 4.8
      },
      {
        id: 'video_6',
        title: '黄油煎杏鲍菇的西式做法',
        description: '简单美味的西式黄油煎杏鲍菇，香气四溢',
        url: 'https://example-videos.com/butter-king-oyster.mp4',
        thumbnail: 'https://example-videos.com/thumbnails/butter-king-oyster.jpg',
        duration: 360, // 6分钟
        category: 'mushroom-cooking',
        cuisine: '西式',
        difficulty: 'intermediate',
        ingredients: ['杏鲍菇', '黄油', '大蒜', '黑胡椒', '盐'],
        flavorProfile: ['浓郁', '香鲜'],
        tags: ['杏鲍菇', '黄油', '西式', '煎'],
        uploadDate: '2026-01-20',
        viewCount: 6500,
        rating: 4.7
      }
    ];
    
    // 根据参数过滤视频
    let filteredVideos = [...allVideos];
    
    if (params.mushroomName) {
      filteredVideos = filteredVideos.filter(video => 
        video.ingredients.includes(params.mushroomName) ||
        video.tags.includes(params.mushroomName)
      );
    }
    
    if (params.recipeId) {
      // 这里应该根据食谱ID查询食谱，然后根据食谱信息过滤视频
      // 由于是模拟数据，这里简化处理
    }
    
    return filteredVideos.slice(0, params.limit || 10);
  }

  /**
   * 验证视频质量是否符合标准
   * @param {Object} video 视频信息
   * @returns {Object} 验证结果，包含isValid和errors字段
   */
  validateVideoQuality(video) {
    const result = {
      isValid: true,
      errors: []
    };
    
    // 检查必需元数据
    for (const metadata of this.videoQualityStandards.requiredMetadata) {
      if (!video[metadata]) {
        result.isValid = false;
        result.errors.push(`缺少必需元数据: ${metadata}`);
      }
    }
    
    // 检查视频时长
    if (video.duration < this.videoQualityStandards.minDuration) {
      result.isValid = false;
      result.errors.push(`视频时长过短，最小时长为 ${this.videoQualityStandards.minDuration} 秒`);
    }
    
    if (video.duration > this.videoQualityStandards.maxDuration) {
      result.isValid = false;
      result.errors.push(`视频时长过长，最大时长为 ${this.videoQualityStandards.maxDuration} 秒`);
    }
    
    // 检查视频分辨率
    if (video.resolution && video.resolution < this.videoQualityStandards.minResolution) {
      result.isValid = false;
      result.errors.push(`视频分辨率过低，最低要求为 ${this.videoQualityStandards.minResolution}`);
    }
    
    return result;
  }

  /**
   * 计算视频与食谱的匹配评分
   * @param {Object} video 视频信息
   * @param {Object} recipe 食谱信息
   * @returns {number} 匹配评分（0-10分）
   */
  calculateVideoRecipeMatchScore(video, recipe) {
    let totalScore = 0;
    
    // 标题匹配评分
    let titleMatchScore = 0;
    const recipeTitleWords = recipe.name.split(/\s+/);
    const videoTitleLower = video.title.toLowerCase();
    
    for (const word of recipeTitleWords) {
      if (videoTitleLower.includes(word.toLowerCase())) {
        titleMatchScore += 1;
      }
    }
    titleMatchScore = recipeTitleWords.length > 0 ? 
      (titleMatchScore / recipeTitleWords.length) * 10 : 0;
    
    // 食材匹配评分
    let ingredientMatchScore = 0;
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      const recipeIngredients = recipe.ingredients.map(ing => ing.ingredientName);
      
      for (const recipeIng of recipeIngredients) {
        if (video.ingredients && video.ingredients.includes(recipeIng)) {
          ingredientMatchScore += 1;
        }
      }
      
      ingredientMatchScore = (ingredientMatchScore / recipeIngredients.length) * 10;
    }
    
    // 菜系匹配评分
    let cuisineMatchScore = 0;
    if (recipe.cuisine && video.cuisine && recipe.cuisine === video.cuisine) {
      cuisineMatchScore = 10;
    }
    
    // 难度匹配评分
    let difficultyMatchScore = 0;
    if (recipe.difficulty && video.difficulty && recipe.difficulty === video.difficulty) {
      difficultyMatchScore = 10;
    }
    
    // 计算综合评分
    totalScore = (
      titleMatchScore * this.videoRecipeMatchingWeights.titleMatch +
      ingredientMatchScore * this.videoRecipeMatchingWeights.ingredientMatch +
      cuisineMatchScore * this.videoRecipeMatchingWeights.cuisineMatch +
      difficultyMatchScore * this.videoRecipeMatchingWeights.difficultyMatch
    );
    
    return Math.round(totalScore * 10) / 10;
  }

  /**
   * 基于用户口味偏好推荐烹饪视频
   * @param {Object} userPreference 用户偏好
   * @param {Object} options 推荐选项
   * @returns {Promise<Array>} 推荐视频列表
   */
  async recommendVideosByUserPreference(userPreference, options = {}) {
    try {
      console.log('基于用户口味偏好推荐烹饪视频...');
      
      const { limit = 10, mushroomName, recipeId } = options;
      
      // 获取视频列表
      const videos = await this.fetchCookingVideos({
        mushroomName: mushroomName,
        recipeId: recipeId,
        limit: limit * 2 // 获取两倍数量，用于筛选
      });
      
      // 过滤符合质量标准的视频
      const qualityVideos = videos.filter(video => {
        const validation = this.validateVideoQuality(video);
        return validation.isValid;
      });
      
      // 根据用户偏好排序视频
      const scoredVideos = qualityVideos.map(video => {
        let preferenceScore = 5;
        
        if (userPreference) {
          // 计算口味偏好匹配评分
          let flavorMatchScore = 0;
          let flavorCount = 0;
          
          // 检查视频风格是否匹配用户口味偏好
          if (userPreference.tastePreferences) {
            for (const [flavor, isLiked] of Object.entries(userPreference.tastePreferences)) {
              if (isLiked && this.flavorToVideoStyle[flavor]) {
                flavorCount++;
                
                // 检查视频标签或描述是否包含匹配的风格关键词
                const videoText = `${video.title} ${video.description} ${video.tags.join(' ')}`.toLowerCase();
                const styleKeywords = this.flavorToVideoStyle[flavor].map(style => style.toLowerCase());
                
                for (const style of styleKeywords) {
                  if (videoText.includes(style)) {
                    flavorMatchScore += 1;
                    break;
                  }
                }
              }
            }
          }
          
          // 计算最终偏好评分
          if (flavorCount > 0) {
            flavorMatchScore = (flavorMatchScore / flavorCount) * 10;
            preferenceScore = flavorMatchScore;
          }
          
          // 检查饮食类型匹配
          if (userPreference.dietaryRestrictions && userPreference.dietaryRestrictions.length > 0) {
            // 这里可以根据视频的饮食类型标签进行匹配
            // 简化处理，假设视频都符合基本饮食类型
          }
        }
        
        return {
          ...video,
          preferenceScore: Math.round(preferenceScore * 10) / 10
        };
      });
      
      // 按偏好评分降序排序
      scoredVideos.sort((a, b) => b.preferenceScore - a.preferenceScore);
      
      // 返回前N个视频
      const recommendedVideos = scoredVideos.slice(0, limit);
      
      console.log(`推荐 ${recommendedVideos.length} 个符合用户偏好的烹饪视频`);
      return recommendedVideos;
    } catch (error) {
      console.error('基于用户偏好推荐视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取与食谱匹配的烹饪视频
   * @param {number} recipeId 食谱ID
   * @param {Object} options 选项
   * @returns {Promise<Array>} 匹配的视频列表
   */
  async getVideosForRecipe(recipeId, options = {}) {
    try {
      console.log(`获取与食谱ID ${recipeId} 匹配的烹饪视频...`);
      
      const { limit = 5, userId } = options;
      
      // 查询食谱信息
      const recipe = await Recipe.findByPk(recipeId, {
        include: ['ingredients']
      });
      
      if (!recipe) {
        throw new Error('食谱不存在');
      }
      
      // 获取视频列表
      const videos = await this.fetchCookingVideos({
        mushroomName: recipe.mainIngredient,
        recipeId: recipeId,
        limit: limit * 2
      });
      
      // 获取用户偏好（如果提供了userId）
      let userPreference = null;
      if (userId) {
        userPreference = await UserPreference.findOne({
          where: { userId }
        });
      }
      
      // 计算视频与食谱的匹配评分
      const scoredVideos = videos.map(video => {
        const recipeMatchScore = this.calculateVideoRecipeMatchScore(video, recipe);
        
        // 获取用户偏好评分
        let preferenceScore = 5;
        if (userPreference) {
          // 这里可以调用 recommendVideosByUserPreference 中的偏好评分逻辑
          // 简化处理，直接使用默认评分
        }
        
        // 综合评分（食谱匹配70% + 用户偏好30%）
        const totalScore = (recipeMatchScore * 0.7) + (preferenceScore * 0.3);
        
        return {
          ...video,
          recipeMatchScore: Math.round(recipeMatchScore * 10) / 10,
          preferenceScore: Math.round(preferenceScore * 10) / 10,
          totalScore: Math.round(totalScore * 10) / 10
        };
      });
      
      // 按综合评分降序排序
      scoredVideos.sort((a, b) => b.totalScore - a.totalScore);
      
      // 过滤符合质量标准的视频
      const qualityScoredVideos = scoredVideos.filter(video => {
        const validation = this.validateVideoQuality(video);
        return validation.isValid;
      });
      
      // 返回前N个视频
      const matchedVideos = qualityScoredVideos.slice(0, limit);
      
      console.log(`找到 ${matchedVideos.length} 个与食谱匹配的烹饪视频`);
      return matchedVideos;
    } catch (error) {
      console.error('获取与食谱匹配的视频失败:', error);
      throw error;
    }
  }

  /**
   * 基于蘑菇品种推荐烹饪视频
   * @param {string} mushroomName 蘑菇名称
   * @param {Object} options 选项
   * @returns {Promise<Array>} 推荐视频列表
   */
  async recommendVideosByMushroom(mushroomName, options = {}) {
    try {
      console.log(`基于蘑菇品种 ${mushroomName} 推荐烹饪视频...`);
      
      const { limit = 10, userId } = options;
      
      // 获取用户偏好（如果提供了userId）
      let userPreference = null;
      if (userId) {
        userPreference = await UserPreference.findOne({
          where: { userId }
        });
      }
      
      // 调用基于用户偏好的视频推荐方法
      return this.recommendVideosByUserPreference(userPreference, {
        mushroomName: mushroomName,
        limit: limit
      });
    } catch (error) {
      console.error('基于蘑菇品种推荐视频失败:', error);
      throw error;
    }
  }

  /**
   * 推荐烹饪视频
   * @param {Object} params 推荐参数
   * @returns {Promise<Array>} 推荐视频列表
   */
  async recommendVideos(params = {}) {
    try {
      console.log('推荐烹饪视频...');
      
      const { mushroomId, limit = 5, userPreferences } = params;
      
      // 构建缓存键
      const cacheKey = `videos_${mushroomId || 'all'}_${limit}_${JSON.stringify(userPreferences || {})}`;
      
      // 尝试从缓存获取
      const cachedVideos = this.getCachedVideos(cacheKey);
      if (cachedVideos) {
        console.log('从缓存获取视频推荐');
        return cachedVideos;
      }
      
      // 获取蘑菇信息（如果提供了蘑菇ID）
      let mushroomName = '蘑菇';
      if (mushroomId) {
        try {
          const Mushroom = require('../models/Mushroom');
          const mushroom = await Mushroom.findByPk(mushroomId);
          if (mushroom) {
            mushroomName = mushroom.name;
          }
        } catch (error) {
          console.warn('获取蘑菇信息失败，使用默认值:', error);
        }
      }
      
      // 生成模拟视频数据
      const videos = this.generateMockVideos({
        mushroomName: mushroomName,
        limit: limit
      });
      
      // 缓存视频推荐结果
      this.setCachedVideos(cacheKey, videos);
      
      console.log(`推荐 ${videos.length} 个烹饪视频`);
      return videos;
    } catch (error) {
      console.error('推荐烹饪视频失败:', error);
      throw error;
    }
  }

  /**
   * 获取视频缓存
   * @param {string} key 缓存键
   * @returns {Object|null} 缓存的视频数据
   */
  getCachedVideos(key) {
    const cached = this.videoCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttl) {
      return cached.data;
    }
    
    // 缓存过期，移除缓存
    this.videoCache.delete(key);
    return null;
  }

  /**
   * 设置视频缓存
   * @param {string} key 缓存键
   * @param {Array} videos 视频数据
   */
  setCachedVideos(key, videos) {
    // 检查缓存大小
    if (this.videoCache.size >= this.cacheConfig.maxSize) {
      // 移除最旧的缓存
      const oldestKey = this.videoCache.keys().next().value;
      this.videoCache.delete(oldestKey);
    }
    
    this.videoCache.set(key, {
      timestamp: Date.now(),
      data: videos
    });
  }

  /**
   * 启动定时推送任务
   * @param {number} interval 推送间隔（毫秒），默认24小时
   */
  startScheduledPush(interval = 86400000) {
    if (this.pushTimer) {
      console.log('烹饪视频定时推送任务已在运行中');
      return;
    }
    
    console.log(`启动烹饪视频定时推送任务，间隔: ${interval}ms`);
    
    // 设置定时任务（这里可以根据需要添加具体的推送逻辑）
    this.pushTimer = setInterval(async () => {
      try {
        console.log('执行烹饪视频定时推送任务...');
        // 这里可以添加具体的推送逻辑
      } catch (error) {
        console.error('定时推送任务执行失败:', error);
      }
    }, interval);
  }

  /**
   * 停止定时推送任务
   */
  stopScheduledPush() {
    if (this.pushTimer) {
      clearInterval(this.pushTimer);
      this.pushTimer = null;
      console.log('烹饪视频定时推送任务已停止');
    }
  }
}

// 创建并导出烹饪视频服务实例
const cookingVideoService = new CookingVideoService();

module.exports = cookingVideoService;