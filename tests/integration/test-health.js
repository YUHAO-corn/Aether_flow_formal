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

// 运行测试
testApiConnection(); 