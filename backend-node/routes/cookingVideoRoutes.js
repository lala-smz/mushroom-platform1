const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const cookingVideoController = require('../controllers/cookingVideoController');
const cookingVideoCrudController = require('../controllers/cookingVideoCrudController');

// 烹饪视频相关路由

// 公开路由
router.get('/search', cookingVideoController.searchCookingVideos); // 搜索烹饪视频
router.get('/recipe/:recipeId', cookingVideoController.getVideosForRecipe); // 获取与食谱匹配的视频
router.get('/mushroom/:mushroomName', cookingVideoController.recommendVideosByMushroom); // 基于蘑菇品种推荐视频
router.get('/mushroom-box/:mushroomBoxId', cookingVideoCrudController.getVideosByMushroomBoxId); // 获取盲盒关联的视频

// 需要认证的路由
router.get('/user/recommend', authMiddleware, cookingVideoController.recommendVideosByUser); // 基于用户口味偏好推荐视频

// 管理员路由 - 需要管理员权限
router.get('/', authMiddleware, adminMiddleware, cookingVideoCrudController.getCookingVideos); // 获取所有烹饪视频
router.get('/stats', authMiddleware, adminMiddleware, cookingVideoCrudController.getVideoStats); // 获取视频统计信息
router.get('/:id', authMiddleware, adminMiddleware, cookingVideoCrudController.getCookingVideoById); // 获取单个烹饪视频详情
router.post('/', authMiddleware, adminMiddleware, cookingVideoCrudController.createCookingVideo); // 创建烹饪视频
router.put('/:id', authMiddleware, adminMiddleware, cookingVideoCrudController.updateCookingVideo); // 更新烹饪视频
router.delete('/:id', authMiddleware, adminMiddleware, cookingVideoCrudController.deleteCookingVideo); // 删除烹饪视频
router.post('/bulk-delete', authMiddleware, adminMiddleware, cookingVideoCrudController.bulkDeleteCookingVideos); // 批量删除视频
router.post('/bulk-status', authMiddleware, adminMiddleware, cookingVideoCrudController.bulkUpdateVideoStatus); // 批量更新视频状态
router.post('/update-sort', authMiddleware, adminMiddleware, cookingVideoCrudController.updateVideoSortOrder); // 更新视频排序
router.post('/upload-thumbnail', authMiddleware, adminMiddleware, cookingVideoCrudController.uploadVideoThumbnail); // 上传视频封面
router.post('/upload-video', authMiddleware, adminMiddleware, cookingVideoCrudController.uploadVideoFile); // 上传视频文件

module.exports = router;