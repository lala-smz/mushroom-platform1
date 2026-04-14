const Product = require('../models/Product');
const MushroomBoxItem = require('../models/MushroomBoxItem');
const ProductCategory = require('../models/ProductCategory');
const { Op } = require('sequelize');
const { cache, cacheKeys } = require('../config/redis');
const operationLogService = require('../services/operationLogService');
const { getLevel1Categories } = require('../config/categoryConfig');

const validateCategoryFromDB = async (level1, level2, level3) => {
  try {
    const level1Cat = await ProductCategory.findOne({
      where: { key: level1, level: 1, status: 'active' }
    });
    if (!level1Cat) {
      return { valid: false, message: '无效的一级分类' };
    }

    if (level2) {
      const level2Cat = await ProductCategory.findOne({
        where: { key: level2, level: 2, parentKey: level1, status: 'active' }
      });
      if (!level2Cat) {
        return { valid: false, message: '无效的二级分类' };
      }

      if (level3) {
        const level3Cat = await ProductCategory.findOne({
          where: { key: level3, level: 3, parentKey: level2, status: 'active' }
        });
        if (!level3Cat) {
          return { valid: false, message: '无效的三级分类' };
        }
      }
    }

    return { valid: true, message: '分类验证通过' };
  } catch (error) {
    console.error('数据库验证分类失败:', error);
    return { valid: false, message: '验证分类时发生错误' };
  }
};

const productController = {
  // 商品列表
  getProducts: async (req, res) => {
    try {
      // 验证和转换查询参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category || '';
      const categories = req.query.categories;
      const status = req.query.status || '';
      const offset = (page - 1) * limit;

      // 验证参数有效性
      if (page < 1) throw new Error('页码不能小于1');
      if (limit < 1 || limit > 100) throw new Error('每页数量必须在1-100之间');

      // 构建查询条件
      const where = {};
      
      // 处理多分类筛选
      if (categories) {
        // 如果是数组，使用IN操作
        if (Array.isArray(categories)) {
          where.category = {
            [Op.in]: categories
          };
        } else if (typeof categories === 'string') {
          // 如果是字符串，尝试解析为JSON数组
          try {
            const parsedCategories = JSON.parse(categories);
            if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
              where.category = {
                [Op.in]: parsedCategories
              };
            }
          } catch (e) {
            // 如果解析失败，当做单个分类处理
            where.category = categories;
          }
        }
      } else if (category) {
        // 兼容单个分类参数
        where.category = category;
      }

      if (status) {
        // 验证状态值的有效性
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
          throw new Error('无效的状态值');
        }
        where.status = status;
      } else {
        // 只有未登录用户才默认只返回已审核商品
        if (!req.user) {
          where.status = 'approved';
        }
        // 已登录用户（管理员或卖家）选择全部状态时，不设置状态筛选，返回所有状态
      }
      
      if (req.user) {
        // 已登录用户
        if (req.user.role === 'seller') {
          // 卖家：只返回自己的商品
          where.sellerId = req.user.id;
        }
      }

      // 尝试从缓存获取 - 只缓存公开的已审核商品
      let cachedData = null;
      if (!req.user && !status) {
        const cacheKey = cacheKeys.productList(page, limit, category);
        cachedData = await cache.get(cacheKey);
        if (cachedData) {
          return res.status(200).json({
            success: true,
            data: cachedData
          });
        }
      }

      // 从数据库查询，只查询存在的字段
      const { count, rows: products } = await Product.findAndCountAll({
        where,
        attributes: ['id', 'name', 'description', 'price', 'stock', 'category', 'subCategory', 'subSubCategory', 'images', 'status', 'viewCount', 'sellerId', 'createdAt', 'updatedAt', 'rejectReason', 'rejectType', 'rejectRule', 'rejectedAt', 'isHot'],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      const result = {
        products,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };

      // 缓存结果（仅缓存公开的已审核商品）
      if (!req.user && !status) {
        const cacheKey = cacheKeys.productList(page, limit, category);
        await cache.set(cacheKey, result, 300);
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取商品列表失败: ' + error.message
      });
    }
  },

  // 卖家获取自己的商品列表
  getSellerProducts: async (req, res) => {
    try {
      // 验证和转换查询参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category || '';
      const status = req.query.status || '';
      const offset = (page - 1) * limit;

      // 验证参数有效性
      if (page < 1) throw new Error('页码不能小于1');
      if (limit < 1 || limit > 100) throw new Error('每页数量必须在1-100之间');

      // 构建查询条件 - 只返回当前卖家的商品
      const where = {
        sellerId: req.user.id
      };
      
      if (category) {
        where.category = category;
      }
      
      if (status) {
        // 验证状态值的有效性
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
          throw new Error('无效的状态值');
        }
        where.status = status;
      }

      // 从数据库查询，只查询存在的字段
      const { count, rows: products } = await Product.findAndCountAll({
        where,
        attributes: ['id', 'name', 'description', 'price', 'stock', 'category', 'subCategory', 'subSubCategory', 'images', 'status', 'viewCount', 'sellerId', 'createdAt', 'updatedAt', 'rejectReason', 'rejectType', 'rejectRule', 'rejectedAt', 'isHot'],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      const result = {
        products,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取卖家商品列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取卖家商品列表失败: ' + error.message
      });
    }
  },

  // 商品详情
  getProductDetail: async (req, res) => {
    try {
      const { id } = req.params;

      // 尝试从缓存获取
      const cacheKey = cacheKeys.productDetail(id);
      let product = await cache.get(cacheKey);
      if (product) {
        // 异步更新浏览次数
        Product.increment('viewCount', { where: { id } });
        
        // 权限检查
        // 情况1: 非登录用户 - 只能查看已审核商品
        if (!req.user && product.status !== 'approved') {
          return res.status(403).json({
            success: false,
            error: '您没有权限查看此商品'
          });
        }
        
        // 情况2: 卖家用户 - 只能查看自己的商品
        if (req.user && req.user.role === 'seller' && product.sellerId !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: '您没有权限查看此商品'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: product
        });
      }

      // 从数据库查询，显式指定包含拒绝字段
      product = await Product.findByPk(id, {
        attributes: ['id', 'name', 'description', 'price', 'stock', 'category', 'images', 'status', 'viewCount', 'sellerId', 'createdAt', 'updatedAt', 'rejectReason', 'rejectType', 'rejectRule', 'rejectedAt', 'isHot']
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: '商品不存在'
        });
      }

      // 权限检查
      // 情况1: 非登录用户 - 只能查看已审核商品
      if (!req.user && product.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: '您没有权限查看此商品'
        });
      }
      
      // 情况2: 卖家用户 - 只能查看自己的商品
      if (req.user && req.user.role === 'seller' && product.sellerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '您没有权限查看此商品'
        });
      }

      // 更新浏览次数
      await product.increment('viewCount');

      // 缓存商品详情
      await cache.set(cacheKey, product.toJSON(), 600);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('获取商品详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取商品详情失败'
      });
    }
  },

  // 热门商品
  getHotProducts: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      let hotProducts;

      try {
        // 尝试从缓存获取
        const cacheKey = cacheKeys.hotProducts(limit);
        hotProducts = await cache.get(cacheKey);
        if (hotProducts) {
          return res.status(200).json({
            success: true,
            data: hotProducts
          });
        }
      } catch (cacheError) {
        console.warn('从缓存获取热门商品失败，将从数据库查询:', cacheError);
      }

      // 从数据库查询，只查询存在的字段
      hotProducts = await Product.findAll({
        where: { 
          status: 'approved',
          isHot: true
        },
        attributes: ['id', 'name', 'description', 'price', 'stock', 'category', 'subCategory', 'subSubCategory', 'images', 'status', 'viewCount', 'sellerId', 'createdAt', 'updatedAt', 'rejectReason', 'rejectType', 'rejectRule', 'rejectedAt', 'isHot'],
        limit: parseInt(limit),
        order: [['viewCount', 'DESC']]
      });

      // 尝试缓存热门商品
      try {
        const cacheKey = cacheKeys.hotProducts(limit);
        await cache.set(cacheKey, hotProducts, 600);
      } catch (cacheError) {
        console.warn('缓存热门商品失败:', cacheError);
      }

      res.status(200).json({
        success: true,
        data: hotProducts
      });
    } catch (error) {
      console.error('获取热门商品失败:', error);
      res.status(500).json({
        success: false,
        error: '获取热门商品失败: ' + error.message
      });
    }
  },

  // 上传商品
  createProduct: async (req, res) => {
    try {
      const { name, description, price, stock, category, subCategory, subSubCategory, images } = req.body;
      const sellerId = req.user.id;
      const userRole = req.user.role;

      // 验证参数
      if (!name || !price || !stock || !category) {
        return res.status(400).json({
          success: false,
          error: '商品名称、价格、库存和一级分类不能为空'
        });
      }

      // 验证分类
      const categoryValidation = await validateCategoryFromDB(category, subCategory, subSubCategory);
      if (!categoryValidation.valid) {
        return res.status(400).json({
          success: false,
          error: categoryValidation.message
        });
      }

      // 根据用户角色设置商品状态
      // 管理员上传商品时直接通过审核，商家上传商品时需要审核
      const status = userRole === 'admin' ? 'approved' : 'pending';

      // 创建商品
      const product = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        subCategory,
        subSubCategory,
        images: images || [],
        status,
        sellerId
      });

      // 记录操作日志
      await operationLogService.logOperation({
        userId: sellerId,
        username: req.user.username,
        role: userRole,
        action: 'create',
        module: 'product',
        targetId: product.id,
        targetName: product.name,
        description: `${userRole === 'admin' ? '管理员' : '卖家'}创建商品`,
        req,
        afterData: product.toJSON()
      });

      // 清除相关缓存
      await cache.clearPattern('product:list:*');
      await cache.clearPattern('product:hot:*');

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('上传商品失败:', error);
      res.status(500).json({
        success: false,
        error: '上传商品失败'
      });
    }
  },

  // 更新商品
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, stock, category, images } = req.body;

      const beforeData = req.product.toJSON();

      // 更新商品
      await req.product.update({
        name,
        description,
        price,
        stock,
        category,
        images: images || req.product.images
      });

      const afterData = req.product.toJSON();

      // 同步更新盲盒中的商品信息！
      console.log('正在同步更新盲盒中的商品信息...');
      
      // 找到商品的第一张图片
      let productImage = null;
      if (images && Array.isArray(images) && images.length > 0) {
        productImage = images[0];
      } else if (req.product.images && Array.isArray(req.product.images) && req.product.images.length > 0) {
        productImage = req.product.images[0];
      }

      // 更新所有引用该商品的盲盒项
      const updatedCount = await MushroomBoxItem.update(
        {
          mushroomName: name,
          image: productImage
        },
        {
          where: {
            mushroomId: parseInt(id, 10)
          }
        }
      );
      
      console.log(`盲盒商品信息同步更新完成，更新了 ${updatedCount[0]} 条记录`);

      // 记录操作日志
      await operationLogService.logOperation({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'update',
        module: 'product',
        targetId: req.product.id,
        targetName: req.product.name,
        description: `${req.user.role === 'admin' ? '管理员' : '卖家'}更新商品`,
        req,
        beforeData,
        afterData
      });

      // 清除相关缓存
      await cache.del(cacheKeys.productDetail(id));
      await cache.clearPattern('product:list:*');
      await cache.clearPattern('product:hot:*');
      
      // 清除盲盒相关缓存
      await cache.clearPattern('box:*');

      res.status(200).json({
        success: true,
        data: req.product,
        message: '商品更新成功，并已同步更新盲盒中的商品信息'
      });
    } catch (error) {
      console.error('更新商品失败:', error);
      res.status(500).json({
        success: false,
        error: '更新商品失败'
      });
    }
  },

  // 删除商品
  deleteProduct: async (req, res) => {
    const { sequelize } = require('../config/db');
    const { id } = req.params;
    const transaction = await sequelize.transaction();
    
    try {
      console.log('开始处理删除商品请求:', {
        productId: id,
        userId: req.user.id,
        userRole: req.user.role
      });

      const beforeData = req.product.toJSON();

      // 删除关联的盲盒商品项
      console.log('开始删除关联的盲盒商品项...');
      await MushroomBoxItem.destroy({
        where: { mushroomId: parseInt(id, 10) },
        transaction
      });
      console.log('关联的盲盒商品项删除完成');

      // 删除商品
      console.log('开始删除商品...');
      await req.product.destroy({ transaction });
      console.log('商品删除成功:', id);

      // 记录操作日志
      await operationLogService.logOperation({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'delete',
        module: 'product',
        targetId: req.product.id,
        targetName: req.product.name,
        description: `${req.user.role === 'admin' ? '管理员' : '卖家'}删除商品`,
        req,
        beforeData
      });

      // 提交事务
      await transaction.commit();
      console.log('事务提交成功');

      // 清除相关缓存（使用Promise.allSettled确保即使缓存操作失败，请求也能继续执行）
      await Promise.allSettled([
        cache.del(cacheKeys.productDetail(id)),
        cache.clearPattern('product:list:*'),
        cache.clearPattern('product:hot:*'),
        cache.clearPattern('box:*')
      ]);
      console.log('相关缓存清除完成');

      res.status(200).json({
        success: true,
        message: '商品删除成功'
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error('删除商品失败，事务已回滚:', error.message);
      console.error('删除商品失败详情:', {
        error: error.stack,
        request: {
          params: req.params,
          user: req.user
        },
        sql: error.sql,
        sqlState: error.sqlState,
        errno: error.errno
      });
      res.status(500).json({
        success: false,
        error: '删除商品失败: ' + error.message
      });
    }
  },

  // 商品审核
  approveProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectReason, rejectType, rejectRule } = req.body;
      
      // 验证req.user是否存在
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '未认证'
        });
      }
      
      console.log('开始处理商品审核请求:', {
        productId: id,
        userId: req.user.id,
        userRole: req.user.role,
        status
      });

      // 验证状态值的有效性
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: '无效的状态值' + '，允许的值：' + validStatuses.join(', ')
        });
      }

      // 查找商品
      let product;
      try {
        product = await Product.findByPk(id);
      } catch (dbError) {
        console.error('查找商品失败:', dbError);
        return res.status(500).json({
          success: false,
          error: '数据库查询失败'
        });
      }
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: '商品不存在'
        });
      }

      // 构建更新数据
      const updateData = {
        status
      };

      // 如果审核拒绝，保存拒绝详情
      if (status === 'rejected') {
        updateData.rejectReason = rejectReason;
        updateData.rejectType = rejectType;
        updateData.rejectRule = rejectRule;
        updateData.rejectedAt = new Date();
      } else {
        // 如果审核通过，清空拒绝详情
        updateData.rejectReason = null;
        updateData.rejectType = null;
        updateData.rejectRule = null;
        updateData.rejectedAt = null;
      }

      // 更新商品状态和拒绝详情
      try {
        await product.update(updateData);
        console.log('商品审核成功:', {
          productId: id,
          status: product.status
        });
      } catch (dbError) {
        console.error('更新商品状态失败:', dbError);
        // 提供更详细的错误信息
        let errorMessage = '审核商品失败';
        if (dbError.message && dbError.message.includes('Unknown column')) {
          errorMessage = '审核失败：数据库结构不完整，请联系管理员更新数据库表结构';
        } else if (dbError.message) {
          errorMessage = `审核失败：${dbError.message}`;
        }
        return res.status(500).json({
          success: false,
          error: errorMessage
        });
      }

      // 清除相关缓存（使用Promise.allSettled确保即使缓存操作失败，请求也能继续执行）
      await Promise.allSettled([
        cache.del(cacheKeys.productDetail(id)),
        cache.clearPattern('product:list:*'),
        cache.clearPattern('product:hot:*')
      ]);

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      // 详细的错误日志
      console.error('审核商品请求处理失败:', error.message);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        request: {
          params: req.params,
          body: req.body,
          user: req.user
        },
        sql: error.sql,
        sqlState: error.sqlState,
        errno: error.errno
      });
      
      // 提供更详细的错误信息
      let errorMessage = '审核商品失败';
      if (error.message) {
        errorMessage = `审核失败：${error.message}`;
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  },

  // 设置热门商品
  setHotProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { isHot } = req.body;

      // 验证req.user是否存在
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '未认证'
        });
      }

      console.log('开始处理设置热门商品请求:', {
        productId: id,
        userId: req.user.id,
        userRole: req.user.role,
        isHot
      });

      // 查找商品
      let product;
      try {
        product = await Product.findByPk(id);
      } catch (dbError) {
        console.error('查找商品失败:', dbError);
        return res.status(500).json({
          success: false,
          error: '数据库查询失败'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          error: '商品不存在'
        });
      }

      // 更新商品的isHot状态
      try {
        await product.update({ isHot: !!isHot });
        console.log('热门商品设置成功:', {
          productId: id,
          isHot: product.isHot
        });
      } catch (dbError) {
        console.error('更新热门商品状态失败:', dbError);
        return res.status(500).json({
          success: false,
          error: '设置热门商品失败'
        });
      }

      // 清除相关缓存 - 明确清除所有可能的热门商品缓存键
      console.log('开始清除热门商品相关缓存...');
      
      // 清除商品详情缓存
      await cache.del(cacheKeys.productDetail(id));
      
      // 清除商品列表缓存
      await cache.clearPattern('product:list:*');
      
      // 清除各种可能的热门商品缓存（不同limit值）
      const commonLimits = [5, 6, 8, 10, 12, 15, 20];
      for (const limit of commonLimits) {
        const cacheKey = cacheKeys.hotProducts(limit);
        await cache.del(cacheKey);
        console.log('已清除缓存:', cacheKey);
      }
      
      // 额外清除所有匹配pattern的热门商品缓存
      await cache.clearPattern('product:hot:*');
      
      console.log('热门商品相关缓存清除完成');

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('设置热门商品请求处理失败:', error.message);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        request: {
          params: req.params,
          body: req.body,
          user: req.user
        }
      });

      res.status(500).json({
        success: false,
        error: '设置热门商品失败'
      });
    }
  },

  // 商品统计
  getProductStats: async (req, res) => {
    try {
      const isAdmin = req.user && req.user.role === 'admin';
      
      // 构建查询条件
      const baseWhere = {};
      if (!isAdmin && req.user) {
        // 卖家只看自己的商品
        baseWhere.sellerId = req.user.id;
      }

      // 总商品数
      const totalProducts = await Product.count({
        where: baseWhere
      });

      // 总浏览次数
      const allProducts = await Product.findAll({
        where: baseWhere,
        attributes: ['viewCount']
      });
      const totalViews = allProducts.reduce((sum, p) => sum + (p.viewCount || 0), 0);

      // 按状态统计
      const statusStats = [];
      const statuses = ['pending', 'approved', 'rejected'];
      for (const status of statuses) {
        const count = await Product.count({
          where: {
            ...baseWhere,
            status
          }
        });
        statusStats.push({ status, count });
      }

      // 按分类统计
      const categoryStats = [];
      const categories = ['食用菌', '药用菌', '野生菌', '菌包', '菌种', '盲盒', '菌菇'];
      for (const category of categories) {
        const count = await Product.count({
          where: {
            ...baseWhere,
            category
          }
        });
        if (count > 0) {
          categoryStats.push({ category, count });
        }
      }

      // 热门商品数
      const hotProductsCount = await Product.count({
        where: {
          ...baseWhere,
          isHot: true
        }
      });

      const stats = {
        totalProducts,
        totalViews,
        statusStats,
        categoryStats,
        hotProductsCount,
        lastUpdated: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取商品统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取商品统计失败: ' + error.message
      });
    }
  }
};

module.exports = productController;