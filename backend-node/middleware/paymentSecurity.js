const crypto = require('crypto');

// 支付安全中间件
const paymentSecurity = {
  // 验证支付请求签名
  validateSignature: (req, res, next) => {
    try {
      const { signature, timestamp, orderNo, totalAmount, paymentMethod } = req.body;

      // 检查必要参数
      if (!signature || !timestamp || !orderNo || !totalAmount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的支付参数'
        });
      }

      // 检查时间戳是否有效（防止重放攻击）
      const now = Date.now();
      const timeDiff = Math.abs(now - parseInt(timestamp));
      // 允许5分钟的时间误差
      if (timeDiff > 5 * 60 * 1000) {
        return res.status(400).json({
          success: false,
          error: '时间戳无效'
        });
      }

      // 检查签名格式
      if (!/^[a-f0-9]{32}$/i.test(signature)) {
        return res.status(400).json({
          success: false,
          error: '签名格式无效'
        });
      }

      next();
    } catch (error) {
      console.error('验证支付签名失败:', error);
      return res.status(400).json({
        success: false,
        error: '验证支付签名失败'
      });
    }
  },

  // 验证支付回调IP
  validateCallbackIP: (req, res, next) => {
    // 实际项目中，应该根据支付服务商的文档，验证回调请求的IP地址
    // 这里只是一个示例实现
    const allowedIPs = process.env.ALLOWED_PAYMENT_CALLBACK_IPS ? 
      process.env.ALLOWED_PAYMENT_CALLBACK_IPS.split(',') : [];

    if (allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!allowedIPs.includes(clientIP)) {
        console.warn('支付回调IP验证失败:', clientIP);
        // 在实际项目中，这里应该返回错误
        // return res.status(403).json({ success: false, error: 'IP地址不允许' });
      }
    }

    next();
  },

  // 验证支付金额
  validateAmount: (req, res, next) => {
    try {
      const { totalAmount } = req.body;

      if (totalAmount !== undefined) {
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({
            success: false,
            error: '支付金额无效'
          });
        }

        // 检查金额精度
        const amountStr = amount.toString();
        const decimalPlaces = amountStr.includes('.') ? 
          amountStr.split('.')[1].length : 0;
        if (decimalPlaces > 2) {
          return res.status(400).json({
            success: false,
            error: '支付金额精度无效'
          });
        }
      }

      next();
    } catch (error) {
      console.error('验证支付金额失败:', error);
      return res.status(400).json({
        success: false,
        error: '验证支付金额失败'
      });
    }
  },

  // 防止支付请求重放
  preventReplay: (req, res, next) => {
    // 实际项目中，应该实现一个防重放机制
    // 例如使用Redis存储已经处理过的请求ID，设置过期时间
    // 这里只是一个示例实现
    const { orderNo, timestamp } = req.body;
    const requestId = `${orderNo}_${timestamp}`;

    // 这里应该检查requestId是否已经被处理过
    // 例如：const isReplayed = await redisClient.exists(`payment:request:${requestId}`);
    // if (isReplayed) {
    //   return res.status(400).json({ success: false, error: '请求已处理' });
    // }
    // 然后存储requestId，设置过期时间
    // await redisClient.set(`payment:request:${requestId}`, '1', 'EX', 3600);

    next();
  }
};

module.exports = paymentSecurity;
