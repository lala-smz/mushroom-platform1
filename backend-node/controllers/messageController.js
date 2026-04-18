const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Replace sequelize.Op with Op for all operations
const SequelizeOp = Op;

const messageController = {
  // 获取对话列表
  getConversations: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      console.log(`获取对话列表 - 用户ID: ${userId}, 角色: ${userRole}`);
      
      // 查询当前用户参与的所有对话
      const conversations = await Conversation.findAll({
        where: {
          [SequelizeOp.or]: [
            {
              initiatorId: userId,
              initiatorRole: userRole
            },
            {
              receiverId: userId,
              receiverRole: userRole
            }
          ]
        },
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']]
          },
          {
            model: User,
            as: 'initiatorUser',
            attributes: ['id', 'username', 'avatar', 'role'],
            required: false
          },
          {
            model: User,
            as: 'receiverUser',
            attributes: ['id', 'username', 'avatar', 'role'],
            required: false
          }
        ],
        order: [['updatedAt', 'DESC']]
      });

      console.log(`获取对话列表成功 - 找到 ${conversations.length} 个对话`);
      
      // 处理对话数据，添加商家名称等信息
      const processedConversations = conversations.map(conversation => {
        const conversationData = conversation.toJSON();
        
        // 添加商家名称信息
        if (conversationData.initiatorRole === 'seller') {
          conversationData.initiatorName = conversationData.initiatorUser?.username || `商家${conversationData.initiatorId}`;
        }
        
        if (conversationData.receiverRole === 'seller') {
          conversationData.receiverName = conversationData.receiverUser?.username || `商家${conversationData.receiverId}`;
        }
        
        return conversationData;
      });
      
      res.status(200).json({
        success: true,
        data: processedConversations
      });
    } catch (error) {
      console.error('获取对话列表失败:', error);
      console.error('错误详情:', error.stack);
      res.status(500).json({
        success: false,
        error: '获取对话列表失败'
      });
    }
  },

  // 获取对话详情
  getConversationDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 检查当前用户是否参与该对话
      const conversation = await Conversation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'initiatorUser',
            attributes: ['id', 'username', 'avatar', 'role'],
            required: false
          },
          {
            model: User,
            as: 'receiverUser',
            attributes: ['id', 'username', 'avatar', 'role'],
            required: false
          }
        ]
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在'
        });
      }

      // 验证权限
      const isParticipant = (
        conversation.initiatorId === userId && conversation.initiatorRole === userRole
      ) || (
        conversation.receiverId === userId && conversation.receiverRole === userRole
      );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: '无权限访问该对话'
        });
      }

      // 获取对话消息
      const messages = await Message.findAll({
        where: { conversationId: id },
        order: [['createdAt', 'ASC']]
      });

      // 标记对话为已读
      await Conversation.update(
        { unreadCount: 0 },
        { where: { id } }
      );

      // 标记消息为已读
      await Message.update(
        { status: 'read' },
        {
          where: {
            conversationId: id,
            [SequelizeOp.not]: {
              senderId: userId,
              senderRole: userRole
            }
          }
        }
      );

      // 处理对话数据，添加商家名称等信息
      const conversationData = conversation.toJSON();
      
      // 添加商家名称信息
      if (conversationData.initiatorRole === 'seller') {
        conversationData.initiatorName = conversationData.initiatorUser?.username || `商家${conversationData.initiatorId}`;
      }
      
      if (conversationData.receiverRole === 'seller') {
        conversationData.receiverName = conversationData.receiverUser?.username || `商家${conversationData.receiverId}`;
      }

      res.status(200).json({
        success: true,
        data: {
          conversation: conversationData,
          messages
        }
      });
    } catch (error) {
      console.error('获取对话详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取对话详情失败'
      });
    }
  },

  // 创建新对话
  createConversation: async (req, res) => {
    try {
      const { receiverId, receiverRole } = req.body;
      const initiatorId = req.user.id;
      const initiatorRole = req.user.role;

      // 检查是否已存在对话
      const existingConversation = await Conversation.findOne({
        where: {
          [SequelizeOp.or]: [
            {
              initiatorId,
              initiatorRole,
              receiverId,
              receiverRole
            },
            {
              initiatorId: receiverId,
              initiatorRole: receiverRole,
              receiverId: initiatorId,
              receiverRole: initiatorRole
            }
          ]
        }
      });

      if (existingConversation) {
        return res.status(200).json({
          success: true,
          data: existingConversation
        });
      }

      // 创建新对话
      const conversation = await Conversation.create({
        initiatorId,
        initiatorRole,
        receiverId,
        receiverRole,
        unreadCount: 0
      });

      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('创建对话失败:', error);
      res.status(500).json({
        success: false,
        error: '创建对话失败'
      });
    }
  },

  // 发送消息
  sendMessage: async (req, res) => {
    try {
      const { conversationId, content, type = 'text', fileUrl } = req.body;
      const senderId = req.user.id;
      const senderRole = req.user.role;

      // 检查对话是否存在
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在'
        });
      }

      // 验证发送者是否为对话参与者
      const isParticipant = (
        conversation.initiatorId === senderId && conversation.initiatorRole === senderRole
      ) || (
        conversation.receiverId === senderId && conversation.receiverRole === senderRole
      );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: '无权限发送消息到该对话'
        });
      }

      // 创建消息
      const message = await Message.create({
        conversationId,
        senderId,
        senderRole,
        content,
        type,
        status: 'sent',
        fileUrl
      });

      // 更新对话的最后一条消息和未读计数
      const isReceiver = (
        conversation.receiverId === senderId && conversation.receiverRole === senderRole
      );

      await Conversation.update(
        {
          lastMessageId: message.id,
          unreadCount: isReceiver ? conversation.unreadCount : conversation.unreadCount + 1
        },
        { where: { id: conversationId } }
      );

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      res.status(500).json({
        success: false,
        error: '发送消息失败'
      });
    }
  },

  // 获取对话消息
  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 检查对话是否存在
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在'
        });
      }

      // 验证用户是否为对话参与者
      const isParticipant = (
        conversation.initiatorId === userId && conversation.initiatorRole === userRole
      ) || (
        conversation.receiverId === userId && conversation.receiverRole === userRole
      );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: '无权限访问该对话消息'
        });
      }

      // 获取消息列表
      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('获取消息失败:', error);
      res.status(500).json({
        success: false,
        error: '获取消息失败'
      });
    }
  },

  // 更新消息状态
  updateMessageStatus: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // 检查消息是否存在
      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({
          success: false,
          error: '消息不存在'
        });
      }

      // 检查对话
      const conversation = await Conversation.findByPk(message.conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在'
        });
      }

      // 验证用户是否为对话参与者
      const isParticipant = (
        conversation.initiatorId === userId && conversation.initiatorRole === req.user.role
      ) || (
        conversation.receiverId === userId && conversation.receiverRole === req.user.role
      );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: '无权限更新该消息状态'
        });
      }

      // 更新消息状态
      await message.update({ status });

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('更新消息状态失败:', error);
      res.status(500).json({
        success: false,
        error: '更新消息状态失败'
      });
    }
  },

  // 获取未读消息数量
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      console.log(`获取未读消息数量 - 用户ID: ${userId}, 角色: ${userRole}`);
      
      // 统计未读消息总数
      const [result] = await sequelize.query(`
        SELECT SUM(unreadCount) as totalUnread
        FROM conversations
        WHERE (
          receiverId = :userId AND receiverRole = :userRole
        )
      `, {
        replacements: { userId, userRole },
        type: sequelize.QueryTypes.SELECT
      });

      console.log(`获取未读消息数量成功 - 未读数量: ${result.totalUnread || 0}`);
      
      res.status(200).json({
        success: true,
        data: {
          unreadCount: result.totalUnread || 0
        }
      });
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      console.error('错误详情:', error.stack);
      res.status(500).json({
        success: false,
        error: '获取未读消息数量失败'
      });
    }
  },

  // 标记对话已读
  markConversationAsRead: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 检查对话是否存在
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在'
        });
      }

      // 验证用户是否为对话接收者
      if (conversation.receiverId !== userId || conversation.receiverRole !== userRole) {
        return res.status(403).json({
          success: false,
          error: '无权限标记该对话已读'
        });
      }

      // 更新未读计数为0
      await conversation.update({ unreadCount: 0 });

      // 更新对话中所有消息为已读
      await Message.update(
        { status: 'read' },
        {
          where: {
            conversationId,
            status: { [SequelizeOp.not]: 'read' },
            [SequelizeOp.not]: {
              senderId: userId,
              senderRole: userRole
            }
          }
        }
      );

      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('标记对话已读失败:', error);
      res.status(500).json({
        success: false,
        error: '标记对话已读失败'
      });
    }
  },

  // 搜索消息
  searchMessages: async (req, res) => {
    try {
      const { keyword } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          error: '搜索关键词不能为空'
        });
      }

      // 搜索包含关键词的消息
      const messages = await Message.findAll({
        where: {
          content: { [SequelizeOp.like]: `%${keyword}%` }
        },
        include: [
          {
            model: Conversation,
            as: 'conversation',
            where: {
              [SequelizeOp.or]: [
                {
                  initiatorId: userId,
                  initiatorRole: userRole
                },
                {
                  receiverId: userId,
                  receiverRole: userRole
                }
              ]
            }
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('搜索消息失败:', error);
      res.status(500).json({
        success: false,
        error: '搜索消息失败'
      });
    }
  }
};

module.exports = messageController;