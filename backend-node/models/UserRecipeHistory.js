const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserRecipeHistory = sequelize.define('UserRecipeHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '食谱ID'
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '操作类型（view/like/save/cook）'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '操作时间'
  }
}, {
  tableName: 'user_recipe_history',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = UserRecipeHistory;