/**
 * 侧边栏管理器
 * 
 * 这个脚本负责在页面中创建和管理侧边栏，使其能够持续显示而不是作为弹出窗口
 */

// 创建侧边栏容器
function createSidebarContainer() {
  // 检查是否已存在侧边栏
  if (document.getElementById('aetherflow-sidebar-container')) {
    return;
  }

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

  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.id = 'aetherflow-sidebar-close';
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.left = '10px';
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
  closeButton.style.opacity = '0';
  closeButton.style.transition = 'opacity 0.3s ease';

  // 添加关闭按钮点击事件
  closeButton.addEventListener('click', () => {
    hideSidebar();
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

  // 添加鼠标悬停事件，显示关闭按钮
  container.addEventListener('mouseenter', () => {
    closeButton.style.opacity = '1';
  });

  container.addEventListener('mouseleave', () => {
    closeButton.style.opacity = '0';
  });

  console.log('[SidebarManager] 侧边栏容器已创建');
}

// 显示侧边栏
function showSidebar() {
  const container = document.getElementById('aetherflow-sidebar-container');
  if (container) {
    container.style.width = '400px';
    const toggleButton = document.getElementById('aetherflow-sidebar-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = '◀';
      toggleButton.setAttribute('data-state', 'expanded');
    }
    console.log('[SidebarManager] 侧边栏已显示');
  }
}

// 隐藏侧边栏
function hideSidebar() {
  const container = document.getElementById('aetherflow-sidebar-container');
  if (container) {
    container.style.width = '0';
    const toggleButton = document.getElementById('aetherflow-sidebar-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = '▶';
      toggleButton.setAttribute('data-state', 'collapsed');
    }
    console.log('[SidebarManager] 侧边栏已隐藏');
  }
}

// 折叠侧边栏（只显示一个小图标）
function collapseSidebar() {
  const container = document.getElementById('aetherflow-sidebar-container');
  if (container) {
    container.style.width = '20px';
    console.log('[SidebarManager] 侧边栏已折叠');
  }
}

// 展开侧边栏
function expandSidebar() {
  const container = document.getElementById('aetherflow-sidebar-container');
  if (container) {
    container.style.width = '400px';
    console.log('[SidebarManager] 侧边栏已展开');
  }
}

// 切换侧边栏显示状态
function toggleSidebar() {
  const container = document.getElementById('aetherflow-sidebar-container');
  if (container) {
    if (container.style.width === '0px' || container.style.width === '') {
      showSidebar();
    } else {
      hideSidebar();
    }
  } else {
    createSidebarContainer();
    showSidebar();
  }
}

// 创建浮动按钮
function createFloatingButton() {
  // 检查是否已存在浮动按钮
  if (document.getElementById('aetherflow-floating-button')) {
    return;
  }

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
}

// 初始化
function init() {
  console.log('[SidebarManager] 初始化');
  createFloatingButton();
  
  // 监听来自插件的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleSidebar') {
      toggleSidebar();
      sendResponse({ success: true });
    }
    return true;
  });
}

// 页面加载完成后初始化
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
} 