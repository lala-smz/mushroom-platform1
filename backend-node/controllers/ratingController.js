const { Op } = require('sequelize');
const WorkRating = require('../models/WorkRating');
const RatingWeight = require('../models/RatingWeight');
const RatingHistory = require('../models/RatingHistory');
const UserTasteHistory = require('../models/UserTasteHistory');
const Work = require('../models/Work');
const User = require('../models/User');

// 导入Socket.IO实例
const { io } = require('../app');


// 评分控制器
class RatingController {
  // 提交评分
  static async submitRating(req, res) {
    try {
      const { workId, rating, comment } = req.body;
      const userId = req.user.id;

      // 验证用户ID
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '用户未认证'
        });
      }

      // 验证参数
      if (!workId || rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: '无效的评分参数'
        });
      }

      // 转换评分为整数
      const integerRating = Math.round(parseFloat(rating));

      // 检查作品是否存在
      const work = await Work.findByPk(workId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 注释掉品尝历史检查，允许任何用户评分
      // 检查用户是否品尝过该菜肴
      // const tasteHistory = await UserTasteHistory.findOne({
      //   where: { userId, workId }
      // });
      // if (!tasteHistory) {
      //   return res.status(403).json({
      //     success: false,
      //     error: '只有品尝过该菜肴的用户才能评分'
      //   });
      // }

      // 检查是否已经评分
      let existingRating = await WorkRating.findOne({
        where: { userId, workId }
      });

      if (existingRating) {
        // 更新评分
        existingRating.rating = integerRating;
        existingRating.comment = comment;
        existingRating.isActive = true;
        await existingRating.save();
        
        // 检测异常评分
        await RatingController.detectAbnormalRating(existingRating);

        // 更新作品评分
        await RatingController.updateWorkRating(workId);

        // 广播排行榜更新事件
        try {
          // 只向订阅了相关排行榜的客户端广播更新
          io.to('ranking:daily').emit('ranking:update', {
            workId,
            ratingType: 'daily',
            timestamp: new Date().toISOString()
          });
          io.to('ranking:weekly').emit('ranking:update', {
            workId,
            ratingType: 'weekly',
            timestamp: new Date().toISOString()
          });
          io.to('ranking:monthly').emit('ranking:update', {
            workId,
            ratingType: 'monthly',
            timestamp: new Date().toISOString()
          });
          // 同时向订阅了所有排行榜的客户端广播
          io.to('ranking:all').emit('ranking:update', {
            workId,
            ratingType: 'all',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('广播排行榜更新事件失败:', error);
        }

        return res.status(200).json({
          success: true,
          message: '评分更新成功',
          data: existingRating
        });
      } else {
        // 创建新评分
        const newRating = await WorkRating.create({
          workId,
          userId,
          rating: integerRating,
          comment
        });

        // 检测异常评分
        await RatingController.detectAbnormalRating(newRating);

        // 更新作品评分
        await RatingController.updateWorkRating(workId);

        // 积分奖励
        await RatingController.rewardPoints(userId, 1); // 基础评分奖励1分

        // 广播排行榜更新事件
        try {
          // 只向订阅了相关排行榜的客户端广播更新
          io.to('ranking:daily').emit('ranking:update', {
            workId,
            ratingType: 'daily',
            timestamp: new Date().toISOString()
          });
          io.to('ranking:weekly').emit('ranking:update', {
            workId,
            ratingType: 'weekly',
            timestamp: new Date().toISOString()
          });
          io.to('ranking:monthly').emit('ranking:update', {
            workId,
            ratingType: 'monthly',
            timestamp: new Date().toISOString()
          });
          // 同时向订阅了所有排行榜的客户端广播
          io.to('ranking:all').emit('ranking:update', {
            workId,
            ratingType: 'all',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('广播排行榜更新事件失败:', error);
        }

        return res.status(201).json({
          success: true,
          message: '评分提交成功',
          data: newRating
        });
      }
    } catch (error) {
      console.error('提交评分失败:', error);
      res.status(500).json({
        success: false,
        error: '提交评分失败，请稍后重试'
      });
    }
  }

  // 修改评分
  static async updateRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      // 验证参数
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: '无效的评分参数'
        });
      }

      // 查找评分记录
      const existingRating = await WorkRating.findByPk(id);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: '评分记录不存在'
        });
      }

      // 验证权限
      if (existingRating.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权修改他人的评分'
        });
      }

      // 更新评分
      existingRating.rating = rating;
      existingRating.isActive = true;
      await existingRating.save();

      // 检测异常评分
      await RatingController.detectAbnormalRating(existingRating);

      // 更新作品评分
      await RatingController.updateWorkRating(existingRating.workId);

      // 广播排行榜更新事件
      try {
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'daily',
          timestamp: new Date().toISOString()
        });
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'weekly',
          timestamp: new Date().toISOString()
        });
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'monthly',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('广播排行榜更新事件失败:', error);
      }

      return res.status(200).json({
        success: true,
        message: '评分修改成功',
        data: existingRating
      });
    } catch (error) {
      console.error('修改评分失败:', error);
      res.status(500).json({
        success: false,
        error: '修改评分失败，请稍后重试'
      });
    }
  }

  // 删除评分
  static async deleteRating(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 查找评分记录
      const existingRating = await WorkRating.findByPk(id);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: '评分记录不存在'
        });
      }

      // 验证权限
      if (existingRating.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权删除他人的评分'
        });
      }

      // 标记为非活跃（软删除）
      existingRating.isActive = false;
      await existingRating.save();

      // 更新作品评分
      await RatingController.updateWorkRating(existingRating.workId);

      // 广播排行榜更新事件
      try {
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'daily',
          timestamp: new Date().toISOString()
        });
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'weekly',
          timestamp: new Date().toISOString()
        });
        io.emit('ranking:update', {
          workId: existingRating.workId,
          ratingType: 'monthly',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('广播排行榜更新事件失败:', error);
      }

      return res.status(200).json({
        success: true,
        message: '评分删除成功'
      });
    } catch (error) {
      console.error('删除评分失败:', error);
      res.status(500).json({
        success: false,
        error: '删除评分失败，请稍后重试'
      });
    }
  }

  // 获取作品评分列表
  static async getWorkRatings(req, res) {
    try {
      const { workId } = req.params;
      const { page = 1, pageSize = 20 } = req.query;

      // 检查作品是否存在
      const work = await Work.findByPk(workId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 计算偏移量
      const offset = (page - 1) * pageSize;

      // 查询评分列表
      const [ratings, total] = await Promise.all([
        WorkRating.findAll({
          where: {
            workId,
            isActive: true
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar', 'role']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(pageSize),
          offset: parseInt(offset)
        }),
        WorkRating.count({
          where: {
            workId,
            isActive: true
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          ratings,
          pagination: {
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取作品评分列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取作品评分列表失败，请稍后重试'
      });
    }
  }

  // 更新作品评分
  static async updateWorkRating(workId) {
    try {
      // 获取所有活跃的评分
      const ratings = await WorkRating.findAll({
        where: {
          workId,
          isActive: true
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['role']
          }
        ]
      });

      if (ratings.length === 0) {
        // 没有评分，保持默认值
        await Work.update(
          { rating: 0, totalScore: 0 },
          { where: { id: workId } }
        );
        return;
      }

      // 获取评分权重配置
      const ratingWeights = await RatingWeight.findAll({
        where: { isActive: true }
      });

      // 构建权重映射
      const weightMap = {};
      ratingWeights.forEach(item => {
        weightMap[item.roleType] = item.weight;
      });

      // 默认权重
      const defaultWeight = weightMap.user || 1.0;
      const vipWeight = weightMap.vip || 1.5;
      const judgeWeight = weightMap.judge || 2.0;

      // 计算加权平均分
      let totalWeight = 0;
      let weightedSum = 0;

      ratings.forEach(rating => {
        let weight = defaultWeight;
        
        // 根据用户角色设置权重
        if (rating.user.role === 'vip') {
          weight = vipWeight;
        } else if (rating.user.role === 'judge') {
          weight = judgeWeight;
        }

        weightedSum += rating.rating * weight;
        totalWeight += weight;
      });

      // 计算平均评分（精确到小数点后一位）
      const averageRating = parseFloat((weightedSum / totalWeight).toFixed(1));

      // 更新作品评分
      await Work.update(
        { rating: averageRating, totalScore: averageRating },
        { where: { id: workId } }
      );

      // 更新评分历史
      await RatingController.updateRatingHistory(workId, averageRating, ratings.length);

    } catch (error) {
      console.error('更新作品评分失败:', error);
    }
  }

  // 更新评分历史
  static async updateRatingHistory(workId, averageRating, ratingCount) {
    try {
      const now = new Date();
      
      // 生成不同周期的历史记录
      const periods = [
        { type: 'daily', start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) },
        { type: 'weekly', start: new Date(now.setDate(now.getDate() - now.getDay())), end: new Date(now.setDate(now.getDate() + 6)) },
        { type: 'monthly', start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
        { type: 'quarterly', start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0) }
      ];

      // 为每个周期创建或更新历史记录
      for (const period of periods) {
        // 检查是否已存在该周期的记录
        const existingHistory = await RatingHistory.findOne({
          where: {
            workId,
            period: period.type,
            periodStart: period.start,
            periodEnd: period.end
          }
        });

        if (existingHistory) {
          // 更新现有记录
          await existingHistory.update({
            averageRating,
            ratingCount
          });
        } else {
          // 创建新记录
          await RatingHistory.create({
            workId,
            averageRating,
            ratingCount,
            period: period.type,
            periodStart: period.start,
            periodEnd: period.end
          });
        }
      }

    } catch (error) {
      console.error('更新评分历史失败:', error);
    }
  }

  // 检测异常评分
  static async detectAbnormalRating(rating) {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // 检查用户在24小时内对同一作品的评分次数
      const recentRatings = await WorkRating.count({
        where: {
          userId: rating.userId,
          workId: rating.workId,
          createdAt: {
            [Op.gte]: twentyFourHoursAgo
          }
        }
      });

      // 如果24小时内评分次数超过3次，标记为异常
      if (recentRatings > 3) {
        console.warn(`异常评分检测: 用户 ${rating.userId} 在24小时内对作品 ${rating.workId} 评分超过3次`);
        // 这里可以添加更多处理逻辑，如通知管理员
      }

      // 检查作品的评分分布
      const workRatings = await WorkRating.findAll({
        where: {
          workId: rating.workId,
          isActive: true
        }
      });

      if (workRatings.length >= 10) {
        // 计算极端分值比例
        const extremeRatings = workRatings.filter(r => r.rating === 1 || r.rating === 5).length;
        const extremeRatio = extremeRatings / workRatings.length;

        // 如果极端分值比例超过80%，标记为异常
        if (extremeRatio > 0.8) {
          console.warn(`异常评分检测: 作品 ${rating.workId} 的极端分值比例超过80%`);
          // 这里可以添加更多处理逻辑，如通知管理员
        }
      }

    } catch (error) {
      console.error('检测异常评分失败:', error);
    }
  }

  // 奖励积分
  static async rewardPoints(userId, points) {
    try {
      // 这里可以实现积分奖励逻辑
      // 例如：更新用户积分表、记录积分变动历史等
      console.log(`用户 ${userId} 获得 ${points} 积分奖励`);
    } catch (error) {
      console.error('奖励积分失败:', error);
    }
  }

  // 获取评分历史趋势
  static async getRatingTrend(req, res) {
    try {
      const { workId, period = 'weekly' } = req.params;

      // 检查作品是否存在
      const work = await Work.findByPk(workId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 验证周期参数
      const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: '无效的周期参数'
        });
      }

      // 查询评分历史
      const history = await RatingHistory.findAll({
        where: {
          workId,
          period
        },
        order: [['periodStart', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('获取评分历史趋势失败:', error);
      res.status(500).json({
        success: false,
        error: '获取评分历史趋势失败，请稍后重试'
      });
    }
  }

  // 管理后台：查看评分详情
  static async getAdminRatings(req, res) {
    try {
      const { page = 1, pageSize = 20, workId, userId, status } = req.query;

      // 构建查询条件
      const whereClause = {};

      if (workId) {
        whereClause.workId = workId;
      }

      if (userId) {
        whereClause.userId = userId;
      }

      if (status) {
        whereClause.isActive = status === 'active';
      }

      // 计算偏移量
      const offset = (page - 1) * pageSize;

      // 查询评分列表
      const [ratings, total] = await Promise.all([
        WorkRating.findAll({
          where: whereClause,
          include: [
            {
              model: Work,
              as: 'work',
              attributes: ['id', 'title', 'imageUrl']
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar', 'role']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(pageSize),
          offset: parseInt(offset)
        }),
        WorkRating.count({ where: whereClause })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          ratings,
          pagination: {
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize),
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      });
    } catch (error) {
      console.error('查看评分详情失败:', error);
      res.status(500).json({
        success: false,
        error: '查看评分详情失败，请稍后重试'
      });
    }
  }

  // 管理后台：处理异常评分
  static async handleAbnormalRating(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // 查找评分记录
      const existingRating = await WorkRating.findByPk(id);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          error: '评分记录不存在'
        });
      }

      // 更新评分状态
      existingRating.isActive = status === 'active';
      await existingRating.save();

      // 更新作品评分
      await RatingController.updateWorkRating(existingRating.workId);

      return res.status(200).json({
        success: true,
        message: '处理异常评分成功',
        data: existingRating
      });
    } catch (error) {
      console.error('处理异常评分失败:', error);
      res.status(500).json({
        success: false,
        error: '处理异常评分失败，请稍后重试'
      });
    }
  }

  // 管理后台：导出评分数据报表
  static async exportRatingData(req, res) {
    try {
      const { workId, startDate, endDate } = req.query;

      // 构建查询条件
      const whereClause = {};

      if (workId) {
        whereClause.workId = workId;
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // 查询评分数据
      const ratings = await WorkRating.findAll({
        where: whereClause,
        include: [
          {
            model: Work,
            as: 'work',
            attributes: ['id', 'title']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'role']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // 生成CSV格式数据
      let csvContent = 'Work ID,Work Title,User ID,Username,User Role,Rating,Status,Created At\n';

      ratings.forEach(rating => {
        csvContent += `${rating.workId},${rating.work.title},${rating.userId},${rating.user.username},${rating.user.role},${rating.rating},${rating.isActive ? 'Active' : 'Inactive'},${rating.createdAt}\n`;
      });

      // 设置响应头
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ratings_${Date.now()}.csv"`);

      // 发送CSV数据
      res.send(csvContent);

    } catch (error) {
      console.error('导出评分数据失败:', error);
      res.status(500).json({
        success: false,
        error: '导出评分数据失败，请稍后重试'
      });
    }
  }
}

module.exports = RatingController;