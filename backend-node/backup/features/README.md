# 功能增强模块备份

本目录包含了为提高项目健壮性而保留的功能模块代码，这些模块在基础版本中被移除以优化内存占用和启动速度。

## 目录结构

```
backup/
└── features/
    ├── app-enhanced.js      # 增强版主应用入口
    ├── uploadRoutes.js      # 文件上传路由（支持图片和视频）
    ├── reviewRoutes.js      # 内容审核路由
    └── README.md            # 本说明文档
```

## 备份模块说明

### 1. app-enhanced.js

增强版主应用入口，包含以下额外功能：

| 功能模块 | 用途 | 启用方式 |
|---------|------|---------|
| **helmet** | 设置安全HTTP响应头，防护XSS、点击劫持等攻击 | 自动启用 |
| **express-rate-limit** | API请求限流，防止恶意请求和DDoS攻击 | 自动启用（15分钟内最多100次请求） |
| **Socket.IO** | 实时双向通信，支持即时消息、盲盒抽奖结果推送 | 自动启用 |

### 2. uploadRoutes.js

文件上传专用路由，支持：
- 图片上传（JPG、PNG、GIF、WebP）
- 视频上传（MP4）
- 文件删除
- 需要用户认证

### 3. reviewRoutes.js

内容审核路由，支持：
- 审核列表管理（分页、状态筛选、类型筛选）
- 审核详情查看
- 审核通过/拒绝/重置操作
- 需要管理员或审核员权限

## 如何恢复使用

### 方式一：使用增强版主入口

```bash
# 备份当前的 app.js
cp app.js app.js.backup

# 使用增强版替换
cp backup/features/app-enhanced.js app.js

# 确保安装了所需依赖
npm install helmet express-rate-limit socket.io
```

### 方式二：部分恢复

1. **恢复 helmet 安全中间件**：
```javascript
const helmet = require('helmet');
app.use(helmet());
```

2. **恢复请求限流**：
```javascript
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);
```

3. **恢复 Socket.IO**：
```javascript
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
// 替换 app.listen() 为 server.listen()
```

4. **添加 uploadRoutes**：
```javascript
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
```

5. **添加 reviewRoutes**：
```javascript
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
```

## 恢复建议

| 场景 | 推荐恢复的模块 |
|------|--------------|
| 生产环境部署 | helmet + rateLimit |
| 实时消息功能 | Socket.IO |
| 用户上传视频 | uploadRoutes |
| 内容审核系统 | reviewRoutes |

## 注意事项

1. **内存占用**：启用所有增强模块会增加约 20-30MB 内存占用
2. **依赖安装**：恢复前需确保安装相关依赖包
3. **环境变量**：Socket.IO 需要正确配置跨域域名
4. **数据库**：reviewRoutes 需要 ContentReview 模型支持

## 依赖列表

如需完整启用所有增强功能，请确保安装以下依赖：

```bash
npm install helmet express-rate-limit socket.io
```
