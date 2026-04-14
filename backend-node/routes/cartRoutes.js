const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// 所有购物车路由都需要认证
router.get('/list', authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addToCart);
router.put('/update/:id', authMiddleware, cartController.updateCartItem);
router.put('/status/:id', authMiddleware, cartController.updateCartItemStatus);
router.delete('/delete/:id', authMiddleware, cartController.deleteCartItem);
router.delete('/clear', authMiddleware, cartController.clearCart);

module.exports = router;