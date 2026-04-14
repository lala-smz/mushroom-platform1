const jwtUtils = require('../utils/jwt');

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('=== 认证中间件调试信息 ===');
  console.log('请求路径:', req.path);
  console.log('请求方法:', req.method);
  console.log('是否有token:', !!token);
  
  if (!token) {
    console.log('未提供token，返回401错误');
    return res.status(401).json({
      success: false,
      error: '请先登录' 
    });
  }

  console.log('开始验证token...');
  const userInfo = jwtUtils.extractUserInfo(token);
  console.log('token验证结果:', userInfo);
  
  if (!userInfo) {
    console.log('无效的token，返回401错误');
    return res.status(401).json({
      success: false,
      error: '登录已过期，请重新登录' 
    });
  }

  console.log('token有效，设置用户信息到req.user');
  req.user = userInfo;
  next();
};

// 角色权限中间件
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    console.log('角色权限检查:', roles);
    console.log('当前用户:', req.user);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: '权限不足'
      });
    }

    next();
  };
};

// 卖家权限中间件
const sellerMiddleware = (req, res, next) => {
  console.log('卖家权限检查');
  console.log('当前用户:', req.user);
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '未认证'
    });
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '需要卖家权限'
    });
  }

  next();
};

// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  console.log('管理员权限检查');
  console.log('当前用户:', req.user);
  
  if (!req.user) {
    console.log('用户未认证，返回401错误');
    return res.status(401).json({
      success: false,
      error: '登录已过期，请重新登录'
    });
  }

  if (req.user.role !== 'admin') {
    console.log('用户角色不是管理员，返回403错误');
    return res.status(403).json({
      success: false,
      error: '需要管理员权限才能创建食谱'
    });
  }

  console.log('管理员权限验证通过');
  next();
};

// 权限中间件 - 检查用户是否具有指定的权限
const permissionMiddleware = (requiredPermissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未认证'
      });
    }

    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    // 获取用户权限列表
    // 注意：这里需要根据实际情况从数据库获取用户权限
    // 由于当前系统设计限制，暂时使用基于角色的权限控制
    // 后续需要修改为从数据库获取用户权限
    let userPermissions = [];
    
    // 根据用户角色设置默认权限
    switch (req.user.role) {
      case 'seller':
        // 默认卖家权限：商品查看、创建、编辑、删除
        userPermissions = ['product:read', 'product:create', 'product:update', 'product:delete'];
        break;
      case 'user':
        // 默认普通用户权限：商品查看
        userPermissions = ['product:read'];
        break;
      default:
        userPermissions = [];
    }
    
    // 检查用户是否具有所有必需的权限
    const hasAllPermissions = requiredPermissions.every(permission => {
      return userPermissions.includes(permission);
    });
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        error: '权限不足，缺少必需的权限'
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  sellerMiddleware,
  adminMiddleware,
  permissionMiddleware
};