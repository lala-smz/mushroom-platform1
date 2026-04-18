const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserLevel = sequelize.define('UserLevel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    nextLevelExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: {
        min: 0
      }
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
    tableName: 'UserLevels',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      }
    ]
  });

  // 关联关系
  UserLevel.associate = (models) => {
    // 与User模型的一对一关系
    UserLevel.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserLevel;
};
