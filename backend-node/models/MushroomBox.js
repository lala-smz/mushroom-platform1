const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MushroomBox = sequelize.define('MushroomBox', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '盲盒ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '盲盒名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '盲盒描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '盲盒价格'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '盲盒库存数量'
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: '盲盒内商品总数量'
  },
  // 暂时注释掉这些字段，因为数据库表中还没有这些字段
  // minTotalQuantity: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   comment: '盲盒内商品总数量最小值'
  // },
  // maxTotalQuantity: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   comment: '盲盒内商品总数量最大值'
  // },
  season: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '季节'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '盲盒图片（兼容旧版本）'
  },
  // 暂时注释掉 images 字段，因为数据库中还没有这个列
  // images: {
  //   type: DataTypes.JSON,
  //   allowNull: true,
  //   comment: '盲盒图片数组'
  // },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active/inactive）'
  },
  // 代培服务相关字段
  cultivationService: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否包含代培服务'
  },
  cultivationPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '代培服务价格'
  },
  cultivationDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '代培时长（天）'
  },
  cultivationInclusions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '代培服务包含内容'
  },
  cultivationDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '代培服务描述'
  },
  // 暂时注释掉 layoutConfig 字段，因为数据库中不存在此列
  // layoutConfig: {
  //   type: DataTypes.JSON,
  //   allowNull: true,
  //   comment: '盲盒布局配置（界面布局、交互流程等）'
  // }
}, {
  tableName: 'mushroom_boxes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = MushroomBox;