const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Achievement = sequelize.define('Achievement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unlockedAt: {
      type: DataTypes.DATE,
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
    tableName: 'Achievements',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      }
    ]
  });

  // 关联关系
  Achievement.associate = (models) => {
    // 与User模型的多对一关系
    Achievement.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Achievement;
};
