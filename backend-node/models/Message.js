const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所属对话ID'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '发送者ID'
  },
  senderRole: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '发送者角色（user/seller/admin）'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  type: {
    type: DataTypes.STRING(20),
    defaultValue: 'text',
    comment: '消息类型（text/image/file）'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'sent',
    comment: '消息状态（sent/delivered/read）'
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '文件URL（用于图片、文件等多媒体消息）'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  comment: '消息表'
});

// 定义关联关系
Message.associate = function(models) {
  Message.belongsTo(models.Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
  });
};

module.exports = Message;