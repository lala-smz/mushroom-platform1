const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ScoreConfigLog = sequelize.define('ScoreConfigLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  configId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'score_configs',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  operatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  oldConfig: {
    type: DataTypes.JSON,
    allowNull: false
  },
  newConfig: {
    type: DataTypes.JSON,
    allowNull: false
  },
  changeReason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'score_config_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['configId']
    },
    {
      fields: ['operatorId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// 关联关系
ScoreConfigLog.associate = function(models) {
  // 与 ScoreConfig 模型的多对一关系
  ScoreConfigLog.belongsTo(models.ScoreConfig, {
    foreignKey: 'configId',
    as: 'config'
  });

  // 与 User 模型的多对一关系
  ScoreConfigLog.belongsTo(models.User, {
    foreignKey: 'operatorId',
    as: 'operator'
  });
};

module.exports = ScoreConfigLog;