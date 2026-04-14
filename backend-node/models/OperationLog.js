const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OperationLog = sequelize.define('OperationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '操作用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作用户名'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '用户角色'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型：create, update, delete, view, approve, reject等'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作模块：product, order, user, recipe, video等'
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '目标对象ID'
  },
  targetName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '目标对象名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '操作描述'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '用户代理信息'
  },
  beforeData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '操作前数据'
  },
  afterData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '操作后数据'
  }
}, {
  tableName: 'operation_logs',
  timestamps: true,
  comment: '操作日志表',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['role']
    },
    {
      fields: ['module']
    },
    {
      fields: ['action']
    },
    {
      fields: ['targetId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

OperationLog.associate = function(models) {
  OperationLog.belongsTo(models.User, { foreignKey: 'userId', as: 'operator' });
};

module.exports = OperationLog;
