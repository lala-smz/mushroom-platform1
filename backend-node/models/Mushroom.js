const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Mushroom = sequelize.define('Mushroom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '菌菇ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '菌菇名称'
  },
  scientificName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '学名'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  // 形态特征
  morphology: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '形态特征，包括菌盖、菌褶、菌柄等描述'
  },
  // 生长环境
  growthEnvironment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '生长环境，包括气候条件、土壤要求等'
  },
  // 营养价值
  nutritionalValue: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '营养价值，包括蛋白质、维生素、矿物质等含量'
  },
  // 食用安全性
  safetyInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '食用安全性，包括毒性、食用禁忌等'
  },
  // 食用方法
  cookingMethods: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '适宜的烹饪方法'
  },
  // 选购建议
  selectionTips: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '选购建议，包括新鲜度判断、储存方法等'
  },
  // 季节信息
  season: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '生长季节，支持多个季节，如："春季,秋季"'
  },
  // 培育信息
  cultivationGuide: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '培育指南'
  },
  cultivationDifficulty: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '培育难度（easy/medium/hard）'
  },
  // 分类信息
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分类，如："食用菇"、"药用菇"'
  },
  // 产地信息
  originInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '产地信息，包括主要产区、地理环境等'
  },
  // 保存方法
  storageMethods: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '保存方法，包括温度、湿度、保存时间等'
  },
  // 功效与作用
  healthBenefits: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '功效与作用，包括药用价值、保健功能等'
  },
  // 历史文化
  culturalInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '历史文化，包括食用历史、文化意义等'
  },
  // 市场信息
  marketInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '市场信息，包括价格区间、市场需求等'
  },
  // 数据来源
  dataSource: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '数据来源，如："中国食用菌协会"'
  },
  // 数据更新时间
  dataUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '数据更新时间'
  },
  // 图片信息
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '菌菇图片'
  },
  // 状态
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active/inactive）'
  },
  // 菌菇类型
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'common',
    comment: '菌菇类型（common: 常见菌菇, product: 自有商品菌菇）'
  }
}, {
  tableName: 'mushrooms',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['cultivationDifficulty']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Mushroom;