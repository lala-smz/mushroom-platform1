const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RatingWeight = sequelize.define('RatingWeight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleType: {
    type: DataTypes.ENUM('user', 'vip', 'judge'),
    allowNull: false,
    unique: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.1,
      max: 5.0
    }
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
  tableName: 'rating_weights',
  timestamps: true,
  indexes: [
    {
      fields: ['roleType']
    },
    {
      fields: ['isActive']
    }
  ]
});

// 关联关系
RatingWeight.associate = function(models) {
  // 无需额外关联
};

module.exports = RatingWeight;