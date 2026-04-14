const Product = require('../models/Product');

/**
 * 商品所有权验证中间件
 * 验证当前认证用户是否为商品所有者或管理员
 */
const productOwnershipMiddleware = async (req, res, next) => {
  try {
    // 获取商品ID
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '商品ID不能为空'
      });
    }

    // 查找商品
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: '商品不存在'
      });
    }

    // 验证所有权：管理员或商品所有者
    // 管理员可以访问所有商品
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
      // 记录未授权访问尝试
      console.log(`[${new Date().toISOString()}] 未授权访问尝试: 用户ID ${req.user.id} (${req.user.role}) 尝试访问商品ID ${id}, IP: ${req.ip}, 请求: ${req.method} ${req.originalUrl}`);
      
      return res.status(403).json({
        success: false,
        error: '您没有权限访问或操作此商品'
      });
    }

    // 将商品信息添加到请求对象，方便后续使用
    req.product = product;
    next();
  } catch (error) {
    console.error('商品所有权验证失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

module.exports = productOwnershipMiddleware;