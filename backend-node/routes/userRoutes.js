const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// 需要认证的路由
router.get('/info', authMiddleware, userController.getUserInfo);
router.put('/info', authMiddleware, userController.updateUserInfo);
router.put('/password', authMiddleware, userController.changePassword);

// 关注相关路由
router.post('/follow', authMiddleware, userController.followUser);
router.post('/unfollow', authMiddleware, userController.unfollowUser);
router.get('/follow/status', authMiddleware, userController.getUserFollowStatus);

// 公开路由（必须放在最后，因为:userId会匹配任何路径）
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:userId', userController.getUserById);

module.exports = router;