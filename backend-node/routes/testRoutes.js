const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// 测试路由
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '后端服务正常运行', timestamp: new Date() });
});

router.get('/mushroom-boxes', testController.getMushroomBoxes);

module.exports = router;