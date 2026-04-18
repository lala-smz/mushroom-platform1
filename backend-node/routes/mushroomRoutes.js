const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const mushroomController = require('../controllers/mushroomController');

// 蘑菇管理路由

// 公开路由
router.get('/', mushroomController.getMushrooms); // 获取蘑菇列表
router.get('/search', mushroomController.searchMushrooms); // 搜索蘑菇
router.get('/:id', mushroomController.getMushroomById); // 获取蘑菇详情

// 需要认证的路由（管理员）
router.post('/', authMiddleware, mushroomController.createMushroom); // 创建蘑菇
router.put('/:id', authMiddleware, mushroomController.updateMushroom); // 更新蘑菇
router.delete('/:id', authMiddleware, mushroomController.deleteMushroom); // 删除蘑菇

module.exports = router;