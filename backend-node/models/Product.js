const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '商品价格'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '库存数量'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '一级分类'
  },
  subCategory: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '二级分类'
  },
  subSubCategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '三级分类'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '商品图片'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '商品状态：pending-待审核 | approved-已审核 | rejected-已拒绝'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数'
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '卖家ID'
  },
  rejectReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '拒绝原因文本'
  },
  rejectType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '拒绝类型：如内容违规、价格异常、图片违规等'
  },
  rejectRule: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '相关规则依据'
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '拒绝时间'
  },
  isHot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否热门商品'
  }
}, {
  tableName: 'products',
  timestamps: true,
  comment: '商品表',
  indexes: [
    { fields: ['sellerId'] },
    { fields: ['category', 'status'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

// 定义关联关系
Product.associate = function(models) {
  Product.hasMany(models.Cart, { foreignKey: 'productId', as: 'cartItems' });
  Product.hasMany(models.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  Product.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
};

module.exports = Product;