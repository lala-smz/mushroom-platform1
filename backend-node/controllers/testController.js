const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * 测试控制器 - 返回模拟的菌菇盲盒数据
 */
class TestController {
  static async initDatabase(req, res) {
    try {
      await sequelize.sync({ force: true });

      await User.bulkCreate([
        { id: 1, username: 'admin', password: '$2a$10$kENosy5h8X2nBcrWgn3zaOu6ck1gJR9/6GMSJTOllv/sySZDLsrzC', email: 'admin@example.com', phone: '13800138000', role: 'admin', status: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, username: 'aaa', password: '$2a$10$kENosy5h8X2nBcrWgn3zaOu6ck1gJR9/6GMSJTOllv/sySZDLsrzC', email: 'aaa@example.com', phone: '13800138001', role: 'seller', status: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, username: 'user1', password: '$2a$10$kENosy5h8X2nBcrWgn3zaOu6ck1gJR9/6GMSJTOllv/sySZDLsrzC', email: 'user1@example.com', phone: '13800138002', role: 'user', status: true, createdAt: new Date(), updatedAt: new Date() }
      ]);

      await Category.bulkCreate([
        { id: 1, name: '时令盲盒', parent_id: 0, sort_order: 1, status: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: '新鲜菌菇', parent_id: 0, sort_order: 2, status: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: '干货特产', parent_id: 0, sort_order: 3, status: true, createdAt: new Date(), updatedAt: new Date() }
      ]);

      await Product.bulkCreate([
        { id: 1, name: '香菇', description: '新鲜香菇，产地直发', price: 25.00, stock: 100, category: '新鲜菌菇', sellerId: 2, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: '金针菇', description: '新鲜金针菇，口感鲜美', price: 15.00, stock: 200, category: '新鲜菌菇', sellerId: 2, status: 'approved', createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: '时令盲盒A', description: '精选时令双菇盲盒', price: 99.00, stock: 50, category: '时令盲盒', sellerId: 2, status: 'approved', createdAt: new Date(), updatedAt: new Date() }
      ]);

      res.status(200).json({
        success: true,
        message: '数据库初始化成功'
      });
    } catch (error) {
      console.error('数据库初始化失败:', error);
      res.status(500).json({
        success: false,
        error: '数据库初始化失败: ' + error.message
      });
    }
  }

  static async getMushroomBoxes(req, res) {
    try {
      // 模拟时令菌菇盲盒数据
      const mushroomBoxes = [
        {
          id: 1,
          name: '春季时令菌菇盲盒',
          description: '精选当季新鲜菌菇品种，从菌包培育到收获的全程指导',
          price: 99.00,
          status: 'active',
          season: '春季',
          imageUrl: '/uploads/boxes/spring-box.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            { mushroomName: '杏鲍菇', quantity: 3, description: '肉质肥厚，适合炒制和烧烤', weight: '500g' },
            { mushroomName: '金针菇', quantity: 2, description: '细长脆嫩，适合火锅和凉拌', weight: '300g' },
            { mushroomName: '香菇', quantity: 4, description: '香气浓郁，适合炖汤和炒菜', weight: '600g' }
          ]
        },
        {
          id: 2,
          name: '夏季清凉菌菇盲盒',
          description: '夏日清爽菌菇组合，低热量高营养',
          price: 88.00,
          status: 'active',
          season: '夏季',
          imageUrl: '/uploads/boxes/summer-box.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            { mushroomName: '平菇', quantity: 3, description: '口感滑嫩，适合清炒和做汤', weight: '400g' },
            { mushroomName: '草菇', quantity: 2, description: '鲜美多汁，适合快炒', weight: '200g' }
          ]
        }
      ];

      res.status(200).json({
        success: true,
        data: mushroomBoxes
      });
    } catch (error) {
      console.error('获取菌菇盲盒数据失败:', error);
      res.status(500).json({
        success: false,
        error: '获取菌菇盲盒数据失败，请稍后重试'
      });
    }
  }
}

module.exports = TestController;