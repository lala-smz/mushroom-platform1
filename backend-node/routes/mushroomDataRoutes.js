const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const mushroomDataController = require('../controllers/mushroomDataController');

// 蘑菇数据相关路由

// 公开路由
router.get('/seasonal', mushroomDataController.getSeasonalMushrooms); // 获取当季蘑菇列表
router.get('/:id/details', mushroomDataController.getMushroomDetails); // 获取蘑菇详细信息
router.get('/:mushroomName/ingredient-suggestions', mushroomDataController.getIngredientSuggestions); // 获取蘑菇食材搭配建议

// 需要认证的路由
router.post('/update', authMiddleware, mushroomDataController.updateMushroomData); // 手动触发蘑菇数据更新（管理员）

module.exports = router;