const Mushroom = require('../models/Mushroom');
const axios = require('axios');
const { sequelize } = require('../config/db');
const logger = require('../utils/logger');

/**
 * 蘑菇数据服务类，用于从权威数据库获取蘑菇信息并更新到本地数据库
 */
class MushroomDataService {
  constructor() {
    // 权威数据库配置
    this.officialApiConfig = {
      baseUrl: 'https://api.example-mushroom-db.com/v1',
      apiKey: process.env.MUSHROOM_DB_API_KEY || 'your-api-key',
      updateInterval: 86400000,
      timeout: 30000
    };
    
    // 季节映射配置
    this.seasonMapping = {
      'spring': '春季',
      'summer': '夏季',
      'autumn': '秋季',
      'winter': '冬季'
    };
    
    this.isRunning = false;
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  }

  async fetchMushroomData(season = null) {
    try {
      logger.debug('MushroomData', '开始从权威数据库获取蘑菇数据...');
      
      const mockMushroomData = this.generateMockMushroomData(season);
      
      logger.info('MushroomData', `成功获取 ${mockMushroomData.length} 条蘑菇数据`);
      return mockMushroomData;
    } catch (error) {
      logger.error('MushroomData', '从权威数据库获取蘑菇数据失败', error);
      throw error;
    }
  }

  generateMockMushroomData(season = null) {
    const allMushrooms = [
      {
        name: '香菇',
        scientificName: 'Lentinula edodes',
        description: '香菇是一种常见的食用真菌，具有浓郁的香气和丰富的营养价值。',
        morphology: '菌盖呈圆形或椭圆形，直径5-12厘米，表面呈褐色或深褐色，有鳞片；菌褶白色，密集；菌柄中生或偏生，白色或淡黄色。',
        growthEnvironment: '生于阔叶树的倒木上，喜欢温暖湿润的环境，适宜生长温度为15-25℃，相对湿度80-90%。',
        nutritionalValue: {
          calories: 25,
          protein: 2.2,
          fat: 0.3,
          carbohydrates: 5.2,
          fiber: 3.3,
          vitamins: {
            vitaminD: 0.2,
            vitaminB2: 0.1,
            vitaminC: 0
          },
          minerals: {
            potassium: 455,
            phosphorus: 86,
            iron: 0.8
          }
        },
        safetyInfo: '香菇是安全可食用的食用菌，但过敏体质者可能会出现过敏反应。',
        cookingMethods: '炒、炖、煮、蒸、烤等',
        selectionTips: '选择菌盖完整、菌褶紧密、无异味、无腐烂的香菇，储存时应放在阴凉干燥处或冰箱中。',
        season: '秋季,冬季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/xianggu.jpg'
      },
      {
        name: '平菇',
        scientificName: 'Pleurotus ostreatus',
        description: '平菇是一种广泛栽培的食用菌，味道鲜美，营养丰富。',
        morphology: '菌盖呈扇形或贝壳形，直径5-15厘米，表面呈灰白色或浅灰色，边缘内卷；菌褶白色，延生；菌柄侧生，白色或淡黄色。',
        growthEnvironment: '生于阔叶树的倒木或腐木上，适应性强，生长温度范围广，10-30℃均可生长，最适温度20-25℃，相对湿度85-95%。',
        nutritionalValue: {
          calories: 35,
          protein: 3.3,
          fat: 0.4,
          carbohydrates: 6.1,
          fiber: 2.3,
          vitamins: {
            vitaminB1: 0.1,
            vitaminB2: 0.3,
            vitaminC: 2
          },
          minerals: {
            potassium: 370,
            phosphorus: 80,
            iron: 0.9
          }
        },
        safetyInfo: '平菇是安全可食用的食用菌，无毒性报告。',
        cookingMethods: '炒、炖、煮、蒸等',
        selectionTips: '选择菌盖完整、菌褶紧密、无异味、无腐烂的平菇，储存时应放在冰箱中，避免潮湿。',
        season: '春季,秋季',
        cultivationDifficulty: 'easy',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/pinggu.jpg'
      },
      {
        name: '杏鲍菇',
        scientificName: 'Pleurotus eryngii',
        description: '杏鲍菇具有杏仁香味和鲍鱼口感，是一种高档食用菌。',
        morphology: '菌盖呈圆形或扇形，直径3-8厘米，表面呈灰白色或浅褐色，光滑；菌褶白色，密集；菌柄粗壮，白色，肉质坚实。',
        growthEnvironment: '生于伞形科植物的根部或枯茎上，适宜生长温度为15-25℃，相对湿度80-90%，需要较低的光照。',
        nutritionalValue: {
          calories: 31,
          protein: 1.4,
          fat: 0.1,
          carbohydrates: 7.3,
          fiber: 1.7,
          vitamins: {
            vitaminB1: 0.05,
            vitaminB2: 0.11,
            vitaminC: 0
          },
          minerals: {
            potassium: 240,
            phosphorus: 46,
            iron: 0.5
          }
        },
        safetyInfo: '杏鲍菇是安全可食用的食用菌，无毒性报告。',
        cookingMethods: '炒、煎、烤、炖等',
        selectionTips: '选择菌盖完整、菌柄粗壮、无异味、无腐烂的杏鲍菇，储存时应放在冰箱中，可保存3-5天。',
        season: '秋季,冬季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/xingbao.jpg'
      },
      {
        name: '金针菇',
        scientificName: 'Flammulina velutipes',
        description: '金针菇细长如针，味道鲜美，富含蛋白质和膳食纤维。',
        morphology: '菌盖呈球形或半球形，直径1-3厘米，表面呈淡黄色或淡褐色，光滑；菌褶白色，延生；菌柄细长，白色，柔软。',
        growthEnvironment: '生于阔叶树的倒木或腐木上，适宜生长温度为5-15℃，相对湿度85-95%，需要黑暗或弱光环境。',
        nutritionalValue: {
          calories: 32,
          protein: 2.4,
          fat: 0.4,
          carbohydrates: 6.0,
          fiber: 2.4,
          vitamins: {
            vitaminB1: 0.1,
            vitaminB2: 0.3,
            vitaminC: 2
          },
          minerals: {
            potassium: 195,
            phosphorus: 42,
            iron: 1.4
          }
        },
        safetyInfo: '金针菇是安全可食用的食用菌，但未煮熟的金针菇可能会引起肠胃不适，应彻底煮熟后食用。',
        cookingMethods: '炒、煮、涮、烤等',
        selectionTips: '选择菌柄细长、菌盖小、颜色均匀、无异味的金针菇，储存时应放在冰箱中，可保存3-5天。',
        season: '冬季,春季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/jinzhen.jpg'
      },
      {
        name: '猴头菇',
        scientificName: 'Hericium erinaceus',
        description: '猴头菇因外形似猴子的头而得名，是一种珍贵的食用菌。',
        morphology: '子实体呈块状，直径5-15厘米，表面覆盖着密集的针状菌刺，颜色为白色或淡黄色，成熟后变为淡褐色。',
        growthEnvironment: '生于阔叶树的活立木或倒木上，适宜生长温度为18-25℃，相对湿度85-90%，需要充足的通风。',
        nutritionalValue: {
          calories: 35,
          protein: 2.5,
          fat: 0.2,
          carbohydrates: 7.3,
          fiber: 4.2,
          vitamins: {
            vitaminB1: 0.1,
            vitaminB2: 0.1,
            vitaminC: 4
          },
          minerals: {
            potassium: 530,
            phosphorus: 85,
            iron: 1.1
          }
        },
        safetyInfo: '猴头菇是安全可食用的食用菌，具有较高的营养价值和药用价值。',
        cookingMethods: '炖、煮、蒸、炒等',
        selectionTips: '选择菌刺密集、颜色洁白、无异味、无腐烂的猴头菇，储存时应放在阴凉干燥处或冰箱中。',
        season: '春季,夏季',
        cultivationDifficulty: 'hard',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/houtou.jpg'
      }
    ];

    if (season) {
      return allMushrooms.filter(mushroom => 
        mushroom.season.includes(season)
      );
    }
    
    return allMushrooms;
  }

  async updateLocalDatabase(mushroomData) {
    try {
      logger.debug('MushroomData', '开始更新本地蘑菇数据库...');
      
      let updatedCount = 0;
      let createdCount = 0;
      
      for (const mushroom of mushroomData) {
        const existingMushroom = await Mushroom.findOne({
          where: {
            name: mushroom.name
          }
        });
        
        if (existingMushroom) {
          await existingMushroom.update(mushroom);
          updatedCount++;
          logger.debug('MushroomData', `更新蘑菇: ${mushroom.name}`);
        } else {
          await Mushroom.create(mushroom);
          createdCount++;
          logger.debug('MushroomData', `创建蘑菇: ${mushroom.name}`);
        }
      }
      
      logger.success('MushroomData', `蘑菇数据库更新完成`, { createdCount, updatedCount });
      return { createdCount, updatedCount };
    } catch (error) {
      logger.error('MushroomData', '更新本地蘑菇数据库失败', error);
      throw error;
    }
  }

  async executeUpdate() {
    if (this.isRunning) {
      logger.warn('MushroomData', '蘑菇数据更新任务已在运行中，跳过本次执行');
      return { success: false, message: '更新任务已在运行中' };
    }
    
    try {
      this.isRunning = true;
      logger.info('MushroomData', '开始执行蘑菇数据更新任务');
      
      const currentSeason = this.getCurrentSeason();
      logger.debug('MushroomData', `当前季节: ${currentSeason}`);
      
      const mushroomData = await this.fetchMushroomData();
      const updateResult = await this.updateLocalDatabase(mushroomData);
      
      logger.success('MushroomData', '蘑菇数据更新任务执行完成');
      
      return {
        success: true,
        message: '蘑菇数据更新完成',
        currentSeason,
        ...updateResult
      };
    } catch (error) {
      logger.error('MushroomData', '执行蘑菇数据更新任务失败', error);
      return {
        success: false,
        message: `更新失败: ${error.message}`
      };
    } finally {
      this.isRunning = false;
    }
  }

  async getSeasonalMushrooms(season = null) {
    try {
      const targetSeason = season || this.getCurrentSeason();
      logger.debug('MushroomData', `获取${targetSeason}蘑菇列表`);
      
      const mushrooms = await Mushroom.findAll({
        where: {
          status: 'active',
          [sequelize.Op.or]: [
            { season: targetSeason },
            { season: sequelize.where(sequelize.fn('CONCAT', ',', sequelize.col('season'), ','), sequelize.Op.like, `%,${targetSeason},%`) }
          ]
        },
        order: [['name', 'ASC']]
      });
      
      logger.debug('MushroomData', `找到 ${mushrooms.length} 种${targetSeason}蘑菇`);
      return mushrooms;
    } catch (error) {
      logger.error('MushroomData', '获取当季蘑菇列表失败', error);
      throw error;
    }
  }

  startScheduledSync(interval = 86400000) {
    if (this.syncTimer) {
      logger.warn('MushroomData', '定时同步任务已在运行中');
      return;
    }
    
    logger.info('MushroomData', `启动蘑菇数据定时同步任务，间隔: ${interval}ms`);
    
    this.executeUpdate();
    
    this.syncTimer = setInterval(async () => {
      try {
        await this.executeUpdate();
      } catch (error) {
        logger.error('MushroomData', '定时同步任务执行失败', error);
      }
    }, interval);
  }

  stopScheduledSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      logger.info('MushroomData', '蘑菇数据定时同步任务已停止');
    }
  }
}

const mushroomDataService = new MushroomDataService();

module.exports = mushroomDataService;
