const axios = require('axios');

const BASE_URL = 'http://localhost:3303/api';
let token = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username: 'admin',
      password: '123456'
    });
    token = response.data.data.token;
    console.log('登录成功，Token获取完成');
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    throw error;
  }
}

async function testPaymentAPI() {
  try {
    console.log('测试支付接口...');
    
    // 先登录获取token
    await login();
    
    // 测试获取订单列表
    console.log('\n1. 测试获取订单列表:');
    const ordersResponse = await axios.get(`${BASE_URL}/order/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('订单列表:', JSON.stringify(ordersResponse.data, null, 2));
    
    // 测试支付接口
    console.log('\n2. 测试支付接口(alipay):');
    const payResponse = await axios.post(`${BASE_URL}/order/pay/1`, {
      paymentMethod: 'alipay'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('支付接口响应:', JSON.stringify(payResponse.data, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testPaymentAPI();
