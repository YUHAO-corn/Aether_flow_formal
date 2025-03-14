/**
 * 环境检查脚本
 * 用于检查MongoDB连接和用户权限
 */

const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: './AetherFlow_backend/.env' });

// 设置axios默认配置
axios.defaults.baseURL = 'http://localhost:3001/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 检查MongoDB连接
async function checkMongoDBConnection() {
  try {
    console.log('检查MongoDB连接...');
    
    // 连接MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB连接成功!');
    console.log('连接字符串:', process.env.MONGODB_URI);
    
    // 检查数据库状态
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log('MongoDB版本:', serverStatus.version);
    console.log('连接数:', serverStatus.connections.current);
    
    // 列出所有集合
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('数据库集合:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    console.log('请确保MongoDB服务正在运行，并且连接字符串正确');
    console.log('尝试运行: mongod --dbpath=/data/db');
    return false;
  } finally {
    // 关闭连接
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

// 检查用户权限
async function checkUserPermissions() {
  try {
    console.log('\n检查用户权限...');
    
    // 尝试注册新用户
    const username = `testuser${Date.now()}`;
    const email = `test${Date.now()}@example.com`;
    const password = 'Password123!';
    
    console.log(`尝试注册用户: ${username} (${email})`);
    const registerResponse = await axios.post('/auth/register', {
      username,
      email,
      password,
      passwordConfirm: password
    });
    
    if (registerResponse.data && registerResponse.data.data && registerResponse.data.data.token) {
      console.log('用户注册成功!');
      
      // 设置认证令牌
      const token = registerResponse.data.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 测试受保护的路由
      console.log('\n测试受保护的路由...');
      
      // 获取当前用户信息
      const meResponse = await axios.get('/auth/me');
      console.log('当前用户信息:', JSON.stringify(meResponse.data, null, 2));
      
      // 测试创建提示词
      const promptResponse = await axios.post('/prompts', {
        content: '测试提示词内容',
        response: '测试回答内容',
        platform: 'test-platform',
        tags: ['测试标签1', '测试标签2'],
        favorite: false
      });
      console.log('创建提示词响应:', JSON.stringify(promptResponse.data, null, 2));
      
      console.log('\n用户权限检查成功!');
      return true;
    } else {
      console.error('用户注册失败:', registerResponse.data);
      return false;
    }
  } catch (error) {
    console.error('用户权限检查失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始环境检查...');
  
  // 检查MongoDB连接
  const mongoDBConnected = await checkMongoDBConnection();
  
  if (mongoDBConnected) {
    // 等待一下，确保MongoDB连接完成
    await delay(1000);
    
    // 检查用户权限
    await checkUserPermissions();
  }
  
  console.log('\n环境检查完成!');
}

// 执行主函数
main().catch(error => {
  console.error('环境检查过程中发生错误:', error);
}); 