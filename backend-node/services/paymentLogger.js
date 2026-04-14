const fs = require('fs');
const path = require('path');

// 支付日志服务
class PaymentLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirExists();
  }

  // 确保日志目录存在
  ensureLogDirExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // 获取日志文件路径
  getLogFilePath() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `payment-${today}.log`);
  }

  // 写入日志
  writeLog(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logString = JSON.stringify(logEntry) + '\n';
    const logFilePath = this.getLogFilePath();

    // 异步写入日志
    fs.appendFile(logFilePath, logString, (err) => {
      if (err) {
        console.error('写入支付日志失败:', err);
      }
    });

    // 同时输出到控制台
    if (level === 'error' || level === 'warn') {
      console[level](`[${level.toUpperCase()}] ${message}`, data);
    } else if (process.env.NODE_ENV === 'development') {
      console[level]?.(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  // 记录支付创建
  logPaymentCreate(orderNo, userId, totalAmount, paymentMethod) {
    this.writeLog('info', '创建支付订单', {
      orderNo,
      userId,
      totalAmount,
      paymentMethod
    });
  }

  // 记录支付成功
  logPaymentSuccess(orderNo, transactionId, paymentMethod, payTime) {
    this.writeLog('info', '支付成功', {
      orderNo,
      transactionId,
      paymentMethod,
      payTime
    });
  }

  // 记录支付失败
  logPaymentFailure(orderNo, errorMessage, paymentMethod, errorDetails = {}) {
    this.writeLog('error', '支付失败', {
      orderNo,
      errorMessage,
      paymentMethod,
      errorDetails
    });
  }

  // 记录支付超时
  logPaymentTimeout(orderNo, paymentMethod, timeoutAt) {
    this.writeLog('warn', '支付超时', {
      orderNo,
      paymentMethod,
      timeoutAt
    });
  }

  // 记录支付重试
  logPaymentRetry(orderNo, userId, paymentMethod, retryCount) {
    this.writeLog('info', '支付重试', {
      orderNo,
      userId,
      paymentMethod,
      retryCount
    });
  }

  // 记录支付签名验证失败
  logSignatureFailure(orderNo, errorMessage, signature) {
    this.writeLog('error', '支付签名验证失败', {
      orderNo,
      errorMessage,
      signature
    });
  }

  // 记录支付回调处理
  logPayNotify(orderNo, transactionId, status, notifyData = {}) {
    this.writeLog('info', '支付回调处理', {
      orderNo,
      transactionId,
      status,
      notifyData
    });
  }

  // 记录异常
  logException(operation, error, context = {}) {
    this.writeLog('error', `支付操作异常: ${operation}`, {
      error: {
        message: error.message,
        stack: error.stack
      },
      context
    });
  }
}

// 导出单例
module.exports = new PaymentLogger();
