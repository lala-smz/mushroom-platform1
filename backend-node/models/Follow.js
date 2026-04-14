const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'Follows',
  timestamps: true,
  indexes: [
    {
      fields: ['followerId']
    },
    {
      fields: ['followingId']
    },
    {
      fields: ['followerId', 'followingId'],
      unique: true
    }
  ]
});

// 关联关系
Follow.associate = function(models) {
  // 与用户模型的多对一关系（关注者）
  Follow.belongsTo(models.User, {
    foreignKey: 'followerId',
    as: 'follower'
  });

  // 与用户模型的多对一关系（被关注者）
  Follow.belongsTo(models.User, {
    foreignKey: 'followingId',
    as: 'following'
  });
};

module.exports = Follow;