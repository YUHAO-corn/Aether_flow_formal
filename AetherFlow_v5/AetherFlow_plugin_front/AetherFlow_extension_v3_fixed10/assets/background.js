/**
 * 自动保存后台脚本
 * 
 * 这个脚本负责接收内容脚本发送的对话内容，并将其保存到本地存储或发送到后端API
 */

// 保存最近的对话历史（最多100条）
const MAX_HISTORY_SIZE = 100;

// 初始化本地存储
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 扩展已安装，初始化本地存储');
  
  // 初始化保存状态
  chrome.storage.local.set({ 
    'saveStatus': 'idle',
    'autoSaveEnabled': true,
    'conversationHistory': []
  }, () => {
    console.log('[Background] 本地存储已初始化');
  });
});

/**
 * 保存对话内容到本地存储
 * @param {Array} conversations - 对话内容数组
 */
function saveConversationsToLocal(conversations) {
  console.log('[Background] 保存对话内容到本地存储:', conversations.length);
  
  if (!conversations || conversations.length === 0) {
    console.log('[Background] 没有对话内容需要保存');
    return;
  }
  
  // 为每个对话添加唯一ID和时间戳（如果没有）
  const processedConversations = conversations.map(conv => {
    return {
      ...conv,
      id: conv.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: conv.timestamp || Date.now()
    };
  });
  
  // 获取现有的对话历史
  chrome.storage.local.get('conversationHistory', data => {
    let history = data.conversationHistory || [];
    
    // 添加新的对话内容，避免重复
    const newHistory = [...processedConversations];
    
    // 合并现有历史，避免重复
    history.forEach(oldConv => {
      // 检查是否已存在相同ID的对话
      const exists = newHistory.some(newConv => newConv.id === oldConv.id);
      if (!exists) {
        newHistory.push(oldConv);
      }
    });
    
    // 限制历史记录大小
    if (newHistory.length > MAX_HISTORY_SIZE) {
      console.log(`[Background] 历史记录超过${MAX_HISTORY_SIZE}条，截断至${MAX_HISTORY_SIZE}条`);
      newHistory.sort((a, b) => b.timestamp - a.timestamp); // 按时间戳降序排序
      newHistory.splice(MAX_HISTORY_SIZE);
    }
    
    // 保存到本地存储
    chrome.storage.local.set({ 'conversationHistory': newHistory }, () => {
      console.log('[Background] 对话内容已保存到本地存储，总条数:', newHistory.length);
      
      // 更新保存状态
      const timestamp = new Date().toISOString();
      chrome.storage.local.set({ 
        'lastSaved': timestamp,
        'saveStatus': 'saved'
      }, () => {
        console.log('[Background] 保存状态已更新为"saved"');
      });
      
      // 通知UI更新
      chrome.runtime.sendMessage({
        action: 'updateSaveStatus',
        status: 'saved',
        timestamp: timestamp
      });
    });
  });
}

// 创建侧边栏
function createSidebar(tabId) {
  console.log('[Background] 尝试创建侧边栏，tabId:', tabId);
  
  // 检查标签页是否存在
  if (!tabId) {
    console.error('[Background] 无法创建侧边栏：tabId为空');
    return;
  }
  
  // 尝试向内容脚本发送消息
  try {
    chrome.tabs.sendMessage(tabId, { action: 'toggleSidebar' }, response => {
      if (chrome.runtime.lastError) {
        console.error('[Background] 发送toggleSidebar消息失败:', chrome.runtime.lastError);
        
        // 尝试注入内容脚本
        injectContentScripts(tabId);
        return;
      }
      
      if (response && response.success) {
        console.log('[Background] 侧边栏切换成功');
      } else {
        console.error('[Background] 侧边栏切换失败:', response?.error || '未知错误');
      }
    });
  } catch (error) {
    console.error('[Background] 发送消息时出错:', error);
    
    // 尝试注入内容脚本
    injectContentScripts(tabId);
  }
}

// 注入内容脚本
function injectContentScripts(tabId) {
  console.log('[Background] 尝试注入内容脚本，tabId:', tabId);
  
  // 注入sidebarManager.js
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['assets/sidebarManager.js']
  }).then(() => {
    console.log('[Background] sidebarManager.js注入成功');
    
    // 延迟一秒后再次尝试发送消息
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'toggleSidebar' }, response => {
        if (chrome.runtime.lastError) {
          console.error('[Background] 再次发送toggleSidebar消息失败:', chrome.runtime.lastError);
          return;
        }
        
        console.log('[Background] 侧边栏切换成功');
      });
    }, 1000);
  }).catch(error => {
    console.error('[Background] 注入内容脚本失败:', error);
  });
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message.action, '来自:', sender.tab ? sender.tab.url : '扩展');
  
  if (message.action === 'saveConversations') {
    // 保存对话内容
    saveConversationsToLocal(message.conversations);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'getConversationHistory') {
    // 获取对话历史
    chrome.storage.local.get('conversationHistory', data => {
      const history = data.conversationHistory || [];
      console.log('[Background] 返回对话历史，条数:', history.length);
      
      // 如果历史记录为空，尝试创建一些模拟数据
      if (history.length === 0) {
        console.log('[Background] 历史记录为空，返回模拟数据');
        const mockHistory = [
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            prompt: '如何使用React Hooks优化组件性能？',
            response: 'React Hooks提供了多种方式来优化组件性能...',
            platform: 'ChatGPT',
            url: 'https://chat.openai.com/'
          }
        ];
        sendResponse({ 
          success: true, 
          history: mockHistory,
          isMockData: true
        });
      } else {
        sendResponse({ 
          success: true, 
          history: history,
          isMockData: false
        });
      }
    });
    return true;
  }
  
  if (message.action === 'getSaveStatus') {
    // 获取保存状态
    chrome.storage.local.get(['saveStatus', 'lastSaved'], data => {
      console.log('[Background] 返回保存状态:', data.saveStatus);
      sendResponse({ 
        status: data.saveStatus || 'idle',
        timestamp: data.lastSaved
      });
    });
    return true;
  }
  
  if (message.action === 'toggleAutoSave') {
    // 切换自动保存状态
    chrome.storage.local.set({ 'autoSaveEnabled': message.enabled }, () => {
      console.log('[Background] 自动保存状态已更新为:', message.enabled);
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'toggleSidebar') {
    // 向内容脚本发送切换侧边栏的消息
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        createSidebar(tabs[0].id);
        sendResponse({ success: true });
      } else {
        console.error('[Background] 没有活动标签页');
        sendResponse({ success: false, error: '没有活动标签页' });
      }
    });
    return true;
  }
  
  // 默认响应
  sendResponse({ success: false, error: '未知消息类型' });
  return true;
});

// 添加浏览器动作点击事件
chrome.action.onClicked.addListener(tab => {
  console.log('[Background] 浏览器动作被点击，tabId:', tab.id, 'URL:', tab.url);
  
  // 直接调用创建侧边栏函数
  createSidebar(tab.id);
});

// 初始化
console.log('[Background] 后台脚本已加载'); 