const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

// 确保在最开始加载环境变量
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { sequelize, testConnection } = require('./config/db');
const { redisClient } = require('./config/redis');

// 导入路由
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const messageRoutes = require('./routes/messageRoutes');

// 导入新增路由
const mushroomBoxRoutes = require('./routes/mushroomBoxRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const mushroomDataRoutes = require('./routes/mushroomDataRoutes');
const cookingVideoRoutes = require('./routes/cookingVideoRoutes');
const contentManagementRoutes = require('./routes/contentManagementRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const mushroomRoutes = require('./routes/mushroomRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// 导入作品路由
const workRoutes = require('./routes/workRoutes');

// 导入评分路由
const ratingRoutes = require('./routes/ratingRoutes');

// 导入日志工具
const logger = require('./utils/logger');

// 导入所有模型，确保关联关系被正确初始化
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Address = require('./models/Address');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Permission = require('./models/Permission');
const UserPermission = require('./models/UserPermission');

// 导入新增模型
const Mushroom = require('./models/Mushroom');
const MushroomBox = require('./models/MushroomBox');
const MushroomBoxItem = require('./models/MushroomBoxItem');
const UserBoxOrder = require('./models/UserBoxOrder');
const Recipe = require('./models/Recipe');
const RecipeIngredient = require('./models/RecipeIngredient');
const RecipeStep = require('./models/RecipeStep');
const UserPreference = require('./models/UserPreference');
const UserRecipeHistory = require('./models/UserRecipeHistory');
const Notification = require('./models/Notification');

// 导入作品相关模型
const Work = require('./models/Work');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Favorite = require('./models/Favorite');
const Follow = require('./models/Follow');

// 导入评分配置相关模型
const ScoreConfig = require('./models/ScoreConfig');
const ScoreConfigLog = require('./models/ScoreConfigLog');

// 导入评分功能相关模型
const WorkRating = require('./models/WorkRating');
const RatingWeight = require('./models/RatingWeight');
const RatingHistory = require('./models/RatingHistory');
const UserTasteHistory = require('./models/UserTasteHistory');

// 导入内容管理相关模型
const CookingVideo = require('./models/CookingVideo');
const ContentReview = require('./models/ContentReview');

// 导入操作日志模型
const OperationLog = require('./models/OperationLog');

// 导入商家商品层级权限相关模型
const BusinessCategoryPermission = require('./models/BusinessCategoryPermission');
const BusinessCategoryApplication = require('./models/BusinessCategoryApplication');


// 初始化模型关联
const models = {
  User,
  Product,
  Cart,
  Order,
  OrderItem,
  Address,
  Conversation,
  Message,
  Permission,
  UserPermission,
  Mushroom,
  MushroomBox,
  MushroomBoxItem,
  UserBoxOrder,
  Recipe,
  RecipeIngredient,
  RecipeStep,
  UserPreference,
  UserRecipeHistory,
  Notification,
  Work,
  Comment,
  Like,
  Favorite,
  Follow,
  ScoreConfig,
  ScoreConfigLog,
  WorkRating,
  RatingWeight,
  RatingHistory,
  UserTasteHistory,
  CookingVideo,
  ContentReview,
  OperationLog,
  BusinessCategoryPermission,
  BusinessCategoryApplication
};

// 设置模型关联
// 1. MushroomBox 和 MushroomBoxItem (一对多)
MushroomBox.hasMany(MushroomBoxItem, {
  foreignKey: 'boxId',
  as: 'items',
  onDelete: 'CASCADE'
});
MushroomBoxItem.belongsTo(MushroomBox, {
  foreignKey: 'boxId',
  as: 'box'
});

// 2. MushroomBoxItem 和 Mushroom (多对一)
MushroomBoxItem.belongsTo(Mushroom, {
  foreignKey: 'mushroomId',
  as: 'mushroom'
});
Mushroom.hasMany(MushroomBoxItem, {
  foreignKey: 'mushroomId',
  as: 'boxItems'
});

// 3. UserBoxOrder 和 User (多对一)
User.hasMany(UserBoxOrder, {
  foreignKey: 'userId',
  as: 'boxOrders',
  onDelete: 'CASCADE'
});
UserBoxOrder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 4. UserBoxOrder 和 MushroomBox (多对一)
MushroomBox.hasMany(UserBoxOrder, {
  foreignKey: 'boxId',
  as: 'orders',
  onDelete: 'CASCADE'
});
UserBoxOrder.belongsTo(MushroomBox, {
  foreignKey: 'boxId',
  as: 'box'
});

// 5. Recipe 和 RecipeIngredient (一对多)
Recipe.hasMany(RecipeIngredient, {
  foreignKey: 'recipeId',
  as: 'ingredients',
  onDelete: 'CASCADE'
});
RecipeIngredient.belongsTo(Recipe, {
  foreignKey: 'recipeId',
  as: 'recipe'
});

// 6. RecipeIngredient 和 Mushroom (多对一)
RecipeIngredient.belongsTo(Mushroom, {
  foreignKey: 'mushroomId',
  as: 'mushroom'
});
Mushroom.hasMany(RecipeIngredient, {
  foreignKey: 'mushroomId',
  as: 'recipeIngredients'
});

// 7. Recipe 和 RecipeStep (一对多)
Recipe.hasMany(RecipeStep, {
  foreignKey: 'recipeId',
  as: 'steps',
  onDelete: 'CASCADE'
});
RecipeStep.belongsTo(Recipe, {
  foreignKey: 'recipeId',
  as: 'recipe'
});

// 8. User 和 UserPreference (一对一)
User.hasOne(UserPreference, {
  foreignKey: 'userId',
  as: 'preference',
  onDelete: 'CASCADE'
});
UserPreference.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 9. UserRecipeHistory 和 User (多对一)
User.hasMany(UserRecipeHistory, {
  foreignKey: 'userId',
  as: 'recipeHistory',
  onDelete: 'CASCADE'
});
UserRecipeHistory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 10. UserRecipeHistory 和 Recipe (多对一)
Recipe.hasMany(UserRecipeHistory, {
  foreignKey: 'recipeId',
  as: 'history',
  onDelete: 'CASCADE'
});
UserRecipeHistory.belongsTo(Recipe, {
  foreignKey: 'recipeId',
  as: 'recipe'
});

// 11. User 和 Notification (一对多)
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 12. CookingVideo 和 MushroomBox (多对一) - 暂时注释，先确保基本功能正常
// MushroomBox.hasMany(CookingVideo, {
//   foreignKey: 'mushroomBoxId',
//   as: 'videos',
//   onDelete: 'SET NULL'
// });
// CookingVideo.belongsTo(MushroomBox, {
//   foreignKey: 'mushroomBoxId',
//   as: 'mushroomBox'
// });

// 调用所有模型的associate方法
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3003;

// 创建HTTP服务器
const server = http.createServer(app);

// 初始化Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3001', 'http://localhost:3003', 'https://lala-smz.github.io'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// 导出io实例，供其他模块使用
module.exports.io = io;

// 配置中间件
app.use(compression({
  level: 6,
  threshold: 1024, // 只压缩大于1KB的响应
  filter: (req, res) => {
    // 不压缩图片等已压缩文件
    if (req.path.startsWith('/uploads/') || req.path.startsWith('/mushrooms/')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175', 
  'http://localhost:5176', 
  'http://localhost:3001', 
  'https://lala-smz.github.io',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  process.env.RAILWAY_EXTERNAL_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://grateful-renewal-production-b1b1.up.railway.app"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*", "https://grateful-renewal-production-b1b1.up.railway.app"],
      mediaSrc: ["'self'", "blob:", "https://grateful-renewal-production-b1b1.up.railway.app"]
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  const userInfo = req.user ? req.user : null;
  
  logger.request(req.method, req.originalUrl, userInfo);
  
  // 捕获响应结束事件
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.response(req.method, req.originalUrl, res.statusCode, duration);
    return originalSend.call(this, data);
  };
  
  next();
});

// API 响应缓存头优化
app.use((req, res, next) => {
  if (req.method === 'GET') {
    // 静态资源 - 长时间缓存
    if (req.path.startsWith('/uploads/') || req.path.startsWith('/mushrooms/')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // 24小时
    }
    // 列表类数据 - 中等缓存时间
    else if (req.path.includes('/mushrooms') || req.path.includes('/products') || req.path.includes('/recipes')) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5分钟
    }
    // 详情页数据 - 短缓存
    else if (req.path.match(/\/\d+$/)) {
      res.setHeader('Cache-Control', 'public, max-age=60'); // 1分钟
    }
    // 其他 GET 请求 - 禁止缓存
    else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  } else {
    // POST/PUT/DELETE 请求 - 禁止缓存
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('上传目录已创建:', uploadDir);
}

// 文件类型验证
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.mimetype);
};

// 配置文件上传 - 修复中文文件名编码问题
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
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  },
  fileFilter: function (req, file, cb) {
    if (!validateFileType(file)) {
      return cb(new Error('只支持JPG、PNG、GIF和WebP格式的图片'));
    }
    cb(null, true);
  }
});

// 配置静态文件服务
const uploadsStatic = express.static(path.join(__dirname, 'uploads'));
const mushroomsStatic = express.static(path.join(__dirname, 'uploads', 'mushrooms'));
const publicStatic = express.static(path.join(__dirname, 'public'));

app.use('/uploads', (req, res, next) => {
  // 设置 CORS 头，允许前端访问图片
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 为所有图片设置正确的 MIME 类型，特别是 webp
  const ext = path.extname(req.path).toLowerCase();
  
  if (ext === '.webp') {
    res.setHeader('Content-Type', 'image/webp');
  } else if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (ext === '.gif') {
    res.setHeader('Content-Type', 'image/gif');
  }
  
  // 移除可能的缓存问题，允许浏览器重新请求资源
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, uploadsStatic);

app.use('/mushrooms', (req, res, next) => {
  // 设置 CORS 头，允许前端访问图片
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, mushroomsStatic);

app.use('/', publicStatic);

// 配置全局速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 增加速率限制阈值到1000
  standardHeaders: true,
  legacyHeaders: false,
  // 配置特定路径的速率限制
  skip: (req) => {
    // 跳过静态文件请求
    if (req.path.startsWith('/uploads/')) {
      return true;
    }
    // 跳过健康检查
    if (req.path === '/health') {
      return true;
    }
    return false;
  }
});

// 为/boxes路由设置单独的速率限制
const boxesLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.BOXES_RATE_LIMIT_MAX) || 800, // 为盲盒路由设置更高的限制
  standardHeaders: true,
  legacyHeaders: false,
  message: '盲盒请求过于频繁，请稍后重试',
  // 跳过静态文件请求
  skip: (req) => {
    if (req.path.startsWith('/uploads/')) {
      return true;
    }
    return false;
  }
});

// 使用全局速率限制
app.use(limiter);

// Socket.IO事件处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  // 认证处理（从auth对象获取token - Socket.IO 4.x标准）
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.error('WebSocket连接失败：未提供token');
    socket.disconnect(true);
    return;
  }
  
  // 实现JWT验证逻辑
  const jwt = require('jsonwebtoken');
  let userId = null;
  let userRole = null;
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    userRole = decoded.role;
    
    console.log('WebSocket连接成功：用户ID', userId);
  } catch (error) {
    console.error('WebSocket连接失败：token验证失败', error.message);
    socket.disconnect(true);
    return;
  }
  
  // 将用户ID与socketID关联
  socket.data.userId = userId;
  socket.data.userRole = userRole;
  
  // 加入用户特定的房间
  socket.join(`user:${userId}`);
  
  // 发送欢迎消息
  socket.emit('connected', {
    message: '连接成功',
    socketId: socket.id,
    userId: userId
  });
  
  // 监听消息发送事件
  socket.on('message:send', async (data) => {
    console.log('收到消息:', data);
    
    const { conversationId, senderId, content, type = 'text' } = data;
    
    try {
      // 导入模型
      const Message = require('./models/Message');
      const Conversation = require('./models/Conversation');
      
      // 保存消息到数据库
      const savedMessage = await Message.create({
        conversationId,
        senderId,
        senderRole: userRole,
        content,
        type,
        status: 'sent'
      });
      
      console.log('消息保存成功:', savedMessage);
      
      // 更新对话的最后一条消息
      await Conversation.update(
        {
          lastMessageId: savedMessage.id,
          updatedAt: savedMessage.createdAt
        },
        {
          where: { id: conversationId }
        }
      );
      
      // 创建消息对象
      const message = {
        id: savedMessage.id.toString(),
        conversationId: savedMessage.conversationId,
        senderId: savedMessage.senderId,
        senderRole: savedMessage.senderRole,
        content: savedMessage.content,
        type: savedMessage.type,
        status: savedMessage.status,
        createdAt: savedMessage.createdAt.toISOString()
      };
      
      // 发送消息给对话参与者
      io.to(`conversation:${conversationId}`).emit('message:new', message);
      
      // 发送消息发送确认给发送者
      socket.emit('message:send:confirmed', {
        ...message,
        tempId: data.tempId // 包含临时ID，方便前端更新本地消息
      });
      
      // 更新对话房间
      socket.join(`conversation:${conversationId}`);
    } catch (error) {
      console.error('处理消息失败:', error);
      // 发送错误消息给发送者
      socket.emit('message:send:error', {
        error: '消息发送失败',
        tempId: data.tempId
      });
    }
  });
  
  // 监听消息已读事件
  socket.on('message:read', (data) => {
    const { messageId, conversationId } = data;
    
    // 广播消息已读状态
    io.to(`conversation:${conversationId}`).emit('message:read', {
      messageId,
      conversationId
    });
  });
  
  // 监听消息已送达事件
  socket.on('message:delivered', (data) => {
    const { messageId, conversationId } = data;
    
    // 广播消息已送达状态
    io.to(`conversation:${conversationId}`).emit('message:delivered', {
      messageId,
      conversationId
    });
  });
  
  // 监听加入对话房间事件
  socket.on('join:conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`用户 ${userId} 加入对话房间: ${conversationId}`);
  });
  
  // 监听离开对话房间事件
  socket.on('leave:conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`用户 ${userId} 离开对话房间: ${conversationId}`);
  });
  
  // 监听断开连接事件
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });

  // 排行榜相关事件
  socket.on('ranking:subscribe', (data) => {
    const ratingType = data?.ratingType || 'all';
    console.log(`用户 ${userId} 订阅排行榜更新: ${ratingType}`);
    socket.join(`ranking:${ratingType}`);
  });

  socket.on('ranking:unsubscribe', (data) => {
    const ratingType = data?.ratingType || 'all';
    console.log(`用户 ${userId} 取消订阅排行榜更新: ${ratingType}`);
    socket.leave(`ranking:${ratingType}`);
  });

  // 监听评分提交事件（可选，用于前端主动通知）
  socket.on('rating:submit', (data) => {
    const { workId, rating } = data;
    console.log(`收到评分提交事件: 作品 ${workId}, 评分 ${rating}`);
    // 这里可以触发排行榜更新逻辑
    // 例如：更新作品评分、广播排行榜更新事件等
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常'
  });
});

// API 健康检查
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务运行正常'
  });
});

// 文件上传接口
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    // 处理上传成功的情况
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件'
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      data: files,
      message: `成功上传 ${files.length} 个文件`
    });
  } catch (error) {
    console.error('处理上传请求时出错:', error);
    let errorMessage = '文件上传失败';
    let statusCode = 500;
    
    // 针对不同类型的错误提供更详细的错误信息
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorMessage = '文件大小超过限制，单张图片不能超过10MB';
      statusCode = 400;
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      errorMessage = '文件数量超过限制，最多只能上传10个文件';
      statusCode = 400;
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      errorMessage = '文件字段名错误，请检查前端配置';
      statusCode = 400;
    } else {
      errorMessage = '文件上传失败: ' + error.message;
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// 路由配置
const testRoutes = require('./routes/testRoutes');
const simpleTestRoutes = require('./routes/simpleTestRoutes');
const importRoutes = require('./routes/importRoutes');

// 使用路由
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/works', workRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mushroom-data', mushroomDataRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/test', testRoutes);
app.use('/api/simple-test', simpleTestRoutes);
app.use('/api/import', importRoutes);

// 注册新增路由
// 为盲盒路由使用单独的速率限制
app.use('/api/boxes', boxesLimiter, mushroomBoxRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cooking-videos', cookingVideoRoutes);

// 注册评分路由
app.use('/api/ratings', ratingRoutes);

// 注册内容管理路由
app.use('/api/content-management', contentManagementRoutes);

// 注册智能匹配路由
app.use('/api/matching', matchingRoutes);

// 注册蘑菇管理路由
app.use('/api/mushrooms', mushroomRoutes);

// 注册分类和标签管理路由
app.use('/api/categories', categoryRoutes);

// 注册商家商品层级权限路由
const businessCategoryRoutes = require('./routes/businessCategoryRoutes');
app.use('/api/business-categories', businessCategoryRoutes);

// 注册同步管理路由
const syncRoutes = require('./routes/syncRoutes');
app.use('/api/sync', syncRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 处理前端SPA路由 - 如果不是API请求，返回index.html
app.use('*', (req, res) => {
  // 如果是API请求，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: '接口不存在'
    });
  }
  
  // 前端路由，返回index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  res.status(404).json({
    success: false,
    error: '页面不存在'
  });
});

// 同步数据库表结构
sequelize.sync({ alter: true }).then(() => {
  console.log('数据库表已自动同步');
}).catch(err => {
  console.error('数据库同步失败:', err);
});

// 引入蘑菇数据服务
const mushroomDataService = require('./services/mushroomDataService');
// 引入季节信息推送服务
const seasonalPushService = require('./services/seasonalPushService');
// 引入烹饪视频服务
const cookingVideoService = require('./services/cookingVideoService');
// 引入智能推送服务
const smartPushService = require('./services/smartPushService');

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 启动服务器
    server.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log(`WebSocket服务已启动`);
      
      // 暂时禁用蘑菇数据定时同步，减少内存使用
      // mushroomDataService.startScheduledSync();
      
      // 暂时禁用季节信息定时推送，因为表结构可能不完整
      // seasonalPushService.startScheduledPush();
      
      // 暂时禁用烹饪视频定时推送，因为表结构可能不完整
      // cookingVideoService.startScheduledPush();
      
      // 暂时禁用智能推送服务，因为表结构可能不完整
      // smartPushService.startScheduledPush();
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

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

module.exports = app;