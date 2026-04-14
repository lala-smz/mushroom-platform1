const axios = require('axios');

async function testApi() {
  try {
    console.log('测试后端API...');
    
    // 测试健康检查
    const healthRes = await axios.get('http://localhost:3002/api/test/health');
    console.log('健康检查:', healthRes.data);
    
    // 测试盲盒数据
    const boxesRes = await axios.get('http://localhost:3002/api/test/boxes');
    console.log('盲盒数据:', boxesRes.data);
    
  } catch (error) {
    console.error('API测试失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testApi();