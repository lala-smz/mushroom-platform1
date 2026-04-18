const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  receiver: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收件人姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '区县'
  },
  detail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '详细地址'
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '邮政编码'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否默认地址'
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  comment: '用户地址表'
});

// 定义关联关系
Address.associate = function(models) {
  Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = Address;