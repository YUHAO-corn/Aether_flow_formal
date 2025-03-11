/**
 * 后台脚本
 * 
 * 处理扩展命令和消息传递
 */

console.log('[Background] 脚本已加载');

// 监听命令
chrome.commands.onCommand.addListener((command) => {
  console.log('[Background] 收到命令:', command);
  
  if (command === 'toggle-sidebar') {
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      if (activeTab && activeTab.id) {
        // 向内容脚本发送消息
        chrome.tabs.sendMessage(activeTab.id, { action: 'toggleSidebar' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Background] 发送消息时出错:', chrome.runtime.lastError);
          } else {
            console.log('[Background] 收到响应:', response);
          }
        });
      }
    });
  }
});

// 监听来自弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message);
  
  if (message.action === 'openSidebar') {
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      if (activeTab && activeTab.id) {
        // 向内容脚本发送消息
        chrome.tabs.sendMessage(activeTab.id, { action: 'toggleSidebar' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Background] 发送消息时出错:', chrome.runtime.lastError);
          } else {
            console.log('[Background] 收到响应:', response);
            sendResponse({ success: true });
          }
        });
      }
    });
    
    // 返回true表示将异步发送响应
    return true;
  }
});

// 当扩展安装或更新时
chrome.runtime.onInstalled.addListener(() => {
  console.log('AetherFlow 扩展已安装或更新');
});

export {};
