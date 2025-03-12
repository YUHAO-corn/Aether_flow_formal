// 简单的日志函数
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] [BACKGROUND] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [BACKGROUND] ${message}`);
  }
};

// 获取当前插件状态
const getPluginState = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isExpanded'], (result) => {
      resolve({
        isExpanded: result.isExpanded === undefined ? false : result.isExpanded
      });
    });
  });
};

// 更新插件状态
const updatePluginState = async (state) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(state, () => {
      resolve();
    });
  });
};

// 通知所有内容脚本更新布局
const notifyContentScripts = async (isExpanded) => {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toggleExpand',
          isExpanded
        });
        log('已通知内容脚本更新布局', { tabId: tab.id, isExpanded });
      } catch (err) {
        // 忽略无法发送消息的标签页（可能没有内容脚本）
      }
    }
  } catch (err) {
    log('通知内容脚本失败', { error: err.message });
  }
};

// 切换插件展开/折叠状态
const togglePluginExpand = async () => {
  try {
    const state = await getPluginState();
    const newState = { isExpanded: !state.isExpanded };
    
    await updatePluginState(newState);
    await notifyContentScripts(newState.isExpanded);
    
    log('切换插件状态', { isExpanded: newState.isExpanded });
    
    return newState.isExpanded;
  } catch (err) {
    log('切换插件状态失败', { error: err.message });
    return false;
  }
};

// 监听扩展程序图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // 切换插件展开/折叠状态
    const isExpanded = await togglePluginExpand();
    
    // 如果是展开状态，则打开侧边栏
    if (isExpanded) {
      chrome.sidePanel.open({ tabId: tab.id });
      log('侧边栏已打开', { tabId: tab.id });
    }
  } catch (err) {
    log('处理图标点击事件失败', { error: err.message, tabId: tab.id });
  }
});

// 监听来自内容脚本或侧边栏的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('收到消息', { message, sender: sender.id });
  
  if (message.action === 'insertPrompt') {
    // 将消息转发到当前活动标签页的内容脚本
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'insertPrompt',
            prompt: message.prompt
          });
          log('转发插入提示词消息', { tabId: tabs[0].id });
        } catch (err) {
          log('转发插入提示词消息失败', { error: err.message, tabId: tabs[0].id });
        }
      } else {
        log('未找到活动标签页');
      }
    });
  } else if (message.action === 'savePrompt') {
    // 保存提示词到存储
    chrome.storage.local.get(['savedPrompts'], (result) => {
      const savedPrompts = result.savedPrompts || [];
      
      // 检查是否已存在相同内容的提示词
      const isDuplicate = savedPrompts.some(p => p.content === message.prompt.content);
      
      if (!isDuplicate) {
        savedPrompts.unshift(message.prompt);
        
        // 限制保存的提示词数量为100个
        const limitedPrompts = savedPrompts.slice(0, 100);
        
        chrome.storage.local.set({ savedPrompts: limitedPrompts }, () => {
          log('保存提示词成功', { promptCount: limitedPrompts.length });
          sendResponse({ success: true });
        });
      } else {
        log('提示词已存在，跳过保存');
        sendResponse({ success: false, reason: 'duplicate' });
      }
    });
    
    // 返回true表示将异步发送响应
    return true;
  } else if (message.action === 'log') {
    // 处理来自内容脚本的日志
    log(`[CONTENT] ${message.message}`, message.data);
  } else if (message.action === 'toggleExpand') {
    // 处理来自侧边栏的展开/折叠请求
    togglePluginExpand().then(isExpanded => {
      sendResponse({ success: true, isExpanded });
    });
    return true;
  } else if (message.action === 'getPluginState') {
    // 获取插件状态
    getPluginState().then(state => {
      sendResponse({ success: true, ...state });
    });
    return true;
  }
});

// 初始化侧边栏
chrome.runtime.onInstalled.addListener((details) => {
  log('扩展程序已安装或更新', { reason: details.reason });
  
  // 设置默认配置
  chrome.storage.local.get(['autoSaveEnabled', 'smartSuggestionsEnabled', 'isExpanded'], (result) => {
    const updates = {};
    
    if (result.autoSaveEnabled === undefined) {
      updates.autoSaveEnabled = true;
      log('设置默认自动保存为启用');
    }
    
    if (result.smartSuggestionsEnabled === undefined) {
      updates.smartSuggestionsEnabled = true;
      log('设置默认智能建议为启用');
    }
    
    if (result.isExpanded === undefined) {
      updates.isExpanded = false;
      log('设置默认插件状态为折叠');
    }
    
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
}); 