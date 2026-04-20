const Mushroom = require('../models/Mushroom');
const SyncLog = require('../models/SyncLog');
const axios = require('axios');
const { sequelize, Op } = require('../config/db');
const logger = require('../utils/logger');

class MushroomDataService {
  constructor() {
    this.officialApiConfig = {
      baseUrl: 'https://api.example-mushroom-db.com/v1',
      apiKey: process.env.MUSHROOM_DB_API_KEY || 'your-api-key',
      updateInterval: 86400000,
      timeout: 30000
    };
    
    this.seasonMapping = {
      'spring': '春季',
      'summer': '夏季',
      'autumn': '秋季',
      'winter': '冬季'
    };
    
    this.isRunning = false;
    this.syncTimer = null;
    
    this.defaultConfig = {
      autoSync: true,
      syncInterval: 86400000,
      syncOnStartup: true,
      enableSeasonFilter: false,
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 100,
      cleanOldData: false,
      syncHistoryRetentionDays: 30
    };
    
    this.currentConfig = { ...this.defaultConfig };
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
          vitamins: { vitaminD: 0.2, vitaminB2: 0.1, vitaminC: 0 },
          minerals: { potassium: 455, phosphorus: 86, iron: 0.8 }
        },
        safetyInfo: '香菇是安全可食用的食用菌，但过敏体质者可能会出现过敏反应。',
        cookingMethods: '炒、炖、煮、蒸、烤等',
        selectionTips: '选择菌盖完整、菌褶紧密、无异味、无腐烂的香菇，储存时应放在阴凉干燥处或冰箱中。',
        season: '秋季,冬季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/xianggu.jpg',
        type: 'common'
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
          vitamins: { vitaminB1: 0.1, vitaminB2: 0.3, vitaminC: 2 },
          minerals: { potassium: 370, phosphorus: 80, iron: 0.9 }
        },
        safetyInfo: '平菇是安全可食用的食用菌，无毒性报告。',
        cookingMethods: '炒、炖、煮、蒸等',
        selectionTips: '选择菌盖完整、菌褶紧密、无异味、无腐烂的平菇，储存时应放在冰箱中，避免潮湿。',
        season: '春季,秋季',
        cultivationDifficulty: 'easy',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/pinggu.jpg',
        type: 'common'
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
          vitamins: { vitaminB1: 0.05, vitaminB2: 0.11, vitaminC: 0 },
          minerals: { potassium: 240, phosphorus: 46, iron: 0.5 }
        },
        safetyInfo: '杏鲍菇是安全可食用的食用菌，无毒性报告。',
        cookingMethods: '炒、煎、烤、炖等',
        selectionTips: '选择菌盖完整、菌柄粗壮、无异味、无腐烂的杏鲍菇，储存时应放在冰箱中，可保存3-5天。',
        season: '秋季,冬季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/xingbao.jpg',
        type: 'common'
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
          vitamins: { vitaminB1: 0.1, vitaminB2: 0.3, vitaminC: 2 },
          minerals: { potassium: 195, phosphorus: 42, iron: 1.4 }
        },
        safetyInfo: '金针菇是安全可食用的食用菌，但未煮熟的金针菇可能会引起肠胃不适，应彻底煮熟后食用。',
        cookingMethods: '炒、煮、涮、烤等',
        selectionTips: '选择菌柄细长、菌盖小、颜色均匀、无异味的金针菇，储存时应放在冰箱中，可保存3-5天。',
        season: '冬季,春季',
        cultivationDifficulty: 'medium',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/jinzhen.jpg',
        type: 'common'
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
          vitamins: { vitaminB1: 0.1, vitaminB2: 0.1, vitaminC: 4 },
          minerals: { potassium: 530, phosphorus: 85, iron: 1.1 }
        },
        safetyInfo: '猴头菇是安全可食用的食用菌，具有较高的营养价值和药用价值。',
        cookingMethods: '炖、煮、蒸、炒等',
        selectionTips: '选择菌刺密集、颜色洁白、无异味、无腐烂的猴头菇，储存时应放在阴凉干燥处或冰箱中。',
        season: '春季,夏季',
        cultivationDifficulty: 'hard',
        category: '食用菇',
        dataSource: '中国食用菌协会',
        image: '/mushrooms/houtou.jpg',
        type: 'common'
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
      let failedCount = 0;
      
      for (const mushroom of mushroomData) {
        try {
          const existingMushroom = await Mushroom.findOne({
            where: { name: mushroom.name }
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
        } catch (error) {
          failedCount++;
          logger.error('MushroomData', `更新蘑菇失败: ${mushroom.name}`, error);
        }
      }
      
      logger.success('MushroomData', `蘑菇数据库更新完成`, { createdCount, updatedCount, failedCount });
      return { createdCount, updatedCount, failedCount, totalCount: mushroomData.length };
    } catch (error) {
      logger.error('MushroomData', '更新本地蘑菇数据库失败', error);
      throw error;
    }
  }

  async createSyncLog(syncType) {
    try {
      const log = await SyncLog.create({
        syncType,
        status: 'running',
        startAt: new Date(),
        syncConfig: JSON.stringify(this.currentConfig)
      });
      return log;
    } catch (error) {
      console.warn('[SyncLog] 无法创建同步日志，表可能不存在:', error.message);
      return null;
    }
  }

  async updateSyncLog(logId, result) {
    if (!logId) return;
    
    try {
      const endAt = new Date();
      const duration = endAt.getTime() - result.startAt.getTime();
      
      await SyncLog.update({
        status: result.success ? 'success' : 'failed',
        endAt,
        duration,
        totalCount: result.totalCount || 0,
        createdCount: result.createdCount || 0,
        updatedCount: result.updatedCount || 0,
        failedCount: result.failedCount || 0,
        errorMessage: result.errorMessage || null,
        notes: result.notes || null
      }, {
        where: { id: logId }
      });
    } catch (error) {
      console.warn('[SyncLog] 无法更新同步日志:', error.message);
    }
  }

  async cleanOldLogs() {
    const retentionDays = this.currentConfig.syncHistoryRetentionDays;
    if (retentionDays <= 0) return;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      await SyncLog.destroy({
        where: {
          createdAt: { [Op.lt]: cutoffDate }
        }
      });
      
      logger.info('MushroomData', `清理了 ${retentionDays} 天前的同步日志`);
    } catch (error) {
      console.warn('[SyncLog] 无法清理旧日志:', error.message);
    }
  }

  async getSyncHistory(options = {}) {
    try {
      const { 
        syncType = null, 
        status = null, 
        page = 1, 
        limit = 20,
        startDate = null,
        endDate = null 
      } = options;
      
      const where = {};
      
      if (syncType) where.syncType = syncType;
      if (status) where.status = status;
      if (startDate) where.startAt = { [Op.gte]: startDate };
      if (endDate) where.startAt = { ...where.startAt, [Op.lte]: endDate };
      
      const result = await SyncLog.findAndCountAll({
        where,
        order: [['startAt', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });
      
      return {
        logs: result.rows,
        total: result.count,
        page,
        limit
      };
    } catch (error) {
      console.warn('[SyncLog] 无法获取同步历史:', error.message);
      return { logs: [], total: 0, page: 1, limit: 20 };
    }
  }

  async getSyncStatistics(syncType = null) {
    try {
      const where = syncType ? { syncType } : {};
      
      const stats = await SyncLog.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration'],
          [sequelize.fn('SUM', sequelize.col('totalCount')), 'totalRecords'],
          [sequelize.fn('SUM', sequelize.col('createdCount')), 'totalCreated'],
          [sequelize.fn('SUM', sequelize.col('updatedCount')), 'totalUpdated']
        ],
        group: ['status'],
        raw: true
      });
      
      const result = {};
      let totalCount = 0;
      
      stats.forEach(stat => {
        result[stat.status] = {
          count: parseInt(stat.count),
          avgDuration: parseFloat(stat.avgDuration) || 0,
          totalRecords: parseInt(stat.totalRecords) || 0,
          totalCreated: parseInt(stat.totalCreated) || 0,
          totalUpdated: parseInt(stat.totalUpdated) || 0
        };
        totalCount += parseInt(stat.count);
      });
      
      result.total = totalCount;
      
      const recentLogs = await SyncLog.findAll({
        where,
        order: [['startAt', 'DESC']],
        limit: 5
      });
      
      return { statistics: result, recentLogs };
    } catch (error) {
      console.warn('[SyncLog] 无法获取同步统计:', error.message);
      return { statistics: { total: 0 }, recentLogs: [] };
    }
  }

  async getLastSyncInfo(syncType = null) {
    try {
      const where = syncType ? { syncType } : {};
      
      const lastLog = await SyncLog.findOne({
        where,
        order: [['startAt', 'DESC']]
      });
      
      if (!lastLog) {
        return null;
      }
      
      return {
        id: lastLog.id,
        syncType: lastLog.syncType,
        status: lastLog.status,
        startAt: lastLog.startAt,
        endAt: lastLog.endAt,
        duration: lastLog.duration,
        totalCount: lastLog.totalCount,
        createdCount: lastLog.createdCount,
        updatedCount: lastLog.updatedCount,
        failedCount: lastLog.failedCount,
        errorMessage: lastLog.errorMessage
      };
    } catch (error) {
      console.warn('[SyncLog] 无法获取最后同步信息:', error.message);
      return null;
    }
  }

  async configureFromHistory(options = {}) {
    const { 
      autoAdjustInterval = false,
      targetSuccessRate = 0.95,
      minInterval = 3600000,
      maxInterval = 604800000
    } = options;
    
    const stats = await this.getSyncStatistics('mushroom_data');
    const { success, failed } = stats.statistics;
    
    if (autoAdjustInterval && success) {
      const successRate = success.count / (success.count + (failed?.count || 0));
      
      if (successRate < targetSuccessRate) {
        this.currentConfig.syncInterval = Math.min(
          this.currentConfig.syncInterval * 2,
          maxInterval
        );
        logger.warn('MushroomData', `同步成功率低于目标(${successRate.toFixed(2)} < ${targetSuccessRate})，已调整同步间隔为 ${this.currentConfig.syncInterval}ms`);
      } else if (successRate >= targetSuccessRate && success.avgDuration < 30000) {
        this.currentConfig.syncInterval = Math.max(
          this.currentConfig.syncInterval / 2,
          minInterval
        );
        logger.info('MushroomData', `同步成功率达标且速度快，已调整同步间隔为 ${this.currentConfig.syncInterval}ms`);
      }
    }
    
    if (this.syncTimer) {
      this.stopScheduledSync();
      this.startScheduledSync(this.currentConfig.syncInterval);
    }
    
    return {
      success: true,
      message: '已根据历史记录重新配置同步参数',
      config: this.currentConfig,
      statistics: stats
    };
  }

  updateConfig(newConfig) {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    
    if (this.syncTimer && newConfig.syncInterval !== undefined) {
      this.stopScheduledSync();
      this.startScheduledSync(this.currentConfig.syncInterval);
    }
    
    logger.info('MushroomData', '同步配置已更新', this.currentConfig);
    return { success: true, config: this.currentConfig };
  }

  getConfig() {
    return { ...this.currentConfig };
  }

  async executeUpdate() {
    if (this.isRunning) {
      logger.warn('MushroomData', '蘑菇数据更新任务已在运行中，跳过本次执行');
      return { success: false, message: '更新任务已在运行中' };
    }
    
    const syncLog = await this.createSyncLog('mushroom_data');
    const startTime = new Date();
    
    try {
      this.isRunning = true;
      logger.info('MushroomData', '开始执行蘑菇数据更新任务');
      
      let mushroomData;
      if (this.currentConfig.enableSeasonFilter) {
        const currentSeason = this.getCurrentSeason();
        logger.debug('MushroomData', `当前季节: ${currentSeason}，启用季节过滤`);
        mushroomData = await this.fetchMushroomData(currentSeason);
      } else {
        mushroomData = await this.fetchMushroomData();
      }
      
      const updateResult = await this.updateLocalDatabase(mushroomData);
      
      await this.updateSyncLog(syncLog.id, {
        ...updateResult,
        success: true,
        startAt: startTime
      });
      
      await this.cleanOldLogs();
      
      logger.success('MushroomData', '蘑菇数据更新任务执行完成');
      
      return {
        success: true,
        message: '蘑菇数据更新完成',
        syncLogId: syncLog.id,
        ...updateResult
      };
    } catch (error) {
      logger.error('MushroomData', '执行蘑菇数据更新任务失败', error);
      
      await this.updateSyncLog(syncLog.id, {
        success: false,
        startAt: startTime,
        errorMessage: error.message,
        notes: '同步任务异常终止'
      });
      
      return {
        success: false,
        message: `更新失败: ${error.message}`,
        syncLogId: syncLog.id
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
          [Op.or]: [
            { season: targetSeason },
            { season: sequelize.where(sequelize.fn('CONCAT', ',', sequelize.col('season'), ','), Op.like, `%,${targetSeason},%`) }
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

  startScheduledSync(interval = null) {
    if (this.syncTimer) {
      logger.warn('MushroomData', '定时同步任务已在运行中');
      return;
    }
    
    const syncInterval = interval || this.currentConfig.syncInterval;
    this.currentConfig.syncInterval = syncInterval;
    
    logger.info('MushroomData', `启动蘑菇数据定时同步任务，间隔: ${syncInterval}ms`);
    
    if (this.currentConfig.syncOnStartup) {
      this.executeUpdate();
    }
    
    this.syncTimer = setInterval(async () => {
      try {
        await this.executeUpdate();
      } catch (error) {
        logger.error('MushroomData', '定时同步任务执行失败', error);
      }
    }, syncInterval);
  }

  stopScheduledSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      logger.info('MushroomData', '蘑菇数据定时同步任务已停止');
    }
  }

  async resetToDefault() {
    this.currentConfig = { ...this.defaultConfig };
    
    if (this.syncTimer) {
      this.stopScheduledSync();
      this.startScheduledSync(this.currentConfig.syncInterval);
    }
    
    logger.info('MushroomData', '同步配置已重置为默认值');
    return { success: true, config: this.currentConfig };
  }
}

const mushroomDataService = new MushroomDataService();

module.exports = mushroomDataService;