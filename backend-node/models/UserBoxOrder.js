const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserBoxOrder = sequelize.define('UserBoxOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  boxId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '盲盒ID'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '订单状态（pending/paid/shipped/completed）'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '收货地址'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  receiver: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收货人'
  },
  paymentMethod: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '支付方式'
  },
  paymentTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发货日期'
  },
  deliveryMethod: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '配送方式'
  },
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '物流单号'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总价格'
  },
  // 代培服务相关字段
  cultivationService: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否选择了代培服务'
  },
  cultivationStatus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null,
    comment: '代培状态（pending/in_progress/completed/cancelled）'
  },
  cultivationStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '代培开始日期'
  },
  cultivationEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '预计代培结束日期'
  },
  cultivationProgress: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '代培进度（百分比）'
  },
  cultivationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '代培备注'
  },
  cultivationUpdates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '代培更新记录'
  }
}, {
  tableName: 'user_box_orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = UserBoxOrder;