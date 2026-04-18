const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '食谱ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '食谱名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '食谱描述'
  },
  // 难度和时间信息
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '烹饪难度（beginner/intermediate/advanced）'
  },
  prepTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '准备时间（分钟）'
  },
  cookTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '烹饪时间（分钟）'
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '份量'
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: '评分'
  },
  // 图片信息
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '食谱图片'
  },
  // 烹饪视频信息
  videoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '烹饪视频URL'
  },
  // 状态信息
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active/inactive）'
  },
  // 营养成分
  nutritionalAnalysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '营养成分分析'
  },
  // 适用人群
  suitableFor: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '适用人群'
  },
  // 口味特点
  flavorProfile: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '口味特点'
  },
  // 菜系类型
  cuisineType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '菜系类型'
  },
  // 餐点类型
  mealType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '餐点类型'
  },
  // 蘑菇数量
  mushroomCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '蘑菇数量'
  },
  // 流行度
  popularity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: '流行度'
  },
  // 评论数量
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '评论数量'
  }
}, {
  tableName: 'recipes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['popularity']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['cuisineType']
    },
    {
      fields: ['mealType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Recipe;