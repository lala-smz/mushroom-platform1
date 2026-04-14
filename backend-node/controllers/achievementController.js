const Achievement = require('../models/Achievement');
const UserLevel = require('../models/UserLevel');
const Work = require('../models/Work');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const sequelize = require('../config/db');

// 成就控制器
class AchievementController {
  // 获取用户成就列表
  static async getUserAchievements(req, res) {
    try {
      const { userId } = req.params;

      const achievements = await Achievement.findAll({
        where: { userId },
        order: [['unlockedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: achievements
      });
    } catch (error) {
      console.error('获取用户成就失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户成就失败，请稍后重试'
      });
    }
  }

  // 获取用户等级信息
  static async getUserLevel(req, res) {
    try {
      const { userId } = req.params;

      let userLevel = await UserLevel.findOne({
        where: { userId }
      });

      // 如果用户等级不存在，创建默认等级
      if (!userLevel) {
        userLevel = await UserLevel.create({
          userId,
          level: 1,
          experience: 0,
          nextLevelExperience: 100
        });
      }

      res.status(200).json({
        success: true,
        data: userLevel
      });
    } catch (error) {
      console.error('获取用户等级失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户等级失败，请稍后重试'
      });
    }
  }

  // 为用户添加经验值
  static async addExperience(req, res) {
    try {
      const { userId, experience, reason } = req.body;

      let userLevel = await UserLevel.findOne({
        where: { userId }
      });

      // 如果用户等级不存在，创建默认等级
      if (!userLevel) {
        userLevel = await UserLevel.create({
          userId,
          level: 1,
          experience: 0,
          nextLevelExperience: 100
        });
      }

      // 添加经验值
      userLevel.experience += experience;

      // 检查是否升级
      let levelUp = false;
      while (userLevel.experience >= userLevel.nextLevelExperience) {
        userLevel.level += 1;
        userLevel.experience -= userLevel.nextLevelExperience;
        userLevel.nextLevelExperience = Math.floor(userLevel.nextLevelExperience * 1.5); // 每级所需经验值增加50%
        levelUp = true;
      }

      // 保存等级信息
      await userLevel.save();

      // 如果升级，解锁等级成就
      if (levelUp) {
        await AchievementController.unlockLevelAchievement(userId, userLevel.level);
      }

      res.status(200).json({
        success: true,
        data: {
          userLevel,
          levelUp
        }
      });
    } catch (error) {
      console.error('添加经验值失败:', error);
      res.status(500).json({
        success: false,
        error: '添加经验值失败，请稍后重试'
      });
    }
  }

  // 检查并解锁用户成就
  static async checkAndUnlockAchievements(userId) {
    try {
      // 获取用户数据
      const userWorks = await Work.count({ where: { userId } });
      const userLikes = await Like.count({ where: { userId } });
      const userComments = await Comment.count({ where: { userId } });
      const userWorkLikes = await Work.sum('likes', { where: { userId } });

      // 检查作品数量成就
      if (userWorks >= 1) {
        await AchievementController.unlockAchievement(userId, 'first_work', '初次创作', '发布你的第一个作品');
      }
      if (userWorks >= 5) {
        await AchievementController.unlockAchievement(userId, 'works_5', '创作达人', '发布5个作品');
      }
      if (userWorks >= 10) {
        await AchievementController.unlockAchievement(userId, 'works_10', '创作大师', '发布10个作品');
      }
      if (userWorks >= 20) {
        await AchievementController.unlockAchievement(userId, 'works_20', '创作宗师', '发布20个作品');
      }

      // 检查点赞成就
      if (userLikes >= 10) {
        await AchievementController.unlockAchievement(userId, 'likes_10', '点赞爱好者', '获得10个点赞');
      }
      if (userLikes >= 50) {
        await AchievementController.unlockAchievement(userId, 'likes_50', '点赞达人', '获得50个点赞');
      }
      if (userLikes >= 100) {
        await AchievementController.unlockAchievement(userId, 'likes_100', '点赞大师', '获得100个点赞');
      }

      // 检查被点赞成就
      if (userWorkLikes >= 50) {
        await AchievementController.unlockAchievement(userId, 'work_likes_50', '受欢迎', '作品获得50个点赞');
      }
      if (userWorkLikes >= 100) {
        await AchievementController.unlockAchievement(userId, 'work_likes_100', '人气王', '作品获得100个点赞');
      }
      if (userWorkLikes >= 500) {
        await AchievementController.unlockAchievement(userId, 'work_likes_500', '超级明星', '作品获得500个点赞');
      }

      // 检查评论成就
      if (userComments >= 10) {
        await AchievementController.unlockAchievement(userId, 'comments_10', '评论爱好者', '发表10条评论');
      }
      if (userComments >= 50) {
        await AchievementController.unlockAchievement(userId, 'comments_50', '评论达人', '发表50条评论');
      }
      if (userComments >= 100) {
        await AchievementController.unlockAchievement(userId, 'comments_100', '评论大师', '发表100条评论');
      }
    } catch (error) {
      console.error('检查成就失败:', error);
    }
  }

  // 解锁成就
  static async unlockAchievement(userId, type, name, description) {
    try {
      // 检查成就是否已解锁
      const existingAchievement = await Achievement.findOne({
        where: { userId, type }
      });

      if (existingAchievement) {
        return; // 成就已解锁，无需重复解锁
      }

      // 创建成就
      await Achievement.create({
        userId,
        type,
        name,
        description
      });

      // 为用户添加经验值
      await AchievementController.addExperience({ userId, experience: 10, reason: `解锁成就: ${name}` });
    } catch (error) {
      console.error('解锁成就失败:', error);
    }
  }

  // 解锁等级成就
  static async unlockLevelAchievement(userId, level) {
    try {
      const levelType = `level_${level}`;
      const levelName = `等级${level}`;
      const levelDescription = `达到${level}级`;

      // 检查成就是否已解锁
      const existingAchievement = await Achievement.findOne({
        where: { userId, type: levelType }
      });

      if (existingAchievement) {
        return; // 成就已解锁，无需重复解锁
      }

      // 创建等级成就
      await Achievement.create({
        userId,
        type: levelType,
        name: levelName,
        description: levelDescription
      });
    } catch (error) {
      console.error('解锁等级成就失败:', error);
    }
  }

  // 获取成就统计
  static async getAchievementStats(req, res) {
    try {
      const { userId } = req.params;

      const totalAchievements = await Achievement.count({ where: { userId } });
      const achievements = await Achievement.findAll({
        where: { userId },
        group: ['type'],
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']]
      });

      const stats = {
        total: totalAchievements,
        byType: achievements.reduce((acc, item) => {
          acc[item.type] = item.count;
          return acc;
        }, {})
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取成就统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取成就统计失败，请稍后重试'
      });
    }
  }
}

module.exports = AchievementController;
