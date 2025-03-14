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

// 测试提示词管理功能
async function testPromptManagement() {
  try {
    console.log('\n测试提示词管理功能...');
    
    // 创建提示词
    const createResponse = await axios.post('/prompts', {
      content: '测试提示词内容',
      response: '测试回答内容',
      platform: 'test-platform',
      tags: ['测试标签1', '测试标签2'],
      favorite: false
    });
    console.log('创建提示词响应:', JSON.stringify(createResponse.data, null, 2));
    
    const promptId = createResponse.data.data._id;
    
    // 获取提示词列表
    const listResponse = await axios.get('/prompts');
    console.log('获取提示词列表响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 获取单个提示词
    const getResponse = await axios.get(`/prompts/${promptId}`);
    console.log('获取单个提示词响应:', JSON.stringify(getResponse.data, null, 2));
    
    // 更新提示词
    const updateResponse = await axios.patch(`/prompts/${promptId}`, {
      content: '更新后的提示词内容',
      favorite: true
    });
    console.log('更新提示词响应:', JSON.stringify(updateResponse.data, null, 2));
    
    // 切换收藏状态
    const favoriteResponse = await axios.patch(`/prompts/${promptId}/favorite`);
    console.log('切换收藏状态响应:', JSON.stringify(favoriteResponse.data, null, 2));
    
    // 增加使用次数
    const usageResponse = await axios.patch(`/prompts/${promptId}/usage`);
    console.log('增加使用次数响应:', JSON.stringify(usageResponse.data, null, 2));
    
    // 获取最近使用的提示词
    const recentResponse = await axios.get('/prompts/recent?limit=5');
    console.log('获取最近使用的提示词响应:', JSON.stringify(recentResponse.data, null, 2));
    
    // 快速搜索提示词
    const searchResponse = await axios.get('/prompts/quick-search?query=更新');
    console.log('快速搜索提示词响应:', JSON.stringify(searchResponse.data, null, 2));
    
    // 批量获取提示词
    const batchResponse = await axios.post('/prompts/batch', {
      ids: [promptId]
    });
    console.log('批量获取提示词响应:', JSON.stringify(batchResponse.data, null, 2));
    
    // 自动保存提示词
    const autoSaveResponse = await axios.post('/prompts/auto-save', {
      content: '自动保存的提示词内容',
      response: '自动保存的回答内容',
      platform: 'test-platform',
      url: 'https://example.com/test'
    });
    console.log('自动保存提示词响应:', JSON.stringify(autoSaveResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`提示词管理功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试标签管理功能
async function testTagManagement() {
  try {
    console.log('\n测试标签管理功能...');
    
    // 创建标签
    const createResponse = await axios.post('/tags', {
      name: '测试标签',
      color: '#FF5733'
    });
    console.log('创建标签响应:', JSON.stringify(createResponse.data, null, 2));
    
    const tagId = createResponse.data.data._id;
    
    // 获取标签列表
    const listResponse = await axios.get('/tags');
    console.log('获取标签列表响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 获取单个标签
    const getResponse = await axios.get(`/tags/${tagId}`);
    console.log('获取单个标签响应:', JSON.stringify(getResponse.data, null, 2));
    
    // 更新标签
    const updateResponse = await axios.patch(`/tags/${tagId}`, {
      name: '更新后的标签',
      color: '#33FF57'
    });
    console.log('更新标签响应:', JSON.stringify(updateResponse.data, null, 2));
    
    // 获取标签关联的提示词
    const promptsResponse = await axios.get(`/tags/${tagId}/prompts`);
    console.log('获取标签关联的提示词响应:', JSON.stringify(promptsResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`标签管理功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试会话管理功能
async function testConversationManagement() {
  try {
    console.log('\n测试会话管理功能...');
    
    // 创建会话
    const createResponse = await axios.post('/conversations', {
      title: '测试会话',
      platform: 'test-platform'
    });
    console.log('创建会话响应:', JSON.stringify(createResponse.data, null, 2));
    
    const conversationId = createResponse.data.data._id;
    
    // 获取会话列表
    const listResponse = await axios.get('/conversations');
    console.log('获取会话列表响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 获取单个会话
    const getResponse = await axios.get(`/conversations/${conversationId}`);
    console.log('获取单个会话响应:', JSON.stringify(getResponse.data, null, 2));
    
    // 更新会话
    const updateResponse = await axios.patch(`/conversations/${conversationId}`, {
      title: '更新后的会话'
    });
    console.log('更新会话响应:', JSON.stringify(updateResponse.data, null, 2));
    
    // 添加消息到会话
    const addMessageResponse = await axios.post(`/conversations/${conversationId}/messages`, {
      role: 'user',
      content: '测试消息内容'
    });
    console.log('添加消息到会话响应:', JSON.stringify(addMessageResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`会话管理功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试提示词优化功能
async function testPromptOptimization() {
  try {
    console.log('\n测试提示词优化功能...');
    
    // 优化提示词
    const optimizeResponse = await axios.post('/prompts/optimize', {
      content: '写一篇关于人工智能的文章',
      category: 'writing',
      provider: 'deepseek'
    });
    console.log('优化提示词响应:', JSON.stringify(optimizeResponse.data, null, 2));
    
    const historyId = optimizeResponse.data.data.historyId;
    
    // 获取优化历史
    const historyResponse = await axios.get('/prompts/optimize/history');
    console.log('获取优化历史响应:', JSON.stringify(historyResponse.data, null, 2));
    
    // 获取单个优化历史
    const getHistoryResponse = await axios.get(`/prompts/optimize/history/${historyId}`);
    console.log('获取单个优化历史响应:', JSON.stringify(getHistoryResponse.data, null, 2));
    
    // 评价优化结果
    const rateResponse = await axios.post(`/prompts/optimize/history/${historyId}/rate`, {
      rating: 5
    });
    console.log('评价优化结果响应:', JSON.stringify(rateResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`提示词优化功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试API密钥管理功能
async function testApiKeyManagement() {
  try {
    console.log('\n测试API密钥管理功能...');
    
    // 创建API密钥
    const createResponse = await axios.post('/prompts/optimize/api-keys', {
      provider: 'openai',
      apiKey: 'sk-test-api-key'
    });
    console.log('创建API密钥响应:', JSON.stringify(createResponse.data, null, 2));
    
    const apiKeyId = createResponse.data.data.id;
    
    // 获取API密钥列表
    const listResponse = await axios.get('/prompts/optimize/api-keys');
    console.log('获取API密钥列表响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 删除API密钥
    const deleteResponse = await axios.delete(`/prompts/optimize/api-keys/${apiKeyId}`);
    console.log('删除API密钥响应:', JSON.stringify(deleteResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`API密钥管理功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 测试活动日志功能
async function testActivityLog() {
  try {
    console.log('\n测试活动日志功能...');
    
    // 获取活动日志列表
    const listResponse = await axios.get('/activities');
    console.log('获取活动日志列表响应:', JSON.stringify(listResponse.data, null, 2));
    
    // 获取活动统计信息
    const statsResponse = await axios.get('/activities/stats');
    console.log('获取活动统计信息响应:', JSON.stringify(statsResponse.data, null, 2));
    
    // 清除活动日志
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const clearResponse = await axios.delete(`/activities?olderThan=${thirtyDaysAgo.toISOString()}`);
    console.log('清除活动日志响应:', JSON.stringify(clearResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`活动日志功能测试失败: ${error.message}`);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始测试所有功能...');
  
  // 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('登录失败，无法继续测试');
    return;
  }
  
  // 等待一下，确保登录完成
  await delay(1000);
  
  // 测试提示词管理功能
  await testPromptManagement();
  await delay(1000);
  
  // 测试标签管理功能
  await testTagManagement();
  await delay(1000);
  
  // 测试会话管理功能
  await testConversationManagement();
  await delay(1000);
  
  // 测试提示词优化功能
  await testPromptOptimization();
  await delay(1000);
  
  // 测试API密钥管理功能
  await testApiKeyManagement();
  await delay(1000);
  
  // 测试活动日志功能
  await testActivityLog();
  
  console.log('\n所有功能测试完成!');
}

// 执行主函数
main().catch(error => {
  console.error('测试过程中发生错误:', error);
}); 