const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkRating = sequelize.define('WorkRating', {
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'work_ratings',
  timestamps: true,
  indexes: [
    { fields: ['workId', 'userId'], unique: true },
    { fields: ['createdAt'] }
  ]
});

// 关联关系
WorkRating.associate = function(models) {
  // 与 Work 模型的多对一关系
  WorkRating.belongsTo(models.Work, {
    foreignKey: 'workId',
    as: 'work'
  });

  // 与 User 模型的多对一关系
  WorkRating.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = WorkRating;