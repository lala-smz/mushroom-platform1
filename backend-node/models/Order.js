const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    comment: '订单编号'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总金额'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '订单状态：pending-待支付 | paid-已支付 | delivered-已发货 | completed-已完成 | cancelled-已取消'
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
  paymentSignature: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '支付签名'
  },
  paymentTimeout: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付超时时间'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '交易ID'
  },
  paymentInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '支付信息'
  },
  cancelledReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '取消原因'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  comment: '订单表',
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
    { fields: ['paymentTime'] }
  ]
});

// 定义关联关系
Order.associate = function(models) {
  Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
};

module.exports = Order;