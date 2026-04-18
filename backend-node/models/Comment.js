const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'works',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
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
  tableName: 'comments',
  timestamps: true,
  indexes: [
    {
      fields: ['workId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// 关联关系
Comment.associate = function(models) {
  // 与Work模型的多对一关系
  Comment.belongsTo(models.Work, {
    foreignKey: 'workId',
    as: 'work'
  });

  // 与User模型的多对一关系
  Comment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // 与自身的多对一关系（回复功能）
  Comment.belongsTo(models.Comment, {
    foreignKey: 'parentId',
    as: 'parent'
  });

  // 与自身的一对多关系（回复列表）
  Comment.hasMany(models.Comment, {
    foreignKey: 'parentId',
    as: 'replies'
  });
};

module.exports = Comment;