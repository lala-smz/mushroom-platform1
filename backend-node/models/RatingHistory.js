const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RatingHistory = sequelize.define('RatingHistory', {
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
  averageRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  period: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly'),
    allowNull: false
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false
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
  tableName: 'rating_histories',
  timestamps: true,
  indexes: [
    { fields: ['workId', 'period', 'periodStart'] }
  ]
});

// 关联关系
RatingHistory.associate = function(models) {
  // 与 Work 模型的多对一关系
  RatingHistory.belongsTo(models.Work, {
    foreignKey: 'workId',
    as: 'work'
  });
};

module.exports = RatingHistory;