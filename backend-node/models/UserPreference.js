const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  tastePreferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: '口味偏好（如：{"spicy": true, "sweet": false}）'
  },
  dietaryRestrictions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '饮食禁忌（如：["vegetarian", "gluten_free"]）'
  },
  cookingSkill: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'beginner',
    comment: '烹饪技能（beginner/intermediate/advanced）'
  },
  favoriteMushrooms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '喜爱的菌菇类型'
  }
}, {
  tableName: 'user_preferences',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = UserPreference;