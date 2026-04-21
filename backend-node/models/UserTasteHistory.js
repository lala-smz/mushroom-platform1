const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserTasteHistory = sequelize.define('UserTasteHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  workId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'works',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  tasteDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'user_taste_histories',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'workId'], unique: true },
    { fields: ['tasteDate'] }
  ]
});

// 关联关系
UserTasteHistory.associate = function(models) {
  // 与 User 模型的多对一关系
  UserTasteHistory.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // 与 Work 模型的多对一关系
  UserTasteHistory.belongsTo(models.Work, {
    foreignKey: 'workId',
    as: 'work'
  });
};

module.exports = UserTasteHistory;