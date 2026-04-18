const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// 测试路由
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '鍚庣鏈嶅姟姝ｅ父杩愯', timestamp: new Date() });
});

router.post('/init-db', testController.initDatabase);

router.post('/test-login', testController.testLogin);

router.get('/mushroom-boxes', testController.getMushroomBoxes);

module.exports = router;