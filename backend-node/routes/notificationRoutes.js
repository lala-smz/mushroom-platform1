const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// 所有通知路由都需要认证
router.use(authMiddleware);

// 获取用户通知列表
router.get('/', notificationController.getUserNotifications);

// 获取未读通知数量
router.get('/unread-count', notificationController.getUnreadNotificationCount);

// 标记通知为已读
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// 标记所有通知为已读
router.put('/read-all', notificationController.markAllNotificationsAsRead);

// 删除通知
router.delete('/:notificationId', notificationController.deleteNotification);

// 发送培育提醒（管理员或系统使用）
router.post('/cultivation-reminder', notificationController.sendCultivationReminder);

// 发送食谱推荐通知（系统使用）
router.post('/recipe-recommendation', notificationController.sendRecipeRecommendation);

module.exports = router;