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

// 测试提示自动捕获接口
async function testPromptAutoSave() {
  try {
    console.log('\n开始测试提示自动捕获API...');
    
    // 1. 自动保存提示词
    console.log('\n1. 自动保存提示词...');
    try {
      const autoSaveResponse = await axios.post('http://localhost:3000/api/v1/prompts/auto-save', {
        content: `这是一个测试提示词 ${Date.now()}`,
        response: '这是一个测试响应',
        platform: 'ChatGPT',
        url: 'https://chat.openai.com/'
      });
      console.log('自动保存提示词接口响应:', JSON.stringify(autoSaveResponse.data, null, 2));
      
      // 保存提示词ID用于后续测试
      if (autoSaveResponse.data && autoSaveResponse.data.data) {
        const promptId = autoSaveResponse.data.data._id;
        console.log(`提示词ID: ${promptId}`);
        
        // 2. 获取提示词列表
        await delay(1000);
        console.log('\n2. 获取提示词列表...');
        try {
          const listResponse = await axios.get('http://localhost:3000/api/v1/prompts');
          console.log('获取提示词列表接口响应:', JSON.stringify(listResponse.data, null, 2));
        } catch (error) {
          console.error(`获取提示词列表失败: ${error.message}`);
          if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
          }
        }
        
        // 3. 获取单个提示词
        await delay(1000);
        console.log('\n3. 获取单个提示词...');
        try {
          const getResponse = await axios.get(`http://localhost:3000/api/v1/prompts/${promptId}`);
          console.log('获取单个提示词接口响应:', JSON.stringify(getResponse.data, null, 2));
        } catch (error) {
          console.error(`获取单个提示词失败: ${error.message}`);
          if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
          }
        }
        
        // 4. 更新提示词（收藏）
        await delay(1000);
        console.log('\n4. 更新提示词（收藏）...');
        try {
          const updateResponse = await axios.patch(`http://localhost:3000/api/v1/prompts/${promptId}`, {
            favorite: true
          });
          console.log('更新提示词接口响应:', JSON.stringify(updateResponse.data, null, 2));
        } catch (error) {
          console.error(`更新提示词失败: ${error.message}`);
          if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
          }
        }
        
        // 5. 删除提示词
        await delay(1000);
        console.log('\n5. 删除提示词...');
        try {
          const deleteResponse = await axios.delete(`http://localhost:3000/api/v1/prompts/${promptId}`);
          console.log('删除提示词接口响应:', JSON.stringify(deleteResponse.data, null, 2));
        } catch (error) {
          console.error(`删除提示词失败: ${error.message}`);
          if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
          }
        }
      }
    } catch (error) {
      console.error(`自动保存提示词失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('\n提示自动捕获API测试完成!');
    return true;
  } catch (error) {
    console.error('提示自动捕获API测试失败:', error.message);
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
      await testPromptAutoSave();
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runTests(); 