const express = require('express');
const router = express.Router();
const WorkController = require('../controllers/workController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('上传目录已创建:', uploadDir);
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// 作品路由

// 上传作品
router.post('/upload', upload.array('files', 1), WorkController.uploadWork);

// 获取推荐作品
router.get('/recommended', WorkController.getRecommendedWorks);

// 获取最新作品
router.get('/latest', WorkController.getLatestWorks);

// 获取关注用户的作品
router.get('/following', authMiddleware, WorkController.getFollowingWorks);

// 获取用户作品
router.get('/user/:userId', authMiddleware, WorkController.getUserWorks);

// 获取用户收藏作品
router.get('/user/:userId/favorites', WorkController.getUserFavorites);

// 获取排行榜数据
router.get('/ranking', WorkController.getRankingData);

// 获取所有作品（管理员专用）
router.get('/admin/all', authMiddleware, adminMiddleware, WorkController.getAllWorks);



// 点赞作品
router.post('/like', WorkController.likeWork);

// 取消点赞
router.post('/unlike', WorkController.unlikeWork);

// 收藏作品
router.post('/favorite', WorkController.favoriteWork);

// 取消收藏
router.post('/unfavorite', WorkController.unfavoriteWork);

// 检查收藏状态
router.get('/check-favorite', WorkController.checkFavoriteStatus);

// 检查点赞状态
router.get('/check-like', WorkController.checkLikeStatus);

// 获取作品详情
router.get('/:id', WorkController.getWorkDetail);



// 更新作品
router.put('/:id', upload.array('files', 1), WorkController.updateWork);

// 删除作品
router.delete('/:id', authMiddleware, WorkController.deleteWork);

// 添加评论
router.post('/comment', WorkController.addComment);

// 删除评论
router.delete('/comment/:id', WorkController.deleteComment);

// 获取作品评论
router.get('/:workId/comments', WorkController.getWorkComments);

// 评分配置相关路由
router.get('/score/config', WorkController.getScoreConfig);
router.put('/score/config', WorkController.updateScoreConfig);
router.get('/score/config/logs', WorkController.getScoreConfigLogs);
router.post('/score/update-all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await WorkController.updateAllWorkScores();
    res.status(200).json(result);
  } catch (error) {
    console.error('批量更新作品评分失败:', error);
    res.status(500).json({ success: false, error: '批量更新作品评分失败，请稍后重试' });
  }
});

module.exports = router;
