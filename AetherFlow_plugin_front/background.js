// 设置侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  // 打开侧边栏
  await chrome.sidePanel.open({ tabId: tab.id });
  
  // 向侧边栏发送消息，通知其调整布局
  chrome.tabs.sendMessage(tab.id, { action: 'adjustMainContent', isOpen: true });
});

// 监听侧边栏关闭事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sidePanelClosed') {
    // 向内容脚本发送消息，通知其恢复主页面布局
    chrome.tabs.sendMessage(sender.tab.id, { action: 'adjustMainContent', isOpen: false });
  }
}); 