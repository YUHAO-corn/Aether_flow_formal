// AetherFlow 浏览器插件内容脚本
// 用于在AI平台页面上捕获提示词和响应

// 全局变量
let isListening = false;
let currentPlatform = '';
let observer = null;
let lastSavedContent = '';
let debounceTimer = null;

// 防抖函数
function debounce(func, wait) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), wait);
  };
}

// 获取选择器
function getSelectors(platform) {
  switch (platform) {
    case 'ChatGPT':
      return {
        promptSelector: 'textarea[data-id="root"]',
        responseSelector: '.markdown'
      };
    case 'Claude':
      return {
        promptSelector: 'textarea.ProseMirror',
        responseSelector: '.claude-response, .prose'
      };
    case 'Bard':
      return {
        promptSelector: 'input[aria-label="Ask something"], textarea[aria-label="Ask Gemini"]',
        responseSelector: '.response-content, .gemini-response'
      };
    case 'Bing':
      return {
        promptSelector: 'textarea#searchbox',
        responseSelector: '.response-message-content'
      };
    case 'Phind':
      return {
        promptSelector: 'textarea.w-full',
        responseSelector: '.chat-answer'
      };
    case 'Perplexity':
      return {
        promptSelector: 'textarea[placeholder*="Ask"]',
        responseSelector: '.prose'
      };
    case 'Anthropic':
      return {
        promptSelector: 'div[contenteditable="true"]',
        responseSelector: '.answer-container'
      };
    default:
      return {
        promptSelector: 'textarea, input[type="text"], div[contenteditable="true"]',
        responseSelector: '.response, .answer, .result, .markdown, .prose'
      };
  }
}

// 检测平台
function detectPlatform() {
  const url = window.location.href;
  if (url.includes('chat.openai.com')) return 'ChatGPT';
  if (url.includes('claude.ai')) return 'Claude';
  if (url.includes('bard.google.com') || url.includes('gemini.google.com')) return 'Bard';
  if (url.includes('bing.com/chat')) return 'Bing';
  if (url.includes('phind.com')) return 'Phind';
  if (url.includes('perplexity.ai')) return 'Perplexity';
  if (url.includes('anthropic.com')) return 'Anthropic';
  return 'Unknown';
}

// 自动保存提示词
const autoSavePrompt = debounce(async (content, response) => {
  if (!content || content.trim().length < 10 || content === lastSavedContent) {
    return;
  }
  
  try {
    // 发送消息到后台脚本，由后台脚本调用API
    chrome.runtime.sendMessage({
      action: 'autoSavePrompt',
      data: {
        content: content,
        response: response || '',
        platform: currentPlatform,
        url: window.location.href
      }
    }, (response) => {
      if (response && response.success) {
        lastSavedContent = content;
        // 通知插件UI更新
        chrome.runtime.sendMessage({
          action: 'promptSaved',
          data: {
            content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // 通知插件UI保存失败
        chrome.runtime.sendMessage({
          action: 'promptSaveError',
          error: response ? response.error : 'Unknown error'
        });
      }
    });
  } catch (error) {
    console.error('自动保存提示词失败:', error);
    // 通知插件UI保存失败
    chrome.runtime.sendMessage({
      action: 'promptSaveError',
      error: error.message
    });
  }
}, 2000);

// 获取元素内容
function getElementContent(element) {
  if (!element) return '';
  
  // 处理不同类型的输入元素
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    return element.value || '';
  } else if (element.getAttribute('contenteditable') === 'true') {
    return element.textContent || element.innerText || '';
  } else {
    return element.textContent || element.innerText || '';
  }
}

// 开始监听
function startListening(platform) {
  if (isListening) return;
  
  // 如果未指定平台，自动检测
  currentPlatform = platform || detectPlatform();
  const selectors = getSelectors(currentPlatform);
  
  // 创建MutationObserver监听DOM变化
  observer = new MutationObserver((mutations) => {
    // 查找提示词输入框
    const promptElement = document.querySelector(selectors.promptSelector);
    if (!promptElement) return;
    
    // 查找响应内容
    const responseElements = document.querySelectorAll(selectors.responseSelector);
    let responseText = '';
    if (responseElements.length > 0) {
      // 获取最后一个响应元素的文本内容
      const lastResponse = responseElements[responseElements.length - 1];
      responseText = lastResponse.textContent || '';
    }
    
    // 获取提示词内容
    const promptContent = getElementContent(promptElement);
    
    // 如果有提示词内容，尝试自动保存
    if (promptContent && promptContent.trim().length > 10) {
      autoSavePrompt(promptContent, responseText);
    }
  });
  
  // 开始监听DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
  
  isListening = true;
  console.log(`AetherFlow: 开始监听 ${currentPlatform} 提示词`);
}

// 停止监听
function stopListening() {
  if (!isListening || !observer) return;
  
  observer.disconnect();
  observer = null;
  isListening = false;
  console.log('AetherFlow: 停止监听提示词');
}

// 监听来自插件的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startAutoSave') {
    startListening(message.platform);
    sendResponse({ success: true });
  } else if (message.action === 'stopAutoSave') {
    stopListening();
    sendResponse({ success: true });
  } else if (message.action === 'checkPlatform') {
    // 新增：检查当前平台
    const platform = detectPlatform();
    sendResponse({ 
      success: true, 
      platform: platform,
      isSupported: platform !== 'Unknown'
    });
  }
  
  // 返回true表示异步响应
  return true;
});

// 初始化 - 自动检测平台并开始监听
(function initialize() {
  const platform = detectPlatform();
  if (platform !== 'Unknown') {
    // 自动启动监听
    startListening(platform);
  }
  console.log('AetherFlow 内容脚本已加载，平台:', platform);
})();

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