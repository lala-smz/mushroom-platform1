const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RecipeStep = sequelize.define('RecipeStep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '食谱ID'
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '步骤序号'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '步骤描述'
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '步骤视频URL（可选）'
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '步骤图片URL（可选）'
  }
}, {
  tableName: 'recipe_steps',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = RecipeStep;