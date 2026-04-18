const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '标签ID'
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    comment: '标签名称'
  },
  color: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '标签颜色（HEX格式）'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用次数'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active/inactive）'
  }
}, {
  tableName: 'tags',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Tag;
