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

// 测试API密钥管理接口
async function testApiKeyManagement() {
  try {
    console.log('\n开始测试API密钥管理API...');
    
    // 1. 获取API密钥列表
    console.log('\n1. 获取API密钥列表...');
    try {
      const listResponse = await axios.get('http://localhost:3000/api/v1/api-keys');
      console.log('获取API密钥列表接口响应:', JSON.stringify(listResponse.data, null, 2));
    } catch (error) {
      console.error(`获取API密钥列表失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 2. 添加API密钥
    console.log('\n2. 添加API密钥...');
    let apiKeyId = null;
    try {
      const addResponse = await axios.post('http://localhost:3000/api/v1/api-keys', {
        provider: 'openai',
        key: 'sk-test-key-' + Date.now(),
        name: '测试密钥'
      });
      console.log('添加API密钥接口响应:', JSON.stringify(addResponse.data, null, 2));
      
      // 保存API密钥ID用于后续测试
      if (addResponse.data && addResponse.data.data && addResponse.data.data.apiKey) {
        apiKeyId = addResponse.data.data.apiKey._id;
        console.log(`API密钥ID: ${apiKeyId}`);
      }
    } catch (error) {
      console.error(`添加API密钥失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 3. 更新API密钥
    if (apiKeyId) {
      console.log('\n3. 更新API密钥...');
      try {
        const updateResponse = await axios.patch(`http://localhost:3000/api/v1/api-keys/${apiKeyId}`, {
          name: '更新的测试密钥',
          isActive: true
        });
        console.log('更新API密钥接口响应:', JSON.stringify(updateResponse.data, null, 2));
      } catch (error) {
        console.error(`更新API密钥失败: ${error.message}`);
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
        }
        // 继续执行其他测试
      }
      
      await delay(1000);
      
      // 4. 验证API密钥
      console.log('\n4. 验证API密钥...');
      try {
        const verifyResponse = await axios.get(`http://localhost:3000/api/v1/api-keys/${apiKeyId}/verify`);
        console.log('验证API密钥接口响应:', JSON.stringify(verifyResponse.data, null, 2));
      } catch (error) {
        console.error(`验证API密钥失败: ${error.message}`);
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
        }
        // 继续执行其他测试
      }
      
      await delay(1000);
      
      // 5. 删除API密钥
      console.log('\n5. 删除API密钥...');
      try {
        const deleteResponse = await axios.delete(`http://localhost:3000/api/v1/api-keys/${apiKeyId}`);
        console.log('删除API密钥接口响应:', JSON.stringify(deleteResponse.data, null, 2));
      } catch (error) {
        console.error(`删除API密钥失败: ${error.message}`);
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
        }
        // 继续执行其他测试
      }
    }
    
    console.log('\nAPI密钥管理API测试完成!');
    return true;
  } catch (error) {
    console.error('API密钥管理API测试失败:', error.message);
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
      await testApiKeyManagement();
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runTests(); 