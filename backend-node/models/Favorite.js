const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Favorite = sequelize.define('Favorite', {
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
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favorites',
  timestamps: false,
  indexes: [
    {
      fields: ['workId', 'userId'],
      unique: true
    },
    {
      fields: ['workId']
    },
    {
      fields: ['userId']
    }
  ]
});

// 关联关系
Favorite.associate = function(models) {
  // 与Work模型的多对一关系
  Favorite.belongsTo(models.Work, {
    foreignKey: 'workId',
    as: 'work'
  });

  // 与User模型的多对一关系
  Favorite.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Favorite;
