const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const recipeMatchingController = require('../controllers/recipeMatchingController');
const cookingVideoService = require('../services/cookingVideoService');

// 智能匹配相关路由

// 执行智能匹配
router.post('/smart', recipeMatchingController.performSmartMatching); // 执行智能匹配

// 推荐烹饪视频
router.get('/videos/recommend', recipeMatchingController.recommendVideos); // 推荐烹饪视频

// 获取匹配历史
router.get('/history', authMiddleware, recipeMatchingController.getMatchingHistory); // 获取匹配历史

// 提交用户反馈
router.post('/feedback', authMiddleware, recipeMatchingController.submitUserFeedback); // 提交用户反馈

module.exports = router;