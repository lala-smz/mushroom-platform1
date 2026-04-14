const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const paymentSecurity = require('../middleware/paymentSecurity');

// 需要认证的路由
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/list', authMiddleware, orderController.getOrders);
router.get('/detail/:id', authMiddleware, orderController.getOrderDetail);
router.put('/update/:id', authMiddleware, orderController.updateOrderStatus);
router.put('/cancel/:id', authMiddleware, orderController.cancelOrder);

// 支付相关路由
router.post('/pay/notify', 
  paymentSecurity.validateSignature,
  paymentSecurity.validateAmount,
  paymentSecurity.validateCallbackIP,
  paymentSecurity.preventReplay,
  orderController.payNotify
); // 支付回调通知，不需要认证
router.get('/pay/status/:id', authMiddleware, orderController.queryPayStatus); // 支付状态查询
router.post('/pay/retry/:id', authMiddleware, orderController.retryPay); // 支付重试

// 新增支付接口
router.post('/pay/:id', authMiddleware, orderController.payOrder); // 发起支付
router.post('/pay/alipay/notify', orderController.alipayNotify); // 支付宝回调
router.post('/pay/unionpay/notify', orderController.unionpayNotify); // 银联回调
router.get('/pay/poll/:id', authMiddleware, orderController.pollPayStatus); // 轮询支付状态

// 卖家订单管理路由
router.get('/seller/list', authMiddleware, orderController.getSellerOrders);
router.put('/seller/update/:id', authMiddleware, orderController.sellerUpdateOrderStatus);
router.get('/seller/stats', authMiddleware, orderController.getSellerOrderStats);

// 需要管理员权限的路由
// 管理员可以查看所有订单，这里可以添加管理员专用的订单管理路由

module.exports = router;