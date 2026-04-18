const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Work = sequelize.define('Work', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [50, 500]
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  mushroomType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved'
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
  tableName: 'works',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['mushroomType']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['likes']
    },
    {
      fields: ['totalScore']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// 关联关系
Work.associate = function(models) {
  // 与User模型的多对一关系
  Work.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // 与Comment模型的一对多关系
  Work.hasMany(models.Comment, {
    foreignKey: 'workId',
    as: 'commentList',
    onDelete: 'CASCADE'
  });

  // 与Like模型的一对多关系
  Work.hasMany(models.Like, {
    foreignKey: 'workId',
    as: 'likeList',
    onDelete: 'CASCADE'
  });

  // 与Favorite模型的一对多关系
  Work.hasMany(models.Favorite, {
    foreignKey: 'workId',
    as: 'favoriteList',
    onDelete: 'CASCADE'
  });

  // 与WorkRating模型的一对多关系
  Work.hasMany(models.WorkRating, {
    foreignKey: 'workId',
    as: 'ratingList',
    onDelete: 'CASCADE'
  });

  // 与UserTasteHistory模型的一对多关系
  Work.hasMany(models.UserTasteHistory, {
    foreignKey: 'workId',
    as: 'tasteHistories',
    onDelete: 'CASCADE'
  });
};

module.exports = Work;