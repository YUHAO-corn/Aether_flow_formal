const axios = require('axios');

// 设置axios默认配置
axios.defaults.baseURL = 'http://localhost:3001/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 用户登录函数
async function login() {
  try {
    const response = await axios.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (response.data && response.data.data && response.data.data.token) {
      // 设置全局Authorization头
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      console.log('登录成功，已设置Authorization头');
      return true;
    } else {
      console.error('登录失败：未获取到token');
      return false;
    }
  } catch (error) {
    console.error(`登录失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    // 尝试注册
    try {
      console.log('尝试注册新用户...');
      const registerResponse = await axios.post('/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (registerResponse.data && registerResponse.data.data && registerResponse.data.data.token) {
        // 设置全局Authorization头
        axios.defaults.headers.common['Authorization'] = `Bearer ${registerResponse.data.data.token}`;
        console.log('注册并登录成功，已设置Authorization头');
        return true;
      } else {
        console.error('注册失败');
        return false;
      }
    } catch (registerError) {
      console.error(`注册失败: ${registerError.message}`);
      if (registerError.response) {
        console.error('错误状态码:', registerError.response.status);
        console.error('错误数据:', JSON.stringify(registerError.response.data, null, 2));
      }
      return false;
    }
  }
}

// 测试活动日志统计功能
async function testActivityStats() {
  try {
    console.log('\n测试活动日志统计功能...');
    
    // 获取活动统计信息
    const statsResponse = await axios.get('/activities/stats');
    console.log('活动统计信息响应:', JSON.stringify(statsResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`获取活动统计信息失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试活动日志清除功能
async function testActivityClear() {
  try {
    console.log('\n测试活动日志清除功能...');
    
    // 清除30天前的活动日志
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const clearResponse = await axios.delete(`/activities?olderThan=${thirtyDaysAgo.toISOString()}`);
    console.log('清除活动日志响应:', JSON.stringify(clearResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`清除活动日志失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试获取最近使用的提示词接口
async function testRecentPrompts() {
  try {
    console.log('\n测试获取最近使用的提示词接口...');
    
    // 获取最近使用的提示词
    const recentResponse = await axios.get('/prompts/recent?limit=5');
    console.log('最近使用的提示词响应:', JSON.stringify(recentResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`获取最近使用的提示词失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始测试活动日志统计和清除功能...');
  
  // 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('登录失败，无法继续测试');
    return;
  }
  
  // 等待一下，确保登录完成
  await delay(1000);
  
  // 测试活动日志统计功能
  await testActivityStats();
  
  // 等待一下
  await delay(1000);
  
  // 测试活动日志清除功能
  await testActivityClear();
  
  // 等待一下
  await delay(1000);
  
  // 测试获取最近使用的提示词接口
  await testRecentPrompts();
  
  console.log('\n测试完成!');
}

// 执行主函数
main().catch(error => {
  console.error('测试过程中发生错误:', error);
}); 