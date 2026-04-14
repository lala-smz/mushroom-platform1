const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ScoreConfig = sequelize.define('ScoreConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ratingWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.3,
    validate: {
      min: 0,
      max: 1
    }
  },
  interactionWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.25,
    validate: {
      min: 0,
      max: 1
    }
  },
  qualityWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.2,
    validate: {
      min: 0,
      max: 1
    }
  },
  creativityWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.15,
    validate: {
      min: 0,
      max: 1
    }
  },
  recencyWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.1,
    validate: {
      min: 0,
      max: 1
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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
  tableName: 'score_configs',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive']
    }
  ]
});

// 关联关系
ScoreConfig.associate = function(models) {
  // 与 ScoreConfigLog 模型的一对多关系
  ScoreConfig.hasMany(models.ScoreConfigLog, {
    foreignKey: 'configId',
    as: 'logs'
  });
};

module.exports = ScoreConfig;