const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const ContentReview = require('../../models/ContentReview');
const User = require('../../models/User');
const Work = require('../../models/Work');

router.get('/', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', type = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.contentType = type;
    }

    const { count, rows: reviews } = await ContentReview.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取审核列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取审核列表失败'
    });
  }
});

router.get('/:id', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ContentReview.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: '审核记录不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('获取审核详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取审核详情失败'
    });
  }
});

router.post('/:id/approve', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const review = await ContentReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: '审核记录不存在'
      });
    }

    if (review.contentType === 'work') {
      const work = await Work.findByPk(review.contentId);
      if (work) {
        await work.update({ status: 'published' });
      }
    }

    await review.update({
      status: 'approved',
      remark,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: '审核通过'
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({
      success: false,
      error: '审核失败'
    });
  }
});

router.post('/:id/reject', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const review = await ContentReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: '审核记录不存在'
      });
    }

    if (review.contentType === 'work') {
      const work = await Work.findByPk(review.contentId);
      if (work) {
        await work.update({ status: 'rejected' });
      }
    }

    await review.update({
      status: 'rejected',
      remark,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: '审核拒绝'
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({
      success: false,
      error: '审核失败'
    });
  }
});

router.post('/:id/reset', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ContentReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: '审核记录不存在'
      });
    }

    if (review.contentType === 'work') {
      const work = await Work.findByPk(review.contentId);
      if (work) {
        await work.update({ status: 'pending' });
      }
    }

    await review.update({
      status: 'pending',
      remark: null,
      reviewedBy: null,
      reviewedAt: null
    });

    res.status(200).json({
      success: true,
      message: '已重置为待审核状态'
    });
  } catch (error) {
    console.error('重置审核状态失败:', error);
    res.status(500).json({
      success: false,
      error: '重置审核状态失败'
    });
  }
});

module.exports = router;
