// 监听侧边栏关闭事件
window.addEventListener('unload', () => {
  // 通知后台脚本侧边栏已关闭
  chrome.runtime.sendMessage({ action: 'sidePanelClosed' });
});

// 添加侧边栏样式
document.addEventListener('DOMContentLoaded', () => {
  // 添加插件容器样式
  const style = document.createElement('style');
  style.textContent = `
    body {
      width: 100% !important;
      min-width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
      background-color: #1a1a1a;
      color: #ffffff;
      font-size: 0.9em; /* 缩小字体大小 */
    }
    
    #root {
      width: 100%;
      height: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }
    
    /* 调整卡片和容器的宽度 */
    .grid, .flex, .container, .space-y-4, .space-x-2, .space-x-3, .space-x-4 {
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      box-sizing: border-box !important;
    }
    
    /* 调整按钮和输入框的大小 */
    button, input, textarea, select {
      padding: 0.4em 0.6em !important;
      font-size: 0.9em !important;
    }
    
    /* 调整图标大小 */
    svg {
      transform: scale(0.9);
    }
    
    /* 调整边距和间距 */
    .p-4 {
      padding: 0.75rem !important;
    }
    
    .px-4 {
      padding-left: 0.75rem !important;
      padding-right: 0.75rem !important;
    }
    
    .py-4 {
      padding-top: 0.75rem !important;
      padding-bottom: 0.75rem !important;
    }
    
    .m-4 {
      margin: 0.75rem !important;
    }
    
    .mx-4 {
      margin-left: 0.75rem !important;
      margin-right: 0.75rem !important;
    }
    
    .my-4 {
      margin-top: 0.75rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    /* 调整间距 */
    .gap-4 {
      gap: 0.75rem !important;
    }
    
    /* 确保弹出菜单不会超出边界 */
    .absolute {
      max-width: calc(100% - 16px) !important;
    }
    
    /* 调整文本溢出处理 */
    .truncate, .line-clamp-1, .line-clamp-2, .line-clamp-3 {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    
    /* 调整卡片布局 */
    .rounded-lg {
      border-radius: 0.375rem !important;
    }
    
    /* 调整标签样式 */
    .text-xs {
      font-size: 0.65rem !important;
    }
    
    /* 调整标题大小 */
    h1, h2, h3, h4, h5, h6 {
      font-size: 95% !important;
    }
    
    /* 窄屏幕特定样式 */
    .narrow-sidebar .grid {
      grid-template-columns: 1fr !important;
    }
    
    .narrow-sidebar .flex {
      flex-wrap: wrap !important;
    }
    
    .narrow-sidebar .space-x-2 > *, 
    .narrow-sidebar .space-x-3 > *, 
    .narrow-sidebar .space-x-4 > * {
      margin-right: 0.25rem !important;
      margin-left: 0 !important;
    }
    
    .narrow-sidebar button, 
    .narrow-sidebar input, 
    .narrow-sidebar textarea, 
    .narrow-sidebar select {
      padding: 0.3em 0.5em !important;
      font-size: 0.85em !important;
    }
    
    .narrow-sidebar .p-4 {
      padding: 0.5rem !important;
    }
    
    .narrow-sidebar .px-4 {
      padding-left: 0.5rem !important;
      padding-right: 0.5rem !important;
    }
    
    .narrow-sidebar .py-4 {
      padding-top: 0.5rem !important;
      padding-bottom: 0.5rem !important;
    }
    
    /* 调整标签在窄屏幕上的显示 */
    .narrow-sidebar .text-xs {
      font-size: 0.6rem !important;
      padding: 0.1rem 0.3rem !important;
    }
    
    /* 调整卡片在窄屏幕上的边距 */
    .narrow-sidebar .rounded-lg {
      margin-bottom: 0.5rem !important;
    }
  `;
  document.head.appendChild(style);
  
  // 监听窗口大小变化，动态调整样式
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const width = entry.contentRect.width;
      // 根据侧边栏宽度动态调整样式
      if (width < 300) {
        document.body.classList.add('narrow-sidebar');
      } else {
        document.body.classList.remove('narrow-sidebar');
      }
    }
  });
  
  // 观察body元素的大小变化
  resizeObserver.observe(document.body);
}); 