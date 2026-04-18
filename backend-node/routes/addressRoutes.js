const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/auth');

// 所有地址路由都需要认证
router.get('/list', authMiddleware, addressController.getAddressList);
router.post('/add', authMiddleware, addressController.addAddress);
router.put('/update/:id', authMiddleware, addressController.updateAddress);
router.delete('/delete/:id', authMiddleware, addressController.deleteAddress);
router.put('/setDefault/:id', authMiddleware, addressController.setDefaultAddress);

module.exports = router;