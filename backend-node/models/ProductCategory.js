const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '分类编码'
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '分类名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '分类描述'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 3,
      isInt: true
    },
    comment: '分类层级（1/2/3）'
  },
  parentKey: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '父分类编码'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      isInt: true
    },
    comment: '排序顺序'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'product_categories',
  timestamps: true,
  paranoid: false,
  indexes: [
    { fields: ['level'], name: 'idx_level' },
    { fields: ['parentKey'], name: 'idx_parent_key' },
    { fields: ['status'], name: 'idx_status' },
    { fields: ['level', 'parentKey', 'status'], name: 'idx_level_parent_status' }
  ],
  defaultScope: {
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  },
  scopes: {
    inactive: {
      where: {
        status: 'inactive'
      }
    },
    active: {
      where: {
        status: 'active'
      }
    },
    level1: {
      where: {
        level: 1
      }
    },
    level2: {
      where: {
        level: 2
      }
    },
    level3: {
      where: {
        level: 3
      }
    }
  }
});

ProductCategory.associate = (models) => {
  ProductCategory.hasMany(ProductCategory, {
    as: 'children',
    foreignKey: 'parentKey',
    sourceKey: 'key'
  });
  
  ProductCategory.belongsTo(ProductCategory, {
    as: 'parent',
    foreignKey: 'parentKey',
    targetKey: 'key'
  });
};

ProductCategory.prototype.toTreeJSON = function() {
  const json = this.toJSON();
  json.children = this.children ? this.children.map(child => child.toTreeJSON()) : [];
  return json;
};

module.exports = ProductCategory;