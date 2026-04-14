require('dotenv').config();

module.exports = {
  // 支付宝配置
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    returnUrl: process.env.ALIPAY_RETURN_URL || 'http://localhost:5175/order/success',
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3303/api/order/pay/alipay/notify',
    signType: 'RSA2'
  },
  
  // 银行卡支付配置（通过银联）
  unionpay: {
    merId: process.env.UNIONPAY_MER_ID || '',
    certPath: process.env.UNIONPAY_CERT_PATH || '',
    keyPath: process.env.UNIONPAY_KEY_PATH || '',
    gateway: process.env.UNIONPAY_GATEWAY || 'https://gateway.95516.com',
    notifyUrl: process.env.UNIONPAY_NOTIFY_URL || 'http://localhost:3303/api/order/pay/unionpay/notify',
    returnUrl: process.env.UNIONPAY_RETURN_URL || 'http://localhost:5175/order/success'
  },
  
  // 支付超时配置（分钟）
  timeout: parseInt(process.env.PAYMENT_TIMEOUT) || 30,
  
  // 支付方式映射
  methodMap: {
    alipay: { name: '支付宝', icon: 'alipay' },
    unionpay: { name: '银行卡', icon: 'bank' },
    wechat: { name: '微信支付', icon: 'wechat' }
  }
};
