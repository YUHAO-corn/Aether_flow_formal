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
    console.log('注册接口响应:', registerResponse.data);
    
    // 测试登录接口
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: registerResponse.data.data.email,
      password: 'Password123!'
    });
    console.log('登录接口响应:', loginResponse.data);
    
    // 设置认证令牌
    const token = loginResponse.data.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 测试获取用户信息接口
    const userResponse = await axios.get('http://localhost:3000/api/v1/auth/me');
    console.log('获取用户信息接口响应:', userResponse.data);
    
    console.log('认证API测试成功!');
    return { success: true, token, userId: userResponse.data.data.id };
  } catch (error) {
    console.error('认证API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
    return { success: false };
  }
}

// 运行测试
testAuthApi(); 