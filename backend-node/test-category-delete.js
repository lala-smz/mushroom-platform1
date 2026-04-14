const axios = require('axios');

const BASE_URL = 'http://localhost:3303/api';

let token = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      phone: 'admin',
      password: 'admin123'
    });
    if (response.data.success) {
      token = response.data.data.token;
      console.log('登录成功，获取到token');
      return true;
    }
    return false;
  } catch (error) {
    console.error('登录失败:', error.message);
    return false;
  }
}

async function testDeleteLevel3Category() {
  console.log('\n=== 测试删除三级分类 ===');
  try {
    const response = await axios.delete(`${BASE_URL}/products/categories/level3/test-key-123`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('删除响应:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('删除失败:', error.response?.data || error.message);
    return null;
  }
}

async function testDeleteLevel2Category() {
  console.log('\n=== 测试删除二级分类 ===');
  try {
    const response = await axios.delete(`${BASE_URL}/products/categories/level2/test-key-456`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('删除响应:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('删除失败:', error.response?.data || error.message);
    return null;
  }
}

async function testDeleteLevel1Category() {
  console.log('\n=== 测试删除一级分类 ===');
  try {
    const response = await axios.delete(`${BASE_URL}/products/categories/level1/test-key-789`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('删除响应:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('删除失败:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('=== 分类删除功能测试 ===');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('登录失败，无法进行测试');
    return;
  }
  
  await testDeleteLevel3Category();
  await testDeleteLevel2Category();
  await testDeleteLevel1Category();
  
  console.log('\n=== 测试完成 ===');
}

main();
