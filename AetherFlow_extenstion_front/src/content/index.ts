// 内容脚本，用于在网页中注入功能
console.log('AetherFlow 内容脚本已加载');

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'insertPrompt') {
    insertPromptToActiveElement(message.text);
    sendResponse({ success: true });
    return true;
  }
});

// 将提示词插入到当前活动元素
function insertPromptToActiveElement(text: string) {
  const activeElement = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
  
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
    
    console.log('提示词已插入');
  } else {
    console.log('未找到可插入的输入框');
    
    // 尝试查找常见的AI平台输入框
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
      // 找到最后一个textarea，通常是输入框
      const lastTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      lastTextarea.value = text;
      lastTextarea.focus();
      
      // 触发输入事件
      const inputEvent = new Event('input', { bubbles: true });
      lastTextarea.dispatchEvent(inputEvent);
      
      console.log('提示词已插入到找到的输入框');
    }
  }
}

// 监听页面上的提示词输入
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement && 
      (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) {
    // 通知插件侧边栏
    chrome.runtime.sendMessage({ action: 'promptImageTrigger' }, (response) => {
      console.log('触发提示词图像功能', response);
    });
  }
});

// 自动保存提示词
function autoSavePrompt() {
  // 查找页面上的提示词和回答
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length > 0) {
    const lastTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
    const promptContent = lastTextarea.value.trim();
    
    if (promptContent && promptContent.length > 5) {
      // 获取平台信息
      const platform = getPlatformInfo();
      
      // 保存提示词
      chrome.storage.local.get(['savedPrompts'], (result) => {
        const savedPrompts = result.savedPrompts || [];
        
        // 检查是否已存在相同内容
        const isDuplicate = savedPrompts.some((prompt: any) => prompt.content === promptContent);
        
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
          console.log('提示词已自动保存');
        }
      });
    }
  }
}

// 获取当前平台信息
function getPlatformInfo(): string {
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

// 导出空对象使其成为模块
export {}; 