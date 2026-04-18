const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建数据库连接，兼容多种环境变量命名方式
const sequelize = new Sequelize(
  // 兼容 DB_NAME, MYSQL_DATABASE, MYSQLDATABASE
  process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'mushroom',
  // 兼容 DB_USER, MYSQL_USER, MYSQLUSER
  process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
  // 兼容 DB_PASSWORD, MYSQL_PASSWORD, MYSQLPASSWORD
  process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
  {
    // 兼容 DB_HOST, MYSQL_HOST, MYSQLHOST
    host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost',
    // 兼容 DB_PORT, MYSQL_PORT, MYSQLPORT
    port: process.env.DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    },
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
      initSql: 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;'
    },
    query: {
      raw: false
    }
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
};