const express = require('express');
const cors = require('cors');
const compression = require('compression');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize, testConnection } = require('../../config/db');
const { redisClient } = require('../../config/redis');

const userRoutes = require('../../routes/userRoutes');
const adminRoutes = require('../../routes/adminRoutes');
const productRoutes = require('../../routes/productRoutes');
const categoryRoutes = require('../../routes/categoryRoutes');
const businessCategoryRoutes = require('../../routes/businessCategoryRoutes');
const mushroomRoutes = require('../../routes/mushroomRoutes');
const mushroomBoxRoutes = require('../../routes/mushroomBoxRoutes');
const orderRoutes = require('../../routes/orderRoutes');
const syncRoutes = require('../../routes/syncRoutes');

const models = require('../../models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001', 'http://localhost:3003', 'https://lala-smz.github.io', 'https://web-production-1993a.up.railway.app'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3003;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.path.startsWith('/uploads/') || req.path.startsWith('/mushrooms/')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: '请求过于频繁，请稍后重试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: '请求过于频繁，请稍后重试'
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3001', 'http://localhost:3003', 'https://lala-smz.github.io', 'https://web-production-1993a.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startTime = Date.now();
  const userInfo = req.user ? req.user : null;
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

const uploadDir = path.join(__dirname, '../../uploads');
const mushroomDir = path.join(__dirname, '../../uploads/mushrooms');
const tempDir = path.join(__dirname, '../../uploads/temp');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(mushroomDir)) fs.mkdirSync(mushroomDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.mimetype);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
    fileSize: 10 * 1024 * 1024,
    files: 10
  },
  fileFilter: function (req, file, cb) {
    if (!validateFileType(file)) {
      return cb(new Error('只支持JPG、PNG、GIF和WebP格式的图片'));
    }
    cb(null, true);
  }
});

const uploadsStatic = express.static(path.join(__dirname, '../../uploads'));
const mushroomsStatic = express.static(path.join(__dirname, '../../uploads/mushrooms'));
const publicStatic = express.static(path.join(__dirname, '../../public'));

app.use('/uploads', uploadsStatic);
app.use('/mushrooms', mushroomsStatic);
app.use('/', publicStatic);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常'
  });
});

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: '文件上传成功',
      files
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败: ' + error.message
    });
  }
});

app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/business-categories', apiLimiter, businessCategoryRoutes);
app.use('/api/mushrooms', apiLimiter, mushroomRoutes);
app.use('/api/boxes', apiLimiter, mushroomBoxRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/sync', apiLimiter, syncRoutes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: '接口不存在'
    });
  } else {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
  }
});

app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message
  });
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`用户 ${socket.id} 加入房间: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`用户 ${socket.id} 离开房间: ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.roomId).emit('receiveMessage', data);
  });

  socket.on('drawResult', (data) => {
    io.to(data.roomId).emit('receiveDrawResult', data);
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

sequelize.sync({ alter: true }).then(async () => {
  console.log('数据库同步完成');
}).catch(err => {
  console.error('数据库同步失败:', err);
});

const startServer = async () => {
  try {
    await testConnection();
    
    server.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log('Socket.IO 实时通信已启用');
    });
  } catch (error) {
    if (error.name === 'SequelizeConnectionError' && error.original && error.original.code === 'ER_BAD_DB_ERROR') {
      console.error('\n数据库连接失败: 数据库不存在');
      console.error('请先创建数据库，或执行以下命令初始化数据库:');
      console.error('mysql -u root -p < init.sql');
      console.error('\n如果您已经创建了数据库，但仍然遇到此错误，请检查.env文件中的数据库配置是否正确。');
    } else {
      console.error('服务器启动失败:', error);
    }
    process.exit(1);
  }
};

startServer();
