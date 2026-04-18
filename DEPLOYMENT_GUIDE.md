# 🍄 菌菇网 Railway 部署指南

## 📋 前置准备

1. **GitHub 账号**: 将代码推送到 GitHub 仓库
2. **Railway 账号**: 访问 [railway.app](https://railway.app) 注册账号
3. **Node.js**: 本地安装 Node.js 用于构建

## 🚀 部署步骤

### 步骤1: 安装 Railway CLI

```bash
# 使用 npm 安装
npm install -g @railway/cli

# 或使用 yarn
yarn global add @railway/cli
```

### 步骤2: 登录 Railway

```bash
railway login
```

打开浏览器授权登录。

### 步骤3: 创建新项目

```bash
# 进入项目目录
cd d:\Allprojects\applications\Desktop\菌类网代\菌类网2.0

# 初始化 Railway 项目
railway init
```

### 步骤4: 添加 MySQL 数据库

```bash
# 添加 MySQL 插件
railway add mysql

# 查看数据库连接信息
railway variables
```

### 步骤5: 设置环境变量

```bash
# 设置 JWT 密钥
railway set JWT_SECRET=your_secure_jwt_secret_key_here

# 设置其他必要的环境变量
railway set NODE_ENV=production
railway set PORT=3000
```

### 步骤6: 部署后端服务

```bash
# 进入后端目录
cd backend-node

# 部署到 Railway
railway up --service backend
```

### 步骤7: 部署前端服务

```bash
# 进入前端目录
cd ../frontend-vue3

# 部署到 Railway
railway up --service frontend
```

### 步骤8: 设置域名

```bash
# 为后端服务设置域名
railway domain --service backend

# 为前端服务设置域名  
railway domain --service frontend
```

## ⚙️ 环境变量配置

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `NODE_ENV` | 运行环境 | ✅ |
| `PORT` | 服务端口 | ✅ |
| `DB_HOST` | 数据库主机 | ⚠️ (自动) |
| `DB_PORT` | 数据库端口 | ⚠️ (自动) |
| `DB_NAME` | 数据库名称 | ⚠️ (自动) |
| `DB_USER` | 数据库用户 | ⚠️ (自动) |
| `DB_PASSWORD` | 数据库密码 | ⚠️ (自动) |

## 🔗 服务配置

### 后端服务 (backend)
- **根目录**: `backend-node`
- **构建命令**: `npm install`
- **启动命令**: `node app.js`
- **端口**: 3000

### 前端服务 (frontend)
- **根目录**: `frontend-vue3`
- **构建命令**: `npm install && npm run build`
- **启动命令**: `npx serve -s dist -l 8080`
- **端口**: 8080

## 🔧 配置 Nginx 反向代理（可选）

如果需要将前端和后端部署在同一个域名下，可以配置反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端
    location / {
        proxy_pass http://frontend:8080;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://backend:3000/api/;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://backend:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📝 数据库初始化

部署完成后，需要初始化数据库表：

```bash
# 连接到 Railway 环境
railway run node scripts/initData.js
```

## ✅ 验证部署

1. **访问前端**: `https://your-frontend-domain.railway.app`
2. **测试 API**: `https://your-backend-domain.railway.app/api/health`
3. **检查日志**: `railway logs`

## 📌 注意事项

1. **免费额度**: Railway 提供 $5/月免费额度，超出后需要付费
2. **休眠策略**: 免费服务可能会在空闲时休眠
3. **数据库备份**: 定期备份数据库数据
4. **环境变量安全**: 敏感信息使用 Railway 变量管理
5. **构建缓存**: Railway 会自动缓存依赖，加快部署速度

## 🛠️ 常用命令

```bash
# 查看服务状态
railway status

# 查看日志
railway logs

# 打开环境变量管理
railway variables

# 删除服务
railway remove <service-name>

# 重启服务
railway restart
```

## 🎉 部署成功

部署完成后，您的菌菇网网站将可以通过 Railway 提供的域名访问！

---

*如有问题，请查看 Railway 官方文档: https://docs.railway.app/*
