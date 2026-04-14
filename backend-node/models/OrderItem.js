const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '订单ID'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品/盲盒ID'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'product',
    comment: '类型：product-商品 | box-盲盒'
  },
  productName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品/盲盒名称'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '商品/盲盒价格'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品/盲盒数量'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商品/盲盒图片'
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  comment: '订单项表'
});

// 定义关联关系
OrderItem.associate = function(models) {
  OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  // 移除外键约束，因为productId可能引用盲盒
};

module.exports = OrderItem;