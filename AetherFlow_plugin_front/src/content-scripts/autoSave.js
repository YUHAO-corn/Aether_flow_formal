/**
 * 自动保存内容脚本
 * 
 * 这个脚本负责捕获用户与AI平台的对话内容，并将其发送到插件进行保存
 * 支持的平台：ChatGPT, Claude, Bard等
 */

// 全局变量，用于存储上次捕获的对话，避免重复保存
let lastCapturedConversations = [];

/**
 * 捕获ChatGPT的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureChatGPTConversation() {
  console.log('[AutoSave] 尝试捕获ChatGPT对话内容');
  
  // ChatGPT的对话容器
  const conversationContainer = document.querySelector('main div.flex.flex-col.items-center');
  if (!conversationContainer) {
    console.log('[AutoSave] 未找到ChatGPT对话容器');
    return null;
  }
  
  // 获取所有对话项
  const conversationItems = conversationContainer.querySelectorAll('div.group');
  if (!conversationItems || conversationItems.length === 0) {
    console.log('[AutoSave] 未找到ChatGPT对话项');
    return null;
  }
  
  const conversations = [];
  
  // 遍历对话项，提取用户提问和AI回答
  for (let i = 0; i < conversationItems.length; i += 2) {
    const userItem = conversationItems[i];
    const aiItem = conversationItems[i + 1];
    
    if (!userItem) continue;
    
    // 提取用户提问
    const userPrompt = userItem.querySelector('div[data-message-author-role="user"]');
    if (!userPrompt) continue;
    
    // 提取AI回答
    let aiResponse = '';
    if (aiItem) {
      const aiResponseElem = aiItem.querySelector('div[data-message-author-role="assistant"]');
      if (aiResponseElem) {
        aiResponse = aiResponseElem.textContent.trim();
      }
    }
    
    const conversation = {
      platform: 'ChatGPT',
      prompt: userPrompt.textContent.trim(),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('[AutoSave] 捕获ChatGPT对话:', {
      prompt: conversation.prompt.substring(0, 50) + (conversation.prompt.length > 50 ? '...' : ''),
      responseLength: conversation.response.length
    });
    
    conversations.push(conversation);
  }
  
  console.log(`[AutoSave] 共捕获 ${conversations.length} 条ChatGPT对话`);
  return conversations;
}

/**
 * 捕获Claude的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureClaudeConversation() {
  console.log('[AutoSave] 尝试捕获Claude对话内容');
  
  // Claude的对话容器
  const conversationContainer = document.querySelector('.claude-container .conversation-container');
  if (!conversationContainer) {
    console.log('[AutoSave] 未找到Claude对话容器');
    return null;
  }
  
  // 获取所有对话项
  const userMessages = conversationContainer.querySelectorAll('.user-message');
  const assistantMessages = conversationContainer.querySelectorAll('.assistant-message');
  
  if (!userMessages || userMessages.length === 0) {
    console.log('[AutoSave] 未找到Claude用户消息');
    return null;
  }
  
  const conversations = [];
  
  // 遍历用户消息，提取用户提问和AI回答
  for (let i = 0; i < userMessages.length; i++) {
    const userMessage = userMessages[i];
    const assistantMessage = assistantMessages[i];
    
    // 提取用户提问
    const userPrompt = userMessage.querySelector('.message-content');
    if (!userPrompt) continue;
    
    // 提取AI回答
    let aiResponse = '';
    if (assistantMessage) {
      const aiResponseElem = assistantMessage.querySelector('.message-content');
      if (aiResponseElem) {
        aiResponse = aiResponseElem.textContent.trim();
      }
    }
    
    const conversation = {
      platform: 'Claude',
      prompt: userPrompt.textContent.trim(),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('[AutoSave] 捕获Claude对话:', {
      prompt: conversation.prompt.substring(0, 50) + (conversation.prompt.length > 50 ? '...' : ''),
      responseLength: conversation.response.length
    });
    
    conversations.push(conversation);
  }
  
  console.log(`[AutoSave] 共捕获 ${conversations.length} 条Claude对话`);
  return conversations;
}

/**
 * 捕获Bard的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureBardConversation() {
  console.log('[AutoSave] 尝试捕获Bard对话内容');
  
  // Bard的对话容器
  const conversationContainer = document.querySelector('.conversation-container');
  if (!conversationContainer) {
    console.log('[AutoSave] 未找到Bard对话容器');
    return null;
  }
  
  // 获取所有对话项
  const messageGroups = conversationContainer.querySelectorAll('.message-group');
  
  if (!messageGroups || messageGroups.length === 0) {
    console.log('[AutoSave] 未找到Bard消息组');
    return null;
  }
  
  const conversations = [];
  
  // 遍历消息组，提取用户提问和AI回答
  for (let i = 0; i < messageGroups.length; i++) {
    const messageGroup = messageGroups[i];
    
    // 提取用户提问
    const userPrompt = messageGroup.querySelector('.user-query');
    if (!userPrompt) continue;
    
    // 提取AI回答
    let aiResponse = '';
    const aiResponseElem = messageGroup.querySelector('.model-response');
    if (aiResponseElem) {
      aiResponse = aiResponseElem.textContent.trim();
    }
    
    const conversation = {
      platform: 'Bard',
      prompt: userPrompt.textContent.trim(),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('[AutoSave] 捕获Bard对话:', {
      prompt: conversation.prompt.substring(0, 50) + (conversation.prompt.length > 50 ? '...' : ''),
      responseLength: conversation.response.length
    });
    
    conversations.push(conversation);
  }
  
  console.log(`[AutoSave] 共捕获 ${conversations.length} 条Bard对话`);
  return conversations;
}

/**
 * 捕获当前页面的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureConversation() {
  console.log('[AutoSave] 开始捕获对话内容');
  
  let conversations = null;
  
  // 根据当前URL判断平台
  const url = window.location.href;
  
  try {
    if (url.includes('chat.openai.com')) {
      conversations = captureChatGPTConversation();
    } else if (url.includes('claude.ai')) {
      conversations = captureClaudeConversation();
    } else if (url.includes('bard.google.com')) {
      conversations = captureBardConversation();
    } else {
      console.log('[AutoSave] 不支持的平台:', url);
      return null;
    }
    
    if (!conversations || conversations.length === 0) {
      console.log('[AutoSave] 未捕获到对话内容');
      return null;
    }
    
    // 检查是否有新的对话内容
    if (JSON.stringify(conversations) === JSON.stringify(lastCapturedConversations)) {
      console.log('[AutoSave] 对话内容未变化，跳过保存');
      return null;
    }
    
    // 更新上次捕获的对话
    lastCapturedConversations = conversations;
    
    console.log('[AutoSave] 捕获到对话内容:', conversations.length);
    
    // 检查chrome对象是否存在（在测试环境中可能不存在）
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      // 发送消息到插件的后台脚本
      chrome.runtime.sendMessage({
        action: 'saveConversation',
        data: conversations
      }, response => {
        if (response && response.success) {
          console.log('[AutoSave] 对话内容已保存');
        } else {
          console.error('[AutoSave] 保存对话内容失败:', response ? response.error : '未知错误');
        }
      });
    } else {
      console.log('[AutoSave] 测试环境中，跳过发送消息到后台脚本');
    }
    
    return conversations;
  } catch (error) {
    console.error('[AutoSave] 捕获对话内容时发生错误:', error);
    return null;
  }
}

/**
 * 初始化自动保存功能
 */
export function initAutoSave() {
  console.log('[AutoSave] 初始化自动保存功能');
  
  // 检查chrome对象是否存在（在测试环境中可能不存在）
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.log('[AutoSave] 测试环境中，使用模拟的chrome API');
    // 在测试环境中，立即捕获一次对话内容
    captureConversation();
    return;
  }
  
  // 检查是否启用了自动保存
  chrome.storage.local.get('autoSaveEnabled', data => {
    if (data.autoSaveEnabled === false) {
      console.log('[AutoSave] 自动保存功能已禁用');
      return;
    }
    
    console.log('[AutoSave] 自动保存功能已启用');
    
    // 立即捕获一次对话内容
    captureConversation();
    
    // 设置定时器，定期捕获对话内容
    const saveInterval = setInterval(captureConversation, 30000); // 每30秒捕获一次
    console.log('[AutoSave] 已设置自动保存定时器，间隔: 30秒');
    
    // 监听DOM变化，在对话更新时捕获内容
    const observer = new MutationObserver(mutations => {
      // 检查是否有新的对话内容
      const hasNewContent = mutations.some(mutation => {
        return mutation.type === 'childList' && 
               mutation.addedNodes.length > 0 &&
               Array.from(mutation.addedNodes).some(node => {
                 return node.nodeType === Node.ELEMENT_NODE &&
                        (node.classList.contains('group') || // ChatGPT
                         node.classList.contains('message') || // Claude
                         node.classList.contains('message-group')); // Bard
               });
      });
      
      if (hasNewContent) {
        console.log('[AutoSave] 检测到新的对话内容，触发捕获');
        // 延迟一秒，确保内容已完全加载
        setTimeout(captureConversation, 1000);
      }
    });
    
    // 开始观察文档变化
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[AutoSave] 已启动DOM变化监听');
    
    // 监听来自插件的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggleAutoSave') {
        console.log('[AutoSave] 收到切换自动保存状态的消息:', message.enabled);
        
        if (message.enabled) {
          // 如果启用了自动保存，立即捕获一次对话内容
          captureConversation();
        } else {
          // 如果禁用了自动保存，清除定时器和观察者
          clearInterval(saveInterval);
          observer.disconnect();
          console.log('[AutoSave] 已禁用自动保存功能');
        }
        
        sendResponse({ success: true });
      }
    });
  });
}

// 在页面加载完成后初始化自动保存功能
if (document.readyState === 'complete') {
  console.log('[AutoSave] 页面已加载完成，立即初始化');
  initAutoSave();
} else {
  console.log('[AutoSave] 页面正在加载，等待加载完成后初始化');
  window.addEventListener('load', () => {
    console.log('[AutoSave] 页面加载完成，开始初始化');
    initAutoSave();
  });
}

console.log('[AutoSave] 内容脚本已加载'); 