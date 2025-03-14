const axios = require('axios');

// 测试用户认证接口
async function testAuthApi() {
  try {
    console.log('开始测试认证API...');
    
    // 测试注册接口
    const registerResponse = await axios.post('http://localhost:3000/api/v1/auth/register', {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!'
    });
    
    // 测试登录接口
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: registerResponse.data.data.email,
      password: 'Password123!'
    });
    
    // 设置认证令牌
    const token = loginResponse.data.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('认证API测试成功!');
    return { success: true, token };
  } catch (error) {
    console.error('认证API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    } else if (error.request) {
      console.error('未收到响应，请检查服务器是否运行');
    } else {
      console.error('请求配置错误:', error.config);
    }
    return { success: false };
  }
}

// 测试会话创建接口
async function testCreateConversation(token) {
  try {
    console.log('\n开始测试会话创建API...');
    
    // 设置认证令牌
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 创建会话
    console.log('创建会话...');
    const createResponse = await axios.post('http://localhost:3000/api/v1/conversations', {
      title: `测试会话 ${Date.now()}`,
      model: 'gpt-3.5-turbo',
      tags: []
    });
    console.log('创建会话接口响应:', createResponse.data);
    
    console.log('\n会话创建API测试成功!');
    return true;
  } catch (error) {
    console.error('会话创建API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    } else if (error.request) {
      console.error('未收到响应，请检查服务器是否运行');
    } else {
      console.error('请求配置错误:', error.config);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  const authResult = await testAuthApi();
  
  if (authResult.success) {
    await testCreateConversation(authResult.token);
  }
}

runTests(); 