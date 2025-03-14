const axios = require('axios');

// 设置axios默认配置
axios.defaults.baseURL = 'http://localhost:3001/api/v1';

// 添加延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试用户认证接口
async function testAuthApi() {
  try {
    console.log('开始测试认证API...');
    
    // 测试注册接口
    const registerResponse = await axios.post('http://localhost:3001/api/v1/auth/register', {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!'
    });
    console.log('注册接口响应:', JSON.stringify(registerResponse.data, null, 2));
    
    // 测试登录接口
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
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

// 测试提示优化接口
async function testPromptOptimization() {
  try {
    console.log('\n开始测试提示优化API...');
    
    // 1. 获取客户端配置
    console.log('\n1. 获取客户端配置...');
    try {
      const configResponse = await axios.get('http://localhost:3001/api/v1/prompts/optimize/config');
      console.log('获取客户端配置接口响应:', JSON.stringify(configResponse.data, null, 2));
    } catch (error) {
      console.error(`获取客户端配置失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 2. 优化提示词
    console.log('\n2. 优化提示词...');
    try {
      const optimizeResponse = await axios.post('http://localhost:3001/api/v1/prompts/optimize', {
        content: '写一个关于人工智能的文章',
        category: 'general',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        useClientApi: false
      });
      console.log('优化提示词接口响应:', JSON.stringify(optimizeResponse.data, null, 2));
      
      // 如果有历史ID，保存它用于后续测试
      let historyId = null;
      if (optimizeResponse.data && optimizeResponse.data.data && optimizeResponse.data.data.historyId) {
        historyId = optimizeResponse.data.data.historyId;
        console.log(`优化历史ID: ${historyId}`);
        
        // 3. 使用历史ID进行多轮优化
        await delay(1000);
        console.log('\n3. 多轮优化...');
        try {
          const multiRoundResponse = await axios.post('http://localhost:3001/api/v1/prompts/optimize', {
            content: '写一个关于人工智能在医疗领域应用的详细文章',
            category: 'general',
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            useClientApi: false,
            historyId: historyId
          });
          console.log('多轮优化接口响应:', JSON.stringify(multiRoundResponse.data, null, 2));
        } catch (error) {
          console.error(`多轮优化失败: ${error.message}`);
          if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
          }
        }
      }
    } catch (error) {
      console.error(`优化提示词失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('\n提示优化API测试完成!');
    return true;
  } catch (error) {
    console.error('提示优化API测试失败:', error.message);
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
      await testPromptOptimization();
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runTests(); 