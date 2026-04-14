const Notification = require('../models/Notification');
const UserBoxOrder = require('../models/UserBoxOrder');
const MushroomBox = require('../models/MushroomBox');
const Recipe = require('../models/Recipe');

// 通知相关控制器

// 获取用户通知列表
exports.getUserNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 20, type } = req.query;
    
    const whereClause = { userId };
    if (type) whereClause.type = type;
    
    const offset = (page - 1) * limit;
    
    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.rows,
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(notifications.count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户通知失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户通知失败'
    });
  }
};

// 标记通知为已读
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: '通知不存在'
      });
    }
    
    await notification.update({
      isRead: true,
      readAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    res.status(500).json({
      success: false,
      error: '标记通知为已读失败'
    });
  }
};

// 标记所有通知为已读
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    await Notification.update(
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { where: { userId, isRead: false } }
    );
    
    res.status(200).json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    console.error('标记所有通知为已读失败:', error);
    res.status(500).json({
      success: false,
      error: '标记所有通知为已读失败'
    });
  }
};

// 删除通知
exports.deleteNotification = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationId } = req.params;
    
    const result = await Notification.destroy({
      where: { id: notificationId, userId }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: '通知不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '通知删除成功'
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({
      success: false,
      error: '删除通知失败'
    });
  }
};

// 发送培育提醒
exports.sendCultivationReminder = async (req, res) => {
  try {
    // 这个API可以由管理员调用，或者通过定时任务自动调用
    const { userId, orderId, message } = req.body;
    
    // 查询代培订单
    const order = await UserBoxOrder.findOne({
      where: { id: orderId, userId, cultivationService: true },
      include: [{ model: MushroomBox, as: 'box' }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '代培订单不存在'
      });
    }
    
    // 创建通知
    const notification = await Notification.create({
      userId,
      type: 'cultivation_reminder',
      title: '菌菇培育提醒',
      content: message || `您的${order.box.name}培育进度已更新，请查看详情。`,
      relatedId: orderId
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('发送培育提醒失败:', error);
    res.status(500).json({
      success: false,
      error: '发送培育提醒失败'
    });
  }
};

// 发送食谱推荐通知
exports.sendRecipeRecommendation = async (req, res) => {
  try {
    const { userId, recipeId } = req.body;
    
    // 查询食谱
    const recipe = await Recipe.findByPk(recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在'
      });
    }
    
    // 创建通知
    const notification = await Notification.create({
      userId,
      type: 'recipe_recommendation',
      title: '推荐食谱',
      content: `根据您的口味偏好，为您推荐食谱：${recipe.name}，快去看看吧！`,
      relatedId: recipeId
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('发送食谱推荐失败:', error);
    res.status(500).json({
      success: false,
      error: '发送食谱推荐失败'
    });
  }
};

// 获取未读通知数量
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const count = await Notification.count({
      where: { userId, isRead: false }
    });
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({
      success: false,
      error: '获取未读通知数量失败'
    });
  }
};