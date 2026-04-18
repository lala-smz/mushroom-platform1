const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Product = require('./Product');
const MushroomBox = require('./MushroomBox');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商品ID或盲盒ID'
  },
  type: {
    type: DataTypes.ENUM('product', 'box'),
    allowNull: false,
    defaultValue: 'product',
    comment: '商品类型：product-普通商品，box-盲盒'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '商品数量'
  },
  selected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否选中'
  }
}, {
  tableName: 'carts',
  timestamps: true,
  comment: '购物车表',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['userId', 'productId', 'type'],
      unique: true
    }
  ]
});

// 定义关联关系
Cart.associate = function(models) {
  Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product', constraints: false });
  Cart.belongsTo(MushroomBox, { foreignKey: 'productId', as: 'box', constraints: false });
};

module.exports = Cart;