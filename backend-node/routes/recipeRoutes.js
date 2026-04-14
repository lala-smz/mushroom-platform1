const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const recipeController = require('../controllers/recipeController');
const recipeMatchingController = require('../controllers/recipeMatchingController');
const externalRecipeController = require('../controllers/externalRecipeController');

// 食谱相关路由
// 公开路由 - 注意：统计路由和其他固定路径路由必须在 /:id 之前
router.get('/', recipeController.getRecipes); // 获取所有食谱列表
router.get('/recommended', recipeController.getRecommendedRecipes); // 获取推荐食谱（支持未登录用户）
router.get('/popular', recipeMatchingController.getPopularRecipes); // 获取热门食谱

// 统计数据路由 - 必须在 /:id 之前
router.get('/statistics', authMiddleware, adminMiddleware, recipeController.getRecipeStatistics); // 获取食谱统计数据（管理员）

// 智能食谱搭配路由
router.get('/mushroom/:mushroomId/recommend', recipeMatchingController.recommendRecipesByMushroom); // 基于蘑菇品种推荐食谱
router.get('/user/recommend', authMiddleware, recipeMatchingController.recommendRecipesByUser); // 基于用户偏好推荐食谱
router.get('/ingredient-suggestions/:mushroomName', recipeMatchingController.getIngredientSuggestions); // 获取食材搭配建议

// 批量操作路由
router.post('/batch/delete', authMiddleware, adminMiddleware, recipeController.batchDeleteRecipes); // 批量删除食谱（管理员）
router.put('/batch/status', authMiddleware, adminMiddleware, recipeController.batchUpdateRecipeStatus); // 批量更新食谱状态（管理员）

// 用户偏好路由
router.get('/preferences/user', authMiddleware, recipeController.getUserPreferences); // 获取用户偏好
router.put('/preferences/user', authMiddleware, recipeController.updateUserPreferences); // 更新用户偏好

// 食谱历史路由
router.post('/history', authMiddleware, recipeController.addRecipeHistory); // 添加食谱历史
router.get('/history/user', authMiddleware, recipeController.getUserRecipeHistory); // 获取用户食谱历史

// 根据盲盒内容推荐食谱路由 - 支持未登录用户
router.get('/box/:boxId', recipeController.getRecipesByBoxId); // 根据盲盒ID获取推荐食谱

// 外部食谱数据获取路由
router.get('/external/fetch', externalRecipeController.fetchExternalRecipes); // 从外部API获取食谱
router.post('/external/save', authMiddleware, adminMiddleware, externalRecipeController.saveExternalRecipe); // 保存外部食谱到本地（管理员）
router.get('/external/update', authMiddleware, adminMiddleware, externalRecipeController.updateExternalRecipes); // 更新外部食谱数据（管理员）

// 照片资源传输端点 - 这些也需要在 /:id 之前
router.get('/steps/:id/image', recipeController.getStepImage); // 获取步骤图片
router.post('/steps/:id/image', authMiddleware, adminMiddleware, recipeController.uploadStepImage); // 上传步骤图片（管理员）

// 需要认证的路由
router.post('/', authMiddleware, adminMiddleware, recipeController.createRecipe); // 创建食谱（管理员）

// 带 /:id 的路由必须放在最后，避免与固定路径冲突
router.get('/:id', recipeController.getRecipeById); // 获取食谱详情
router.put('/:id', authMiddleware, adminMiddleware, recipeController.updateRecipe); // 更新食谱（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, recipeController.deleteRecipe); // 删除食谱（管理员）
router.get('/:id/ingredients', recipeController.getRecipeIngredients); // 获取食谱配料
router.post('/:id/ingredients', authMiddleware, adminMiddleware, recipeController.addRecipeIngredient); // 添加食谱配料（管理员）
router.get('/:id/steps', recipeController.getRecipeSteps); // 获取食谱步骤
router.post('/:id/steps', authMiddleware, adminMiddleware, recipeController.addRecipeStep); // 添加食谱步骤（管理员）
router.get('/:id/images', recipeController.getRecipeImages); // 获取食谱图片
router.post('/:id/images', authMiddleware, adminMiddleware, recipeController.uploadRecipeImages); // 上传食谱图片（管理员）

// 食谱配料和步骤的独立路由（不带 /:id 前缀）
router.delete('/ingredients/:id', authMiddleware, adminMiddleware, recipeController.deleteRecipeIngredient); // 删除食谱配料（管理员）
router.put('/steps/:id', authMiddleware, adminMiddleware, recipeController.updateRecipeStep); // 更新食谱步骤（管理员）
router.delete('/steps/:id', authMiddleware, adminMiddleware, recipeController.deleteRecipeStep); // 删除食谱步骤（管理员）

module.exports = router;