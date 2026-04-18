const Mushroom = require('../models/Mushroom');
const UserPreference = require('../models/UserPreference');
const Notification = require('../models/Notification');
const mushroomDataService = require('./mushroomDataService');
const recipeMatchingService = require('./recipeMatchingService');
const cookingVideoService = require('./cookingVideoService');

/**
 * 季节信息推送服务类
 */
class SeasonalPushService {
  constructor() {
    // 推送配置
    this.pushConfig = {
      // 推送频率（毫秒）
      frequency: {
        seasonalInfo: 86400000, // 每天一次
        seasonalRecipes: 604800000, // 每周一次
        seasonalVideos: 604800000 // 每周一次
      },
      // 推送渠道
      channels: {
        inApp: true,
        browser: true,
        email: false // 暂不支持邮件推送
      },
      // 推送时间窗口（小时）
      pushWindow: {
        start: 8,
        end: 20
      }
    };
    
    // 季节信息模板
    this.seasonalInfoTemplates = {
      '春季': {
        title: '春季蘑菇推荐',
        template: '【春季蘑菇推荐】\n\n春季是蘑菇生长的好时节，推荐您尝试以下当季蘑菇：\n\n%s\n\n这些蘑菇不仅新鲜美味，而且营养丰富，适合春季食用。\n\n%s\n\n%s\n\n更多蘑菇相关信息，请访问蘑菇网查看详情。'
      },
      '夏季': {
        title: '夏季蘑菇推荐',
        template: '【夏季蘑菇推荐】\n\n夏季高温多雨，适合以下蘑菇生长：\n\n%s\n\n夏季食用蘑菇建议选择清淡烹饪方式，保持营养和口感。\n\n%s\n\n%s\n\n更多蘑菇相关信息，请访问蘑菇网查看详情。'
      },
      '秋季': {
        title: '秋季蘑菇推荐',
        template: '【秋季蘑菇推荐】\n\n秋季是蘑菇的丰收季节，以下是当季热门蘑菇：\n\n%s\n\n秋季蘑菇营养丰富，适合滋补养生。\n\n%s\n\n%s\n\n更多蘑菇相关信息，请访问蘑菇网查看详情。'
      },
      '冬季': {
        title: '冬季蘑菇推荐',
        template: '【冬季蘑菇推荐】\n\n冬季寒冷干燥，适合以下蘑菇生长：\n\n%s\n\n冬季食用蘑菇建议选择炖煮等温热烹饪方式，温暖又营养。\n\n%s\n\n%s\n\n更多蘑菇相关信息，请访问蘑菇网查看详情。'
      }
    };
    
    // 推送内容类型
    this.pushContentTypes = {
      seasonalInfo: 'seasonal_info',
      seasonalRecipes: 'seasonal_recipes',
      seasonalVideos: 'seasonal_videos'
    };
  }

  /**
   * 检查是否在推送时间窗口内
   * @returns {boolean} 是否在推送时间窗口内
   */
  isInPushWindow() {
    const now = new Date();
    const currentHour = now.getHours();
    
    return currentHour >= this.pushConfig.pushWindow.start && 
           currentHour <= this.pushConfig.pushWindow.end;
  }

  /**
   * 生成当季蘑菇信息
   * @param {string} season 季节
   * @returns {Promise<string>} 当季蘑菇信息字符串
   */
  async generateSeasonalMushroomInfo(season) {
    try {
      // 获取当季蘑菇列表
      const seasonalMushrooms = await mushroomDataService.getSeasonalMushrooms(season);
      
      if (seasonalMushrooms.length === 0) {
        return '当前季节暂无推荐蘑菇。';
      }
      
      // 生成蘑菇信息
      let mushroomInfo = '';
      for (const mushroom of seasonalMushrooms.slice(0, 5)) { // 最多展示5种蘑菇
        mushroomInfo += `${mushroom.name}：${mushroom.description}\n`;
        
        // 添加营养价值信息
        if (mushroom.nutritionalValue) {
          mushroomInfo += `  营养价值：\n`;
          mushroomInfo += `    - 卡路里：${mushroom.nutritionalValue.calories} 大卡\n`;
          mushroomInfo += `    - 蛋白质：${mushroom.nutritionalValue.protein}g\n`;
          mushroomInfo += `    - 膳食纤维：${mushroom.nutritionalValue.fiber}g\n`;
        }
        
        // 添加选购建议
        if (mushroom.selectionTips) {
          mushroomInfo += `  选购建议：${mushroom.selectionTips}\n`;
        }
        
        mushroomInfo += '\n';
      }
      
      return mushroomInfo;
    } catch (error) {
      console.error('生成当季蘑菇信息失败:', error);
      return '获取当季蘑菇信息失败，请稍后重试。';
    }
  }

  /**
   * 生成当季推荐食谱
   * @param {string} season 季节
   * @returns {Promise<string>} 当季推荐食谱字符串
   */
  async generateSeasonalRecipes(season) {
    try {
      // 获取当季蘑菇
      const seasonalMushrooms = await mushroomDataService.getSeasonalMushrooms(season);
      
      if (seasonalMushrooms.length === 0) {
        return '当前季节暂无推荐食谱。';
      }
      
      // 获取热门食谱
      const popularRecipes = await recipeMatchingService.getPopularRecipes(5);
      
      if (popularRecipes.length === 0) {
        return '当前暂无推荐食谱。';
      }
      
      // 生成食谱信息
      let recipeInfo = '推荐食谱：\n';
      for (const recipe of popularRecipes.slice(0, 3)) { // 最多展示3个食谱
        recipeInfo += `\n${recipe.name}\n`;
        recipeInfo += `  烹饪难度：${recipe.difficulty}\n`;
        recipeInfo += `  烹饪时间：${recipe.totalTime} 分钟\n`;
        recipeInfo += `  简介：${recipe.description}\n`;
      }
      
      return recipeInfo;
    } catch (error) {
      console.error('生成当季推荐食谱失败:', error);
      return '获取推荐食谱失败，请稍后重试。';
    }
  }

  /**
   * 生成当季推荐视频
   * @param {string} season 季节
   * @returns {Promise<string>} 当季推荐视频字符串
   */
  async generateSeasonalVideos(season) {
    try {
      // 获取当季蘑菇
      const seasonalMushrooms = await mushroomDataService.getSeasonalMushrooms(season);
      
      if (seasonalMushrooms.length === 0) {
        return '当前季节暂无推荐视频。';
      }
      
      // 获取推荐视频
      const recommendedVideos = await cookingVideoService.fetchCookingVideos({
        mushroomName: seasonalMushrooms[0].name,
        limit: 3
      });
      
      if (recommendedVideos.length === 0) {
        return '当前暂无推荐视频。';
      }
      
      // 生成视频信息
      let videoInfo = '推荐烹饪视频：\n';
      for (const video of recommendedVideos) {
        videoInfo += `\n${video.title}\n`;
        videoInfo += `  时长：${Math.floor(video.duration / 60)} 分钟\n`;
        videoInfo += `  简介：${video.description}\n`;
      }
      
      return videoInfo;
    } catch (error) {
      console.error('生成当季推荐视频失败:', error);
      return '获取推荐视频失败，请稍后重试。';
    }
  }

  /**
   * 生成季节信息推送内容
   * @param {string} season 季节
   * @returns {Promise<Object>} 推送内容，包含title和content字段
   */
  async generateSeasonalPushContent(season) {
    try {
      const template = this.seasonalInfoTemplates[season];
      if (!template) {
        throw new Error('未找到对应的季节信息模板');
      }
      
      // 生成当季蘑菇信息
      const mushroomInfo = await this.generateSeasonalMushroomInfo(season);
      
      // 生成当季推荐食谱
      const recipeInfo = await this.generateSeasonalRecipes(season);
      
      // 生成当季推荐视频
      const videoInfo = await this.generateSeasonalVideos(season);
      
      // 生成推送内容
      const content = template.template % [mushroomInfo, recipeInfo, videoInfo];
      
      return {
        title: template.title,
        content: content
      };
    } catch (error) {
      console.error('生成季节信息推送内容失败:', error);
      throw error;
    }
  }

  /**
   * 发送季节信息推送
   * @returns {Promise<number>} 推送的用户数
   */
  async sendSeasonalPush() {
    try {
      console.log('开始发送季节信息推送...');
      
      // 检查是否在推送时间窗口内
      if (!this.isInPushWindow()) {
        console.log('当前不在推送时间窗口内，跳过推送。');
        return 0;
      }
      
      // 获取当前季节
      const currentSeason = mushroomDataService.getCurrentSeason();
      console.log(`当前季节：${currentSeason}`);
      
      // 获取所有用户偏好设置
      const userPreferences = await UserPreference.findAll();
      
      if (userPreferences.length === 0) {
        console.log('没有找到用户偏好设置，跳过推送。');
        return 0;
      }
      
      // 生成推送内容
      const pushContent = await this.generateSeasonalPushContent(currentSeason);
      
      let pushedCount = 0;
      
      // 发送推送
      for (const userPreference of userPreferences) {
        try {
          // 创建通知
          await Notification.create({
            userId: userPreference.userId,
            type: this.pushContentTypes.seasonalInfo,
            title: pushContent.title,
            content: pushContent.content,
            status: 'unread',
            relatedId: null // 无相关实体ID
          });
          
          pushedCount++;
          console.log(`已向用户 ${userPreference.userId} 发送季节信息推送`);
        } catch (error) {
          console.error(`向用户 ${userPreference.userId} 发送季节信息推送失败:`, error);
        }
      }
      
      console.log(`季节信息推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('发送季节信息推送失败:', error);
      throw error;
    }
  }

  /**
   * 发送当季食谱推送
   * @returns {Promise<number>} 推送的用户数
   */
  async sendSeasonalRecipesPush() {
    try {
      console.log('开始发送当季食谱推送...');
      
      // 检查是否在推送时间窗口内
      if (!this.isInPushWindow()) {
        console.log('当前不在推送时间窗口内，跳过推送。');
        return 0;
      }
      
      // 获取当前季节
      const currentSeason = mushroomDataService.getCurrentSeason();
      console.log(`当前季节：${currentSeason}`);
      
      // 获取所有用户偏好设置
      const userPreferences = await UserPreference.findAll();
      
      if (userPreferences.length === 0) {
        console.log('没有找到用户偏好设置，跳过推送。');
        return 0;
      }
      
      let pushedCount = 0;
      
      // 为每个用户生成个性化食谱推荐
      for (const userPreference of userPreferences) {
        try {
          // 获取用户喜爱的蘑菇
          const favoriteMushrooms = userPreference.favoriteMushrooms || [];
          
          let recommendedRecipes = [];
          
          if (favoriteMushrooms.length > 0) {
            // 基于用户喜爱的蘑菇推荐食谱
            recommendedRecipes = await recipeMatchingService.recommendRecipesByUserPreference(
              userPreference,
              { limit: 3 }
            );
          } else {
            // 获取热门食谱
            recommendedRecipes = await recipeMatchingService.getPopularRecipes(3);
          }
          
          if (recommendedRecipes.length > 0) {
            // 生成推送内容
            let recipeContent = '';
            for (const recipe of recommendedRecipes) {
              recipeContent += `\n${recipe.name}\n`;
              recipeContent += `  烹饪难度：${recipe.difficulty}\n`;
              recipeContent += `  烹饪时间：${recipe.totalTime} 分钟\n`;
              recipeContent += `  简介：${recipe.description}\n`;
              
              // 添加营养信息
              if (recipe.nutritionalInfo) {
                recipeContent += `  营养成分：\n`;
                recipeContent += `    - 卡路里：${recipe.nutritionalInfo.calories} 大卡\n`;
                recipeContent += `    - 蛋白质：${recipe.nutritionalInfo.protein}g\n`;
                recipeContent += `    - 脂肪：${recipe.nutritionalInfo.fat}g\n`;
                recipeContent += `    - 碳水化合物：${recipe.nutritionalInfo.carbohydrates}g\n`;
              }
            }
            
            // 创建通知
            await Notification.create({
              userId: userPreference.userId,
              type: this.pushContentTypes.seasonalRecipes,
              title: `${currentSeason}推荐食谱`,
              content: `【${currentSeason}推荐食谱】\n\n根据您的口味偏好，为您推荐以下${currentSeason}食谱：${recipeContent}\n\n更多食谱详情，请访问蘑菇网查看。`,
              status: 'unread',
              relatedId: null
            });
            
            pushedCount++;
            console.log(`已向用户 ${userPreference.userId} 发送当季食谱推送`);
          }
        } catch (error) {
          console.error(`向用户 ${userPreference.userId} 发送当季食谱推送失败:`, error);
        }
      }
      
      console.log(`当季食谱推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('发送当季食谱推送失败:', error);
      throw error;
    }
  }

  /**
   * 发送当季视频推送
   * @returns {Promise<number>} 推送的用户数
   */
  async sendSeasonalVideosPush() {
    try {
      console.log('开始发送当季视频推送...');
      
      // 检查是否在推送时间窗口内
      if (!this.isInPushWindow()) {
        console.log('当前不在推送时间窗口内，跳过推送。');
        return 0;
      }
      
      // 获取当前季节
      const currentSeason = mushroomDataService.getCurrentSeason();
      console.log(`当前季节：${currentSeason}`);
      
      // 获取所有用户偏好设置
      const userPreferences = await UserPreference.findAll();
      
      if (userPreferences.length === 0) {
        console.log('没有找到用户偏好设置，跳过推送。');
        return 0;
      }
      
      let pushedCount = 0;
      
      // 为每个用户生成个性化视频推荐
      for (const userPreference of userPreferences) {
        try {
          // 获取用户喜爱的蘑菇
          const favoriteMushrooms = userPreference.favoriteMushrooms || [];
          
          let recommendedVideos = [];
          
          if (favoriteMushrooms.length > 0) {
            // 基于用户喜爱的蘑菇推荐视频
            recommendedVideos = await cookingVideoService.recommendVideosByMushroom(
              favoriteMushrooms[0],
              { limit: 3, userId: userPreference.userId }
            );
          } else {
            // 获取热门视频
            recommendedVideos = await cookingVideoService.fetchCookingVideos({ limit: 3 });
          }
          
          if (recommendedVideos.length > 0) {
            // 生成推送内容
            let videoContent = '';
            for (const video of recommendedVideos) {
              videoContent += `\n${video.title}\n`;
              videoContent += `  时长：${Math.floor(video.duration / 60)} 分钟\n`;
              videoContent += `  简介：${video.description}\n`;
            }
            
            // 创建通知
            await Notification.create({
              userId: userPreference.userId,
              type: this.pushContentTypes.seasonalVideos,
              title: `${currentSeason}烹饪视频推荐`,
              content: `【${currentSeason}烹饪视频推荐】\n\n根据您的口味偏好，为您推荐以下烹饪视频：${videoContent}\n\n更多视频详情，请访问蘑菇网查看。`,
              status: 'unread',
              relatedId: null
            });
            
            pushedCount++;
            console.log(`已向用户 ${userPreference.userId} 发送当季视频推送`);
          }
        } catch (error) {
          console.error(`向用户 ${userPreference.userId} 发送当季视频推送失败:`, error);
        }
      }
      
      console.log(`当季视频推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('发送当季视频推送失败:', error);
      throw error;
    }
  }

  /**
   * 执行所有季节推送任务
   * @returns {Promise<Object>} 推送结果，包含各类推送的用户数
   */
  async executeAllPushTasks() {
    try {
      console.log('开始执行所有季节推送任务...');
      
      const results = {
        seasonalInfo: 0,
        seasonalRecipes: 0,
        seasonalVideos: 0
      };
      
      // 发送季节信息推送
      results.seasonalInfo = await this.sendSeasonalPush();
      
      // 发送当季食谱推送
      results.seasonalRecipes = await this.sendSeasonalRecipesPush();
      
      // 发送当季视频推送
      results.seasonalVideos = await this.sendSeasonalVideosPush();
      
      console.log('所有季节推送任务执行完成:', results);
      return results;
    } catch (error) {
      console.error('执行季节推送任务失败:', error);
      throw error;
    }
  }

  /**
   * 启动定时推送任务
   * @param {number} interval 推送间隔（毫秒），默认24小时
   */
  startScheduledPush(interval = 86400000) {
    if (this.pushTimer) {
      console.log('定时推送任务已在运行中');
      return;
    }
    
    console.log(`启动季节信息定时推送任务，间隔: ${interval}ms`);
    
    // 立即执行一次
    this.executeAllPushTasks();
    
    // 设置定时任务
    this.pushTimer = setInterval(async () => {
      try {
        await this.executeAllPushTasks();
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
      console.log('季节信息定时推送任务已停止');
    }
  }
}

// 创建并导出季节信息推送服务实例
const seasonalPushService = new SeasonalPushService();

module.exports = seasonalPushService;