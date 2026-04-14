const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const MushroomBox = require('../models/MushroomBox');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const paymentLogger = require('../services/paymentLogger');
const operationLogService = require('../services/operationLogService');
const logger = require('../utils/logger');

// 支付安全配置
const PAYMENT_CONFIG = {
  // 签名密钥，从环境变量获取，确保生产环境中设置
  SIGN_KEY: process.env.PAYMENT_SIGN_KEY || (() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('警告: 生产环境中未设置支付签名密钥');
    }
    return 'your-secure-payment-sign-key';
  })(),
  // 支付超时时间（分钟）
  PAYMENT_TIMEOUT: parseInt(process.env.PAYMENT_TIMEOUT) || 30,
  // 允许的支付方式
  ALLOWED_PAYMENT_METHODS: process.env.ALLOWED_PAYMENT_METHODS ? 
    process.env.ALLOWED_PAYMENT_METHODS.split(',') : ['alipay', 'wechat', 'bank'],
  // 金额精度（小数位数）
  AMOUNT_PRECISION: parseInt(process.env.AMOUNT_PRECISION) || 2,
  // 支付验证开关
  ENABLE_PAYMENT_VERIFICATION: process.env.ENABLE_PAYMENT_VERIFICATION !== 'false',
  // 日志级别
  LOG_LEVEL: process.env.PAYMENT_LOG_LEVEL || 'info'
};

// 验证支付配置
if (process.env.NODE_ENV === 'production' && PAYMENT_CONFIG.SIGN_KEY === 'your-secure-payment-sign-key') {
  console.warn('安全警告: 生产环境使用默认支付签名密钥，存在安全风险');
}

// 生成支付签名
const generatePaymentSignature = (orderNo, totalAmount, paymentMethod, timestamp) => {
  const data = {
    orderNo,
    totalAmount: parseFloat(totalAmount).toFixed(PAYMENT_CONFIG.AMOUNT_PRECISION),
    paymentMethod,
    timestamp
  };
  
  // 按字典序排序
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  
  // 添加签名密钥
  const signData = sortedData + '&key=' + PAYMENT_CONFIG.SIGN_KEY;
  
  // 生成签名
  return crypto.createHash('md5').update(signData).digest('hex');
};

// 验证支付签名
const verifyPaymentSignature = (data, signature) => {
  const { orderNo, totalAmount, paymentMethod, timestamp } = data;
  const generatedSignature = generatePaymentSignature(orderNo, totalAmount, paymentMethod, timestamp);
  return generatedSignature === signature;
};

const orderController = {
  // 创建订单
  createOrder: async (req, res) => {
    let userId;
    let paymentMethod;
    let cartItems;
    const { sequelize } = require('../config/db');
    
    try {
      logger.section('创建订单');
      logger.debug('Order', '收到创建订单请求', req.body);
      
      userId = req.user.id;
      const { address, phone, receiver, paymentMethod: pm, cartItems: ci } = req.body;
      paymentMethod = pm;
      cartItems = ci;

      logger.info('Order', '解析订单参数', { 
        userId, 
        address, 
        phone, 
        receiver, 
        paymentMethod, 
        cartItemsCount: cartItems?.length 
      });

      // 验证参数
      if (!address || !phone || !receiver || !cartItems || cartItems.length === 0) {
        logger.warn('Order', '参数验证失败', { address, phone, receiver, cartItems });
        return res.status(400).json({
          success: false,
          error: '请填写完整的订单信息'
        });
      }

      // 验证支付方式
      if (!paymentMethod || !PAYMENT_CONFIG.ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        logger.warn('Order', '支付方式验证失败', paymentMethod);
        return res.status(400).json({
          success: false,
          error: '不支持的支付方式'
        });
      }

      // 使用数据库事务确保数据一致性
      const result = await sequelize.transaction(async (t) => {
        // 生成订单编号
        const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

        // 计算总金额并验证库存
        let totalAmount = 0;
        const orderItems = [];
        const validCartItems = [];

        logger.info('Order', '开始处理订单商品', { totalItems: cartItems.length });
        
        for (let i = 0; i < cartItems.length; i++) {
          const item = cartItems[i];
          logger.debug('Order', `处理商品 ${i + 1}/${cartItems.length}`, item);
          
          let itemInfo = null;
          const itemType = item.type === 'box' ? 'box' : 'product';
          
          if (itemType === 'box') {
            // 盲盒类型
            logger.debug('Order', '验证盲盒', { productId: item.productId });
            const box = await MushroomBox.findByPk(item.productId, { transaction: t });
            if (!box) {
              logger.error('Order', '盲盒不存在', { productId: item.productId });
              throw new Error(`盲盒ID ${item.productId} 不存在，请检查购物车`);
            }
            logger.info('Order', '找到盲盒', { 
              name: box.name, 
              stock: box.stock, 
              required: item.quantity 
            });

            if (box.stock < item.quantity) {
              logger.warn('Order', '盲盒库存不足', { 
                name: box.name, 
                stock: box.stock, 
                required: item.quantity 
              });
              throw new Error(`${box.name} 库存不足`);
            }

            totalAmount += box.price * item.quantity;
            itemInfo = {
              productId: box.id,
              type: 'box',
              productName: box.name,
              price: box.price,
              quantity: item.quantity,
              image: box.image || ''
            };
            
            // 扣减盲盒库存
            logger.debug('Order', '扣减盲盒库存', { 
              productId: item.productId, 
              quantity: item.quantity 
            });
            await MushroomBox.decrement('stock', {
              by: item.quantity,
              where: { id: item.productId },
              transaction: t
            });
          } else {
            // 普通商品类型
            logger.debug('Order', '验证商品', { productId: item.productId });
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (!product) {
              logger.error('Order', '商品不存在', { productId: item.productId });
              throw new Error(`商品ID ${item.productId} 不存在，请检查购物车`);
            }
            logger.info('Order', '找到商品', { 
              name: product.name, 
              stock: product.stock, 
              required: item.quantity 
            });

            if (product.stock < item.quantity) {
              logger.warn('Order', '商品库存不足', { 
                name: product.name, 
                stock: product.stock, 
                required: item.quantity 
              });
              throw new Error(`${product.name} 库存不足`);
            }

            totalAmount += product.price * item.quantity;
            itemInfo = {
              productId: product.id,
              type: 'product',
              productName: product.name,
              price: product.price,
              quantity: item.quantity,
              image: product.images && product.images.length > 0 ? product.images[0] : ''
            };
            
            // 扣减商品库存
            logger.debug('Order', '扣减商品库存', { 
              productId: item.productId, 
              quantity: item.quantity 
            });
            await Product.decrement('stock', {
              by: item.quantity,
              where: { id: item.productId },
              transaction: t
            });
          }

          logger.debug('Order', '添加订单项', itemInfo);
          orderItems.push(itemInfo);
          validCartItems.push(item);
        }
        
        logger.info('Order', '所有商品处理完成', { 
          totalAmount, 
          orderItemsCount: orderItems.length 
        });

        // 生成支付相关参数
        const timestamp = Date.now();
        const paymentSignature = generatePaymentSignature(orderNo, totalAmount, paymentMethod, timestamp);
        const paymentTimeout = new Date(Date.now() + PAYMENT_CONFIG.PAYMENT_TIMEOUT * 60 * 1000);

        // 创建订单
        logger.info('Order', '创建订单', { orderNo });
        const order = await Order.create({
          orderNo,
          userId,
          totalAmount,
          address,
          phone,
          receiver,
          paymentMethod,
          status: 'pending',
          paymentSignature,
          paymentTimeout,
          paymentInfo: {
            timestamp,
            signature: paymentSignature,
            method: paymentMethod
          }
        }, { transaction: t });
        logger.success('Order', '订单创建成功', { orderId: order.id, orderNo });

        // 记录支付创建日志
        paymentLogger.logPaymentCreate(orderNo, userId, totalAmount, paymentMethod);

        // 创建订单项
        logger.info('Order', '开始创建订单项', { count: orderItems.length });
        for (let i = 0; i < orderItems.length; i++) {
          const item = orderItems[i];
          logger.debug('Order', `创建订单项 ${i + 1}/${orderItems.length}`, item);
          await OrderItem.create({
            orderId: order.id,
            ...item
          }, { transaction: t });
        }
        logger.success('Order', '所有订单项创建完成');

        // 清除购物车中已购买的商品
        logger.info('Order', '清除购物车商品');
        const cartIdsToDelete = validCartItems
          .map(item => item.cartId)
          .filter(id => id != null && id !== undefined);
        
        logger.debug('Order', '需要清除的购物车ID', cartIdsToDelete);
        
        if (cartIdsToDelete.length > 0) {
          const deletedCount = await Cart.destroy({
            where: {
              userId,
              id: cartIdsToDelete
            },
            transaction: t
          });
          logger.success('Order', '购物车商品已清除', { count: deletedCount });
        } else {
          logger.info('Order', '没有需要清除的购物车商品');
        }

        // 构建支付参数
        const paymentParams = {
          orderNo: order.orderNo,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          timestamp: timestamp,
          signature: paymentSignature,
          paymentTimeout: order.paymentTimeout,
          notifyUrl: `${req.protocol}://${req.get('host')}/api/order/pay/notify`,
          returnUrl: `${req.protocol}://${req.get('host')}/order/${order.id}`
        };

        return { order, paymentParams };
      });

      logger.success('Order', '订单创建流程完成', {
        orderId: result.order.id,
        orderNo: result.order.orderNo,
        totalAmount: result.order.totalAmount
      });
      logger.separator();
      
      res.status(201).json({
        success: true,
        data: {
          ...result.order.toJSON(),
          paymentParams: result.paymentParams
        }
      });
    } catch (error) {
      logger.error('Order', '创建订单失败', error);
      logger.debug('Order', '错误上下文', {
        userId,
        paymentMethod,
        cartItems: cartItems
      });
      
      paymentLogger.logException('创建订单', error, {
        userId,
        paymentMethod,
        cartItemsCount: cartItems?.length || 0
      });
      
      // 根据错误类型返回更具体的错误信息
      let errorMessage = '创建订单失败，请重试';
      if (error.message) {
        if (error.message.includes('商品') || error.message.includes('库存') || error.message.includes('盲盒')) {
          errorMessage = error.message;
        }
      }
      
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  },

  // 获取订单列表
  getOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status = '' } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // 构建查询条件
      const where = { userId };
      if (status) {
        where.status = status;
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
          orders: orders.map(order => order.toJSON()),
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
  },

  // 获取订单详情
  getOrderDetail: async (req, res) => {
    try {
      const userId = req.user.id;
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

      // 检查权限
      if (order.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限查看此订单'
        });
      }

      res.status(200).json({
        success: true,
        data: order.toJSON()
      });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({
        success: false,
        error: '获取订单详情失败'
      });
    }
  },

  // 更新订单状态
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentTime } = req.body;

      // 查找订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查权限
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限修改此订单'
        });
      }

      // 更新订单状态
      const updateData = { status };
      if (status === 'paid' && paymentTime) {
        updateData.paymentTime = paymentTime;
      }

      await order.update(updateData);

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('更新订单状态失败:', error);
      res.status(500).json({
        success: false,
        error: '更新订单状态失败'
      });
    }
  },

  // 取消订单
  cancelOrder: async (req, res) => {
    const { sequelize } = require('../config/db');
    
    try {
      const { id } = req.params;

      // 使用事务确保库存回滚的原子性
      const result = await sequelize.transaction(async (t) => {
        // 查找订单
        const order = await Order.findByPk(id, {
          include: [
            {
              model: OrderItem,
              as: 'items'
            }
          ],
          transaction: t
        });
        
        if (!order) {
          throw new Error('订单不存在');
        }

        // 检查权限
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
          throw new Error('无权限修改此订单');
        }

        // 检查订单状态
        if (order.status !== 'pending') {
          throw new Error('只有待支付的订单可以取消');
        }

        // 回滚库存
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            if (item.type === 'box') {
              // 回滚盲盒库存
              await MushroomBox.increment('stock', {
                by: item.quantity,
                where: { id: item.productId },
                transaction: t
              });
            } else {
              // 回滚普通商品库存
              await Product.increment('stock', {
                by: item.quantity,
                where: { id: item.productId },
                transaction: t
              });
            }
          }
        }

        // 更新订单状态为已取消
        await order.update({ 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: req.user.id,
          cancelledReason: '用户主动取消'
        }, { transaction: t });

        return order;
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('取消订单失败:', error);
      
      let errorMessage = '取消订单失败';
      if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  },

  // 支付回调通知接口
  payNotify: async (req, res) => {
    try {
      const { orderNo, paymentMethod, totalAmount, timestamp, signature, transactionId, payTime } = req.body;

      // 验证签名
      if (!verifyPaymentSignature({ orderNo, totalAmount, paymentMethod, timestamp }, signature)) {
        paymentLogger.logSignatureFailure(orderNo, '签名验证失败', signature);
        return res.status(400).json({
          success: false,
          error: '签名验证失败'
        });
      }

      // 查找订单
      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        paymentLogger.logException('支付回调', new Error('订单不存在'), {
          orderNo,
          paymentMethod,
          transactionId
        });
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        paymentLogger.logException('支付回调', new Error('订单状态不正确'), {
          orderNo,
          currentStatus: order.status,
          paymentMethod
        });
        return res.status(400).json({
          success: false,
          error: '订单状态不正确'
        });
      }

      // 检查支付金额
      if (parseFloat(order.totalAmount) !== parseFloat(totalAmount)) {
        paymentLogger.logException('支付回调', new Error('支付金额与订单金额不符'), {
          orderNo,
          orderAmount: order.totalAmount,
          payAmount: totalAmount,
          paymentMethod
        });
        return res.status(400).json({
          success: false,
          error: '支付金额与订单金额不符'
        });
      }

      // 更新订单状态
      await order.update({
        status: 'paid',
        paymentTime: payTime || new Date(),
        transactionId,
        paymentInfo: {
          ...(order.paymentInfo || {}),
          transactionId,
          payTime: payTime || new Date(),
          notifyTime: new Date()
        }
      });

      // 记录支付成功日志
      paymentLogger.logPaymentSuccess(orderNo, transactionId, paymentMethod, payTime || new Date());
      paymentLogger.logPayNotify(orderNo, transactionId, 'success', req.body);

      res.status(200).json({
        success: true,
        message: '支付成功'
      });
    } catch (error) {
      console.error('支付回调处理失败:', error);
      paymentLogger.logException('支付回调处理', error, {
        orderNo: req.body.orderNo,
        transactionId: req.body.transactionId,
        paymentMethod: req.body.paymentMethod
      });
      res.status(500).json({
        success: false,
        error: '支付回调处理失败'
      });
    }
  },

  // 支付状态查询接口
  queryPayStatus: async (req, res) => {
    try {
      const { id } = req.params;

      // 查找订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查权限
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限查看此订单'
        });
      }

      // 检查支付是否超时
      if (order.status === 'pending' && order.paymentTimeout < new Date()) {
        // 记录支付超时日志
        paymentLogger.logPaymentTimeout(order.orderNo, order.paymentMethod, order.paymentTimeout);
        // 更新订单状态为已取消
        await order.update({ status: 'cancelled', cancelledReason: '支付超时' });
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          status: order.status,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          paymentTime: order.paymentTime,
          transactionId: order.transactionId,
          paymentTimeout: order.paymentTimeout,
          isTimeout: order.status === 'pending' && order.paymentTimeout < new Date()
        }
      });
    } catch (error) {
      console.error('查询支付状态失败:', error);
      paymentLogger.logException('查询支付状态', error, {
        orderId: req.params.id,
        userId: req.user.id
      });
      res.status(500).json({
        success: false,
        error: '查询支付状态失败'
      });
    }
  },

  // 支付重试接口
  retryPay: async (req, res) => {
    try {
      const { id } = req.params;

      // 查找订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查权限
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限操作此订单'
        });
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: '订单状态不正确'
        });
      }

      // 检查支付是否超时
      if (order.paymentTimeout < new Date()) {
        return res.status(400).json({
          success: false,
          error: '支付已超时'
        });
      }

      // 重新生成支付参数
      const timestamp = Date.now();
      const paymentSignature = generatePaymentSignature(order.orderNo, order.totalAmount, order.paymentMethod, timestamp);

      // 记录支付重试日志
      paymentLogger.logPaymentRetry(order.orderNo, req.user.id, order.paymentMethod, 1);

      // 构建支付参数
      const paymentParams = {
        orderNo: order.orderNo,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        timestamp: timestamp,
        signature: paymentSignature,
        paymentTimeout: order.paymentTimeout,
        notifyUrl: `${req.protocol}://${req.get('host')}/api/order/pay/notify`,
        returnUrl: `${req.protocol}://${req.get('host')}/order/${order.id}`
      };

      res.status(200).json({
        success: true,
        data: {
          paymentParams
        }
      });
    } catch (error) {
      console.error('支付重试失败:', error);
      paymentLogger.logException('支付重试', error, {
        orderId: req.params.id,
        userId: req.user.id
      });
      res.status(500).json({
        success: false,
        error: '支付重试失败'
      });
    }
  },

  // 卖家获取订单列表
  getSellerOrders: async (req, res) => {
    try {
      const sellerId = req.user.id;
      const { page = 1, limit = 10, status = '' } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // 先找到卖家的所有商品ID
      const sellerProducts = await Product.findAll({
        where: { sellerId },
        attributes: ['id']
      });
      
      const productIds = sellerProducts.map(p => p.id);
      
      if (productIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            orders: [],
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0
          }
        });
      }

      // 找到包含这些商品的订单项
      const orderItems = await OrderItem.findAll({
        where: { productId: productIds },
        attributes: ['orderId']
      });
      
      const orderIds = [...new Set(orderItems.map(item => item.orderId))];
      
      if (orderIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            orders: [],
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0
          }
        });
      }

      // 构建查询条件
      const where = { id: orderIds };
      if (status) {
        where.status = status;
      }

      // 查询订单
      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: OrderItem,
            as: 'items'
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      const result = {
        orders: orders.map(order => order.toJSON()),
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      };

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取卖家订单列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取订单列表失败'
      });
    }
  },

  // 卖家更新订单状态（发货等）
  sellerUpdateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const sellerId = req.user.id;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sellerId']
              }
            ]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      const hasSellerProduct = order.items.some(item => 
        item.product && item.product.sellerId === sellerId
      );

      if (!hasSellerProduct) {
        return res.status(403).json({
          success: false,
          error: '无权限操作此订单'
        });
      }

      const beforeData = order.toJSON();
      await order.update({ status });
      const afterData = order.toJSON();

      await operationLogService.logOperation({
        userId: sellerId,
        username: req.user.username,
        role: req.user.role,
        action: 'update',
        module: 'order',
        targetId: order.id,
        targetName: order.orderNo,
        description: `卖家更新订单状态: ${status}`,
        req,
        beforeData,
        afterData
      });

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('卖家更新订单状态失败:', error);
      res.status(500).json({
        success: false,
        error: '更新订单状态失败'
      });
    }
  },

  // 卖家获取订单统计
  getSellerOrderStats: async (req, res) => {
    try {
      const sellerId = req.user.id;

      // 先找到卖家的所有商品ID
      const sellerProducts = await Product.findAll({
        where: { sellerId },
        attributes: ['id']
      });
      
      const productIds = sellerProducts.map(p => p.id);
      
      // 统计商品数量
      const totalProducts = productIds.length;
      
      let totalOrders = 0;
      let totalRevenue = 0;
      
      if (productIds.length > 0) {
        // 找到包含这些商品的订单项
        const orderItems = await OrderItem.findAll({
          where: { productId: productIds },
          attributes: ['orderId']
        });
        
        const orderIds = [...new Set(orderItems.map(item => item.orderId))];
        totalOrders = orderIds.length;
        
        if (orderIds.length > 0) {
          // 查询订单计算销售额
          const orders = await Order.findAll({
            where: { id: orderIds }
          });
          
          totalRevenue = orders
            .filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'delivered' || o.status === 'shipping')
            .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        }
      }

      // 返回与管理员统计类似的数据结构
      const stats = {
        users: 0, // 卖家不显示用户统计
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取卖家订单统计失败:', error);
      res.status(500).json({
        success: false,
        error: '获取订单统计失败'
      });
    }
  },

  // 发起支付接口
  payOrder: async (req, res) => {
    const paymentService = require('../services/paymentService');
    
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      logger.info('Order', '发起支付请求', { orderId: id, paymentMethod });

      // 查找订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查权限
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限操作此订单'
        });
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: '订单状态不正确，只能对未支付订单发起支付'
        });
      }

      // 检查支付是否超时
      if (order.paymentTimeout < new Date()) {
        return res.status(400).json({
          success: false,
          error: '支付已超时，请重新创建订单'
        });
      }

      let result;
      
      // 根据支付方式调用对应的支付服务
      switch (paymentMethod) {
        case 'alipay':
          result = await paymentService.createAlipayOrder(order);
          break;
        case 'alipay_qr':
          result = await paymentService.createAlipayQRCode(order);
          break;
        case 'unionpay':
          result = await paymentService.createUnionpayOrder(order);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: '不支持的支付方式'
          });
      }

      if (result.success) {
        logger.success('Order', '支付参数创建成功', { orderNo: order.orderNo, paymentMethod });
        
        res.status(200).json({
          success: true,
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            totalAmount: order.totalAmount,
            ...result.data
          }
        });
      } else {
        logger.error('Order', '支付参数创建失败', { orderNo: order.orderNo });
        
        res.status(500).json({
          success: false,
          error: '创建支付订单失败'
        });
      }
    } catch (error) {
      logger.error('Order', '发起支付失败', error);
      paymentLogger.logException('发起支付', error, {
        orderId: req.params.id,
        userId: req.user.id,
        paymentMethod: req.body.paymentMethod
      });
      
      res.status(500).json({
        success: false,
        error: '发起支付失败'
      });
    }
  },

  // 支付宝支付回调
  alipayNotify: async (req, res) => {
    const paymentService = require('../services/paymentService');
    
    try {
      logger.info('Order', '收到支付宝回调通知');
      
      const result = paymentService.verifyAlipayNotify(req.body);
      
      if (!result.success) {
        logger.warn('Order', '支付宝回调签名验证失败');
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      const { orderNo, tradeNo, totalAmount, tradeStatus, payTime } = result.data;

      // 查找订单
      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        logger.error('Order', '支付宝回调订单不存在', { orderNo });
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        logger.warn('Order', '支付宝回调订单状态不正确', { orderNo, currentStatus: order.status });
        return res.status(200).json({
          success: true,
          message: '订单已处理'
        });
      }

      // 检查支付金额
      if (parseFloat(order.totalAmount) !== parseFloat(totalAmount)) {
        logger.error('Order', '支付宝回调金额不符', { orderNo, orderAmount: order.totalAmount, payAmount: totalAmount });
        return res.status(400).json({
          success: false,
          error: '支付金额与订单金额不符'
        });
      }

      // 更新订单状态
      await order.update({
        status: 'paid',
        paymentTime: payTime,
        transactionId: tradeNo,
        paymentInfo: {
          ...(order.paymentInfo || {}),
          transactionId: tradeNo,
          payTime,
          notifyTime: new Date(),
          tradeStatus
        }
      });

      // 记录支付成功日志
      paymentLogger.logPaymentSuccess(orderNo, tradeNo, 'alipay', payTime);
      logger.success('Order', '支付宝支付成功', { orderNo, tradeNo });

      res.status(200).json({
        success: true,
        message: 'success'
      });
    } catch (error) {
      logger.error('Order', '支付宝回调处理失败', error);
      paymentLogger.logException('支付宝回调处理', error, req.body);
      
      res.status(500).json({
        success: false,
        error: '支付回调处理失败'
      });
    }
  },

  // 银联支付回调
  unionpayNotify: async (req, res) => {
    const paymentService = require('../services/paymentService');
    
    try {
      logger.info('Order', '收到银联回调通知');
      
      const result = paymentService.verifyUnionpayNotify(req.body);
      
      if (!result.success) {
        logger.warn('Order', '银联回调验证失败');
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      const { orderNo, tradeNo, totalAmount, tradeStatus, payTime } = result.data;

      // 查找订单
      const order = await Order.findOne({ where: { orderNo } });
      if (!order) {
        logger.error('Order', '银联回调订单不存在', { orderNo });
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查订单状态
      if (order.status !== 'pending') {
        logger.warn('Order', '银联回调订单状态不正确', { orderNo, currentStatus: order.status });
        return res.status(200).json({
          success: true,
          message: '订单已处理'
        });
      }

      // 检查支付金额
      if (Math.abs(parseFloat(order.totalAmount) - parseFloat(totalAmount)) > 0.01) {
        logger.error('Order', '银联回调金额不符', { orderNo, orderAmount: order.totalAmount, payAmount: totalAmount });
        return res.status(400).json({
          success: false,
          error: '支付金额与订单金额不符'
        });
      }

      // 更新订单状态
      await order.update({
        status: 'paid',
        paymentTime: payTime,
        transactionId: tradeNo,
        paymentInfo: {
          ...(order.paymentInfo || {}),
          transactionId: tradeNo,
          payTime,
          notifyTime: new Date(),
          tradeStatus
        }
      });

      // 记录支付成功日志
      paymentLogger.logPaymentSuccess(orderNo, tradeNo, 'unionpay', payTime);
      logger.success('Order', '银联支付成功', { orderNo, tradeNo });

      res.status(200).json({
        success: true,
        message: 'success'
      });
    } catch (error) {
      logger.error('Order', '银联回调处理失败', error);
      paymentLogger.logException('银联回调处理', error, req.body);
      
      res.status(500).json({
        success: false,
        error: '支付回调处理失败'
      });
    }
  },

  // 查询支付状态（轮询用）
  pollPayStatus: async (req, res) => {
    const paymentService = require('../services/paymentService');
    
    try {
      const { id } = req.params;

      // 查找订单
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 检查权限
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: '无权限查看此订单'
        });
      }

      // 如果订单已支付或已取消，直接返回状态
      if (order.status !== 'pending') {
        return res.status(200).json({
          success: true,
          data: {
            orderId: order.id,
            orderNo: order.orderNo,
            status: order.status,
            isPaid: order.status === 'paid',
            isCancelled: order.status === 'cancelled',
            transactionId: order.transactionId,
            paymentTime: order.paymentTime
          }
        });
      }

      // 如果是支付宝支付，查询支付宝状态
      if (order.paymentMethod === 'alipay' && order.orderNo) {
        try {
          const result = await paymentService.queryAlipayOrder(order.orderNo);
          
          if (result.success && result.data.tradeStatus === 'TRADE_SUCCESS') {
            // 更新订单状态
            await order.update({
              status: 'paid',
              paymentTime: result.data.payTime,
              transactionId: result.data.tradeNo,
              paymentInfo: {
                ...(order.paymentInfo || {}),
                tradeStatus: result.data.tradeStatus,
                transactionId: result.data.tradeNo,
                payTime: result.data.payTime
              }
            });
            
            return res.status(200).json({
              success: true,
              data: {
                orderId: order.id,
                orderNo: order.orderNo,
                status: 'paid',
                isPaid: true,
                isCancelled: false,
                transactionId: result.data.tradeNo,
                paymentTime: result.data.payTime
              }
            });
          }
        } catch (error) {
          logger.warn('Order', '查询支付宝订单状态失败', error);
        }
      }

      // 返回当前状态
      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          orderNo: order.orderNo,
          status: order.status,
          isPaid: false,
          isCancelled: false,
          transactionId: null,
          paymentTime: null
        }
      });
    } catch (error) {
      logger.error('Order', '轮询支付状态失败', error);
      
      res.status(500).json({
        success: false,
        error: '查询支付状态失败'
      });
    }
  }
};

module.exports = orderController;