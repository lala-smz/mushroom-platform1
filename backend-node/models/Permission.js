const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '权限名称（如：product:create, product:read, product:update, product:delete）'
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '权限显示名称（如：创建商品、查看商品、修改商品、删除商品）'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '权限描述'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  comment: '权限表'
});

// 定义关联关系
Permission.associate = function(models) {
  // 权限与用户的多对多关联
  Permission.belongsToMany(models.User, {
    through: 'user_permissions',
    foreignKey: 'permissionId',
    otherKey: 'userId',
    as: 'users'
  });
};

module.exports = Permission;