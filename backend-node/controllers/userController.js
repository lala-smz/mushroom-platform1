const User = require('../models/User');
const Follow = require('../models/Follow');
const Work = require('../models/Work');
const Like = require('../models/Like');
const jwtUtils = require('../utils/jwt');
const { cache, cacheKeys } = require('../config/redis');

const userController = {
  // 用户注册
  register: async (req, res) => {
    try {
      const { username, password, email, phone, role } = req.body;

      // 验证参数
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: '用户名和密码不能为空'
        });
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '用户名已存在'
        });
      }

      // 检查邮箱是否已存在
      if (email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            error: '邮箱已被注册'
          });
        }
      }

      // 验证角色值
      const validRoles = ['user', 'seller'];
      const finalRole = validRoles.includes(role) ? role : 'user';

      // 创建新用户
      const user = await User.create({
        username,
        password,
        email,
        phone,
        role: finalRole
      });

      // 生成JWT令牌
      const token = jwtUtils.generateToken(user.id, user.role, user.username);

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          token
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({
        success: false,
        error: '注册失败，请稍后重试'
      });
    }
  },

  // 用户登录
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // 验证参数
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: '用户名和密码不能为空'
        });
      }

      // 查找用户
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: '用户名或密码错误'
        });
      }

      // 检查账号状态
      if (!user.status) {
        return res.status(401).json({
          success: false,
          error: '账号已被禁用'
        });
      }

      // 验证密码
      if (!user.validatePassword(password)) {
        return res.status(401).json({
          success: false,
          error: '用户名或密码错误'
        });
      }

      // 更新最后登录时间
      await user.update({ lastLoginAt: new Date() });

      // 生成JWT令牌
      const token = jwtUtils.generateToken(user.id, user.role, user.username);

      // 尝试缓存用户信息
      try {
        await cache.set(cacheKeys.userInfo(user.id), {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          phone: user.phone
        }, 3600);
      } catch (cacheError) {
        console.warn('缓存用户信息失败，将继续执行登录流程:', cacheError);
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          phone: user.phone,
          token
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      // 提供更详细的错误信息
      let errorMessage = '登录失败，请稍后重试';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = '服务器连接失败，请稍后重试';
      } else if (error.name === 'SequelizeConnectionError') {
        errorMessage = '数据库连接失败，请稍后重试';
      }
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  },

  // 获取用户信息
  getUserInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      let userInfo;

      // 尝试从缓存获取
      try {
        userInfo = await cache.get(cacheKeys.userInfo(userId));
        if (userInfo) {
          return res.status(200).json({
            success: true,
            data: userInfo
          });
        }
      } catch (cacheError) {
        console.warn('从缓存获取用户信息失败，将从数据库查询:', cacheError);
      }

      // 从数据库获取
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'role', 'email', 'phone', 'avatar', 'lastLoginAt']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt
      };

      // 尝试缓存用户信息
      try {
        await cache.set(cacheKeys.userInfo(userId), userInfo, 3600);
      } catch (cacheError) {
        console.warn('缓存用户信息失败:', cacheError);
      }

      res.status(200).json({
        success: true,
        data: userInfo
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户信息失败'
      });
    }
  },

  // 更新用户信息
  updateUserInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const { email, phone, avatar } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 更新用户信息
      await user.update({ email, phone, avatar });

      // 清除缓存
      await cache.del(cacheKeys.userInfo(userId));

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        success: false,
        error: '更新用户信息失败'
      });
    }
  },

  // 修改密码
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 验证旧密码
      if (!user.validatePassword(oldPassword)) {
        return res.status(400).json({
          success: false,
          error: '旧密码错误'
        });
      }

      // 更新密码
      await user.update({ password: newPassword });

      res.status(200).json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({
        success: false,
        error: '修改密码失败'
      });
    }
  },

  // 关注用户
  followUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { followingId } = req.body;

      // 验证参数
      if (!followingId) {
        return res.status(400).json({
          success: false,
          error: '缺少关注用户ID'
        });
      }

      // 验证关注用户ID
      const numericFollowingId = parseInt(followingId, 10);
      if (isNaN(numericFollowingId) || numericFollowingId <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的关注用户ID'
        });
      }

      // 检查是否关注自己
      if (followerId === numericFollowingId) {
        return res.status(400).json({
          success: false,
          error: '不能关注自己'
        });
      }

      // 检查被关注用户是否存在
      const followingUser = await User.findByPk(numericFollowingId);
      if (!followingUser) {
        return res.status(404).json({
          success: false,
          error: '被关注用户不存在'
        });
      }

      // 检查是否已经关注
      const existingFollow = await Follow.findOne({
        where: {
          followerId,
          followingId: numericFollowingId
        }
      });

      if (existingFollow) {
        return res.status(400).json({
          success: false,
          error: '已经关注过该用户'
        });
      }

      // 创建关注记录
      await Follow.create({
        followerId,
        followingId: numericFollowingId
      });

      res.status(200).json({
        success: true,
        message: '关注成功'
      });
    } catch (error) {
      console.error('关注用户失败:', error);
      res.status(500).json({
        success: false,
        error: '关注用户失败，请稍后重试'
      });
    }
  },

  // 取消关注用户
  unfollowUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { followingId } = req.body;

      // 验证参数
      if (!followingId) {
        return res.status(400).json({
          success: false,
          error: '缺少关注用户ID'
        });
      }

      // 验证关注用户ID
      const numericFollowingId = parseInt(followingId, 10);
      if (isNaN(numericFollowingId) || numericFollowingId <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的关注用户ID'
        });
      }

      // 检查关注记录是否存在
      const existingFollow = await Follow.findOne({
        where: {
          followerId,
          followingId: numericFollowingId
        }
      });

      if (!existingFollow) {
        return res.status(400).json({
          success: false,
          error: '还没有关注该用户'
        });
      }

      // 删除关注记录
      await existingFollow.destroy();

      res.status(200).json({
        success: true,
        message: '取消关注成功'
      });
    } catch (error) {
      console.error('取消关注用户失败:', error);
      res.status(500).json({
        success: false,
        error: '取消关注用户失败，请稍后重试'
      });
    }
  },

  // 获取用户关注状态
  getUserFollowStatus: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { followingId } = req.query;

      // 验证参数
      if (!followingId) {
        return res.status(400).json({
          success: false,
          error: '缺少关注用户ID'
        });
      }

      // 验证关注用户ID
      const numericFollowingId = parseInt(followingId, 10);
      if (isNaN(numericFollowingId) || numericFollowingId <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的关注用户ID'
        });
      }

      // 检查是否关注
      const existingFollow = await Follow.findOne({
        where: {
          followerId,
          followingId: numericFollowingId
        }
      });

      res.status(200).json({
        success: true,
        data: {
          isFollowing: !!existingFollow
        }
      });
    } catch (error) {
      console.error('获取关注状态失败:', error);
      res.status(500).json({
        success: false,
        error: '获取关注状态失败，请稍后重试'
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;

      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }

      const user = await User.findOne({
        where: { id: numericUserId },
        attributes: ['id', 'username', 'createdAt', 'avatar']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      const [followersStats, worksStats, likesStats] = await Promise.all([
        Follow.findAndCountAll({
          where: { followingId: numericUserId }
        }),
        Work.findAndCountAll({
          where: { userId: numericUserId }
        }),
        Like.findAndCountAll({
          include: [
            {
              model: Work,
              as: 'work',
              where: { userId: numericUserId }
            }
          ]
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          bio: '该用户暂无简介',
          createdAt: user.createdAt,
          avatar: user.avatar,
          followersCount: followersStats.count,
          worksCount: worksStats.count,
          totalLikes: likesStats.count
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户信息失败，请稍后重试'
      });
    }
  }
};

module.exports = userController;