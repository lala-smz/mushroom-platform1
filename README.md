# 菌类网二代 - 项目启动文档

## 项目简介

菌类网二代是一个基于Vue3和Node.js的线上菌类产品交易平台，采用前后端分离架构，使用Redis作为缓存系统，MySQL作为数据库。

## 项目结构

```
菌类网二代/
├── backend-node/           # 后端Node.js项目
│   ├── config/             # 配置文件
│   │   ├── db.js           # 数据库配置
│   │   ├── redis.js        # Redis缓存配置
│   │   └── upload.js       # 文件上传配置
│   ├── controllers/        # 控制器层
│   │   ├── userController.js    # 用户相关控制器
│   │   ├── productController.js # 商品相关控制器
│   │   ├── cartController.js    # 购物车相关控制器
│   │   └── orderController.js   # 订单相关控制器
│   ├── middleware/         # 中间件
│   │   └── auth.js         # 认证和权限中间件
│   ├── models/             # 数据模型
│   │   ├── User.js         # 用户模型
│   │   ├── Product.js      # 商品模型
│   │   ├── Cart.js         # 购物车模型
│   │   ├── Order.js        # 订单模型
│   │   └── OrderItem.js    # 订单项模型
│   ├── routes/             # 路由配置
│   │   ├── userRoutes.js   # 用户路由
│   │   ├── adminRoutes.js  # 管理员路由
│   │   ├── productRoutes.js # 商品路由
│   │   ├── cartRoutes.js   # 购物车路由
│   │   └── orderRoutes.js  # 订单路由
│   ├── utils/              # 工具函数
│   │   ├── jwt.js          # JWT工具
│   │   └── upload.js       # 文件上传工具
│   ├── app.js              # 后端主入口
│   ├── package.json        # 后端依赖配置
│   └── .env                # 环境变量配置
├── frontend-vue3/          # 前端Vue3项目
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── api/            # API接口配置
│   │   │   └── index.js    # API接口定义
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   │   └── index.js    # 路由定义
│   │   ├── stores/         # 状态管理
│   │   │   ├── useUserStore.js    # 用户状态管理
│   │   │   ├── useProductStore.js # 商品状态管理
│   │   │   ├── useCartStore.js    # 购物车状态管理
│   │   │   └── useOrderStore.js   # 订单状态管理
│   │   ├── views/          # 页面视图
│   │   │   ├── admin/      # 管理后台页面
│   │   │   │   ├── AdminLayout.vue  # 管理后台布局
│   │   │   │   ├── Dashboard.vue    # 控制台
│   │   │   │   ├── UserManage.vue   # 用户管理
│   │   │   │   ├── ProductManage.vue # 商品管理
│   │   │   │   ├── ProductUpload.vue # 商品上传
│   │   │   │   └── OrderManage.vue   # 订单管理
│   │   │   ├── Login.vue   # 登录页面
│   │   │   ├── Register.vue # 注册页面
│   │   │   ├── Home.vue    # 首页
│   │   │   ├── User.vue    # 个人中心
│   │   │   ├── Cart.vue    # 购物车
│   │   │   └── Checkout.vue # 结算页面
│   │   └── main.js         # 前端主入口
│   ├── vite.config.js      # Vite配置
│   ├── package.json        # 前端依赖配置
│   └── .env                # 环境变量配置
└── README.md               # 项目启动文档
```

## 技术栈

### 前端
- Vue 3 (Composition API)
- Pinia (状态管理)
- Vue Router (路由管理)
- Element Plus (UI组件库)
- Axios (HTTP请求)
- ESLint + Prettier (代码规范)

### 后端
- Node.js + Express (Web框架)
- Sequelize (ORM框架)
- MySQL (数据库)
- Redis (缓存系统)
- JWT (认证)
- bcryptjs (密码加密)
- Multer (文件上传)

## 启动步骤

### 1. 环境准备

- Node.js 20.19+ 或 22.12+
- MySQL 5.7+
- Redis 6.0+

### 2. 后端启动

1. 进入后端目录
   ```bash
   cd backend-node
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   编辑 `.env` 文件，填写数据库和Redis连接信息：
   ```env
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=fungus_sales
   
   # Redis配置
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # JWT配置
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   ```

4. 启动后端服务
   ```bash
   npm run dev
   ```

   后端服务将运行在 `http://localhost:3000`

### 3. 前端启动

1. 进入前端目录
   ```bash
   cd frontend-vue3
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   编辑 `.env` 文件，填写API基础URL：
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. 启动前端服务
   ```bash
   npm run dev
   ```

   前端服务将运行在 `http://localhost:5173`

## 功能测试

### 1. 用户注册和登录

1. 访问 `http://localhost:5173/register` 进行注册
2. 访问 `http://localhost:5173/login` 进行登录
3. 登录成功后将跳转到首页

### 2. 管理后台访问

1. 使用管理员账号登录（默认管理员账号：admin，密码：admin123）
2. 访问 `http://localhost:5173/admin` 进入管理后台
3. 测试各个管理功能：
   - 控制台：查看系统概览
   - 用户管理：管理用户账号和角色
   - 商品管理：管理商品列表和审核
   - 商品上传：上传新商品
   - 订单管理：管理订单状态和处理

### 3. 商品浏览和购买

1. 访问首页查看商品列表
2. 点击商品进入详情页
3. 添加商品到购物车
4. 进入购物车查看商品
5. 点击结算完成购买流程

## 核心功能

### 1. 用户角色与权限管理
- 管理员：拥有所有权限，可管理用户、商品和订单
- 卖家：可上传商品、管理自己的商品和订单
- 普通用户：可浏览商品、购买商品和管理个人信息

### 2. 商品管理
- 商品上传：支持多图上传、商品属性设置
- 商品审核：管理员审核商品，确保商品质量
- 商品分类：支持商品分类管理

### 3. 购物车和订单管理
- 购物车：添加、删除、修改商品数量
- 订单：生成订单、支付、配送状态跟踪
- 订单管理：管理员和卖家可查看和处理订单

### 4. 缓存策略
- 使用Redis缓存高频访问数据（商品列表、热门商品）
- 缓存过期机制：避免缓存雪崩
- 缓存更新机制：数据变化时自动更新缓存

## 安全措施

- 密码加盐哈希存储
- JWT令牌认证
- 登录失败限制
- 请求参数验证
- 权限控制中间件
- CORS跨域配置

## 常见问题

### 1. 后端启动失败
- 检查数据库连接是否正常
- 检查Redis服务是否启动
- 检查端口是否被占用

### 2. 前端请求失败
- 检查后端服务是否运行
- 检查API地址配置是否正确
- 检查浏览器控制台是否有错误信息

### 3. 上传图片失败
- 检查文件上传配置是否正确
- 检查服务器存储空间是否充足
- 检查图片格式和大小是否符合要求

## 联系方式

如有问题，请联系项目维护者。