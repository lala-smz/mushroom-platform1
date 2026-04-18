const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/payment');
const logger = require('../utils/logger');

const paymentService = {
  async createAlipayOrder(order) {
    try {
      logger.info('Payment', '创建支付宝订单', { orderNo: order.orderNo, amount: order.totalAmount });
      
      const params = {
        app_id: config.alipay.appId,
        method: 'alipay.trade.page.pay',
        format: 'JSON',
        charset: 'UTF-8',
        sign_type: config.alipay.signType,
        timestamp: new Date().toISOString().replace(/T/g, ' ').substring(0, 19),
        version: '1.0',
        notify_url: config.alipay.notifyUrl,
        return_url: config.alipay.returnUrl,
        biz_content: JSON.stringify({
          out_trade_no: order.orderNo,
          product_code: 'FAST_INSTANT_TRADE_PAY',
          total_amount: order.totalAmount.toFixed(2),
          subject: `菌菇网订单 ${order.orderNo}`,
          body: '菌菇商品订单支付',
          timeout_express: `${config.timeout}m`
        })
      };
      
      const sign = this.generateAlipaySignature(params);
      params.sign = sign;
      
      const formData = new URLSearchParams(params).toString();
      
      logger.success('Payment', '支付宝订单创建成功', { orderNo: order.orderNo });
      return {
        success: true,
        data: {
          formData,
          orderNo: order.orderNo,
          method: 'alipay',
          gateway: config.alipay.gateway
        }
      };
    } catch (error) {
      logger.error('Payment', '创建支付宝订单失败', error);
      throw error;
    }
  },
  
  async createAlipayQRCode(order) {
    try {
      logger.info('Payment', '创建支付宝二维码订单', { orderNo: order.orderNo });
      
      const params = {
        app_id: config.alipay.appId,
        method: 'alipay.trade.precreate',
        format: 'JSON',
        charset: 'UTF-8',
        sign_type: config.alipay.signType,
        timestamp: new Date().toISOString().replace(/T/g, ' ').substring(0, 19),
        version: '1.0',
        notify_url: config.alipay.notifyUrl,
        biz_content: JSON.stringify({
          out_trade_no: order.orderNo,
          total_amount: order.totalAmount.toFixed(2),
          subject: `菌菇网订单 ${order.orderNo}`,
          timeout_express: `${config.timeout}m`
        })
      };
      
      const sign = this.generateAlipaySignature(params);
      params.sign = sign;
      
      const response = await axios.post(config.alipay.gateway, null, {
        params: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const result = response.data.alipay_trade_precreate_response;
      
      if (result.code === '10000' && result.qr_code) {
        logger.success('Payment', '支付宝二维码订单创建成功', { orderNo: order.orderNo });
        return {
          success: true,
          data: {
            qrCode: result.qr_code,
            orderNo: order.orderNo,
            method: 'alipay'
          }
        };
      } else {
        throw new Error(result.sub_msg || '创建二维码失败');
      }
    } catch (error) {
      logger.error('Payment', '创建支付宝二维码订单失败', error);
      throw error;
    }
  },
  
  async createUnionpayOrder(order) {
    try {
      logger.info('Payment', '创建银联订单', { orderNo: order.orderNo });
      
      const params = {
        orderId: order.orderNo,
        txnAmt: Math.round(order.totalAmount * 100).toString(),
        orderDesc: `菌菇网订单 ${order.orderNo}`,
        notifyUrl: config.unionpay.notifyUrl,
        frontUrl: config.unionpay.returnUrl,
        merId: config.unionpay.merId,
        txnType: '01',
        txnSubType: '01',
        bizType: '000201',
        channelType: '08',
        currencyCode: '156',
        encoding: 'UTF-8',
        signMethod: '01',
        version: '5.1.0'
      };
      
      logger.success('Payment', '银联订单参数已准备', { orderNo: order.orderNo });
      return {
        success: true,
        data: {
          params,
          orderNo: order.orderNo,
          method: 'unionpay',
          formAction: `${config.unionpay.gateway}/gateway/api/frontTransReq.do`
        }
      };
    } catch (error) {
      logger.error('Payment', '创建银联订单失败', error);
      throw error;
    }
  },
  
  async queryAlipayOrder(orderNo) {
    try {
      logger.info('Payment', '查询支付宝订单状态', { orderNo });
      
      const params = {
        app_id: config.alipay.appId,
        method: 'alipay.trade.query',
        format: 'JSON',
        charset: 'UTF-8',
        sign_type: config.alipay.signType,
        timestamp: new Date().toISOString().replace(/T/g, ' ').substring(0, 19),
        version: '1.0',
        biz_content: JSON.stringify({
          out_trade_no: orderNo
        })
      };
      
      const sign = this.generateAlipaySignature(params);
      params.sign = sign;
      
      const response = await axios.get(config.alipay.gateway, { params });
      const result = response.data.alipay_trade_query_response;
      
      if (result.code === '10000') {
        return {
          success: true,
          data: {
            tradeStatus: result.trade_status,
            tradeNo: result.trade_no,
            payTime: result.send_pay_date
          }
        };
      }
      
      return {
        success: false,
        error: result.sub_msg || '查询失败'
      };
    } catch (error) {
      logger.error('Payment', '查询支付宝订单失败', error);
      throw error;
    }
  },
  
  verifyAlipayNotify(postData) {
    try {
      logger.info('Payment', '验证支付宝回调', { orderNo: postData.out_trade_no });
      
      const sign = postData.sign;
      const signType = postData.sign_type || 'RSA2';
      
      delete postData.sign;
      delete postData.sign_type;
      
      const sortedKeys = Object.keys(postData).sort();
      const sortedData = sortedKeys.map(key => `${key}=${postData[key]}`).join('&');
      
      let verifyResult = false;
      try {
        verifyResult = crypto.verify(
          signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1',
          Buffer.from(sortedData),
          { key: config.alipay.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
          Buffer.from(sign, 'base64')
        );
      } catch (e) {
        logger.warn('Payment', '支付宝签名验证异常', e);
        verifyResult = false;
      }
      
      if (verifyResult) {
        logger.success('Payment', '支付宝回调验证成功', { orderNo: postData.out_trade_no });
        return {
          success: true,
          data: {
            orderNo: postData.out_trade_no,
            tradeNo: postData.trade_no,
            totalAmount: postData.total_amount,
            tradeStatus: postData.trade_status,
            payTime: postData.gmt_payment
          }
        };
      }
      
      logger.warn('Payment', '支付宝回调验证失败', { orderNo: postData.out_trade_no });
      return {
        success: false,
        error: '签名验证失败'
      };
    } catch (error) {
      logger.error('Payment', '验证支付宝回调失败', error);
      throw error;
    }
  },
  
  verifyUnionpayNotify(postData) {
    try {
      logger.info('Payment', '验证银联回调', { orderNo: postData.orderId });
      
      return {
        success: true,
        data: {
          orderNo: postData.orderId,
          tradeNo: postData.queryId,
          totalAmount: (parseInt(postData.txnAmt) / 100).toFixed(2),
          tradeStatus: postData.txnStatus === '00' ? 'TRADE_SUCCESS' : 'FAILED',
          payTime: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Payment', '验证银联回调失败', error);
      throw error;
    }
  },
  
  generateAlipaySignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const sortedData = sortedKeys.map(key => {
      const value = params[key];
      if (typeof value === 'object') {
        return `${key}=${JSON.stringify(value)}`;
      }
      return `${key}=${value}`;
    }).join('&');
    
    const signData = sortedData;
    
    return crypto.sign(
      config.alipay.signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1',
      Buffer.from(signData),
      { key: config.alipay.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }
    ).toString('base64');
  }
};

module.exports = paymentService;
