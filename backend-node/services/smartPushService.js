const UserBoxOrder = require('../models/UserBoxOrder');
const UserPreference = require('../models/UserPreference');
const Notification = require('../models/Notification');
const recipeMatchingService = require('./recipeMatchingService');
const cookingVideoService = require('./cookingVideoService');
const { Op } = require('sequelize');

/**
 * 智能推送服务类 - 基于盲盒和用户偏好的个性化推送
 */
class SmartPushService {
  constructor() {
    // 推送配置
    this.pushConfig = {
      // 推送频率（毫秒）
      frequency: {
        boxBasedRecipes: 86400000, // 每天一次（基于盲盒内容的食谱推荐）
        personalizedVideos: 172800000, // 每两天一次（个性化视频推荐）
        seasonalReminders: 604800000 // 每周一次（季节性提醒）
      },
      // 推送时间窗口（小时）
      pushWindow: {
        start: 9,  // 上午9点
        end: 21    // 晚上9点
      },
      // 推送渠道
      channels: {
        inApp: true,
        email: true,
        browser: true
      }
    };
    
    // 推送内容模板
    this.templates = {
      boxRecipes: {
        title: '您的盲盒食谱推荐',
        template: '【盲盒食谱推荐】\n\n根据您订阅的"%s"盲盒，为您精心挑选了以下食谱：\n\n%s\n\n%s\n\n点击查看详情，开启美味之旅！'
      },
      personalVideos: {
        title: '为您定制的烹饪视频',
        template: '【个性化烹饪视频】\n\n根据您的口味偏好，推荐以下精彩视频：\n\n%s\n\n%s\n\n立即观看，提升厨艺！'
      },
      seasonal: {
        title: '季节美食提醒',
        template: '【季节美食提醒】\n\n%s季节到了，为您推荐时令美味：\n\n%s\n\n%s\n\n快来试试吧！'
      }
    };
    
    // 内容类型标识
    this.contentTypes = {
      boxRecipes: 'box_recipes',
      personalVideos: 'personal_videos',
      seasonal: 'seasonal_reminder'
    };
  }

  /**
   * 检查当前是否在推送时间窗口内
   * @returns {boolean}
   */
  isInPushWindow() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.pushConfig.pushWindow.start && 
           currentHour <= this.pushConfig.pushWindow.end;
  }

  /**
   * 获取当前季节
   * @returns {string}
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  }

  /**
   * 基于盲盒内容推送食谱推荐
   * @returns {Promise<number>} 推送的用户数
   */
  async pushBoxBasedRecipes() {
    try {
      console.log('开始推送基于盲盒的食谱推荐...');
      
      if (!this.isInPushWindow()) {
        console.log('当前不在推送时间窗口内，跳过推送。');
        return 0;
      }

      // 获取最近订阅盲盒的用户订单（过去7天内）
      const recentOrders = await UserBoxOrder.findAll({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          status: 'completed'
        },
        include: [
          {
            model: require('../models/MushroomBox'),
            as: 'box',
            include: [{
              model: require('../models/MushroomBoxItem'),
              as: 'items',
              include: [{ model: require('../models/Mushroom'), as: 'mushroom' }]
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      if (recentOrders.length === 0) {
        console.log('没有找到近期的盲盒订单，跳过推送。');
        return 0;
      }

      let pushedCount = 0;
      const processedUsers = new Set();

      // 为每个用户的最新盲盒订单生成推荐
      for (const order of recentOrders) {
        const userId = order.userId;
        
        // 避免重复推送给同一用户
        if (processedUsers.has(userId)) continue;
        processedUsers.add(userId);

        try {
          // 获取用户偏好
          const userPreference = await UserPreference.findOne({
            where: { userId }
          });

          // 获取盲盒中的菌菇
          const mushrooms = order.box.items.map(item => item.mushroom);
          const mushroomNames = mushrooms.map(m => m.name);

          // 基于盲盒内容推荐食谱
          const recommendedRecipes = await recipeMatchingService.recommendRecipesByUserPreference(userId, {
            limit: 3,
            mushroomIds: mushrooms.map(m => m.id)
          });

          if (recommendedRecipes.length > 0) {
            // 生成食谱推荐内容
            let recipeContent = '';
            for (const recipe of recommendedRecipes) {
              recipeContent += `\n🍳 ${recipe.name}\n`;
              recipeContent += `   难度：${this.getDifficultyText(recipe.difficulty)}\n`;
              recipeContent += `   时长：${recipe.totalTime || (recipe.prepTime + recipe.cookTime)}分钟\n`;
              recipeContent += `   匹配菌菇：${recipe.mushroomMatches?.join('、') || '多种菌菇'}\n`;
            }

            // 生成个性化建议
            const suggestion = this.generatePersonalizedSuggestion(userPreference, mushrooms);

            // 创建推送通知
            await Notification.create({
              userId,
              type: this.contentTypes.boxRecipes,
              title: this.templates.boxRecipes.title,
              content: util.format(
                this.templates.boxRecipes.template,
                order.box.name,
                recipeContent,
                suggestion
              ),
              status: 'unread',
              relatedId: order.box.id,
              metadata: {
                boxId: order.box.id,
                recipeIds: recommendedRecipes.map(r => r.id),
                mushroomNames: mushroomNames
              }
            });

            pushedCount++;
            console.log(`已向用户 ${userId} 推送盲盒食谱推荐`);
          }
        } catch (error) {
          console.error(`向用户 ${userId} 推送失败:`, error);
        }
      }

      console.log(`盲盒食谱推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('推送基于盲盒的食谱推荐失败:', error);
      throw error;
    }
  }

  /**
   * 推送个性化烹饪视频
   * @returns {Promise<number>} 推送的用户数
   */
  async pushPersonalizedVideos() {
    try {
      console.log('开始推送个性化烹饪视频...');
      
      if (!this.isInPushWindow()) {
        console.log('当前不在推送时间窗口内，跳过推送。');
        return 0;
      }

      // 获取所有用户偏好
      const userPreferences = await UserPreference.findAll();

      if (userPreferences.length === 0) {
        console.log('没有用户偏好数据，跳过推送。');
        return 0;
      }

      let pushedCount = 0;

      for (const preference of userPreferences) {
        try {
          const userId = preference.userId;
          
          // 基于用户偏好推荐视频
          let recommendedVideos = [];
          
          if (preference.favoriteMushrooms && preference.favoriteMushrooms.length > 0) {
            // 基于喜爱的菌菇推荐
            recommendedVideos = await cookingVideoService.recommendVideosByMushroom(
              preference.favoriteMushrooms[0],
              { userId, limit: 2 }
            );
          } else {
            // 基于口味偏好推荐
            recommendedVideos = await cookingVideoService.recommendVideosByUserPreference(
              preference,
              { limit: 2 }
            );
          }

          if (recommendedVideos.length > 0) {
            // 生成视频推荐内容
            let videoContent = '';
            for (const video of recommendedVideos) {
              videoContent += `\n🎥 ${video.title}\n`;
              videoContent += `   时长：${this.formatDuration(video.duration)}\n`;
              videoContent += `   匹配度：${video.totalScore || video.preferenceScore}分\n`;
            }

            // 生成个性化文案
            const personalMessage = this.generateVideoPersonalMessage(preference);

            // 创建推送通知
            await Notification.create({
              userId,
              type: this.contentTypes.personalVideos,
              title: this.templates.personalVideos.title,
              content: util.format(
                this.templates.personalVideos.template,
                videoContent,
                personalMessage
              ),
              status: 'unread',
              metadata: {
                videoIds: recommendedVideos.map(v => v.id),
                preference: {
                  cookingSkill: preference.cookingSkill,
                  tastePreferences: preference.tastePreferences
                }
              }
            });

            pushedCount++;
            console.log(`已向用户 ${userId} 推送个性化视频推荐`);
          }
        } catch (error) {
          console.error(`向用户 ${preference.userId} 推送视频失败:`, error);
        }
      }

      console.log(`个性化视频推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('推送个性化视频失败:', error);
      throw error;
    }
  }

  /**
   * 推送季节性提醒
   * @returns {Promise<number>} 推送的用户数
   */
  async pushSeasonalReminders() {
    try {
      console.log('开始推送季节性提醒...');
      
      const currentSeason = this.getCurrentSeason();
      console.log(`当前季节：${currentSeason}`);

      // 获取所有用户
      const users = await require('../models/User').findAll({
        attributes: ['id']
      });

      let pushedCount = 0;

      for (const user of users) {
        try {
          // 获取季节性推荐内容
          const seasonalContent = await this.generateSeasonalContent(currentSeason);
          
          if (seasonalContent) {
            await Notification.create({
              userId: user.id,
              type: this.contentTypes.seasonal,
              title: `${currentSeason}${this.templates.seasonal.title}`,
              content: util.format(
                this.templates.seasonal.template,
                currentSeason,
                seasonalContent.recipes,
                seasonalContent.tips
              ),
              status: 'unread',
              metadata: {
                season: currentSeason,
                contentType: 'seasonal_reminder'
              }
            });

            pushedCount++;
          }
        } catch (error) {
          console.error(`向用户 ${user.id} 推送季节提醒失败:`, error);
        }
      }

      console.log(`季节性提醒推送完成，共推送 ${pushedCount} 个用户`);
      return pushedCount;
    } catch (error) {
      console.error('推送季节性提醒失败:', error);
      throw error;
    }
  }

  /**
   * 获取难度文本
   * @param {string} difficulty 
   * @returns {string}
   */
  getDifficultyText(difficulty) {
    const map = {
      'beginner': '入门级',
      'intermediate': '中级',
      'advanced': '高级'
    };
    return map[difficulty] || difficulty;
  }

  /**
   * 格式化时长
   * @param {number} seconds 
   * @returns {string}
   */
  formatDuration(seconds) {
    if (!seconds) return '0分钟';
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}分钟`;
  }

  /**
   * 生成个性化建议
   * @param {Object} preference 用户偏好
   * @param {Array} mushrooms 菌菇列表
   * @returns {string}
   */
  generatePersonalizedSuggestion(preference, mushrooms) {
    let suggestions = [];
    
    if (preference && preference.cookingSkill === 'beginner') {
      suggestions.push('💡 新手友好：这些食谱步骤简单，适合初学者练习');
    }
    
    if (mushrooms.length > 1) {
      suggestions.push('🍄 多菌搭配：充分利用您盲盒中的多种菌菇，营养更丰富');
    }
    
    if (preference && preference.tastePreferences) {
      const likedTastes = Object.keys(preference.tastePreferences)
        .filter(taste => preference.tastePreferences[taste]);
      if (likedTastes.length > 0) {
        suggestions.push(`👍 符合您的口味偏好：${likedTastes.join('、')}风味`);
      }
    }
    
    return suggestions.join('\n') || '✨ 精选推荐，祝您烹饪愉快！';
  }

  /**
   * 生成视频个性化消息
   * @param {Object} preference 用户偏好
   * @returns {string}
   */
  generateVideoPersonalMessage(preference) {
    const messages = [
      '📺 精选视频，助您成为厨房达人',
      '👨‍🍳 跟着视频学，轻松掌握烹饪技巧',
      '🔥 热门教程，不容错过'
    ];
    
    if (preference && preference.cookingSkill === 'beginner') {
      return '🎯 专为新手挑选的易学视频，一步步跟着做';
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 生成季节性内容
   * @param {string} season 季节
   * @returns {Promise<Object|null>}
   */
  async generateSeasonalContent(season) {
    try {
      // 获取当季热门食谱
      const popularRecipes = await recipeMatchingService.getPopularRecipes(3);
      
      if (popularRecipes.length === 0) return null;
      
      let recipeList = '推荐时令美食：\n';
      popularRecipes.forEach((recipe, index) => {
        recipeList += `\n${index + 1}. ${recipe.name}\n`;
        recipeList += `   烹饪难度：${this.getDifficultyText(recipe.difficulty)}\n`;
      });
      
      const tips = {
        '春季': '🌱 春季宜清淡，多选用新鲜蔬菜搭配',
        '夏季': '❄️ 夏季炎热，推荐凉拌、清蒸等清爽做法',
        '秋季': '🍂 秋季干燥，适合炖煮滋补类菜品',
        '冬季': '🔥 冬季寒冷，推荐温热的煲汤和炖菜'
      }[season] || '✨ 应季而食，享受自然美味';
      
      return {
        recipes: recipeList,
        tips: tips
      };
    } catch (error) {
      console.error('生成季节性内容失败:', error);
      return null;
    }
  }

  /**
   * 启动定时推送任务
   */
  startScheduledPush() {
    console.log('启动智能推送服务...');
    
    // 基于盲盒的食谱推荐（每天上午10点）
    setInterval(async () => {
      try {
        await this.pushBoxBasedRecipes();
      } catch (error) {
        console.error('定时推送盲盒食谱失败:', error);
      }
    }, this.pushConfig.frequency.boxBasedRecipes);
    
    // 个性化视频推荐（每两天上午11点）
    setInterval(async () => {
      try {
        await this.pushPersonalizedVideos();
      } catch (error) {
        console.error('定时推送个性化视频失败:', error);
      }
    }, this.pushConfig.frequency.personalizedVideos);
    
    // 季节性提醒（每周一上午9点）
    setInterval(async () => {
      try {
        await this.pushSeasonalReminders();
      } catch (error) {
        console.error('定时推送季节提醒失败:', error);
      }
    }, this.pushConfig.frequency.seasonalReminders);
    
    console.log('智能推送服务已启动');
  }
}

// 创建并导出智能推送服务实例
const smartPushService = new SmartPushService();

module.exports = smartPushService;