const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

// 所有消息路由都需要认证
router.use(authMiddleware);

// 获取对话列表
router.get('/conversations', messageController.getConversations);

// 获取对话详情
router.get('/conversations/:id', messageController.getConversationDetail);

// 创建新对话
router.post('/conversations', messageController.createConversation);

// 发送消息
router.post('/', messageController.sendMessage);

// 获取对话消息
router.get('/conversations/:conversationId/messages', messageController.getMessages);

// 更新消息状态
router.put('/messages/:messageId/status', messageController.updateMessageStatus);

// 获取未读消息数量
router.get('/unread-count', messageController.getUnreadCount);

// 标记对话已读
router.put('/conversations/:conversationId/read', messageController.markConversationAsRead);

// 搜索消息
router.get('/search', messageController.searchMessages);

module.exports = router;