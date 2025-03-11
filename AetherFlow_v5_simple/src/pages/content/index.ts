/**
 * 侧边栏管理器
 * 
 * 这个脚本负责在页面中创建和管理侧边栏，使其能够持续显示而不是作为弹出窗口
 */

console.log('[SidebarManager] 脚本已加载');

// 创建侧边栏容器
function createSidebarContainer() {
  console.log('[SidebarManager] 开始创建侧边栏容器');
  
  // 检查是否已存在侧边栏
  if (document.getElementById('aetherflow-sidebar-container')) {
    console.log('[SidebarManager] 侧边栏容器已存在，跳过创建');
    return;
  }

  try {
    // 创建侧边栏容器
    const container = document.createElement('div');
    container.id = 'aetherflow-sidebar-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.height = '100vh';
    container.style.width = '0';
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';
    container.style.transition = 'width 0.3s ease';
    container.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.3)';

    // 创建iframe来加载插件内容
    const iframe = document.createElement('iframe');
    iframe.id = 'aetherflow-sidebar-iframe';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.src = chrome.runtime.getURL('src/pages/sidepanel/index.html');
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');

    // 处理iframe加载错误
    iframe.onerror = (error) => {
      console.error('[SidebarManager] iframe加载失败:', error);
    };

    // 处理iframe加载完成
    iframe.onload = () => {
      console.log('[SidebarManager] iframe加载完成');
    };

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.id = 'aetherflow-sidebar-close';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.background = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.fontSize = '20px';
    closeButton.style.lineHeight = '1';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '10000';
    closeButton.style.display = 'none';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.padding = '0';
    closeButton.style.opacity = '0.7';
    closeButton.style.transition = 'opacity 0.2s ease';

    closeButton.addEventListener('mouseover', () => {
      closeButton.style.opacity = '1';
    });

    closeButton.addEventListener('mouseout', () => {
      closeButton.style.opacity = '0.7';
    });

    closeButton.addEventListener('click', () => {
      hideSidebar();
    });

    // 创建浮动按钮，用于重新打开侧边栏
    const floatingButton = createFloatingButton();

    // 将元素添加到DOM
    container.appendChild(iframe);
    container.appendChild(closeButton);
    document.body.appendChild(container);
    document.body.appendChild(floatingButton);

    console.log('[SidebarManager] 侧边栏容器创建完成');
  } catch (error) {
    console.error('[SidebarManager] 创建侧边栏容器时出错:', error);
  }
}

// 显示侧边栏
function showSidebar() {
  console.log('[SidebarManager] 显示侧边栏');
  
  const container = document.getElementById('aetherflow-sidebar-container');
  const closeButton = document.getElementById('aetherflow-sidebar-close');
  const floatingButton = document.getElementById('aetherflow-floating-button');
  
  if (container && closeButton && floatingButton) {
    container.style.width = '400px';
    closeButton.style.display = 'flex';
    floatingButton.style.display = 'none';
  } else {
    console.error('[SidebarManager] 无法找到侧边栏元素');
    
    // 如果元素不存在，尝试重新创建
    createSidebarContainer();
    setTimeout(showSidebar, 100);
  }
}

// 隐藏侧边栏
function hideSidebar() {
  console.log('[SidebarManager] 隐藏侧边栏');
  
  const container = document.getElementById('aetherflow-sidebar-container');
  const closeButton = document.getElementById('aetherflow-sidebar-close');
  const floatingButton = document.getElementById('aetherflow-floating-button');
  
  if (container && closeButton && floatingButton) {
    container.style.width = '0';
    closeButton.style.display = 'none';
    floatingButton.style.display = 'flex';
  } else {
    console.error('[SidebarManager] 无法找到侧边栏元素');
  }
}

// 创建浮动按钮
function createFloatingButton() {
  console.log('[SidebarManager] 创建浮动按钮');
  
  const button = document.createElement('button');
  button.id = 'aetherflow-floating-button';
  button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  button.style.position = 'fixed';
  button.style.top = '50%';
  button.style.right = '0';
  button.style.transform = 'translateY(-50%)';
  button.style.width = '40px';
  button.style.height = '40px';
  button.style.background = '#7c3aed';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '8px 0 0 8px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9998';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.padding = '0';
  button.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.2)';
  button.style.transition = 'background 0.2s ease';

  button.addEventListener('mouseover', () => {
    button.style.background = '#6d28d9';
  });

  button.addEventListener('mouseout', () => {
    button.style.background = '#7c3aed';
  });

  button.addEventListener('click', () => {
    showSidebar();
  });

  return button;
}

// 初始化
function init() {
  console.log('[SidebarManager] 初始化');
  
  // 创建侧边栏容器
  createSidebarContainer();
  
  // 监听来自扩展的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[SidebarManager] 收到消息:', message);
    
    if (message.action === 'toggleSidebar') {
      const container = document.getElementById('aetherflow-sidebar-container');
      
      if (container && container.style.width === '0px') {
        showSidebar();
      } else {
        hideSidebar();
      }
      
      sendResponse({ success: true });
    }
  });
}

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {}; 