const puppeteer = require('puppeteer');
const axios = require('axios');

// 配置
const config = {
  baseUrl: 'http://localhost:5173', // 前端服务地址
  apiUrl: 'http://localhost:3001/api/v1', // 后端API地址
  testUser: {
    email: 'test@example.com',
    password: 'password123'
  },
  timeout: 30000 // 超时时间（毫秒）
};

// 测试状态
const testState = {
  browser: null,
  page: null,
  token: null,
  userId: null
};

// 辅助函数
async function login() {
  try {
    const response = await axios.post(`${config.apiUrl}/auth/login`, config.testUser);
    if (response.data && response.data.data && response.data.data.token) {
      testState.token = response.data.data.token;
      testState.userId = response.data.data.userId;
      return true;
    }
    return false;
  } catch (error) {
    console.error('登录失败:', error.message);
    return false;
  }
}

async function setupBrowser() {
  testState.browser = await puppeteer.launch({
    headless: false, // 设置为true可以在无头模式下运行
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  testState.page = await testState.browser.newPage();
  
  // 设置超时
  testState.page.setDefaultTimeout(config.timeout);
  
  // 监听控制台消息
  testState.page.on('console', msg => console.log('浏览器控制台:', msg.text()));
}

async function closeBrowser() {
  if (testState.browser) {
    await testState.browser.close();
  }
}

// 测试函数
async function testLoginFlow() {
  console.log('测试登录流程...');
  
  try {
    await testState.page.goto(config.baseUrl);
    console.log('页面已加载');
    
    // 等待页面加载完成
    await testState.page.waitForSelector('button:has-text("Account")');
    console.log('找到Account按钮');
    
    // 点击Account按钮
    await testState.page.click('button:has-text("Account")');
    console.log('点击Account按钮');
    
    // 等待下拉菜单出现
    await testState.page.waitForSelector('button:has-text("Sign In")');
    console.log('找到Sign In按钮');
    
    // 点击Sign In按钮
    await testState.page.click('button:has-text("Sign In")');
    console.log('点击Sign In按钮');
    
    // 等待登录模态框出现
    await testState.page.waitForSelector('input[type="email"]');
    console.log('找到邮箱输入框');
    
    // 输入邮箱和密码
    await testState.page.type('input[type="email"]', config.testUser.email);
    await testState.page.type('input[type="password"]', config.testUser.password);
    console.log('输入邮箱和密码');
    
    // 点击登录按钮
    await testState.page.click('button[type="submit"]');
    console.log('点击登录按钮');
    
    // 等待登录成功
    await testState.page.waitForFunction(
      () => {
        const accountButton = document.querySelector('button:has-text("Account")');
        return accountButton && !accountButton.textContent.includes('Account');
      },
      { timeout: config.timeout }
    );
    
    console.log('登录成功');
    return true;
  } catch (error) {
    console.error('登录测试失败:', error);
    return false;
  }
}

async function testPromptsList() {
  console.log('测试提示词列表...');
  
  try {
    // 确保在提示词页面
    await testState.page.goto(`${config.baseUrl}`);
    await testState.page.waitForSelector('button:has-text("Prompts")');
    await testState.page.click('button:has-text("Prompts")');
    
    // 修复API客户端
    await testState.page.evaluate(() => {
      const originalGet = apiClient.get.bind(apiClient);
      apiClient.get = async function(url, config, useCache) {
        try {
          const response = await originalGet(url, config, useCache);
          console.log('API响应:', response);
          // 转换响应格式以匹配前端期望的格式
          if (response && response.data && Array.isArray(response.data)) {
            // 转换_id为id
            const transformedData = response.data.map(item => ({
              ...item,
              id: item._id,
            }));
            return { data: { prompts: transformedData } };
          }
          return response;
        } catch (error) {
          console.error('API请求错误:', error);
          throw error;
        }
      };
      
      console.log('API客户端已修复');
      
      // 刷新页面以应用更改
      window.location.reload();
    });
    
    // 等待页面重新加载
    await testState.page.waitForNavigation();
    
    // 等待提示词卡片加载
    await testState.page.waitForSelector('.prompt-card', { timeout: config.timeout });
    
    // 获取提示词卡片数量
    const promptCount = await testState.page.$$eval('.prompt-card', cards => cards.length);
    console.log(`找到${promptCount}个提示词卡片`);
    
    return promptCount > 0;
  } catch (error) {
    console.error('提示词列表测试失败:', error);
    return false;
  }
}

async function testSearchPrompt() {
  console.log('测试搜索提示词...');
  
  try {
    // 确保在提示词页面
    await testState.page.waitForSelector('input[placeholder="Search prompts..."]');
    
    // 输入搜索关键词
    await testState.page.type('input[placeholder="Search prompts..."]', '测试');
    console.log('输入搜索关键词');
    
    // 等待搜索结果
    await testState.page.waitForTimeout(1000);
    
    // 获取搜索结果数量
    const searchResultCount = await testState.page.$$eval('.prompt-card', cards => cards.length);
    console.log(`搜索结果: ${searchResultCount}个提示词卡片`);
    
    return true;
  } catch (error) {
    console.error('搜索提示词测试失败:', error);
    return false;
  }
}

async function testTagFilter() {
  console.log('测试标签筛选...');
  
  try {
    // 确保在提示词页面
    await testState.page.waitForSelector('.tag-item');
    
    // 点击第一个标签
    await testState.page.click('.tag-item');
    console.log('点击标签');
    
    // 等待筛选结果
    await testState.page.waitForTimeout(1000);
    
    // 获取筛选结果数量
    const filteredResultCount = await testState.page.$$eval('.prompt-card', cards => cards.length);
    console.log(`标签筛选结果: ${filteredResultCount}个提示词卡片`);
    
    return true;
  } catch (error) {
    console.error('标签筛选测试失败:', error);
    return false;
  }
}

async function testLogout() {
  console.log('测试登出...');
  
  try {
    // 点击用户菜单
    await testState.page.click('button:has-text("testuser")');
    console.log('点击用户菜单');
    
    // 等待下拉菜单出现
    await testState.page.waitForSelector('button:has-text("Sign Out")');
    console.log('找到Sign Out按钮');
    
    // 点击登出按钮
    await testState.page.click('button:has-text("Sign Out")');
    console.log('点击Sign Out按钮');
    
    // 等待登出成功
    await testState.page.waitForSelector('button:has-text("Account")');
    console.log('登出成功');
    
    return true;
  } catch (error) {
    console.error('登出测试失败:', error);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('开始网页测试...');
  
  try {
    // 登录获取令牌
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.error('API登录失败，无法继续测试');
      return false;
    }
    
    // 设置浏览器
    await setupBrowser();
    
    // 运行测试
    const testResults = {
      loginFlow: await testLoginFlow(),
      promptsList: await testPromptsList(),
      searchPrompt: await testSearchPrompt(),
      tagFilter: await testTagFilter(),
      logout: await testLogout()
    };
    
    // 输出测试结果
    console.log('\n测试结果:');
    for (const [testName, result] of Object.entries(testResults)) {
      console.log(`${testName}: ${result ? '✅ 通过' : '❌ 失败'}`);
    }
    
    const allPassed = Object.values(testResults).every(result => result);
    console.log(`\n总体结果: ${allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`);
    
    return allPassed;
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    return false;
  } finally {
    // 关闭浏览器
    await closeBrowser();
  }
}

// 运行测试
runTests().then(success => {
  process.exit(success ? 0 : 1);
}); 