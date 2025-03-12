// 初始化扩展
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // 首次安装时设置默认配置
    chrome.storage.sync.set({
      autoSave: true,
      smartSuggestions: true,
      maxPromptHistory: 100,
      theme: 'dark',
      reducedMotion: false,
      apiKey: '',
    });
    
    // 打开欢迎页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/options.html'),
    });
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_PROMPT') {
    // 保存提示词到存储
    savePrompt(message.data, sendResponse);
    return true; // 保持消息通道开放，以便异步响应
  }
  
  if (message.type === 'GET_PROMPTS') {
    // 获取保存的提示词
    getPrompts(sendResponse);
    return true;
  }
  
  if (message.type === 'ENHANCE_PROMPT') {
    // 优化提示词
    enhancePrompt(message.data, sendResponse);
    return true;
  }
});

// 保存提示词到存储
async function savePrompt(promptData, callback) {
  try {
    // 获取当前保存的提示词
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    
    // 添加新提示词
    const newPrompts = [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...promptData,
      },
      ...prompts,
    ];
    
    // 获取最大历史记录数
    const { maxPromptHistory = 100 } = await chrome.storage.sync.get('maxPromptHistory');
    
    // 如果超过最大数量，删除未收藏的最旧提示词
    const trimmedPrompts = trimPromptHistory(newPrompts, maxPromptHistory);
    
    // 保存到存储
    await chrome.storage.local.set({ prompts: trimmedPrompts });
    
    // 响应成功
    callback({ success: true, promptId: newPrompts[0].id });
  } catch (error) {
    console.error('保存提示词失败:', error);
    callback({ success: false, error: error.message });
  }
}

// 获取保存的提示词
async function getPrompts(callback) {
  try {
    const { prompts = [] } = await chrome.storage.local.get('prompts');
    callback({ success: true, prompts });
  } catch (error) {
    console.error('获取提示词失败:', error);
    callback({ success: false, error: error.message });
  }
}

// 优化提示词
async function enhancePrompt(promptText, callback) {
  try {
    // 获取API密钥
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    
    if (!apiKey) {
      callback({ 
        success: false, 
        error: '未设置API密钥，请在设置中配置API密钥' 
      });
      return;
    }
    
    // 这里应该调用实际的API进行提示词优化
    // 为了演示，我们只是简单地返回一个模拟的优化结果
    setTimeout(() => {
      const enhancedPrompt = `${promptText}\n\n请提供详细、具体的回答，包括步骤和示例。`;
      callback({ success: true, enhancedPrompt });
    }, 1000);
  } catch (error) {
    console.error('优化提示词失败:', error);
    callback({ success: false, error: error.message });
  }
}

// 裁剪提示词历史记录
function trimPromptHistory(prompts, maxCount) {
  if (prompts.length <= maxCount) {
    return prompts;
  }
  
  // 分离收藏和未收藏的提示词
  const favorited = prompts.filter(p => p.favorite);
  const unfavorited = prompts.filter(p => !p.favorite);
  
  // 如果收藏的数量已经超过最大数量，则保留最新的收藏
  if (favorited.length >= maxCount) {
    return favorited.slice(0, maxCount);
  }
  
  // 否则，保留所有收藏的，并填充最新的未收藏的
  const remainingSlots = maxCount - favorited.length;
  return [...favorited, ...unfavorited.slice(0, remainingSlots)];
} 