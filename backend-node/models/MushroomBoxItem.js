const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MushroomBoxItem = sequelize.define('MushroomBoxItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  boxId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '盲盒ID'
  },
  mushroomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '菌菇/商品ID（可以是mushrooms表或products表的ID）'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '数量（向后兼容）'
  },
  minQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '最小数量'
  },
  maxQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '最大数量'
  },
  probability: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: '概率'
  },
  mushroomName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '菌菇/商品名称'
  },
  mushroomType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '菌菇/商品类型'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '菌菇/商品图片'
  }
}, {
  tableName: 'mushroom_box_items',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = MushroomBoxItem;