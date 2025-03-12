// 简单的日志函数
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  try {
    // 发送日志到后台脚本
    chrome.runtime.sendMessage({
      action: 'log',
      message,
      data
    });
  } catch (err) {
    // 如果发送失败，则在控制台输出
    if (data) {
      console.log(`[${timestamp}] [CONTENT] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [CONTENT] ${message}`);
    }
  }
};

// 获取当前平台
function getCurrentPlatform() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('openai.com')) {
    return 'ChatGPT';
  } else if (hostname.includes('claude.ai') || hostname.includes('anthropic.com')) {
    return 'Claude';
  } else if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
    return 'Gemini';
  }
  
  return 'Unknown';
}

// 将提示词插入到当前活动的输入元素
function insertPromptToActiveElement(promptText) {
  try {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      log('插入提示词到活动元素', { 
        elementType: activeElement.tagName,
        elementId: activeElement.id,
        promptLength: promptText.length
      });
      
      // 获取当前光标位置
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;
      
      // 获取当前值
      const currentValue = activeElement.value;
      
      // 在光标位置插入提示词
      const newValue = currentValue.substring(0, startPos) + promptText + currentValue.substring(endPos);
      
      // 更新输入元素的值
      activeElement.value = newValue;
      
      // 更新光标位置到插入文本之后
      const newCursorPos = startPos + promptText.length;
      activeElement.setSelectionRange(newCursorPos, newCursorPos);
      
      // 触发输入事件，通知网页内容已更改
      const inputEvent = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(inputEvent);
      
      log('提示词插入成功');
    } else {
      log('未找到活动的输入元素', { 
        activeElement: activeElement ? activeElement.tagName : 'none'
      });
    }
  } catch (err) {
    log('插入提示词失败', { error: err.message });
  }
}

// 自动保存最后一个活动的TEXTAREA中的提示词
let lastActiveTextarea = null;
let lastSavedContent = '';

// 监听文档中的焦点变化
document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'TEXTAREA') {
    lastActiveTextarea = e.target;
    log('文本区域获得焦点', { 
      elementId: e.target.id || 'unknown'
    });
  }
});

// 每10秒检查一次是否有新的提示词需要保存
setInterval(() => {
  try {
    if (lastActiveTextarea && lastActiveTextarea.value && lastActiveTextarea.value.trim() !== '') {
      const currentContent = lastActiveTextarea.value;
      
      // 如果内容与上次保存的不同，则保存
      if (currentContent !== lastSavedContent) {
        lastSavedContent = currentContent;
        
        // 创建提示词对象
        const promptToSave = {
          content: currentContent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          platform: getCurrentPlatform()
        };
        
        log('自动保存提示词', { 
          platform: promptToSave.platform,
          contentLength: currentContent.length
        });
        
        // 发送消息到后台脚本保存提示词
        chrome.runtime.sendMessage({
          action: 'savePrompt',
          prompt: promptToSave
        }, (response) => {
          if (response && response.success) {
            log('提示词保存成功');
          } else {
            log('提示词保存失败', { reason: response ? response.reason : 'unknown' });
          }
        });
      }
    }
  } catch (err) {
    log('自动保存提示词失败', { error: err.message });
  }
}, 10000);

// 控制主页面布局
const PLUGIN_WIDTH = 300; // 插件宽度，单位像素
const MARGIN = 10; // 主页面与插件之间的间距，单位像素
const TRANSITION_DURATION = 300; // 过渡动画时长，单位毫秒

// 创建样式元素
const createStyleElement = () => {
  const styleEl = document.createElement('style');
  styleEl.id = 'aetherflow-layout-styles';
  styleEl.textContent = `
    body {
      transition: transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left top;
      will-change: transform;
      margin-right: 0;
    }
    
    body.aetherflow-expanded {
      transform: translateX(-${PLUGIN_WIDTH + MARGIN}px);
    }
  `;
  document.head.appendChild(styleEl);
  log('添加布局样式');
};

// 更新主页面布局
const updateMainPageLayout = (isExpanded) => {
  try {
    if (isExpanded) {
      document.body.classList.add('aetherflow-expanded');
      log('展开插件，主页面右移');
    } else {
      document.body.classList.remove('aetherflow-expanded');
      log('折叠插件，主页面复位');
    }
  } catch (err) {
    log('更新主页面布局失败', { error: err.message });
  }
};

// 初始化布局
const initLayout = () => {
  try {
    // 创建样式元素
    createStyleElement();
    
    // 从存储中获取插件状态
    chrome.storage.local.get(['isExpanded'], (result) => {
      if (result.isExpanded) {
        updateMainPageLayout(true);
        log('初始化布局：插件展开');
      } else {
        log('初始化布局：插件折叠');
      }
    });
    
    log('布局初始化完成');
  } catch (err) {
    log('布局初始化失败', { error: err.message });
  }
};

// 初始化内容脚本
log('内容脚本已加载', { 
  url: window.location.href,
  platform: getCurrentPlatform()
});

// 初始化布局
initLayout();

// 监听来自扩展程序的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('收到消息', { action: message.action });
  
  if (message.action === 'insertPrompt') {
    insertPromptToActiveElement(message.prompt);
    sendResponse({ success: true });
  } else if (message.action === 'toggleExpand') {
    updateMainPageLayout(message.isExpanded);
    sendResponse({ success: true });
  }
  
  return true;
}); 