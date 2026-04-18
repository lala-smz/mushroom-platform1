const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '加密密码'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: '邮箱'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    comment: '用户角色：user-普通用户 | seller-卖家 | admin-管理员'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '账号状态：true-正常，false-禁用'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  comment: '用户表',
  indexes: [
    {
      fields: ['username'],
      unique: true
    },
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// 密码验证方法
User.prototype.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// 密码加密钩子
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// 定义关联关系
User.associate = function(models) {
  User.hasMany(models.Cart, { foreignKey: 'userId', as: 'cartItems' });
  User.hasMany(models.Product, { foreignKey: 'sellerId', as: 'products' });
  User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  User.hasMany(models.Address, { foreignKey: 'userId', as: 'addresses' });
  
  // 用户与评论的一对多关联
  User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
  
  // 用户与作品的一对多关联
  User.hasMany(models.Work, { foreignKey: 'userId', as: 'works' });
  
  // 用户与评分的一对多关联
  User.hasMany(models.WorkRating, { foreignKey: 'userId', as: 'ratings' });
  
  // 用户与品尝历史的一对多关联
  User.hasMany(models.UserTasteHistory, { foreignKey: 'userId', as: 'tasteHistories' });
  
  // 用户与权限的多对多关联
  User.belongsToMany(models.Permission, {
    through: 'user_permissions',
    foreignKey: 'userId',
    otherKey: 'permissionId',
    as: 'permissions'
  });
};

module.exports = User;