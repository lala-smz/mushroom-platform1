const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 评分相关路由

// 提交评分
router.post('/', authMiddleware, RatingController.submitRating);

// 修改评分
router.put('/:id', authMiddleware, RatingController.updateRating);

// 删除评分
router.delete('/:id', authMiddleware, RatingController.deleteRating);

// 获取作品评分列表
router.get('/work/:workId', RatingController.getWorkRatings);

// 获取评分历史趋势
router.get('/trend/:workId/:period', RatingController.getRatingTrend);

// 管理后台路由
router.get('/admin/ratings', authMiddleware, adminMiddleware, RatingController.getAdminRatings);
router.put('/admin/ratings/:id/status', authMiddleware, adminMiddleware, RatingController.handleAbnormalRating);
router.get('/admin/ratings/export', authMiddleware, adminMiddleware, RatingController.exportRatingData);

module.exports = router;