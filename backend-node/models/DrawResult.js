const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 盲盒抽取结果模型
const DrawResult = sequelize.define('DrawResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  boxId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  drawTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  boxName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  boxImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  boxPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'draw_results',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = DrawResult;