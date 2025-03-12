// 后台脚本，处理扩展的后台任务
console.log('AetherFlow 后台脚本已加载');

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装
    console.log('AetherFlow 扩展已安装');
    
    // 初始化存储
    chrome.storage.local.set({
      userSettings: {
        theme: 'dark',
        autoSave: true,
        enhancementModel: 'gpt-4'
      },
      promptLibrary: [],
      savedPrompts: []
    });
    
    // 打开选项页面
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    // 扩展更新
    console.log('AetherFlow 扩展已更新');
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('收到消息:', message);
  
  if (message.action === 'promptImageTrigger') {
    // 打开侧边栏
    chrome.sidePanel.open();
    
    // 通知侧边栏打开提示词图像组件
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'openPromptImage' });
    }, 500);
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'insertPrompt') {
    // 转发消息到当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: '未找到活动标签页' });
      }
    });
    return true;
  }
});

// 设置侧边栏行为
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 导出空对象使其成为模块
export {}; 