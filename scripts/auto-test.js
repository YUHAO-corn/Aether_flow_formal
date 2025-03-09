// 测试用户注册
async testRegistration(username, email, password) {
  log(`测试用户注册: ${username}, ${email}`);
  
  // 导航到设置页面
  await this.page.goto('http://localhost:5173/');
  await this.waitForElement('.h-screen');
  
  // ... existing code ...
} 