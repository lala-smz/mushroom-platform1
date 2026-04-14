const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const mushroomBoxController = require('../controllers/mushroomBoxController');

// 盲盒相关路由
// 公开路由
router.get('/', mushroomBoxController.getMushroomBoxes); // 获取所有盲盒列表

// 盲盒订单路由
router.post('/orders', authMiddleware, mushroomBoxController.createBoxOrder); // 创建盲盒订单
router.get('/orders/user', authMiddleware, mushroomBoxController.getUserBoxOrders); // 获取用户的盲盒订单
router.get('/orders/:id', authMiddleware, mushroomBoxController.getBoxOrderById); // 获取盲盒订单详情
router.put('/orders/:id/status', authMiddleware, adminMiddleware, mushroomBoxController.updateBoxOrderStatus); // 更新盲盒订单状态（管理员）

// 盲盒抽取路由
router.get('/draw/info', authMiddleware, mushroomBoxController.getDrawInfo); // 获取抽取信息
router.post('/draw', authMiddleware, mushroomBoxController.drawBox); // 抽取盲盒（需要认证）
router.post('/draw/save', authMiddleware, mushroomBoxController.saveDrawResult); // 保存抽取结果
router.get('/draw/history', authMiddleware, mushroomBoxController.getDrawHistory); // 获取抽取历史
router.delete('/draw/result/:resultId', authMiddleware, mushroomBoxController.deleteDrawResult); // 删除单个抽取记录
router.delete('/draw/result', authMiddleware, mushroomBoxController.deleteAllDrawResults); // 删除全部抽取记录

// 代培服务路由
router.get('/cultivation/:orderId', authMiddleware, mushroomBoxController.getCultivationProgress); // 获取代培服务进度
router.put('/cultivation/:orderId/progress', authMiddleware, adminMiddleware, mushroomBoxController.updateCultivationProgress); // 更新代培服务进度
router.get('/cultivation/guide/:boxId', authMiddleware, mushroomBoxController.getCultivationGuide); // 获取培育指导

// 数据统计路由
router.get('/statistics', authMiddleware, adminMiddleware, mushroomBoxController.getBoxStatistics); // 获取盲盒数据统计

// 批量操作路由
router.post('/batch/delete', authMiddleware, adminMiddleware, mushroomBoxController.batchDeleteBoxes); // 批量删除盲盒
router.put('/batch/status', authMiddleware, adminMiddleware, mushroomBoxController.batchUpdateBoxStatus); // 批量更新盲盒状态

// 需要认证的路由
router.post('/', authMiddleware, adminMiddleware, mushroomBoxController.createMushroomBox); // 创建盲盒（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, mushroomBoxController.updateMushroomBox); // 更新盲盒（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, mushroomBoxController.deleteMushroomBox); // 删除盲盒（管理员）

// 动态路由（必须放在所有具体路由之后）
router.get('/:id', mushroomBoxController.getMushroomBoxById); // 获取盲盒详情

module.exports = router;