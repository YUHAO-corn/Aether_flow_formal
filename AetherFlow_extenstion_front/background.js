// 后台脚本，处理扩展的后台任务
console.log('AetherFlow 后台脚本已加载');

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
        console.log('AetherFlow: 已通知内容脚本更新布局', { tabId: tab.id, isExpanded });
      } catch (err) {
        // 忽略无法发送消息的标签页（可能没有内容脚本）
      }
    }
  } catch (err) {
    console.error('AetherFlow: 通知内容脚本失败', err);
  }
};

// 切换插件展开/折叠状态
const togglePluginExpand = async () => {
  try {
    const state = await getPluginState();
    const newState = { isExpanded: !state.isExpanded };
    
    await updatePluginState(newState);
    await notifyContentScripts(newState.isExpanded);
    
    console.log('AetherFlow: 切换插件状态', { isExpanded: newState.isExpanded });
    
    return newState.isExpanded;
  } catch (err) {
    console.error('AetherFlow: 切换插件状态失败', err);
    return false;
  }
};

// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装
    console.log('AetherFlow: 扩展已安装');
    
    // 初始化存储
    chrome.storage.local.set({
      userSettings: {
        theme: 'dark',
        autoSave: true,
        enhancementModel: 'gpt-4'
      },
      promptLibrary: [],
      savedPrompts: [],
      isExpanded: false
    });
  } else if (details.reason === 'update') {
    // 扩展更新
    console.log('AetherFlow: 扩展已更新');
  }
});

// 监听扩展程序图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // 切换插件展开/折叠状态
    const isExpanded = await togglePluginExpand();
    
    // 如果是展开状态，则打开侧边栏
    if (isExpanded) {
      chrome.sidePanel.open({ tabId: tab.id });
      console.log('AetherFlow: 侧边栏已打开', { tabId: tab.id });
    }
  } catch (err) {
    console.error('AetherFlow: 处理图标点击事件失败', { error: err.message, tabId: tab.id });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('AetherFlow: 收到消息:', message);
  
  if (message.action === 'promptImageTrigger') {
    // 打开侧边栏
    chrome.sidePanel.open();
    
    // 通知侧边栏打开提示词图像组件
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'openPromptImage' });
    }, 500);
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'insertPrompt') {
    // 转发消息到当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: '未找到活动标签页' });
      }
    });
    return true;
  }
  
  if (message.action === 'toggleExpand') {
    // 处理来自侧边栏的展开/折叠请求
    togglePluginExpand().then(isExpanded => {
      sendResponse({ success: true, isExpanded });
    });
    return true;
  }
  
  if (message.action === 'getPluginState') {
    // 获取插件状态
    getPluginState().then(state => {
      sendResponse({ success: true, ...state });
    });
    return true;
  }
});

// 设置侧边栏行为
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); 