const CookingVideo = require('../models/CookingVideo');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/video-thumbnails');
const videoDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// 配置封面上传
const thumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 配置视频上传
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const thumbnailUpload = multer({ storage: thumbnailStorage });
const videoUpload = multer({ storage: videoStorage });

// 烹饪视频CRUD控制器

// 获取所有烹饪视频
exports.getCookingVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, quality, source, category, mushroomBoxId, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (quality) whereClause.quality = quality;
    if (source) whereClause.source = source;
    if (category) whereClause.category = category;
    if (mushroomBoxId) whereClause.mushroomBoxId = parseInt(mushroomBoxId);
    
    // 添加搜索功能
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    // 确定排序字段
    let orderClause;
    if (sortBy === 'sortOrder') {
      orderClause = [['sortOrder', 'ASC'], ['createdAt', 'DESC']];
    } else {
      orderClause = [[sortBy, sortOrder]];
    }
    
    // 查询视频列表（暂时不包含关联数据，确保基本功能正常）
    const videos = await CookingVideo.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause
    });
    
    // 查询总数量
    const total = await CookingVideo.count({
      where: whereClause
    });
    
    res.status(200).json({
      success: true,
      data: {
        videos,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取烹饪视频列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取烹饪视频列表失败'
    });
  }
};

// 获取单个烹饪视频详情
exports.getCookingVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await CookingVideo.findByPk(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: '视频不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('获取烹饪视频详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取烹饪视频详情失败'
    });
  }
};

// 创建烹饪视频
exports.createCookingVideo = async (req, res) => {
  console.log('=== 创建烹饪视频请求 ===');
  console.log('请求体:', req.body);
  
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, recipeId, mushroomId, mushroomBoxId, mushroomType, quality, source, category, sortOrder, tags, status } = req.body;
    
    // 数据验证
    if (!title || !videoUrl || !duration) {
      console.log('验证失败：缺少必填字段');
      return res.status(400).json({
        success: false,
        error: '视频标题、URL和时长为必填项'
      });
    }
    
    // 处理 mushroomBoxId - 确保它是数字或 null
    let processedMushroomBoxId = null;
    if (mushroomBoxId !== undefined && mushroomBoxId !== null && mushroomBoxId !== '') {
      const parsed = parseInt(mushroomBoxId);
      if (!isNaN(parsed) && parsed > 0) {
        processedMushroomBoxId = parsed;
      }
    }
    
    // 处理 tags
    let tagsValue = null;
    if (tags) {
      if (Array.isArray(tags)) {
        // 如果是数组，直接序列化
        tagsValue = JSON.stringify(tags);
      } else if (typeof tags === 'string') {
        // 如果是字符串，检查是否已经是JSON格式
        try {
          const parsed = JSON.parse(tags);
          // 如果能解析为数组，直接保存原字符串
          if (Array.isArray(parsed)) {
            tagsValue = tags;
          } else {
            // 如果不是数组，包装成数组再序列化
            tagsValue = JSON.stringify([tags]);
          }
        } catch {
          // 如果不是有效的JSON，包装成数组再序列化
          tagsValue = JSON.stringify([tags]);
        }
      }
    }
    
    console.log('处理后的数据:', {
      title,
      videoUrl,
      duration: parseInt(duration),
      mushroomBoxId: processedMushroomBoxId,
      category: category || 'cultivation'
    });
    
    // 创建视频 - 只传递我们处理过的数据，其他使用模型默认值
    const createData = {
      title: title.trim(),
      videoUrl,
      duration: parseInt(duration),
      category: category || 'cultivation'
    };
    
    // 可选字段
    if (description !== undefined && description !== null && description !== '') {
      createData.description = description.trim();
    }
    if (thumbnailUrl !== undefined && thumbnailUrl !== null && thumbnailUrl !== '') {
      createData.thumbnailUrl = thumbnailUrl;
    }
    if (recipeId !== undefined && recipeId !== null && recipeId !== '') {
      createData.recipeId = parseInt(recipeId);
    }
    if (mushroomId !== undefined && mushroomId !== null && mushroomId !== '') {
      createData.mushroomId = parseInt(mushroomId);
    }
    if (mushroomType !== undefined && mushroomType !== null && mushroomType !== '') {
      createData.mushroomType = mushroomType;
    }
    if (processedMushroomBoxId !== null) {
      createData.mushroomBoxId = processedMushroomBoxId;
    }
    if (quality !== undefined && quality !== null && quality !== '') {
      createData.quality = quality;
    }
    if (source !== undefined && source !== null && source !== '') {
      createData.source = source;
    }
    if (sortOrder !== undefined && sortOrder !== null) {
      createData.sortOrder = parseInt(sortOrder) || 0;
    }
    if (tagsValue !== null) {
      createData.tags = tagsValue;
    }
    if (status !== undefined && status !== null && status !== '') {
      createData.status = status;
    }
    
    console.log('最终创建数据:', createData);
    
    // 创建视频
    const video = await CookingVideo.create(createData);
    
    console.log('视频创建成功，ID:', video.id);
    
    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('创建烹饪视频失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: `创建烹饪视频失败: ${error.message}`
    });
  }
};

// 更新烹饪视频
exports.updateCookingVideo = async (req, res) => {
  console.log('=== 更新烹饪视频请求 ===');
  console.log('视频ID:', req.params.id);
  console.log('请求体:', req.body);
  
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnailUrl, duration, recipeId, mushroomId, mushroomBoxId, mushroomType, quality, source, category, sortOrder, tags, status, reviewStatus } = req.body;
    
    // 查找视频
    const video = await CookingVideo.findByPk(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: '视频不存在'
      });
    }
    
    // 处理 mushroomBoxId
    let processedMushroomBoxId = video.mushroomBoxId;
    if (mushroomBoxId !== undefined) {
      if (mushroomBoxId === null || mushroomBoxId === '') {
        processedMushroomBoxId = null;
      } else {
        const parsed = parseInt(mushroomBoxId);
        if (!isNaN(parsed) && parsed > 0) {
          processedMushroomBoxId = parsed;
        }
      }
    }
    
    console.log('处理后的 mushroomBoxId:', processedMushroomBoxId);
    
    // 构建更新数据
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (recipeId !== undefined) updateData.recipeId = recipeId ? parseInt(recipeId) : null;
    if (mushroomId !== undefined) updateData.mushroomId = mushroomId ? parseInt(mushroomId) : null;
    if (mushroomType !== undefined) updateData.mushroomType = mushroomType || null;
    if (mushroomBoxId !== undefined) updateData.mushroomBoxId = processedMushroomBoxId;
    if (quality !== undefined) updateData.quality = quality;
    if (source !== undefined) updateData.source = source;
    if (category !== undefined) updateData.category = category;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (tags !== undefined) {
      if (!tags) {
        updateData.tags = null;
      } else if (Array.isArray(tags)) {
        updateData.tags = JSON.stringify(tags);
      } else if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) {
            updateData.tags = tags;
          } else {
            updateData.tags = JSON.stringify([tags]);
          }
        } catch {
          updateData.tags = JSON.stringify([tags]);
        }
      }
    }
    if (status !== undefined) updateData.status = status;
    if (reviewStatus !== undefined) updateData.reviewStatus = reviewStatus;
    
    // 更新视频
    await video.update(updateData);
    
    console.log('视频更新成功，ID:', video.id);
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('更新烹饪视频失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: `更新烹饪视频失败: ${error.message}`
    });
  }
};

// 删除烹饪视频
exports.deleteCookingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找视频
    const video = await CookingVideo.findByPk(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: '视频不存在'
      });
    }
    
    // 删除视频
    await video.destroy();
    
    res.status(200).json({
      success: true,
      message: '视频删除成功'
    });
  } catch (error) {
    console.error('删除烹饪视频失败:', error);
    res.status(500).json({
      success: false,
      error: '删除烹饪视频失败'
    });
  }
};

// 批量删除视频
exports.bulkDeleteCookingVideos = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供要删除的视频ID列表'
      });
    }
    
    // 批量删除
    const result = await CookingVideo.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: `成功删除 ${result} 个视频`,
      deletedCount: result
    });
  } catch (error) {
    console.error('批量删除视频失败:', error);
    res.status(500).json({
      success: false,
      error: '批量删除视频失败'
    });
  }
};

// 批量更新视频状态
exports.bulkUpdateVideoStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供要操作的视频ID列表'
      });
    }
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值'
      });
    }
    
    // 批量更新
    const result = await CookingVideo.update(
      { status },
      {
        where: {
          id: {
            [Op.in]: ids
          }
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `成功${status === 'active' ? '启用' : '禁用'} ${result[0]} 个视频`,
      updatedCount: result[0]
    });
  } catch (error) {
    console.error('批量更新视频状态失败:', error);
    res.status(500).json({
      success: false,
      error: '批量更新视频状态失败'
    });
  }
};

// 更新视频排序
exports.updateVideoSortOrder = async (req, res) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供视频排序数据'
      });
    }
    
    // 批量更新排序
    for (const videoData of videos) {
      await CookingVideo.update(
        { sortOrder: videoData.sortOrder },
        { where: { id: videoData.id } }
      );
    }
    
    res.status(200).json({
      success: true,
      message: '视频排序更新成功'
    });
  } catch (error) {
    console.error('更新视频排序失败:', error);
    res.status(500).json({
      success: false,
      error: '更新视频排序失败'
    });
  }
};

// 获取盲盒关联的视频
exports.getVideosByMushroomBoxId = async (req, res) => {
  try {
    const { mushroomBoxId } = req.params;
    const { sortBy = 'sortOrder', sortOrder = 'ASC', category, limit } = req.query;
    
    // 首先尝试获取该盲盒专属的视频
    let whereClause = {
      mushroomBoxId: parseInt(mushroomBoxId),
      status: 'active'
    };
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    // 确定排序
    let orderClause;
    if (sortBy === 'relevance') {
      orderClause = [['viewCount', 'DESC'], ['sortOrder', 'ASC']];
    } else if (sortBy === 'time') {
      orderClause = [['createdAt', 'DESC']];
    } else if (sortBy === 'sortOrder') {
      orderClause = [['sortOrder', 'ASC'], ['createdAt', 'DESC']];
    } else {
      orderClause = [['sortOrder', 'ASC'], ['createdAt', 'DESC']];
    }
    
    const queryOptions = {
      where: whereClause,
      order: orderClause
    };
    
    if (limit) {
      queryOptions.limit = parseInt(limit);
    }
    
    let videos = await CookingVideo.findAll(queryOptions);
    
    // 如果该盲盒没有专属视频，则返回一些通用的推荐视频
    if (videos.length === 0) {
      console.log(`盲盒 ${mushroomBoxId} 没有专属视频，返回通用推荐视频`);
      
      // 获取通用推荐视频（不限制盲盒ID）
      const recommendWhereClause = {
        status: 'active'
      };
      
      if (category && category !== 'all') {
        recommendWhereClause.category = category;
      }
      
      const recommendOptions = {
        where: recommendWhereClause,
        order: [['viewCount', 'DESC']],
        limit: limit ? parseInt(limit) : 6
      };
      
      videos = await CookingVideo.findAll(recommendOptions);
    }
    
    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('获取盲盒视频失败:', error);
    res.status(500).json({
      success: false,
      error: '获取盲盒视频失败'
    });
  }
};

// 上传视频封面
exports.uploadVideoThumbnail = async (req, res) => {
  try {
    // 使用multer中间件处理文件上传
    const uploadSingle = thumbnailUpload.single('thumbnail');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('上传封面失败:', err);
        return res.status(400).json({
          success: false,
          error: '上传封面失败: ' + err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的封面图片'
        });
      }
      
      // 验证文件格式
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const extname = path.extname(req.file.originalname).toLowerCase();
      if (!allowedTypes.includes(extname)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: '只支持 JPG、JPEG、PNG、GIF、WEBP 格式的图片'
        });
      }
      
      // 验证文件大小（限制 5MB）
      if (req.file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: '图片大小不能超过 5MB'
        });
      }
      
      // 处理上传的图片
      const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/video-thumbnails/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        data: {
          url: thumbnailUrl,
          path: `/uploads/video-thumbnails/${req.file.filename}`,
          filename: req.file.filename
        }
      });
    });
  } catch (error) {
    console.error('上传视频封面失败:', error);
    res.status(500).json({
      success: false,
      error: '上传视频封面失败'
    });
  }
};

// 上传视频文件
exports.uploadVideoFile = async (req, res) => {
  try {
    const uploadSingle = videoUpload.single('video');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.error('上传视频失败:', err);
        return res.status(400).json({
          success: false,
          error: '上传视频失败: ' + err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的视频文件'
        });
      }
      
      // 验证文件格式
      const allowedTypes = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      const extname = path.extname(req.file.originalname).toLowerCase();
      if (!allowedTypes.includes(extname)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: '只支持 MP4、WebM、OGG、MOV、AVI 格式的视频'
        });
      }
      
      // 验证文件大小（限制 500MB）
      if (req.file.size > 500 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: '视频大小不能超过 500MB'
        });
      }
      
      // 处理上传的视频
      const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        data: {
          url: videoUrl,
          path: `/uploads/videos/${req.file.filename}`,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    });
  } catch (error) {
    console.error('上传视频文件失败:', error);
    res.status(500).json({
      success: false,
      error: '上传视频文件失败'
    });
  }
};

// 获取视频统计信息
exports.getVideoStats = async (req, res) => {
  try {
    // 获取视频总数
    const totalVideos = await CookingVideo.count();
    
    // 获取各状态视频数量
    const statusStats = await CookingVideo.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });
    
    // 获取各分类视频数量
    const categoryStats = await CookingVideo.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });
    
    // 获取各质量视频数量
    const qualityStats = await CookingVideo.findAll({
      attributes: ['quality', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['quality']
    });
    
    // 获取总观看次数
    const viewStats = await CookingVideo.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('viewCount')), 'totalViews']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalVideos,
        totalViews: parseInt(viewStats?.dataValues?.totalViews || 0),
        statusStats: statusStats.map(item => ({
          status: item.status,
          count: parseInt(item.count)
        })),
        categoryStats: categoryStats.map(item => ({
          category: item.category,
          count: parseInt(item.count)
        })),
        qualityStats: qualityStats.map(item => ({
          quality: item.quality,
          count: parseInt(item.count)
        }))
      }
    });
  } catch (error) {
    console.error('获取视频统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取视频统计信息失败'
    });
  }
};