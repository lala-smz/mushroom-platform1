const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RecipeIngredient = sequelize.define('RecipeIngredient', {
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
  mushroomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '菌菇ID（可为空）'
  },
  ingredientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '配料名称'
  },
  quantity: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '数量'
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '单位'
  }
}, {
  tableName: 'recipe_ingredients',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = RecipeIngredient;