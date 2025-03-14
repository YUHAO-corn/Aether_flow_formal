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

// 测试活动日志管理接口
async function testActivityLogManagement() {
  try {
    console.log('\n开始测试活动日志管理API...');
    
    // 1. 获取活动日志列表
    console.log('\n1. 获取活动日志列表...');
    try {
      const listResponse = await axios.get('http://localhost:3000/api/v1/activities');
      console.log('获取活动日志列表接口响应:', JSON.stringify(listResponse.data, null, 2));
    } catch (error) {
      console.error(`获取活动日志列表失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 2. 获取活动统计信息
    console.log('\n2. 获取活动统计信息...');
    try {
      const statsResponse = await axios.get('http://localhost:3000/api/v1/activities/stats');
      console.log('获取活动统计信息接口响应:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.error(`获取活动统计信息失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 3. 获取单个活动日志
    console.log('\n3. 获取单个活动日志...');
    try {
      // 先获取列表，然后获取第一个活动的ID
      const listResponse = await axios.get('http://localhost:3000/api/v1/activities');
      if (listResponse.data && listResponse.data.data && listResponse.data.data.data && listResponse.data.data.data.length > 0) {
        const activityId = listResponse.data.data.data[0]._id;
        console.log(`活动日志ID: ${activityId}`);
        
        const activityResponse = await axios.get(`http://localhost:3000/api/v1/activities/${activityId}`);
        console.log('获取单个活动日志接口响应:', JSON.stringify(activityResponse.data, null, 2));
      } else {
        console.log('没有可用的活动日志');
      }
    } catch (error) {
      console.error(`获取单个活动日志失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    await delay(1000);
    
    // 4. 清除活动日志
    console.log('\n4. 清除活动日志...');
    try {
      // 清除30天前的活动日志
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const clearResponse = await axios.delete(`http://localhost:3000/api/v1/activities?olderThan=${thirtyDaysAgo.toISOString()}`);
      console.log('清除活动日志接口响应:', JSON.stringify(clearResponse.data, null, 2));
    } catch (error) {
      console.error(`清除活动日志失败: ${error.message}`);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
      }
      // 继续执行其他测试
    }
    
    console.log('\n活动日志管理API测试完成!');
    return true;
  } catch (error) {
    console.error('活动日志管理API测试失败:', error.message);
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
      await testActivityLogManagement();
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runTests(); 