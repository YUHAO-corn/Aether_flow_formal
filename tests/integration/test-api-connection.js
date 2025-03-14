const axios = require('axios');

// 测试API连接
async function testApiConnection() {
  try {
    console.log('开始测试API连接...');
    
    // 测试后端健康检查接口
    const response = await axios.get('http://localhost:3000/api/v1/health');
    console.log('健康检查接口响应:', response.data);
    
    console.log('API连接测试成功!');
    return true;
  } catch (error) {
    console.error('API连接测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
    return false;
  }
}

// 测试用户认证接口
async function testAuthApi() {
  try {
    console.log('\n开始测试认证API...');
    
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

// 测试会话管理接口
async function testConversationApi(token, userId) {
  try {
    console.log('\n开始测试会话管理API...');
    
    // 设置认证令牌
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 创建会话
    const createResponse = await axios.post('http://localhost:3000/api/v1/conversations', {
      title: `测试会话 ${Date.now()}`,
      model: 'gpt-3.5-turbo',
      tags: []
    });
    console.log('创建会话接口响应:', createResponse.data);
    
    const conversationId = createResponse.data.data.id;
    
    // 获取会话列表
    const listResponse = await axios.get('http://localhost:3000/api/v1/conversations');
    console.log('获取会话列表接口响应:', listResponse.data);
    
    // 获取单个会话
    const getResponse = await axios.get(`http://localhost:3000/api/v1/conversations/${conversationId}`);
    console.log('获取单个会话接口响应:', getResponse.data);
    
    // 添加消息到会话
    const messageResponse = await axios.post(`http://localhost:3000/api/v1/conversations/${conversationId}/messages`, {
      content: '这是一条测试消息',
      role: 'user'
    });
    console.log('添加消息接口响应:', messageResponse.data);
    
    // 更新会话
    const updateResponse = await axios.put(`http://localhost:3000/api/v1/conversations/${conversationId}`, {
      title: `更新的测试会话 ${Date.now()}`
    });
    console.log('更新会话接口响应:', updateResponse.data);
    
    console.log('会话管理API测试成功!');
    return true;
  } catch (error) {
    console.error('会话管理API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
async function runTests() {
  const apiConnected = await testApiConnection();
  
  if (apiConnected) {
    const authResult = await testAuthApi();
    
    if (authResult.success) {
      await testConversationApi(authResult.token, authResult.userId);
    }
  }
}

runTests(); 