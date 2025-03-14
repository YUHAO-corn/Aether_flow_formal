// AetherFlow 浏览器插件后台脚本

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 获取用户令牌
async function getUserToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['userData'], (result) => {
      if (result.userData && result.userData.token) {
        resolve(result.userData.token);
      } else {
        resolve(null);
      }
    });
  });
}

// 获取API密钥
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey', 'provider'], (result) => {
      resolve({
        apiKey: result.apiKey || '',
        provider: result.provider || 'openai'
      });
    });
  });
}

// 发送API请求
async function sendApiRequest(endpoint, method, data) {
  const token = await getUserToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.message || '请求失败',
        status: response.status
      };
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API请求失败:', error);
    return { success: false, error: error.message };
  }
}

// 自动保存提示词
async function autoSavePrompt(data) {
  return sendApiRequest('/prompts/auto-save', 'POST', data);
}

// 优化提示词
async function optimizePrompt(data) {
  // 获取API密钥
  const { apiKey, provider } = await getApiKey();
  
  // 如果有API密钥，添加到请求中
  if (apiKey) {
    data.apiKey = apiKey;
    data.provider = provider;
  }
  
  return sendApiRequest('/prompts/optimize', 'POST', data);
}

// 获取提示词列表
async function getPrompts(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.tags && params.tags.length) queryParams.append('tags', params.tags.join(','));
  if (params.favorite !== undefined) queryParams.append('favorite', params.favorite);
  if (params.sort) queryParams.append('sort', params.sort);
  
  const queryString = queryParams.toString();
  const endpoint = `/prompts${queryString ? '?' + queryString : ''}`;
  
  return sendApiRequest(endpoint, 'GET');
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autoSavePrompt') {
    autoSavePrompt(message.data)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回true表示异步响应
    return true;
  } else if (message.action === 'optimizePrompt') {
    optimizePrompt(message.data)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回true表示异步响应
    return true;
  } else if (message.action === 'getPrompts') {
    getPrompts(message.params)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回true表示异步响应
    return true;
  }
});

// 插件安装或更新时
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装
    console.log('AetherFlow插件已安装');
    
    // 设置默认配置
    chrome.storage.sync.set({
      autoSaveEnabled: true,
      smartSuggestionsEnabled: true,
      reducedMotion: false,
      apiKey: '',
      provider: 'openai'
    });
    
    // 打开欢迎页面
    chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    // 插件更新
    console.log('AetherFlow插件已更新');
  }
});

// 浏览器启动时
chrome.runtime.onStartup.addListener(() => {
  console.log('AetherFlow插件已启动');
});

console.log('AetherFlow后台脚本已加载');

// 设置侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  // 打开侧边栏
  await chrome.sidePanel.open({ tabId: tab.id });
  
  // 向侧边栏发送消息，通知其调整布局
  chrome.tabs.sendMessage(tab.id, { action: 'adjustMainContent', isOpen: true });
});

// 监听侧边栏关闭事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sidePanelClosed') {
    // 向内容脚本发送消息，通知其恢复主页面布局
    chrome.tabs.sendMessage(sender.tab.id, { action: 'adjustMainContent', isOpen: false });
  }
}); 