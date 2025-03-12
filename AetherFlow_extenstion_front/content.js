// 内容脚本，用于在网页中注入功能
console.log('AetherFlow 内容脚本已加载');

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
  console.log('AetherFlow: 添加布局样式');
};

// 更新主页面布局
const updateMainPageLayout = (isExpanded) => {
  try {
    if (isExpanded) {
      document.body.classList.add('aetherflow-expanded');
      console.log('AetherFlow: 展开插件，主页面右移');
    } else {
      document.body.classList.remove('aetherflow-expanded');
      console.log('AetherFlow: 折叠插件，主页面复位');
    }
  } catch (err) {
    console.error('AetherFlow: 更新主页面布局失败', err);
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
        console.log('AetherFlow: 初始化布局：插件展开');
      } else {
        console.log('AetherFlow: 初始化布局：插件折叠');
      }
    });
    
    console.log('AetherFlow: 布局初始化完成');
  } catch (err) {
    console.error('AetherFlow: 布局初始化失败', err);
  }
};

// 初始化布局
initLayout();

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'insertPrompt') {
    insertPromptToActiveElement(message.text || message.prompt);
    sendResponse({ success: true });
    return true;
  } else if (message.action === 'toggleExpand') {
    updateMainPageLayout(message.isExpanded);
    sendResponse({ success: true });
    return true;
  }
});

// 将提示词插入到当前活动元素
function insertPromptToActiveElement(text) {
  const activeElement = document.activeElement;
  
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    // 获取当前光标位置
    const startPos = activeElement.selectionStart || 0;
    const endPos = activeElement.selectionEnd || 0;
    
    // 获取当前值
    const currentValue = activeElement.value;
    
    // 插入提示词
    const newValue = currentValue.substring(0, startPos) + text + currentValue.substring(endPos);
    activeElement.value = newValue;
    
    // 设置新的光标位置
    const newCursorPos = startPos + text.length;
    activeElement.setSelectionRange(newCursorPos, newCursorPos);
    
    // 触发输入事件，以便网页可以检测到变化
    const inputEvent = new Event('input', { bubbles: true });
    activeElement.dispatchEvent(inputEvent);
    
    console.log('AetherFlow: 提示词已插入');
  } else {
    console.log('AetherFlow: 未找到可插入的输入框');
    
    // 尝试查找常见的AI平台输入框
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
      // 找到最后一个textarea，通常是输入框
      const lastTextarea = textareas[textareas.length - 1];
      lastTextarea.value = text;
      lastTextarea.focus();
      
      // 触发输入事件
      const inputEvent = new Event('input', { bubbles: true });
      lastTextarea.dispatchEvent(inputEvent);
      
      console.log('AetherFlow: 提示词已插入到找到的输入框');
    }
  }
}

// 监听页面上的提示词输入
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement && 
      (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) {
    // 通知插件侧边栏
    chrome.runtime.sendMessage({ action: 'promptImageTrigger' }, (response) => {
      console.log('AetherFlow: 触发提示词图像功能', response);
    });
  }
});

// 自动保存提示词
function autoSavePrompt() {
  // 查找页面上的提示词和回答
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length > 0) {
    const lastTextarea = textareas[textareas.length - 1];
    const promptContent = lastTextarea.value.trim();
    
    if (promptContent && promptContent.length > 5) {
      // 获取平台信息
      const platform = getPlatformInfo();
      
      // 保存提示词
      chrome.storage.local.get(['savedPrompts'], (result) => {
        const savedPrompts = result.savedPrompts || [];
        
        // 检查是否已存在相同内容
        const isDuplicate = savedPrompts.some((prompt) => prompt.content === promptContent);
        
        if (!isDuplicate) {
          const newPrompt = {
            id: Date.now().toString(),
            content: promptContent,
            platform,
            timestamp: new Date().toISOString(),
            url: window.location.href
          };
          
          // 限制保存数量为100条
          const updatedPrompts = [newPrompt, ...savedPrompts].slice(0, 100);
          chrome.storage.local.set({ savedPrompts: updatedPrompts });
          console.log('AetherFlow: 提示词已自动保存');
        }
      });
    }
  }
}

// 获取当前平台信息
function getPlatformInfo() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('openai.com') || hostname.includes('chat.openai.com')) {
    return 'ChatGPT';
  } else if (hostname.includes('claude.ai')) {
    return 'Claude';
  } else if (hostname.includes('bard.google.com') || hostname.includes('gemini.google.com')) {
    return 'Gemini';
  } else {
    return '未知平台';
  }
}

// 定期检查并保存提示词
setInterval(autoSavePrompt, 10000); // 每10秒检查一次 