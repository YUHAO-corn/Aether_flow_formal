// 调整主页面内容
function adjustMainContent(isOpen) {
  // 获取主页面内容元素（通常是body或其直接子元素）
  const mainContent = document.body;
  
  if (isOpen) {
    // 侧边栏打开时，将主内容向左移动
    mainContent.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-right 300ms cubic-bezier(0.4, 0, 0.2, 1)';
    mainContent.style.transformOrigin = 'left top';
    mainContent.style.transform = 'translateX(-310px)'; // 300px侧边栏宽度 + 10px间距
    mainContent.style.width = 'calc(100% - 310px)';
    mainContent.style.marginRight = '310px';
  } else {
    // 侧边栏关闭时，恢复主内容位置
    mainContent.style.transform = 'translateX(0)';
    mainContent.style.width = '100%';
    mainContent.style.marginRight = '0';
  }
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'adjustMainContent') {
    adjustMainContent(message.isOpen);
  }
}); 