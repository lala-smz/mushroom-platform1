const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, permissionMiddleware, adminMiddleware } = require('../middleware/auth');
const productOwnershipMiddleware = require('../middleware/productAuth');
const categoryController = require('../controllers/categoryController');

// 公开路由 - 未登录用户仅返回已审核商品，已登录用户根据角色返回不同商品
router.get('/list', productController.getProducts);
router.get('/hot', productController.getHotProducts);

// 分类相关API
router.get('/categories', categoryController.getProductLevel1Categories);
router.get('/categories/level2', categoryController.getProductLevel2Categories);
router.get('/categories/level3', categoryController.getProductLevel3Categories);
router.get('/categories/tree', categoryController.getProductCategoryTree);
router.get('/categories/stats', categoryController.getCategoryStats);
router.post('/categories/refresh-cache', authMiddleware, adminMiddleware, categoryController.refreshCategoryCache);
router.post('/categories/batch-sort', authMiddleware, adminMiddleware, categoryController.batchUpdateSortOrder);

// 三级分类管理API（需要管理员权限）
router.post('/categories/level1', authMiddleware, adminMiddleware, categoryController.createLevel1Category);
router.put('/categories/level1/:key', authMiddleware, adminMiddleware, categoryController.updateLevel1Category);
router.delete('/categories/level1/:key', authMiddleware, adminMiddleware, categoryController.deleteLevel1Category);

router.post('/categories/level2/:parentKey', authMiddleware, adminMiddleware, categoryController.createLevel2Category);
router.put('/categories/level2/:key', authMiddleware, adminMiddleware, categoryController.updateLevel2Category);
router.delete('/categories/level2/:key', authMiddleware, adminMiddleware, categoryController.deleteLevel2Category);

router.post('/categories/level3/:parentKey', authMiddleware, adminMiddleware, categoryController.createLevel3Category);
router.put('/categories/level3/:key', authMiddleware, adminMiddleware, categoryController.updateLevel3Category);
router.delete('/categories/level3/:key', authMiddleware, adminMiddleware, categoryController.deleteLevel3Category);

// 需要权限的路由 - 卖家管理自己的商品
router.get('/seller/list', authMiddleware, permissionMiddleware(['product:read']), productController.getSellerProducts);
router.get('/detail/:id', authMiddleware, productController.getProductDetail);
router.post('/create', authMiddleware, permissionMiddleware(['product:create']), productController.createProduct);
router.put('/update/:id', authMiddleware, permissionMiddleware(['product:update']), productOwnershipMiddleware, productController.updateProduct);
router.delete('/delete/:id', authMiddleware, permissionMiddleware(['product:delete']), productOwnershipMiddleware, productController.deleteProduct);

// 需要管理员权限的路由
router.put('/approve/:id', authMiddleware, adminMiddleware, productController.approveProduct);
router.put('/set-hot/:id', authMiddleware, adminMiddleware, productController.setHotProduct);

// 商品统计（需要登录）
router.get('/stats', authMiddleware, productController.getProductStats);

module.exports = router;