const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads');
const mushroomDir = path.join(__dirname, '../../uploads/mushrooms');
const tempDir = path.join(__dirname, '../../uploads/temp');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(mushroomDir)) fs.mkdirSync(mushroomDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
  return allowedTypes.includes(file.mimetype);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      const videoDir = path.join(uploadDir, 'videos');
      if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
      cb(null, videoDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10
  },
  fileFilter: function (req, file, cb) {
    if (!validateFileType(file)) {
      return cb(new Error('只支持JPG、PNG、GIF、WebP图片格式和MP4视频格式'));
    }
    cb(null, true);
  }
});

router.post('/images', authMiddleware, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: '图片上传成功',
      files
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败: ' + error.message
    });
  }
});

router.post('/videos', authMiddleware, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的视频文件'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `/uploads/videos/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: '视频上传成功',
      files
    });
  } catch (error) {
    console.error('视频上传失败:', error);
    res.status(500).json({
      success: false,
      message: '视频上传失败: ' + error.message
    });
  }
});

router.delete('/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('文件删除失败:', error);
    res.status(500).json({
      success: false,
      message: '文件删除失败: ' + error.message
    });
  }
});

module.exports = router;
