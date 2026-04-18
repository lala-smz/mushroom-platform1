const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// 管理员路由
const adminRoutes = express.Router();

// 用户管理
adminRoutes.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    
    const where = {};
    if (role) {
      where.role = role;
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true' ? true : false;
    }
    
    const users = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: ['id', 'username', 'email', 'phone', 'role', 'status', 'lastLoginAt', 'createdAt']
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: users.rows,
        total: users.count
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    });
  }
});

// 更新用户状态
adminRoutes.put('/users/:id/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    await user.update({ status });
    
    res.status(200).json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户状态失败'
    });
  }
});

// 更新用户角色
adminRoutes.put('/users/:id/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    await user.update({ role });
    
    res.status(200).json({
      success: true,
      message: '角色更新成功'
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户角色失败'
    });
  }
});

// 更新用户基本信息
adminRoutes.put('/users/:id/info', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, status } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    await user.update({ email, phone, status });
    
    res.status(200).json({
      success: true,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// 删除用户
adminRoutes.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      error: '删除用户失败'
    });
  }
});

// 管理员获取商品列表
adminRoutes.get('/products', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    const where = {};
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }
    
    // 从数据库查询
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        products,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取商品列表失败'
    });
  }
});

// 管理员更新订单状态
adminRoutes.put('/orders/:id/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }
    
    await order.update({ status });
    
    res.status(200).json({
      success: true,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({
      success: false,
      error: '更新订单状态失败'
    });
  }
});

// 管理员获取订单列表
adminRoutes.get('/orders', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', orderId = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    const where = {};
    if (status) {
      where.status = status;
    }
    if (orderId) {
      where.orderNo = orderId;
    }
    
    // 从数据库查询
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        orders,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取订单列表失败'
    });
  }
});

// 管理员获取订单详情
adminRoutes.get('/orders/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // 查找订单
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取订单详情失败'
    });
  }
});

// 管理员获取统计数据
adminRoutes.get('/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    // 获取用户总数
    const userCount = await User.count();
    
    // 获取商品总数
    const productCount = await Product.count();
    
    // 获取订单总数和总销售额
    const orderStats = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ]
    });
    
    const { orderCount, revenue } = orderStats[0];
    
    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount || 0,
        revenue: parseFloat(revenue) || 0
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    });
  }
});

// 导出路由
module.exports = adminRoutes;