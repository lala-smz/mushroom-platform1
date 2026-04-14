const { Op, Sequelize } = require('sequelize');
const Work = require('../models/Work');
const Like = require('../models/Like');
const Favorite = require('../models/Favorite');
const Follow = require('../models/Follow');
const User = require('../models/User');
const ScoreConfig = require('../models/ScoreConfig');
const ScoreConfigLog = require('../models/ScoreConfigLog');
const WorkRating = require('../models/WorkRating');
const Comment = require('../models/Comment');
const sequelize = Work.sequelize;

// 作品控制器
class WorkController {
  // 上传作品
  static async uploadWork(req, res) {
    try {
      console.log('开始处理上传请求:', req.body);
      
      const { userId, title, description, rating, mushroomType, image } = req.body;
      const { files } = req;

      let imageUrl;
      
      // 支持两种方式：直接文件上传 或 URL方式
      if (files && files.length > 0) {
        // 方式1：直接文件上传（保持向后兼容）
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(files[0].mimetype)) {
          console.error('上传失败: 文件类型错误', { mimetype: files[0].mimetype });
          return res.status(400).json({
            success: false,
            error: '只允许上传 JPG、PNG、GIF、WebP 格式的图片'
          });
        }

        // 验证文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (files[0].size > maxSize) {
          console.error('上传失败: 文件大小超过限制', { size: files[0].size });
          return res.status(400).json({
            success: false,
            error: '图片大小不能超过 10MB'
          });
        }

        console.log('上传的文件:', files[0].filename);
        imageUrl = `/uploads/${files[0].filename}`;
      } else if (image) {
        // 方式2：URL方式（新方式，与商品上传一致）
        console.log('使用URL方式:', image);
        imageUrl = image;
      } else {
        console.error('上传失败: 没有图片文件或URL');
        return res.status(400).json({
          success: false,
          error: '请上传作品图片'
        });
      }
      
      console.log('最终imageUrl:', imageUrl);

      // 验证必要字段
      if (!userId || !title || !description || !rating || !mushroomType) {
        console.error('上传失败: 缺少必要字段', {
          hasUserId: !!userId,
          hasTitle: !!title,
          hasDescription: !!description,
          hasRating: !!rating,
          hasMushroomType: !!mushroomType
        });
        return res.status(400).json({
          success: false,
          error: '缺少必要的作品信息'
        });
      }

      // 验证用户ID
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error('上传失败: 用户ID无效', { userId });
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }

      // 验证评分
      const numericRating = parseInt(rating, 10);
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        console.error('上传失败: 评分无效', { rating });
        return res.status(400).json({
          success: false,
          error: '评分必须在 1-5 星之间'
        });
      }

      // 验证标题长度
      if (title.length < 2 || title.length > 50) {
        console.error('上传失败: 标题长度无效', { titleLength: title.length });
        return res.status(400).json({
          success: false,
          error: '标题长度必须在 2-50 个字符之间'
        });
      }

      // 验证描述长度
      if (description.length < 50 || description.length > 500) {
        console.error('上传失败: 描述长度无效', { descriptionLength: description.length });
        return res.status(400).json({
          success: false,
          error: '描述长度必须在 50-500 个字符之间'
        });
      }

      // 验证菌菇类型
      const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', '松茸', 'other'];
      if (!validMushroomTypes.includes(mushroomType)) {
        console.error('上传失败: 菌菇类型无效', { mushroomType });
        return res.status(400).json({
          success: false,
          error: '无效的菌菇类型'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        console.error('上传失败: 用户不存在', { userId: numericUserId });
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 创建作品
      try {
        console.log('开始创建作品记录...');
        const work = await Work.create({
          userId: numericUserId,
          title,
          description,
          imageUrl,
          rating: numericRating,
          mushroomType
        });
        console.log('作品创建成功:', work.id);

        res.status(201).json({
          success: true,
          data: work
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        if (dbError.name === 'SequelizeValidationError') {
          const validationErrors = dbError.errors.map(err => err.message);
          console.error('验证错误:', validationErrors);
          return res.status(400).json({
            success: false,
            error: '数据验证失败: ' + validationErrors.join(', ')
          });
        }
        if (dbError.name === 'SequelizeForeignKeyConstraintError') {
          console.error('外键约束错误:', dbError);
          return res.status(400).json({
            success: false,
            error: '无效的用户ID'
          });
        }
        throw dbError;
      }
    } catch (error) {
      console.error('上传作品失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({
        success: false,
        error: '上传作品失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 获取作品详情
  static async getWorkDetail(req, res) {
    try {
      const { id } = req.params;

      const work = await Work.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: work
      });
    } catch (error) {
      console.error('获取作品详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取作品详情失败，请稍后重试'
      });
    }
  }

  // 获取推荐作品
  static async getRecommendedWorks(req, res) {
    try {
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;
      console.log('接收到获取推荐作品请求:', { page, pageSize, mushroomType });

      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      
      if (isNaN(numericPage) || numericPage < 1) {
        console.warn('无效的页码:', page);
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        console.warn('无效的每页条数:', pageSize);
        return res.status(400).json({
          success: false,
          error: '无效的每页条数'
        });
      }

      const offset = (numericPage - 1) * numericPageSize;

      const whereClause = { status: 'approved' };
      if (mushroomType !== 'all') {
        // 验证菌菇类型
        const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', 'matsutake', 'other'];
        if (!validMushroomTypes.includes(mushroomType)) {
          console.warn('无效的菌菇类型:', mushroomType);
          return res.status(400).json({
            success: false,
            error: '无效的菌菇类型'
          });
        }
        whereClause.mushroomType = mushroomType;
        console.log('添加菌菇类型过滤条件:', mushroomType);
      }

      console.log('查询条件:', whereClause);

      // 并行执行查询，提高性能
      const [works, total] = await Promise.all([
        Work.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['totalScore', 'DESC'], ['createdAt', 'DESC']],
          limit: numericPageSize,
          offset: offset
        }),
        Work.count({ where: whereClause })
      ]);

      console.log('查询结果:', { worksCount: works.length, total });

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total,
            totalPages: Math.ceil(total / numericPageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取推荐作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取推荐作品失败，请稍后重试'
      });
    }
  }

  // 获取最新作品
  static async getLatestWorks(req, res) {
    try {
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;
      console.log('接收到获取最新作品请求:', { page, pageSize, mushroomType });

      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      
      if (isNaN(numericPage) || numericPage < 1) {
        console.warn('无效的页码:', page);
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        console.warn('无效的每页条数:', pageSize);
        return res.status(400).json({
          success: false,
          error: '无效的每页条数'
        });
      }

      const offset = (numericPage - 1) * numericPageSize;

      const whereClause = { status: 'approved' };
      if (mushroomType !== 'all') {
        // 验证菌菇类型
        const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', 'matsutake', 'other'];
        if (!validMushroomTypes.includes(mushroomType)) {
          console.warn('无效的菌菇类型:', mushroomType);
          return res.status(400).json({
            success: false,
            error: '无效的菌菇类型'
          });
        }
        whereClause.mushroomType = mushroomType;
        console.log('添加菌菇类型过滤条件:', mushroomType);
      }

      console.log('查询条件:', whereClause);

      // 并行执行查询，提高性能
      const [works, total] = await Promise.all([
        Work.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: numericPageSize,
          offset: offset
        }),
        Work.count({ where: whereClause })
      ]);

      console.log('查询结果:', { worksCount: works.length, total });

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total,
            totalPages: Math.ceil(total / numericPageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取最新作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取最新作品失败，请稍后重试'
      });
    }
  }

  // 获取用户作品
  static async getUserWorks(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;
      console.log('接收到获取用户作品请求:', { userId, page, pageSize, mushroomType, currentUser: req.user });

      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      
      if (isNaN(numericPage) || numericPage < 1) {
        console.warn('无效的页码:', page);
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        console.warn('无效的每页条数:', pageSize);
        return res.status(400).json({
          success: false,
          error: '无效的每页条数'
        });
      }

      // 检查用户是否存在（仅当不是admin时）
      if (req.user?.role !== 'admin') {
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId) || numericUserId <= 0) {
          console.warn('无效的用户ID:', userId);
          return res.status(400).json({
            success: false,
            error: '无效的用户ID'
          });
        }

        const user = await User.findByPk(numericUserId);
        if (!user) {
          console.warn('用户不存在:', numericUserId);
          return res.status(404).json({
            success: false,
            error: '用户不存在'
          });
        }
      }

      const offset = (numericPage - 1) * numericPageSize;

      // 构建查询条件
      const whereClause = {};
      
      // 始终根据URL参数中的userId过滤作品
      const numericUserId = parseInt(userId, 10);
      whereClause.userId = numericUserId;
      
      // 判断是否是查看自己的作品
      const currentUserId = parseInt(req.user?.id, 10);
      const isViewingOwnWorks = currentUserId === numericUserId;
      
      // 如果不是查看自己的作品，只显示已批准的作品
      if (!isViewingOwnWorks) {
        whereClause.status = 'approved';
      }
      
      // 添加菌菇类型过滤
      if (mushroomType !== 'all') {
        // 验证菌菇类型
        const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', 'matsutake', 'other'];
        if (!validMushroomTypes.includes(mushroomType)) {
          console.warn('无效的菌菇类型:', mushroomType);
          return res.status(400).json({
            success: false,
            error: '无效的菌菇类型'
          });
        }
        whereClause.mushroomType = mushroomType;
        console.log('添加菌菇类型过滤条件:', mushroomType);
      }

      console.log('查询条件:', whereClause);

      // 并行执行查询，提高性能
      const [works, total] = await Promise.all([
        Work.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: numericPageSize,
          offset: offset
        }),
        Work.count({ where: whereClause })
      ]);

      console.log('查询结果:', { worksCount: works.length, total, isAdmin: req.user?.role === 'admin' });

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total,
            totalPages: Math.ceil(total / numericPageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取用户作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户作品失败，请稍后重试'
      });
    }
  }

  // 获取用户收藏作品
  static async getUserFavorites(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;

      console.log('=== getUserFavorites 开始处理 ===');
      console.log('请求参数:', { userId, page, pageSize, mushroomType });

      // 验证参数
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '缺少用户ID'
        });
      }

      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }

      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      if (isNaN(numericPage) || numericPage < 1) {
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        return res.status(400).json({
          success: false,
          error: '无效的每页数量'
        });
      }

      // 构建查询条件 - 只显示已批准的作品
      const whereCondition = { status: 'approved' };
      
      // 先查询数据库中有哪些菌菇类型，用于调试
      console.log('正在查询所有作品的菌菇类型...');
      const allMushroomTypes = await Work.findAll({
        attributes: ['mushroomType'],
        group: ['mushroomType']
      });
      console.log('数据库中存在的菌菇类型:', allMushroomTypes.map(t => t.mushroomType));

      if (mushroomType && mushroomType !== 'all') {
        console.log('应用菌菇类型筛选:', mushroomType);
        whereCondition.mushroomType = mushroomType;
      }

      console.log('最终查询条件:', whereCondition);

      // 查询用户收藏的作品
      console.log('开始查询数据库...');
      const { count, rows } = await Work.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          },
          {
            model: Favorite,
            as: 'favoriteList',
            where: { userId: numericUserId },
            attributes: []
          }
        ],
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: numericPageSize,
        offset: (numericPage - 1) * numericPageSize
      });

      console.log('=== 查询结果 ===');
      console.log('总数:', count);
      console.log('返回数量:', rows.length);
      console.log('返回作品:', rows.map(w => ({ 
        id: w.id, 
        title: w.title, 
        mushroomType: w.mushroomType 
      })));

      // 转换数据格式
      const works = rows.map(work => ({
        id: work.id,
        title: work.title,
        imageUrl: work.imageUrl,
        rating: work.rating,
        authorName: work.user?.username || '未知用户',
        authorId: work.userId,
        createdAt: work.createdAt,
        mushroomType: work.mushroomType,
        likes: work.likes || 0,
        comments: work.comments || 0,
        isFavorite: true // 标记为已收藏
      }));

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total: count
          }
        }
      });
    } catch (error) {
      console.error('获取用户收藏作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户收藏作品失败，请稍后重试'
      });
    }
  }

  // 获取关注用户的作品
  static async getFollowingWorks(req, res) {
    try {
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;
      console.log('接收到获取关注用户作品请求:', { page, pageSize, mushroomType });
      
      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      
      if (isNaN(numericPage) || numericPage < 1) {
        console.warn('无效的页码:', page);
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        console.warn('无效的每页条数:', pageSize);
        return res.status(400).json({
          success: false,
          error: '无效的每页条数'
        });
      }

      // 假设当前用户ID从认证中间件获取
      // 这里为了演示，使用固定值1，实际项目中应该从req.user.id获取
      const currentUserId = req.user?.id || 1;
      console.log('当前用户ID:', currentUserId);

      const offset = (numericPage - 1) * numericPageSize;

      // 获取当前用户关注的所有用户ID
      const follows = await Follow.findAll({
        where: { followerId: currentUserId },
        attributes: ['followingId']
      });
      
      const followedUserIds = follows.map(follow => follow.followingId);
      console.log('关注的用户ID列表:', followedUserIds);

      // 如果没有关注任何人，返回空列表
      if (followedUserIds.length === 0) {
        console.log('当前用户没有关注任何人');
        return res.status(200).json({
          success: true,
          data: {
            works: [],
            pagination: {
              currentPage: numericPage,
              pageSize: numericPageSize,
              total: 0,
              totalPages: 0
            }
          }
        });
      }

      const whereClause = {
        userId: {
          [Op.in]: followedUserIds
        },
        status: 'approved'
      };
      
      if (mushroomType !== 'all') {
        // 验证菌菇类型
        const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', 'matsutake', 'other'];
        if (!validMushroomTypes.includes(mushroomType)) {
          console.warn('无效的菌菇类型:', mushroomType);
          return res.status(400).json({
            success: false,
            error: '无效的菌菇类型'
          });
        }
        whereClause.mushroomType = mushroomType;
        console.log('添加菌菇类型过滤条件:', mushroomType);
      }

      console.log('查询条件:', whereClause);

      // 并行执行查询，提高性能
      const [works, total] = await Promise.all([
        Work.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: numericPageSize,
          offset: offset
        }),
        Work.count({ where: whereClause })
      ]);

      console.log('查询结果:', { worksCount: works.length, total });

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total,
            totalPages: Math.ceil(total / numericPageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取关注作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取关注作品失败，请稍后重试'
      });
    }
  }

  // 获取排行榜数据
  static async getRankingData(req, res) {
    try {
      const { timeRange = 'weekly', mushroomType = 'all' } = req.query;

      const whereClause = { status: 'approved' };
      if (mushroomType !== 'all') {
        whereClause.mushroomType = mushroomType;
      }

      // 计算时间范围
      let timeCondition = {};
      const now = new Date();
      switch (timeRange) {
        case 'daily':
          timeCondition = {
            createdAt: {
              [Op.gte]: new Date(now.setDate(now.getDate() - 1))
            }
          };
          break;
        case 'weekly':
          timeCondition = {
            createdAt: {
              [Op.gte]: new Date(now.setDate(now.getDate() - 7))
            }
          };
          break;
        case 'monthly':
          timeCondition = {
            createdAt: {
              [Op.gte]: new Date(now.setMonth(now.getMonth() - 1))
            }
          };
          break;
      }

      const works = await Work.findAll({
        where: { ...whereClause, ...timeCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['totalScore', 'DESC'], ['likes', 'DESC']],
        limit: 50
      });

      res.status(200).json({
        success: true,
        data: works
      });
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      res.status(500).json({
        success: false,
        error: '获取排行榜数据失败，请稍后重试'
      });
    }
  }



  // 点赞作品
  static async likeWork(req, res) {
    try {
      const { workId, userId } = req.body;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查是否已经点赞
      const existingLike = await Like.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      if (existingLike) {
        return res.status(400).json({
          success: false,
          error: '您已经点赞过该作品'
        });
      }

      // 创建点赞记录
      await Like.create({
        workId: numericWorkId,
        userId: numericUserId
      });

      // 更新作品点赞数
      await Work.increment('likes', { where: { id: numericWorkId } });

      // 更新作品总评分
      await WorkController.updateWorkTotalScore(numericWorkId);

      res.status(200).json({
        success: true,
        message: '点赞成功'
      });
    } catch (error) {
      console.error('点赞失败:', error);
      // 详细的错误处理
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          error: '无效的作品ID或用户ID'
        });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: '数据验证失败'
        });
      }
      res.status(500).json({
        success: false,
        error: '点赞失败，请稍后重试'
      });
    }
  }

  // 取消点赞
  static async unlikeWork(req, res) {
    try {
      const { workId, userId } = req.body;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查是否已经点赞
      const existingLike = await Like.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      if (!existingLike) {
        return res.status(400).json({
          success: false,
          error: '您还没有点赞过该作品'
        });
      }

      // 删除点赞记录
      await existingLike.destroy();

      // 更新作品点赞数
      await Work.decrement('likes', { where: { id: numericWorkId } });

      // 更新作品总评分
      await WorkController.updateWorkTotalScore(numericWorkId);

      res.status(200).json({
        success: true,
        message: '取消点赞成功'
      });
    } catch (error) {
      console.error('取消点赞失败:', error);
      res.status(500).json({
        success: false,
        error: '取消点赞失败，请稍后重试'
      });
    }
  }

  // 收藏作品
  static async favoriteWork(req, res) {
    try {
      const { workId, userId } = req.body;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查是否已经收藏
      const existingFavorite = await Favorite.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      if (existingFavorite) {
        return res.status(400).json({
          success: false,
          error: '您已经收藏过该作品'
        });
      }

      // 创建收藏记录
      await Favorite.create({
        workId: numericWorkId,
        userId: numericUserId
      });

      res.status(200).json({
        success: true,
        message: '收藏成功'
      });
    } catch (error) {
      console.error('收藏失败:', error);
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          error: '无效的作品ID或用户ID'
        });
      }
      res.status(500).json({
        success: false,
        error: '收藏失败，请稍后重试'
      });
    }
  }

  // 取消收藏
  static async unfavoriteWork(req, res) {
    try {
      const { workId, userId } = req.body;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查是否已经收藏
      const existingFavorite = await Favorite.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      if (!existingFavorite) {
        return res.status(400).json({
          success: false,
          error: '您还没有收藏过该作品'
        });
      }

      // 删除收藏记录
      await existingFavorite.destroy();

      res.status(200).json({
        success: true,
        message: '取消收藏成功'
      });
    } catch (error) {
      console.error('取消收藏失败:', error);
      res.status(500).json({
        success: false,
        error: '取消收藏失败，请稍后重试'
      });
    }
  }

  // 更新作品总评分
  static async updateWorkTotalScore(workId) {
    try {
      // 参数验证
      if (!workId || typeof workId !== 'number') {
        console.error('更新作品总评分失败: 无效的作品ID');
        return;
      }

      // 获取作品信息
      const work = await Work.findByPk(workId);
      if (!work) {
        console.error('更新作品总评分失败: 作品不存在');
        return;
      }

      // 获取当前激活的评分配置
      let scoreConfig = await ScoreConfig.findOne({ where: { isActive: true } });
      
      // 如果没有配置，使用默认值
      if (!scoreConfig) {
        scoreConfig = {
          ratingWeight: 0.3,
          interactionWeight: 0.25,
          qualityWeight: 0.2,
          creativityWeight: 0.15,
          recencyWeight: 0.1
        };
      }

      // 1. 标准化评分 (1-5 → 0-1)
      const normalizedRating = (work.rating || 0) / 5;

      // 2. 标准化互动数据 (点赞数 + 评论数 + 收藏数)
      const favoriteCount = await Favorite.count({ where: { workId: work.id } });
      const totalInteractions = (work.likes || 0) + (work.comments || 0) + favoriteCount;
      // 使用对数变换进行标准化，避免互动数过高导致的评分偏差
      const normalizedInteraction = totalInteractions > 0 ? Math.log1p(totalInteractions) / Math.log1p(100) : 0;

      // 3. 标准化作品质量 (基于描述长度和图片存在性)
      const descriptionScore = Math.min((work.description?.length || 0) / 500, 1);
      const hasImage = !!work.imageUrl;
      const normalizedQuality = (descriptionScore * 0.7) + (hasImage ? 0.3 : 0);

      // 4. 标准化创新性 (暂时基于随机性，实际项目中可以基于内容分析)
      const normalizedCreativity = 0.5 + (Math.random() * 0.5);

      // 5. 标准化时效性 (时间衰减因子)
      const now = new Date();
      const workDate = new Date(work.createdAt);
      const daysSinceCreation = (now - workDate) / (1000 * 60 * 60 * 24);
      // 7天后开始衰减，30天后衰减到最低值0.1
      const normalizedRecency = Math.max(1 - (daysSinceCreation / 30), 0.1);

      // 计算综合评分 (0-1 范围)
      const totalScore = (
        normalizedRating * scoreConfig.ratingWeight +
        normalizedInteraction * scoreConfig.interactionWeight +
        normalizedQuality * scoreConfig.qualityWeight +
        normalizedCreativity * scoreConfig.creativityWeight +
        normalizedRecency * scoreConfig.recencyWeight
      );

      // 确保评分在0-1范围内，然后乘以10变成0-10满分
      const clampedScore = Math.max(0, Math.min(totalScore, 1));
      const finalScore = clampedScore * 10;

      // 更新总评分
      await work.update({ totalScore: finalScore });
    } catch (error) {
      console.error('更新作品总评分失败:', error);
    }
  }

  // 批量更新所有作品评分
  static async updateAllWorkScores() {
    try {
      console.log('开始批量更新所有作品评分...');
      
      // 获取所有已批准的作品
      const works = await Work.findAll({ where: { status: 'approved' } });
      console.log(`找到 ${works.length} 个已批准作品`);
      
      // 批量更新评分
      let updatedCount = 0;
      for (const work of works) {
        try {
          await WorkController.updateWorkTotalScore(work.id);
          updatedCount++;
          
          // 每更新10个作品输出一次进度
          if (updatedCount % 10 === 0) {
            console.log(`已更新 ${updatedCount}/${works.length} 个作品评分`);
          }
        } catch (error) {
          console.error(`更新作品 ${work.id} 评分失败:`, error);
        }
      }
      
      console.log(`批量更新完成，共更新 ${updatedCount} 个作品评分`);
      return { success: true, updatedCount, totalCount: works.length };
    } catch (error) {
      console.error('批量更新作品评分失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取评分配置
  static async getScoreConfig(req, res) {
    try {
      // 获取当前激活的评分配置
      const scoreConfig = await ScoreConfig.findOne({ where: { isActive: true } });
      
      if (!scoreConfig) {
        // 如果没有配置，返回默认配置
        const defaultConfig = {
          ratingWeight: 0.3,
          interactionWeight: 0.25,
          qualityWeight: 0.2,
          creativityWeight: 0.15,
          recencyWeight: 0.1
        };
        return res.status(200).json({
          success: true,
          data: defaultConfig
        });
      }
      
      res.status(200).json({
        success: true,
        data: scoreConfig
      });
    } catch (error) {
      console.error('获取评分配置失败:', error);
      
      // 处理表不存在的错误，返回默认配置
      if (error.name === 'SequelizeDatabaseError' && error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
        const defaultConfig = {
          ratingWeight: 0.3,
          interactionWeight: 0.25,
          qualityWeight: 0.2,
          creativityWeight: 0.15,
          recencyWeight: 0.1
        };
        return res.status(200).json({
          success: true,
          data: defaultConfig
        });
      }
      
      res.status(500).json({
        success: false,
        error: '获取评分配置失败，请稍后重试'
      });
    }
  }

  // 更新评分配置
  static async updateScoreConfig(req, res) {
    try {
      console.log('开始更新评分配置:', req.body);
      
      const { ratingWeight, interactionWeight, qualityWeight, creativityWeight, recencyWeight, changeReason } = req.body;
      // 处理认证问题，提供默认的 operatorId
      const operatorId = req.user?.id || 2;
      console.log('操作人ID:', operatorId);
      
      // 验证权重总和是否为1
      const totalWeight = ratingWeight + interactionWeight + qualityWeight + creativityWeight + recencyWeight;
      if (Math.abs(totalWeight - 1) > 0.01) {
        console.error('权重总和验证失败:', { totalWeight });
        return res.status(400).json({
          success: false,
          error: '评分权重总和必须为1'
        });
      }
      
      // 验证权重范围
      const weights = [ratingWeight, interactionWeight, qualityWeight, creativityWeight, recencyWeight];
      for (const weight of weights) {
        if (weight < 0 || weight > 1) {
          console.error('权重范围验证失败:', { weight });
          return res.status(400).json({
            success: false,
            error: '评分权重必须在0-1之间'
          });
        }
      }
      
      // 开始事务
      const transaction = await Work.sequelize.transaction();
      
      try {
        // 获取当前激活的配置
        let scoreConfig;
        try {
          scoreConfig = await ScoreConfig.findOne({ where: { isActive: true }, transaction });
          console.log('获取现有配置:', scoreConfig ? '找到配置' : '未找到配置');
        } catch (dbError) {
          console.error('查询评分配置失败:', dbError);
          // 处理表不存在的情况
          if (dbError.name === 'SequelizeDatabaseError' && dbError.original && dbError.original.code === 'ER_NO_SUCH_TABLE') {
            console.warn('评分配置表不存在，使用默认配置');
            // 直接返回成功，使用默认配置
            await transaction.rollback();
            
            // 触发批量更新所有作品评分
            setTimeout(async () => {
              await WorkController.updateAllWorkScores();
            }, 0);
            
            return res.status(200).json({
              success: true,
              message: '评分配置更新成功，系统正在重新计算所有作品评分',
              data: {
                ratingWeight,
                interactionWeight,
                qualityWeight,
                creativityWeight,
                recencyWeight
              }
            });
          }
          throw dbError;
        }
        
        // 记录旧配置
        const oldConfig = scoreConfig ? {
          ratingWeight: scoreConfig.ratingWeight,
          interactionWeight: scoreConfig.interactionWeight,
          qualityWeight: scoreConfig.qualityWeight,
          creativityWeight: scoreConfig.creativityWeight,
          recencyWeight: scoreConfig.recencyWeight
        } : {
          ratingWeight: 0.3,
          interactionWeight: 0.25,
          qualityWeight: 0.2,
          creativityWeight: 0.15,
          recencyWeight: 0.1
        };
        console.log('旧配置:', oldConfig);
        console.log('新配置:', {
          ratingWeight,
          interactionWeight,
          qualityWeight,
          creativityWeight,
          recencyWeight
        });
        
        // 创建新配置
        try {
          if (scoreConfig) {
            // 更新现有配置
            await scoreConfig.update({
              ratingWeight,
              interactionWeight,
              qualityWeight,
              creativityWeight,
              recencyWeight
            }, { transaction });
            console.log('更新现有配置成功');
          } else {
            // 创建新配置
            scoreConfig = await ScoreConfig.create({
              ratingWeight,
              interactionWeight,
              qualityWeight,
              creativityWeight,
              recencyWeight,
              isActive: true
            }, { transaction });
            console.log('创建新配置成功:', scoreConfig.id);
          }
        } catch (dbError) {
          console.error('保存评分配置失败:', dbError);
          // 处理表不存在的情况
          if (dbError.name === 'SequelizeDatabaseError' && dbError.original && dbError.original.code === 'ER_NO_SUCH_TABLE') {
            console.warn('评分配置表不存在，跳过保存');
            // 直接返回成功，使用默认配置
            await transaction.rollback();
            
            // 触发批量更新所有作品评分
            setTimeout(async () => {
              await WorkController.updateAllWorkScores();
            }, 0);
            
            return res.status(200).json({
              success: true,
              message: '评分配置更新成功，系统正在重新计算所有作品评分',
              data: {
                ratingWeight,
                interactionWeight,
                qualityWeight,
                creativityWeight,
                recencyWeight
              }
            });
          }
          throw dbError;
        }
        
        // 记录配置变更日志
        try {
          await ScoreConfigLog.create({
            configId: scoreConfig.id,
            operatorId,
            oldConfig,
            newConfig: {
              ratingWeight,
              interactionWeight,
              qualityWeight,
              creativityWeight,
              recencyWeight
            },
            changeReason
          }, { transaction });
          console.log('记录配置变更日志成功');
        } catch (dbError) {
          console.error('记录配置变更日志失败:', dbError);
          // 处理表不存在的情况，跳过日志记录
          if (dbError.name === 'SequelizeDatabaseError' && dbError.original && dbError.original.code === 'ER_NO_SUCH_TABLE') {
            console.warn('评分配置日志表不存在，跳过日志记录');
          } else {
            throw dbError;
          }
        }
        
        // 提交事务
        await transaction.commit();
        console.log('事务提交成功');
        
        // 触发批量更新所有作品评分
        setTimeout(async () => {
          console.log('开始批量更新所有作品评分');
          try {
            await WorkController.updateAllWorkScores();
            console.log('批量更新所有作品评分完成');
          } catch (updateError) {
            console.error('批量更新作品评分失败:', updateError);
          }
        }, 0);
        
        res.status(200).json({
          success: true,
          message: '评分配置更新成功，系统正在重新计算所有作品评分',
          data: scoreConfig
        });
      } catch (error) {
        // 回滚事务
        try {
          await transaction.rollback();
          console.log('事务回滚成功');
        } catch (rollbackError) {
          console.error('事务回滚失败:', rollbackError);
        }
        console.error('事务处理失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('更新评分配置失败:', error);
      console.error('错误堆栈:', error.stack);
      
      // 提供更详细的错误信息
      let errorMessage = '更新评分配置失败，请稍后重试';
      if (error.name === 'SequelizeValidationError') {
        errorMessage = '数据验证失败: ' + error.errors.map(err => err.message).join(', ');
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage = '外键约束错误: 无效的关联ID';
      } else if (error.name === 'SequelizeDatabaseError') {
        errorMessage = '数据库操作失败: ' + (error.original?.message || error.message);
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 获取评分配置变更日志
  static async getScoreConfigLogs(req, res) {
    try {
      // 获取配置变更日志，按时间倒序排列
      const logs = await ScoreConfigLog.findAll({
        include: [
          {
            model: User,
            as: 'operator',
            attributes: ['id', 'username']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });
      
      // 转换日志数据格式
      const formattedLogs = logs.map(log => ({
        id: log.id,
        createdAt: log.createdAt,
        operatorId: log.operatorId,
        operatorName: log.operator?.username || '未知用户',
        oldConfig: log.oldConfig,
        newConfig: log.newConfig,
        changeReason: log.changeReason
      }));
      
      res.status(200).json({
        success: true,
        data: formattedLogs
      });
    } catch (error) {
      console.error('获取配置变更日志失败:', error);
      
      // 处理表不存在的错误，返回空数组
      if (error.name === 'SequelizeDatabaseError' && error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: '获取配置变更日志失败，请稍后重试'
      });
    }
  }

  // 更新作品
  static async updateWork(req, res) {
    try {
      const { id } = req.params;
      const { userId, title, description, rating, mushroomType, image } = req.body;
      const { files } = req;

      // 验证参数
      if (!id || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericId) || numericId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查权限（只有作品创建者可以修改）
      if (work.userId !== numericUserId) {
        return res.status(403).json({
          success: false,
          error: '您没有权限修改此作品'
        });
      }

      // 验证必要字段
      if (!title || !description || !rating || !mushroomType) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的作品信息'
        });
      }

      // 验证评分
      const numericRating = parseInt(rating, 10);
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          error: '评分必须在 1-5 星之间'
        });
      }

      // 验证标题长度
      if (title.length < 2 || title.length > 100) {
        return res.status(400).json({
          success: false,
          error: '标题长度必须在 2-100 个字符之间'
        });
      }

      // 验证描述长度
      if (description.length < 50 || description.length > 500) {
        return res.status(400).json({
          success: false,
          error: '描述长度必须在 50-500 个字符之间'
        });
      }

      // 验证菌菇类型
      const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', '松茸', 'other'];
      if (!validMushroomTypes.includes(mushroomType)) {
        return res.status(400).json({
          success: false,
          error: '无效的菌菇类型'
        });
      }

      // 处理图片上传 - 支持两种方式
      let imageUrl = work.imageUrl;
      
      if (files && files.length > 0) {
        // 方式1：直接文件上传（保持向后兼容）
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(files[0].mimetype)) {
          return res.status(400).json({
            success: false,
            error: '只允许上传 JPG、PNG、GIF、WebP 格式的图片'
          });
        }

        // 验证文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (files[0].size > maxSize) {
          return res.status(400).json({
            success: false,
            error: '图片大小不能超过 10MB'
          });
        }

        // 更新图片URL
        imageUrl = `/uploads/${files[0].filename}`;
      } else if (image) {
        // 方式2：URL方式（新方式，与商品上传一致）
        imageUrl = image;
      }

      // 更新作品
      await work.update({
        title,
        description,
        imageUrl,
        rating: numericRating,
        mushroomType
      });

      // 更新作品总评分
      await WorkController.updateWorkTotalScore(work.id);

      res.status(200).json({
        success: true,
        message: '作品更新成功',
        data: work
      });
    } catch (error) {
      console.error('更新作品失败:', error);
      res.status(500).json({
        success: false,
        error: '更新作品失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 删除作品
  static async deleteWork(req, res) {
    try {
      const { id } = req.params;
      // 从多个可能的位置获取 userId
      let userId = req.body?.userId || req.query?.userId || req.user?.id;

      console.log('删除作品请求:', { id, userId, body: req.body, query: req.query, user: req.user });

      // 验证参数
      if (!id) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericId = parseInt(id, 10);
      let numericUserId = userId ? parseInt(userId, 10) : null;
      
      if (isNaN(numericId) || numericId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      console.log('开始删除作品:', numericId);

      // 使用事务确保操作的原子性
      const result = await sequelize.transaction(async (t) => {
        // 检查作品是否存在
        const work = await Work.findByPk(numericId, { transaction: t });
        if (!work) {
          throw new Error('作品不存在');
        }

        // 检查权限（作品创建者或管理员可以删除）
        if (work.userId !== numericUserId && req.user?.role !== 'admin') {
          throw new Error('您没有权限删除此作品');
        }

        // 直接删除作品，由于设置了 onDelete: 'CASCADE'，关联数据会自动删除
        const deleteResult = await Work.destroy({ 
          where: { id: numericId },
          transaction: t
        });
        
        if (deleteResult === 0) {
          throw new Error('作品不存在');
        }
        
        return deleteResult;
      });

      console.log('作品删除成功:', numericId);

      res.status(200).json({
        success: true,
        message: '作品删除成功'
      });
    } catch (error) {
      console.error('删除作品失败:', error);
      res.status(500).json({
        success: false,
        error: '删除作品失败: ' + (error.message || '未知错误')
      });
    }
  }

  // 添加评论
  static async addComment(req, res) {
    try {
      const { workId, userId, content, rating } = req.body;

      console.log('开始处理添加评论请求:', { workId, userId, content, rating });

      // 验证参数存在性
      if (!workId || !userId) {
        console.error('添加评论失败: 缺少必要的参数', { workId, userId });
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      let numericRating = rating === null || rating === undefined ? null : parseInt(rating, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0) {
        console.error('添加评论失败: 作品ID类型错误', { workId });
        return res.status(400).json({
          success: false,
          error: '无效的作品ID'
        });
      }
      
      if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error('添加评论失败: 用户ID类型错误', { userId });
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }
      
      // 验证评分（如果有）
      if (numericRating !== null && (isNaN(numericRating) || numericRating < 1 || numericRating > 5)) {
        console.error('添加评论失败: 评分类型错误', { rating });
        return res.status(400).json({
          success: false,
          error: '评分必须在1-5星之间'
        });
      }

      // 验证content参数
      if (content !== undefined) {
        if (typeof content !== 'string') {
          console.error('添加评论失败: 评论内容类型错误', { content });
          return res.status(400).json({
            success: false,
            error: '评论内容类型错误'
          });
        }

        if (content.length > 500) {
          console.error('添加评论失败: 评论内容过长', { contentLength: content.length });
          return res.status(400).json({
            success: false,
            error: '评论内容不能超过500个字符'
          });
        }
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        console.error('添加评论失败: 作品不存在', { workId: numericWorkId });
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        console.error('添加评论失败: 用户不存在', { userId: numericUserId });
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 创建评论
      try {
        const comment = await Comment.create({
          workId: numericWorkId,
          userId: numericUserId,
          content: content || '',
          rating: numericRating
        });

        console.log('评论创建成功:', comment.id);

        // 更新作品评论数
        await Work.increment('comments', { where: { id: numericWorkId } });

        // 更新作品总评分
        await WorkController.updateWorkTotalScore(numericWorkId);

        // 构建响应数据，确保格式一致
        const responseData = {
          id: comment.id,
          workId: comment.workId,
          userId: comment.userId,
          content: comment.content,
          rating: comment.rating,
          createdAt: comment.createdAt,
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          }
        };

        res.status(201).json({
          success: true,
          message: '评论添加成功',
          data: responseData
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        console.error('数据库错误详情:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
        
        if (dbError.name === 'SequelizeValidationError') {
          const validationErrors = dbError.errors.map(err => err.message);
          console.error('验证错误:', validationErrors);
          return res.status(400).json({
            success: false,
            error: '数据验证失败: ' + validationErrors.join(', ')
          });
        }
        
        if (dbError.name === 'SequelizeForeignKeyConstraintError') {
          console.error('外键约束错误:', dbError);
          return res.status(400).json({
            success: false,
            error: '无效的作品ID或用户ID'
          });
        }
        
        if (dbError.name === 'SequelizeDatabaseError') {
          console.error('数据库错误:', dbError);
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '添加评论失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    } catch (error) {
      console.error('添加评论失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '添加评论失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 删除评论
  static async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // 验证参数
      if (!id || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericId) || numericId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查评论是否存在
      const comment = await Comment.findByPk(numericId, {
        include: [{
          model: Work,
          as: 'work'
        }]
      });
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: '评论不存在'
        });
      }

      // 检查权限（只有评论发布者或管理员可以删除）
      const user = await User.findByPk(numericUserId);
      if (!user || (comment.userId !== numericUserId && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: '您没有权限删除此评论'
        });
      }

      const workId = comment.workId;

      // 删除评论
      await comment.destroy();

      // 更新作品评论数
      await Work.decrement('comments', { where: { id: workId } });

      // 更新作品总评分
      await WorkController.updateWorkTotalScore(workId);

      res.status(200).json({
        success: true,
        message: '评论删除成功'
      });
    } catch (error) {
      console.error('删除评论失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 详细的错误处理
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          error: '无效的评论ID或用户ID'
        });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: '数据验证失败'
        });
      }
      res.status(500).json({
        success: false,
        error: '删除评论失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 获取作品评论
  static async getWorkComments(req, res) {
    try {
      const { workId } = req.params;
      const { page = 1, pageSize = 20 } = req.query;

      console.log('开始处理获取评论请求:', { workId, page, pageSize });

      // 验证参数
      if (!workId) {
        console.error('获取评论失败: 缺少必要的参数');
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      if (isNaN(numericWorkId) || numericWorkId <= 0) {
        console.error('获取评论失败: 参数类型错误', { workId });
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 验证分页参数
      let numericPage = parseInt(page, 10);
      let numericPageSize = parseInt(pageSize, 10);
      if (isNaN(numericPage) || numericPage <= 0) {
        console.warn('无效的页码，使用默认值1:', { page });
        numericPage = 1;
      }
      if (isNaN(numericPageSize) || numericPageSize <= 0 || numericPageSize > 100) {
        console.warn('无效的每页条数，使用默认值20:', { pageSize });
        numericPageSize = 20;
      }

      // 计算偏移量
      const offset = (numericPage - 1) * numericPageSize;

      // 检查作品是否存在
      try {
        const work = await Work.findByPk(numericWorkId);
        if (!work) {
          console.error('获取评论失败: 作品不存在', { workId: numericWorkId });
          return res.status(404).json({
            success: false,
            error: '作品不存在'
          });
        }
      } catch (workError) {
        console.error('检查作品存在性失败:', workError);
        return res.status(500).json({
          success: false,
          error: '检查作品失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? workError.message : undefined
        });
      }

      // 获取评论，按规则排序
      // 规则：同时包含评分和评论内容的评论优先展示
      try {
        // 并行执行查询，提高性能
        const [comments, total] = await Promise.all([
          Comment.findAll({
            where: { workId: numericWorkId },
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }],
            order: [
              // 首先按是否同时有内容和评分排序（有内容且评分>0的排在前面）
              [sequelize.literal('CASE WHEN content IS NOT NULL AND content != "" AND rating IS NOT NULL AND rating > 0 THEN 0 ELSE 1 END'), 'ASC'],
              // 然后按评分降序排序（处理null值）
              [sequelize.literal('CASE WHEN rating IS NULL THEN 0 ELSE rating END'), 'DESC'],
              // 最后按创建时间降序排序
              ['createdAt', 'DESC']
            ],
            limit: numericPageSize,
            offset: offset
          }),
          Comment.count({ where: { workId: numericWorkId } })
        ]);

        console.log('获取评论成功:', { workId: numericWorkId, commentCount: comments.length, total });

        // 处理评论数据，确保格式一致
        const formattedComments = comments.map(comment => ({
          id: comment.id,
          workId: comment.workId,
          userId: comment.userId,
          content: comment.content,
          rating: comment.rating,
          createdAt: comment.createdAt,
          user: comment.user ? {
            id: comment.user.id,
            username: comment.user.username,
            avatar: comment.user.avatar
          } : null
        }));

        res.status(200).json({
          success: true,
          data: {
            comments: formattedComments,
            total: total,
            pagination: {
              currentPage: numericPage,
              pageSize: numericPageSize,
              totalPages: Math.ceil(total / numericPageSize)
            }
          }
        });
      } catch (commentError) {
        console.error('获取评论失败:', commentError);
        console.error('获取评论错误详情:', {
          name: commentError.name,
          message: commentError.message,
          stack: commentError.stack
        });
        
        if (commentError.name === 'SequelizeDatabaseError') {
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? commentError.message : undefined
          });
        }
        
        if (commentError.name === 'SequelizeAssociationError') {
          return res.status(500).json({
            success: false,
            error: '关联查询失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? commentError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '获取评论失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? commentError.message : undefined
        });
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '获取评论失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 添加评分
  static async addRating(req, res) {
    try {
      const { workId, userId, rating } = req.body;

      console.log('开始处理添加评分请求:', { workId, userId, rating });

      // 验证参数存在性
      if (!workId || !userId || rating === undefined) {
        console.error('添加评分失败: 缺少必要的参数', { workId, userId, rating });
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      const numericRating = parseInt(rating, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0) {
        console.error('添加评分失败: 作品ID类型错误', { workId });
        return res.status(400).json({
          success: false,
          error: '无效的作品ID'
        });
      }
      
      if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error('添加评分失败: 用户ID类型错误', { userId });
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }
      
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        console.error('添加评分失败: 评分类型错误', { rating });
        return res.status(400).json({
          success: false,
          error: '评分必须在1-5星之间'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        console.error('添加评分失败: 作品不存在', { workId: numericWorkId });
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        console.error('添加评分失败: 用户不存在', { userId: numericUserId });
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查是否已经评分
      const existingRating = await WorkRating.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      if (existingRating) {
        return res.status(400).json({
          success: false,
          error: '您已经对该作品进行过评分'
        });
      }

      // 创建评分
      try {
        const newRating = await WorkRating.create({
          workId: numericWorkId,
          userId: numericUserId,
          rating: numericRating
        });

        console.log('评分创建成功:', newRating.id);

        // 更新作品总评分
        await WorkController.updateWorkTotalScore(numericWorkId);

        res.status(201).json({
          success: true,
          message: '评分添加成功',
          data: newRating
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        console.error('数据库错误详情:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
        
        if (dbError.name === 'SequelizeValidationError') {
          const validationErrors = dbError.errors.map(err => err.message);
          console.error('验证错误:', validationErrors);
          return res.status(400).json({
            success: false,
            error: '数据验证失败: ' + validationErrors.join(', ')
          });
        }
        
        if (dbError.name === 'SequelizeForeignKeyConstraintError') {
          console.error('外键约束错误:', dbError);
          return res.status(400).json({
            success: false,
            error: '无效的作品ID或用户ID'
          });
        }
        
        if (dbError.name === 'SequelizeDatabaseError') {
          console.error('数据库错误:', dbError);
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '添加评分失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    } catch (error) {
      console.error('添加评分失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '添加评分失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 获取作品评分
  static async getWorkRatings(req, res) {
    try {
      const { workId } = req.params;

      console.log('开始处理获取评分请求:', { workId });

      // 验证参数
      if (!workId) {
        console.error('获取评分失败: 缺少必要的参数');
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      if (isNaN(numericWorkId) || numericWorkId <= 0) {
        console.error('获取评分失败: 参数类型错误', { workId });
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        console.error('获取评分失败: 作品不存在', { workId: numericWorkId });
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 获取评分
      try {
        const ratings = await WorkRating.findAll({
          where: { workId: numericWorkId },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }],
          order: [['createdAt', 'DESC']]
        });

        console.log('获取评分成功:', { workId: numericWorkId, ratingCount: ratings.length });

        // 计算平均评分
        let averageRating = 0;
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
          averageRating = totalRating / ratings.length;
        }

        // 处理评分数据，确保格式一致
        const formattedRatings = ratings.map(rating => ({
          id: rating.id,
          workId: rating.workId,
          userId: rating.userId,
          rating: rating.rating,
          createdAt: rating.createdAt,
          user: rating.user ? {
            id: rating.user.id,
            username: rating.user.username,
            avatar: rating.user.avatar
          } : null
        }));

        res.status(200).json({
          success: true,
          data: {
            ratings: formattedRatings,
            total: formattedRatings.length,
            averageRating: averageRating
          }
        });
      } catch (ratingError) {
        console.error('获取评分失败:', ratingError);
        console.error('获取评分错误详情:', {
          name: ratingError.name,
          message: ratingError.message,
          stack: ratingError.stack
        });
        
        if (ratingError.name === 'SequelizeDatabaseError') {
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? ratingError.message : undefined
          });
        }
        
        if (ratingError.name === 'SequelizeAssociationError') {
          return res.status(500).json({
            success: false,
            error: '关联查询失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? ratingError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '获取评分失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? ratingError.message : undefined
        });
      }
    } catch (error) {
      console.error('获取评分失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '获取评分失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 更新评分
  static async updateRating(req, res) {
    try {
      const { id } = req.params;
      const { userId, rating } = req.body;

      console.log('开始处理更新评分请求:', { id, userId, rating });

      // 验证参数
      if (!id || !userId || rating === undefined) {
        console.error('更新评分失败: 缺少必要的参数', { id, userId, rating });
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      const numericRating = parseInt(rating, 10);
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('更新评分失败: 评分ID类型错误', { id });
        return res.status(400).json({
          success: false,
          error: '无效的评分ID'
        });
      }
      
      if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error('更新评分失败: 用户ID类型错误', { userId });
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        });
      }
      
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        console.error('更新评分失败: 评分类型错误', { rating });
        return res.status(400).json({
          success: false,
          error: '评分必须在1-5星之间'
        });
      }

      // 检查评分是否存在
      const existingRating = await WorkRating.findByPk(numericId);
      if (!existingRating) {
        console.error('更新评分失败: 评分不存在', { id: numericId });
        return res.status(404).json({
          success: false,
          error: '评分不存在'
        });
      }

      // 检查权限（只有评分发布者可以更新）
      if (existingRating.userId !== numericUserId) {
        return res.status(403).json({
          success: false,
          error: '您没有权限更新此评分'
        });
      }

      // 更新评分
      try {
        await existingRating.update({
          rating: numericRating
        });

        console.log('评分更新成功:', existingRating.id);

        // 更新作品总评分
        await WorkController.updateWorkTotalScore(existingRating.workId);

        res.status(200).json({
          success: true,
          message: '评分更新成功',
          data: existingRating
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        console.error('数据库错误详情:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
        
        if (dbError.name === 'SequelizeValidationError') {
          const validationErrors = dbError.errors.map(err => err.message);
          console.error('验证错误:', validationErrors);
          return res.status(400).json({
            success: false,
            error: '数据验证失败: ' + validationErrors.join(', ')
          });
        }
        
        if (dbError.name === 'SequelizeDatabaseError') {
          console.error('数据库错误:', dbError);
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '更新评分失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    } catch (error) {
      console.error('更新评分失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '更新评分失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 删除评分
  static async deleteRating(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      console.log('开始处理删除评分请求:', { id, userId });

      // 验证参数
      if (!id || !userId) {
        console.error('删除评分失败: 缺少必要的参数', { id, userId });
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericId) || numericId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        console.error('删除评分失败: 参数类型错误', { id, userId });
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查评分是否存在
      const existingRating = await WorkRating.findByPk(numericId);
      if (!existingRating) {
        console.error('删除评分失败: 评分不存在', { id: numericId });
        return res.status(404).json({
          success: false,
          error: '评分不存在'
        });
      }

      // 检查权限（只有评分发布者可以删除）
      if (existingRating.userId !== numericUserId) {
        return res.status(403).json({
          success: false,
          error: '您没有权限删除此评分'
        });
      }

      const workId = existingRating.workId;

      // 删除评分
      try {
        await existingRating.destroy();

        console.log('评分删除成功:', numericId);

        // 更新作品总评分
        await WorkController.updateWorkTotalScore(workId);

        res.status(200).json({
          success: true,
          message: '评分删除成功'
        });
      } catch (dbError) {
        console.error('数据库操作失败:', dbError);
        console.error('数据库错误详情:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
        
        if (dbError.name === 'SequelizeDatabaseError') {
          console.error('数据库错误:', dbError);
          return res.status(500).json({
            success: false,
            error: '数据库操作失败，请稍后重试',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
        
        // 通用错误处理
        return res.status(500).json({
          success: false,
          error: '删除评分失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    } catch (error) {
      console.error('删除评分失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: '删除评分失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 添加评论
  static async addComment(req, res) {
    try {
      const { workId, userId, content, rating, parentId } = req.body;

      // 验证参数
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的评论信息'
        });
      }

      // 验证评论内容长度
      if (content && content.length > 500) {
        return res.status(400).json({
          success: false,
          error: '评论内容不能超过500个字符'
        });
      }

      // 验证评分
      if (rating !== null && rating !== undefined) {
        const numericRating = parseInt(rating, 10);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
          return res.status(400).json({
            success: false,
            error: '评分必须在1-5星之间'
          });
        }
      }

      // 检查作品是否存在
      const work = await Work.findByPk(workId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 如果有parentId，检查父评论是否存在
      if (parentId) {
        const parentComment = await Comment.findByPk(parentId);
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            error: '父评论不存在'
          });
        }
      }

      // 创建评论
      const comment = await Comment.create({
        workId,
        userId,
        parentId: parentId || null,
        content: content || '',
        rating: rating || null
      });

      // 更新作品的评论数
      await work.increment('comments');

      // 返回评论信息，包含用户信息
      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '评论添加成功',
        data: commentWithUser
      });
    } catch (error) {
      console.error('添加评论失败:', error);
      res.status(500).json({
        success: false,
        error: '添加评论失败，请稍后重试'
      });
    }
  }

  // 获取作品评论
  static async getWorkComments(req, res) {
    try {
      const { workId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;

      // 验证参数
      if (!workId) {
        return res.status(400).json({
          success: false,
          error: '缺少作品ID'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(workId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 分页参数
      const limit = parseInt(pageSize);
      const offset = (parseInt(page) - 1) * limit;

      // 查询评论列表（只获取顶级评论，不包含回复）
      const { count, rows: topLevelComments } = await Comment.findAndCountAll({
        where: { workId, parentId: null },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: Comment,
            as: 'replies',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar']
              }
            ],
            order: [['createdAt', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      res.status(200).json({
        success: true,
        data: {
          comments: topLevelComments,
          pagination: {
            currentPage: parseInt(page),
            pageSize: limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取作品评论失败:', error);
      res.status(500).json({
        success: false,
        error: '获取作品评论失败，请稍后重试'
      });
    }
  }

  // 检查收藏状态
  static async checkFavoriteStatus(req, res) {
    try {
      const { workId, userId } = req.query;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查是否已经收藏
      const existingFavorite = await Favorite.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      res.status(200).json({
        success: true,
        data: {
          isFavorited: !!existingFavorite
        }
      });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      res.status(500).json({
        success: false,
        error: '检查收藏状态失败，请稍后重试'
      });
    }
  }

  // 检查点赞状态
  static async checkLikeStatus(req, res) {
    try {
      const { workId, userId } = req.query;

      // 参数验证
      if (!workId || !userId) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的参数'
        });
      }

      // 验证参数类型和范围
      const numericWorkId = parseInt(workId, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericWorkId) || numericWorkId <= 0 || isNaN(numericUserId) || numericUserId <= 0) {
        return res.status(400).json({
          success: false,
          error: '参数类型错误'
        });
      }

      // 检查作品是否存在
      const work = await Work.findByPk(numericWorkId);
      if (!work) {
        return res.status(404).json({
          success: false,
          error: '作品不存在'
        });
      }

      // 检查用户是否存在
      const user = await User.findByPk(numericUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 检查是否已经点赞
      const existingLike = await Like.findOne({
        where: { workId: numericWorkId, userId: numericUserId }
      });

      res.status(200).json({
        success: true,
        data: {
          isLiked: !!existingLike
        }
      });
    } catch (error) {
      console.error('检查点赞状态失败:', error);
      res.status(500).json({
        success: false,
        error: '检查点赞状态失败，请稍后重试'
      });
    }
  }

  // 获取所有作品（管理员专用）
  static async getAllWorks(req, res) {
    try {
      const { page = 1, pageSize = 12, mushroomType = 'all' } = req.query;
      console.log('接收到获取所有作品请求:', { page, pageSize, mushroomType });

      // 验证分页参数
      const numericPage = parseInt(page, 10);
      const numericPageSize = parseInt(pageSize, 10);
      
      if (isNaN(numericPage) || numericPage < 1) {
        console.warn('无效的页码:', page);
        return res.status(400).json({
          success: false,
          error: '无效的页码'
        });
      }
      
      if (isNaN(numericPageSize) || numericPageSize < 1 || numericPageSize > 100) {
        console.warn('无效的每页条数:', pageSize);
        return res.status(400).json({
          success: false,
          error: '无效的每页条数'
        });
      }

      const offset = (numericPage - 1) * numericPageSize;

      const whereClause = {};
      if (mushroomType !== 'all') {
        const validMushroomTypes = ['shiitake', 'oyster', 'enoki', 'king', 'matsutake', 'other'];
        if (!validMushroomTypes.includes(mushroomType)) {
          console.warn('无效的菌菇类型:', mushroomType);
          return res.status(400).json({
            success: false,
            error: '无效的菌菇类型'
          });
        }
        whereClause.mushroomType = mushroomType;
        console.log('添加菌菇类型过滤条件:', mushroomType);
      }

      console.log('查询条件:', whereClause);

      const [works, total] = await Promise.all([
        Work.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: numericPageSize,
          offset: offset
        }),
        Work.count({ where: whereClause })
      ]);

      console.log('查询结果:', { worksCount: works.length, total });

      res.status(200).json({
        success: true,
        data: {
          works,
          pagination: {
            currentPage: numericPage,
            pageSize: numericPageSize,
            total,
            totalPages: Math.ceil(total / numericPageSize)
          }
        }
      });
    } catch (error) {
      console.error('获取所有作品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取所有作品失败，请稍后重试'
      });
    }
  }
}

module.exports = WorkController;