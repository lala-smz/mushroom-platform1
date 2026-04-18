const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContentReview = sequelize.define('ContentReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '审核记录ID'
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '内容ID'
  },
  contentType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '内容类型（mushroom/recipe/cookingVideo）'
  },
  reviewerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '审核员ID'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '审核状态（pending/approved/rejected）'
  },
  reviewNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '审核备注'
  },
  // 审核维度
  accuracyScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '准确性评分（1-5）'
  },
  professionalismScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '专业性评分（1-5）'
  },
  legalityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '合法性评分（1-5）'
  },
  // 问题类型
  issueTypes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '问题类型，如：["信息错误", "专业术语不准确"]'
  },
  // 建议修改
  suggestedChanges: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '建议修改内容'
  }
}, {
  tableName: 'content_reviews',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = ContentReview;