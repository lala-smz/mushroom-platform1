const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CookingVideo = sequelize.define('CookingVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '视频ID'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '视频标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '视频描述'
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '视频URL'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '视频缩略图URL'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '视频时长（秒）'
  },
  mushroomType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null,
    comment: '菌菇类型'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
    comment: '难度等级'
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '观看次数'
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '点赞数'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '创建者ID'
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的菜谱ID'
  },
  mushroomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的菌菇ID'
  },
  mushroomBoxId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的盲盒ID'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'cultivation',
    comment: '视频分类（cultivation/cooking/identification/general）'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序顺序'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '视频标签（JSON数组格式）'
  },
  quality: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '视频质量（hd/sd）'
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '视频来源'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '观看次数'
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '点赞次数'
  },
  favoriteCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '收藏次数'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active/inactive）'
  },
  reviewStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'approved',
    comment: '审核状态（pending/approved/rejected）'
  },
  reviewNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '审核备注'
  }
}, {
  tableName: 'cooking_videos',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = CookingVideo;