# 菌菇盲盒API文档

## 1. 盲盒抽取相关API

### 1.1 获取抽取信息
- **URL**: `/api/boxes/draw/info`
- **方法**: GET
- **权限**: 需要认证
- **请求参数**: 无
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "remainingDraws": 5,
      "totalDraws": 10,
      "userLevel": 2
    }
  }
  ```

### 1.2 抽取盲盒
- **URL**: `/api/boxes/draw`
- **方法**: POST
- **权限**: 需要认证
- **请求参数**: 无
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "box": {
        "id": 1,
        "name": "春季特惠盲盒",
        "description": "精选春季新鲜菌菇品种",
        "price": 99,
        "season": "spring",
        "status": "active",
        "items": [
          {
            "id": 1,
            "boxId": 1,
            "mushroomId": 1,
            "quantity": 1,
            "mushroom": {
              "id": 1,
              "name": "香菇",
              "scientificName": "Lentinus edodes",
              "description": "一种常见的食用菌",
              "image": "/uploads/shiitake.jpg",
              "difficulty": "easy"
            }
          }
        ]
      }
    }
  }
  ```
- **错误情况**: 
  - 400: 暂无可用盲盒
  - 401: 未提供认证令牌 / 无效的认证令牌
  - 500: 服务器内部错误

### 1.3 保存抽取结果
- **URL**: `/api/boxes/draw/save`
- **方法**: POST
- **权限**: 需要认证
- **请求参数**: 
  ```json
  {
    "boxId": 1
  }
  ```
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 12345,
      "userId": 1,
      "boxId": 1,
      "drawTime": "2024-01-26T12:00:00.000Z"
    }
  }
  ```

### 1.4 获取抽取历史
- **URL**: `/api/boxes/draw/history`
- **方法**: GET
- **权限**: 需要认证
- **请求参数**: 无
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "boxId": 1,
        "boxName": "春季特惠盲盒",
        "drawTime": "2024-01-20T12:00:00.000Z",
        "status": "completed"
      },
      {
        "id": 2,
        "boxId": 2,
        "boxName": "珍稀菌菇盲盒",
        "drawTime": "2024-01-19T12:00:00.000Z",
        "status": "completed"
      }
    ]
  }
  ```

## 2. 盲盒管理相关API

### 2.1 获取所有盲盒列表
- **URL**: `/api/boxes`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 无
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "春季特惠盲盒",
        "description": "精选春季新鲜菌菇品种",
        "price": 99,
        "season": "spring",
        "status": "active",
        "items": [
          {
            "id": 1,
            "boxId": 1,
            "mushroomId": 1,
            "quantity": 1,
            "mushroom": {
              "id": 1,
              "name": "香菇",
              "scientificName": "Lentinus edodes",
              "description": "一种常见的食用菌",
              "image": "/uploads/shiitake.jpg",
              "difficulty": "easy"
            }
          }
        ]
      }
    ]
  }
  ```

### 2.2 获取盲盒详情
- **URL**: `/api/boxes/:id`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `id`: 盲盒ID
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "春季特惠盲盒",
      "description": "精选春季新鲜菌菇品种",
      "price": 99,
      "season": "spring",
      "status": "active",
      "items": [
        {
          "id": 1,
          "boxId": 1,
          "mushroomId": 1,
          "quantity": 1,
          "mushroom": {
            "id": 1,
            "name": "香菇",
            "scientificName": "Lentinus edodes",
            "description": "一种常见的食用菌",
            "image": "/uploads/shiitake.jpg",
            "difficulty": "easy"
          }
        }
      ]
    }
  }
  ```

## 3. 盲盒订单相关API

### 3.1 创建盲盒订单
- **URL**: `/api/boxes/orders`
- **方法**: POST
- **权限**: 需要认证
- **请求参数**: 
  ```json
  {
    "boxId": 1,
    "address": "北京市朝阳区",
    "phone": "13800138000",
    "receiver": "张三",
    "paymentMethod": "alipay"
  }
  ```
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "userId": 1,
      "boxId": 1,
      "status": "pending",
      "address": "北京市朝阳区",
      "phone": "13800138000",
      "receiver": "张三",
      "paymentMethod": "alipay",
      "createdAt": "2024-01-26T12:00:00.000Z"
    }
  }
  ```

### 3.2 获取用户的盲盒订单
- **URL**: `/api/boxes/orders/user`
- **方法**: GET
- **权限**: 需要认证
- **请求参数**: 无
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "userId": 1,
        "boxId": 1,
        "status": "pending",
        "address": "北京市朝阳区",
        "phone": "13800138000",
        "receiver": "张三",
        "paymentMethod": "alipay",
        "createdAt": "2024-01-26T12:00:00.000Z",
        "box": {
          "id": 1,
          "name": "春季特惠盲盒",
          "description": "精选春季新鲜菌菇品种",
          "price": 99,
          "season": "spring",
          "status": "active"
        }
      }
    ]
  }
  ```

### 3.3 获取盲盒订单详情
- **URL**: `/api/boxes/orders/:id`
- **方法**: GET
- **权限**: 需要认证
- **请求参数**: 
  - `id`: 订单ID
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "userId": 1,
      "boxId": 1,
      "status": "pending",
      "address": "北京市朝阳区",
      "phone": "13800138000",
      "receiver": "张三",
      "paymentMethod": "alipay",
      "createdAt": "2024-01-26T12:00:00.000Z",
      "box": {
        "id": 1,
        "name": "春季特惠盲盒",
        "description": "精选春季新鲜菌菇品种",
        "price": 99,
        "season": "spring",
        "status": "active",
        "items": [
          {
            "id": 1,
            "boxId": 1,
            "mushroomId": 1,
            "quantity": 1,
            "mushroom": {
              "id": 1,
              "name": "香菇",
              "scientificName": "Lentinus edodes",
              "description": "一种常见的食用菌",
              "image": "/uploads/shiitake.jpg",
              "difficulty": "easy"
            }
          }
        ]
      }
    }
  }
  ```

## 4. 食谱相关API

### 4.1 外部食谱数据获取
- **URL**: `/api/recipes/external/fetch`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `query`: 搜索关键词（可选）
  - `page`: 页码（可选，默认1）
  - `limit`: 每页数量（可选，默认10）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "spoonacular_123",
        "title": "香菇炖鸡",
        "source": "Spoonacular",
        "image": "https://api.spoonacular.com/recipes/123/image",
        "url": "https://spoonacular.com/recipes/香菇炖鸡-123",
        "ingredients": ["鸡肉", "香菇", "姜", "葱"],
        "cookingTime": 60
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
  ```

### 4.2 保存外部食谱
- **URL**: `/api/recipes/external/save`
- **方法**: POST
- **权限**: 需要认证
- **请求参数**: 
  ```json
  {
    "recipeData": {
      "title": "香菇炖鸡",
      "source": "Spoonacular",
      "image": "https://api.spoonacular.com/recipes/123/image",
      "url": "https://spoonacular.com/recipes/香菇炖鸡-123",
      "ingredients": ["鸡肉", "香菇", "姜", "葱"],
      "steps": [
        {
          "stepNumber": 1,
          "description": "准备食材",
          "imageUrl": "https://api.spoonacular.com/recipes/123/step1"
        }
      ]
    }
  }
  ```
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "香菇炖鸡",
      "source": "Spoonacular",
      "image": "https://api.spoonacular.com/recipes/123/image",
      "url": "https://spoonacular.com/recipes/香菇炖鸡-123"
    }
  }
  ```

### 4.3 更新外部食谱
- **URL**: `/api/recipes/external/update`
- **方法**: GET
- **权限**: 需要认证
- **请求参数**: 
  - `sources`: 数据源列表（可选，默认所有）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "updated": 5,
      "sources": ["Spoonacular", "TheMealDB", "Edamam"]
    }
  }
  ```

### 4.4 食谱照片资源管理

#### 4.4.1 获取食谱图片
- **URL**: `/api/recipes/:id/images`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `id`: 食谱ID
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "recipeId": 1,
      "images": [
        {
          "id": 1,
          "url": "/uploads/recipes/1/main.jpg",
          "type": "main"
        }
      ]
    }
  }
  ```

#### 4.4.2 上传食谱图片
- **URL**: `/api/recipes/:id/images`
- **方法**: POST
- **权限**: 需要认证
- **请求参数**: 
  - `id`: 食谱ID
  - `file`: 图片文件（multipart/form-data）
  - `type`: 图片类型（可选，默认main）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "recipeId": 1,
      "url": "/uploads/recipes/1/main.jpg",
      "type": "main"
    }
  }
  ```

#### 4.4.3 获取步骤图片
- **URL**: `/api/recipes/steps/:id/image`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `id`: 步骤ID
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "stepId": 1,
      "url": "/uploads/recipes/steps/1.jpg"
    }
  }
  ```

## 5. 作品管理 API

### 5.1 作品点赞功能

#### 5.1.1 点赞作品
- **URL**: `/api/works/like`
- **方法**: POST
- **权限**: 公开
- **请求参数**: 
  - `workId`: 作品ID（必填，数字类型，大于0）
  - `userId`: 用户ID（必填，数字类型，大于0）
- **响应示例**: 
  ```json
  {
    "success": true,
    "message": "点赞成功"
  }
  ```
- **错误响应示例**: 
  ```json
  {
    "success": false,
    "error": "您已经点赞过该作品"
  }
  ```

#### 5.1.2 取消点赞
- **URL**: `/api/works/unlike`
- **方法**: POST
- **权限**: 公开
- **请求参数**: 
  - `workId`: 作品ID（必填，数字类型，大于0）
  - `userId`: 用户ID（必填，数字类型，大于0）
- **响应示例**: 
  ```json
  {
    "success": true,
    "message": "取消点赞成功"
  }
  ```
- **错误响应示例**: 
  ```json
  {
    "success": false,
    "error": "您还没有点赞过该作品"
  }
  ```

#### 5.1.3 收藏作品
- **URL**: `/api/works/favorite`
- **方法**: POST
- **权限**: 公开
- **请求参数**: 
  - `workId`: 作品ID（必填，数字类型，大于0）
  - `userId`: 用户ID（必填，数字类型，大于0）
- **响应示例**: 
  ```json
  {
    "success": true,
    "message": "收藏成功"
  }
  ```
- **错误响应示例**: 
  ```json
  {
    "success": false,
    "error": "您已经收藏过该作品"
  }
  ```

#### 5.1.4 取消收藏
- **URL**: `/api/works/unfavorite`
- **方法**: POST
- **权限**: 公开
- **请求参数**: 
  - `workId`: 作品ID（必填，数字类型，大于0）
  - `userId`: 用户ID（必填，数字类型，大于0）
- **响应示例**: 
  ```json
  {
    "success": true,
    "message": "取消收藏成功"
  }
  ```
- **错误响应示例**: 
  ```json
  {
    "success": false,
    "error": "您还没有收藏过该作品"
  }
  ```

### 5.2 作品上传功能

#### 5.2.1 上传作品
- **URL**: `/api/works/upload`
- **方法**: POST
- **权限**: 公开
- **请求参数**: 
  - `title`: 作品标题（必填，字符串类型，长度2-50个字符）
  - `description`: 作品描述（必填，字符串类型，长度50-500个字符）
  - `rating`: 作品评分（必填，数字类型，1-5星）
  - `mushroomType`: 菌菇类型（必填，字符串类型，可选值：shiitake, oyster, enoki, king, 松茸, other）
  - `userId`: 用户ID（必填，数字类型，大于0）
  - `files`: 作品图片（必填，文件类型，支持jpg、png、gif格式，大小不超过10MB）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "测试作品标题",
      "description": "测试作品描述",
      "imageUrl": "/uploads/1640000000-test.jpg",
      "rating": 5,
      "mushroomType": "shiitake",
      "userId": 1,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```
- **错误响应示例**: 
  ```json
  {
    "success": false,
    "error": "缺少必要的作品信息"
  }
  ```

### 5.3 作品列表和筛选功能

#### 5.3.1 获取推荐作品
- **URL**: `/api/works/recommended`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `page`: 页码（可选，数字类型，默认1，大于0）
  - `pageSize`: 每页条数（可选，数字类型，默认12，1-100之间）
  - `mushroomType`: 菌菇类型（可选，字符串类型，默认all，可选值：all, shiitake, oyster, enoki, king, 松茸, other）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "works": [
        {
          "id": 1,
          "title": "测试作品标题",
          "imageUrl": "/uploads/1640000000-test.jpg",
          "rating": 5,
          "authorName": "admin",
          "authorId": 1,
          "likes": 10,
          "comments": 5,
          "createdAt": "2023-01-01T00:00:00.000Z",
          "mushroomType": "shiitake"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "pageSize": 12,
        "total": 100,
        "totalPages": 9
      }
    }
  }
  ```

#### 5.3.2 获取最新作品
- **URL**: `/api/works/latest`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `page`: 页码（可选，数字类型，默认1，大于0）
  - `pageSize`: 每页条数（可选，数字类型，默认12，1-100之间）
  - `mushroomType`: 菌菇类型（可选，字符串类型，默认all，可选值：all, shiitake, oyster, enoki, king, 松茸, other）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "works": [
        {
          "id": 1,
          "title": "测试作品标题",
          "imageUrl": "/uploads/1640000000-test.jpg",
          "rating": 5,
          "authorName": "admin",
          "authorId": 1,
          "likes": 10,
          "comments": 5,
          "createdAt": "2023-01-01T00:00:00.000Z",
          "mushroomType": "shiitake"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "pageSize": 12,
        "total": 100,
        "totalPages": 9
      }
    }
  }
  ```

#### 5.3.3 获取用户作品
- **URL**: `/api/works/user/:userId`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `userId`: 用户ID（必填，数字类型，大于0）
  - `page`: 页码（可选，数字类型，默认1，大于0）
  - `pageSize`: 每页条数（可选，数字类型，默认12，1-100之间）
  - `mushroomType`: 菌菇类型（可选，字符串类型，默认all，可选值：all, shiitake, oyster, enoki, king, 松茸, other）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "works": [
        {
          "id": 1,
          "title": "测试作品标题",
          "imageUrl": "/uploads/1640000000-test.jpg",
          "rating": 5,
          "authorName": "admin",
          "authorId": 1,
          "likes": 10,
          "comments": 5,
          "createdAt": "2023-01-01T00:00:00.000Z",
          "mushroomType": "shiitake"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "pageSize": 12,
        "total": 10,
        "totalPages": 1
      }
    }
  }
  ```

#### 5.3.4 获取作品详情
- **URL**: `/api/works/:id`
- **方法**: GET
- **权限**: 公开
- **请求参数**: 
  - `id`: 作品ID（必填，数字类型，大于0）
- **响应示例**: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "测试作品标题",
      "description": "测试作品描述",
      "imageUrl": "/uploads/1640000000-test.jpg",
      "rating": 5,
      "mushroomType": "shiitake",
      "userId": 1,
      "likes": 10,
      "comments": 5,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "username": "admin",
        "avatar": "/uploads/avatars/admin.jpg"
      }
    }
  }
  ```

    "data": {
      "stepId": 1,
      "url": "/uploads/recipes/steps/1.jpg"
    }
  }
  ```

## 5. 错误码说明

| 状态码 | 说明 | 示例错误信息 |
| ---- | ---- | ---- |
| 200 | 请求成功 | - |
| 400 | 请求参数错误或业务逻辑错误 | "暂无可用盲盒" |
| 401 | 未认证或认证失败 | "未提供认证令牌"、"无效的认证令牌" |
| 403 | 权限不足 | "权限不足，无法进行操作" |
| 404 | 请求的资源不存在 | "请求的资源不存在" |
| 500 | 服务器内部错误 | "服务器内部错误，请稍后重试" |

## 6. 认证说明

所有需要认证的API都需要在请求头中添加`Authorization`字段，格式为：
```
Authorization: Bearer <token>
```

其中，`<token>`是用户登录时获取的认证令牌，有效期为24小时。

## 7. 性能优化说明

### 7.1 数据缓存
- 食谱数据会进行内存缓存和localStorage缓存
- 缓存过期时间为1小时
- 重复请求会直接返回缓存数据

### 7.2 图片优化
- 实现了图片懒加载
- 支持渐进式图片加载
- 提供骨架屏占位

### 7.3 错误处理
- 实现了请求重试机制
- 提供详细的错误信息
- 支持网络错误自动重试
