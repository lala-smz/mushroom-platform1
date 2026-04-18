const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const contentManagementController = require('../controllers/contentManagementController');

// 内容管理相关路由

// 菌菇管理路由
router.post('/mushrooms', authMiddleware, adminMiddleware, contentManagementController.uploadMushroom); // 上传菌菇资料（管理员）
router.delete('/mushrooms/:id', authMiddleware, adminMiddleware, contentManagementController.deleteMushroom); // 删除菌菇资料（管理员）
router.get('/mushrooms/filter', contentManagementController.filterMushrooms); // 筛选菌菇

// 菜谱管理路由
router.post('/recipes', authMiddleware, adminMiddleware, contentManagementController.uploadRecipe); // 上传菜谱（管理员）
router.delete('/recipes/:id', authMiddleware, adminMiddleware, contentManagementController.deleteRecipe); // 删除菜谱（管理员）
router.get('/recipes/filter', contentManagementController.filterRecipes); // 筛选菜谱

// 烹饪视频管理路由
router.post('/videos', authMiddleware, adminMiddleware, contentManagementController.uploadCookingVideo); // 上传烹饪视频（管理员）
router.delete('/videos/:id', authMiddleware, adminMiddleware, contentManagementController.deleteCookingVideo); // 删除烹饪视频（管理员）
router.get('/videos/filter', contentManagementController.filterCookingVideos); // 筛选烹饪视频

// 内容审核路由
router.post('/review/:id', authMiddleware, adminMiddleware, contentManagementController.reviewContent); // 审核内容（管理员）

module.exports = router;