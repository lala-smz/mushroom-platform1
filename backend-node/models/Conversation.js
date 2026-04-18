const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  initiatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '发起者ID'
  },
  initiatorRole: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '发起者角色（user/seller/admin）'
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '接收者ID'
  },
  receiverRole: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '接收者角色（user/seller/admin）'
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '最后一条消息ID'
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '未读消息数量'
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  comment: '对话表'
});

// 定义关联关系
Conversation.associate = function(models) {
  Conversation.hasMany(models.Message, {
    foreignKey: 'conversationId',
    as: 'messages'
  });
  
  // 关联发起者用户
  Conversation.belongsTo(models.User, {
    foreignKey: 'initiatorId',
    as: 'initiatorUser',
    constraints: false
  });
  
  // 关联接收者用户
  Conversation.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiverUser',
    constraints: false
  });
};

module.exports = Conversation;