const axios = require('axios');

// 添加延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    console.log('注册接口响应:', JSON.stringify(registerResponse.data, null, 2));
    
    // 测试登录接口
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: registerResponse.data.data.email,
      password: 'Password123!'
    });
    console.log('登录接口响应:', JSON.stringify(loginResponse.data, null, 2));
    
    // 设置认证令牌
    const token = loginResponse.data.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('认证API测试成功!');
    return { success: true, token, userId: loginResponse.data.data.userId };
  } catch (error) {
    console.error('认证API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('未收到响应，请检查服务器是否运行');
    } else {
      console.error('请求配置错误:', error.config);
    }
    return { success: false };
  }
}

// 测试会话管理接口
async function testConversationManagement() {
  try {
    console.log('\n开始测试会话管理API...');
    
    // 1. 创建会话
    console.log('\n1. 创建会话...');
    const createResponse = await axios.post('http://localhost:3000/api/v1/conversations', {
      title: `测试会话 ${Date.now()}`,
      model: 'gpt-3.5-turbo',
      tags: []
    });
    console.log('创建会话接口响应:', JSON.stringify(createResponse.data, null, 2));
    
    // 检查响应结构
    if (!createResponse.data || !createResponse.data.data) {
      throw new Error('创建会话响应数据结构不正确');
    }
    
    // 获取会话ID
    let conversationId;
    if (createResponse.data.data._id) {
      conversationId = createResponse.data.data._id;
    } else if (createResponse.data.data.data && createResponse.data.data.data._id) {
      conversationId = createResponse.data.data.data._id;
    } else if (createResponse.data.data.id) {
      conversationId = createResponse.data.data.id;
    } else {
      throw new Error('无法从响应中获取会话ID');
    }
    
    console.log(`会话ID: ${conversationId}`);
    
    // 等待一段时间
    await delay(1000);
    
    // 2. 获取会话列表
    console.log('\n2. 获取会话列表...');
    const listResponse = await axios.get('http://localhost:3000/api/v1/conversations');
    console.log('获取会话列表接口响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 等待一段时间
    await delay(1000);
    
    // 3. 获取单个会话
    console.log('\n3. 获取单个会话...');
    try {
      const getResponse = await axios.get(`http://localhost:3000/api/v1/conversations/${conversationId}`);
      console.log('获取单个会话接口响应:', JSON.stringify(getResponse.data, null, 2));
    } catch (error) {
      console.error(`获取单个会话失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    // 等待一段时间
    await delay(1000);
    
    // 4. 添加消息到会话
    console.log('\n4. 添加消息到会话...');
    try {
      const messageResponse = await axios.post(`http://localhost:3000/api/v1/conversations/${conversationId}/messages`, {
        content: '这是一条测试消息',
        role: 'user'
      });
      console.log('添加消息接口响应:', JSON.stringify(messageResponse.data, null, 2));
    } catch (error) {
      console.error(`添加消息失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    // 等待一段时间
    await delay(1000);
    
    // 5. 获取会话消息
    console.log('\n5. 获取会话消息...');
    try {
      const getMessagesResponse = await axios.get(`http://localhost:3000/api/v1/conversations/${conversationId}/messages`);
      console.log('获取会话消息接口响应:', JSON.stringify(getMessagesResponse.data, null, 2));
    } catch (error) {
      console.error(`获取会话消息失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    // 等待一段时间
    await delay(1000);
    
    // 6. 更新会话
    console.log('\n6. 更新会话...');
    try {
      const updateResponse = await axios.patch(`http://localhost:3000/api/v1/conversations/${conversationId}`, {
        title: `更新的测试会话 ${Date.now()}`
      });
      console.log('更新会话接口响应:', JSON.stringify(updateResponse.data, null, 2));
    } catch (error) {
      console.error(`更新会话失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    // 等待一段时间
    await delay(1000);
    
    // 7. 清空会话消息
    console.log('\n7. 清空会话消息...');
    try {
      const clearMessagesResponse = await axios.delete(`http://localhost:3000/api/v1/conversations/${conversationId}/messages`);
      console.log('清空会话消息接口响应:', JSON.stringify(clearMessagesResponse.data, null, 2));
    } catch (error) {
      console.error(`清空会话消息失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    // 等待一段时间
    await delay(1000);
    
    // 8. 删除会话
    console.log('\n8. 删除会话...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3000/api/v1/conversations/${conversationId}`);
      console.log('删除会话接口响应:', JSON.stringify(deleteResponse.data, null, 2));
    } catch (error) {
      console.error(`删除会话失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    console.log('\n会话管理API测试完成!');
    return true;
  } catch (error) {
    console.error('会话管理API测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
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
  try {
    const authResult = await testAuthApi();
    
    if (authResult.success) {
      await testConversationManagement();
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runTests(); 