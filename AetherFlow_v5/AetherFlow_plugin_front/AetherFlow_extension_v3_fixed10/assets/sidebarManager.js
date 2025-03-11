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
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');

    // 处理iframe加载错误
    iframe.onerror = (error) => {
      console.error('[SidebarManager] iframe加载失败:', error);
    };

    // 处理iframe加载完成
    iframe.onload = () => {
      console.log('[SidebarManager] iframe加载完成');
      
      try {
        // 尝试访问iframe内容，可能会因为跨域问题失败
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        console.log('[SidebarManager] 成功访问iframe内容');
      } catch (error) {
        console.error('[SidebarManager] 无法访问iframe内容，可能是跨域问题:', error);
      }
    };

    // 创建样式元素，用于注入自定义CSS
    const style = document.createElement('style');
    style.textContent = `
      /* 隐藏右上角的折叠按钮 */
      button[aria-label="Collapse sidebar"],
      button[aria-label="折叠侧边栏"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // 监听iframe加载完成事件，注入自定义CSS
    iframe.addEventListener('load', () => {
      try {
        // 获取iframe的document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // 创建样式元素
        const style = document.createElement('style');
        style.textContent = `
          /* 隐藏右上角的折叠按钮 */
          button[aria-label="Collapse sidebar"],
          button[aria-label="折叠侧边栏"] {
            display: none !important;
          }
        `;
        
        // 将样式元素添加到iframe的head中
        iframeDoc.head.appendChild(style);
        
        console.log('[SidebarManager] 自定义CSS已注入到iframe');
      } catch (error) {
        console.error('[SidebarManager] 注入自定义CSS到iframe时出错:', error);
      }
    });

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.id = 'aetherflow-sidebar-close';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.zIndex = '10000';
    closeButton.style.opacity = '1';
    closeButton.style.transition = 'opacity 0.3s ease';

    // 添加关闭按钮点击事件
    closeButton.addEventListener('click', () => {
      // 完全关闭插件，而不是仅折叠
      const container = document.getElementById('aetherflow-sidebar-container');
      if (container) {
        // 移除整个容器
        document.body.removeChild(container);
        console.log('[SidebarManager] 侧边栏已完全关闭');
        
        // 显示浮动按钮，以便用户可以再次打开插件
        const floatingButton = document.getElementById('aetherflow-floating-button');
        if (floatingButton) {
          floatingButton.style.display = 'flex';
        } else {
          // 如果浮动按钮不存在，则创建一个
          createFloatingButton();
        }
      }
    });

    // 创建隐藏/展开按钮
    const toggleButton = document.createElement('button');
    toggleButton.id = 'aetherflow-sidebar-toggle';
    toggleButton.innerHTML = '◀';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '50%';
    toggleButton.style.left = '0';
    toggleButton.style.transform = 'translateY(-50%)';
    toggleButton.style.width = '20px';
    toggleButton.style.height = '60px';
    toggleButton.style.backgroundColor = '#6d28d9';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderTopRightRadius = '4px';
    toggleButton.style.borderBottomRightRadius = '4px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '10000';
    toggleButton.style.fontSize = '12px';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    toggleButton.style.transition = 'background-color 0.3s ease';
    toggleButton.setAttribute('data-state', 'expanded');

    // 添加隐藏/展开按钮点击事件
    toggleButton.addEventListener('click', () => {
      const state = toggleButton.getAttribute('data-state');
      if (state === 'expanded') {
        // 当前是展开状态，点击后隐藏
        collapseSidebar();
        toggleButton.innerHTML = '▶';
        toggleButton.setAttribute('data-state', 'collapsed');
      } else {
        // 当前是隐藏状态，点击后展开
        expandSidebar();
        toggleButton.innerHTML = '◀';
        toggleButton.setAttribute('data-state', 'expanded');
      }
    });

    // 添加隐藏/展开按钮悬停效果
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.backgroundColor = '#7c3aed';
    });

    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.backgroundColor = '#6d28d9';
    });

    // 添加元素到容器
    container.appendChild(iframe);
    container.appendChild(closeButton);
    container.appendChild(toggleButton);

    // 添加容器到页面
    document.body.appendChild(container);

    console.log('[SidebarManager] 侧边栏容器已创建');
  } catch (error) {
    console.error('[SidebarManager] 创建侧边栏容器时出错:', error);
  }
}

// 显示侧边栏
function showSidebar() {
  console.log('[SidebarManager] 尝试显示侧边栏');
  
  try {
    const container = document.getElementById('aetherflow-sidebar-container');
    if (container) {
      container.style.width = '400px';
      const toggleButton = document.getElementById('aetherflow-sidebar-toggle');
      if (toggleButton) {
        toggleButton.innerHTML = '◀';
        toggleButton.setAttribute('data-state', 'expanded');
      }
      console.log('[SidebarManager] 侧边栏已显示');
    } else {
      console.log('[SidebarManager] 侧边栏容器不存在，先创建再显示');
      createSidebarContainer();
      setTimeout(() => {
        const newContainer = document.getElementById('aetherflow-sidebar-container');
        if (newContainer) {
          newContainer.style.width = '400px';
        }
      }, 100);
    }
  } catch (error) {
    console.error('[SidebarManager] 显示侧边栏时出错:', error);
  }
}

// 隐藏侧边栏
function hideSidebar() {
  console.log('[SidebarManager] 尝试隐藏侧边栏');
  
  try {
    const container = document.getElementById('aetherflow-sidebar-container');
    if (container) {
      container.style.width = '0';
      const toggleButton = document.getElementById('aetherflow-sidebar-toggle');
      if (toggleButton) {
        toggleButton.innerHTML = '▶';
        toggleButton.setAttribute('data-state', 'collapsed');
      }
      console.log('[SidebarManager] 侧边栏已隐藏');
    } else {
      console.log('[SidebarManager] 侧边栏容器不存在，无法隐藏');
    }
  } catch (error) {
    console.error('[SidebarManager] 隐藏侧边栏时出错:', error);
  }
}

// 折叠侧边栏（只显示一个小图标）
function collapseSidebar() {
  console.log('[SidebarManager] 尝试折叠侧边栏');
  
  try {
    const container = document.getElementById('aetherflow-sidebar-container');
    if (container) {
      container.style.width = '20px';
      console.log('[SidebarManager] 侧边栏已折叠');
    } else {
      console.log('[SidebarManager] 侧边栏容器不存在，无法折叠');
    }
  } catch (error) {
    console.error('[SidebarManager] 折叠侧边栏时出错:', error);
  }
}

// 展开侧边栏
function expandSidebar() {
  console.log('[SidebarManager] 尝试展开侧边栏');
  
  try {
    const container = document.getElementById('aetherflow-sidebar-container');
    if (container) {
      container.style.width = '400px';
      console.log('[SidebarManager] 侧边栏已展开');
    } else {
      console.log('[SidebarManager] 侧边栏容器不存在，无法展开');
    }
  } catch (error) {
    console.error('[SidebarManager] 展开侧边栏时出错:', error);
  }
}

// 切换侧边栏显示状态
function toggleSidebar() {
  console.log('[SidebarManager] 尝试切换侧边栏显示状态');
  
  try {
    const container = document.getElementById('aetherflow-sidebar-container');
    if (container) {
      if (container.style.width === '0px' || container.style.width === '') {
        showSidebar();
      } else {
        hideSidebar();
      }
    } else {
      console.log('[SidebarManager] 侧边栏容器不存在，创建并显示');
      createSidebarContainer();
      showSidebar();
    }
  } catch (error) {
    console.error('[SidebarManager] 切换侧边栏显示状态时出错:', error);
    
    // 尝试重新创建
    try {
      createSidebarContainer();
      showSidebar();
    } catch (innerError) {
      console.error('[SidebarManager] 重新创建侧边栏失败:', innerError);
    }
  }
}

// 创建浮动按钮
function createFloatingButton() {
  console.log('[SidebarManager] 尝试创建浮动按钮');
  
  // 检查是否已存在浮动按钮
  if (document.getElementById('aetherflow-floating-button')) {
    console.log('[SidebarManager] 浮动按钮已存在，跳过创建');
    return;
  }

  try {
    // 创建浮动按钮
    const button = document.createElement('button');
    button.id = 'aetherflow-floating-button';
    button.innerHTML = '<span style="font-size: 20px;">✧</span>';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = '#6d28d9';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9998';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'transform 0.3s ease, background-color 0.3s ease';

    // 添加悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.backgroundColor = '#7c3aed';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = '#6d28d9';
    });

    // 添加点击事件
    button.addEventListener('click', () => {
      toggleSidebar();
    });

    // 添加按钮到页面
    document.body.appendChild(button);

    console.log('[SidebarManager] 浮动按钮已创建');
  } catch (error) {
    console.error('[SidebarManager] 创建浮动按钮时出错:', error);
  }
}

// 初始化
function init() {
  console.log('[SidebarManager] 初始化');
  
  try {
    // 创建浮动按钮
    createFloatingButton();
    
    // 监听来自插件的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[SidebarManager] 收到消息:', message.action);
      
      if (message.action === 'toggleSidebar') {
        toggleSidebar();
        sendResponse({ success: true });
      }
      return true;
    });
    
    console.log('[SidebarManager] 初始化完成');
  } catch (error) {
    console.error('[SidebarManager] 初始化时出错:', error);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'complete') {
  console.log('[SidebarManager] 页面已加载完成，立即初始化');
  init();
} else {
  console.log('[SidebarManager] 页面正在加载，等待加载完成后初始化');
  window.addEventListener('load', () => {
    console.log('[SidebarManager] 页面加载完成，开始初始化');
    init();
  });
}

// 导出函数，使其可以被直接调用
window.aetherflowSidebar = {
  toggle: toggleSidebar,
  show: showSidebar,
  hide: hideSidebar,
  collapse: collapseSidebar,
  expand: expandSidebar
}; 