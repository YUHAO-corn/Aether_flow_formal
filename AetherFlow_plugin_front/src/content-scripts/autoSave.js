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
  
  // 检测当前网站
  const currentURL = window.location.href;
  let platform = '';
  
  if (currentURL.includes('chat.openai.com')) {
    platform = 'ChatGPT';
  } else if (currentURL.includes('claude.ai')) {
    platform = 'Claude';
  } else if (currentURL.includes('bard.google.com')) {
    platform = 'Bard';
  } else {
    console.log('[AutoSave] 不支持的平台:', currentURL);
    return;
  }
  
  console.log(`[AutoSave] 检测到平台: ${platform}`);
  
  // 定义MutationObserver监听DOM变化
  const observer = new MutationObserver((mutations) => {
    // 防抖处理，避免频繁触发
    clearTimeout(window.autoSaveDebounceTimer);
    window.autoSaveDebounceTimer = setTimeout(() => {
      console.log('[AutoSave] 检测到DOM变化，尝试捕获对话');
      const conversations = captureConversation();
      
      if (conversations && conversations.length > 0) {
        // 过滤出新的对话
        const newConversations = conversations.filter(conv => {
          // 检查是否已经保存过
          return !lastCapturedConversations.some(lastConv => 
            lastConv.prompt === conv.prompt && 
            lastConv.response === conv.response
          );
        });
        
        if (newConversations.length > 0) {
          console.log(`[AutoSave] 发现 ${newConversations.length} 条新对话，准备保存`);
          
          // 更新最后捕获的对话
          lastCapturedConversations = [...lastCapturedConversations, ...newConversations];
          // 保持最后捕获的对话数量在合理范围内
          if (lastCapturedConversations.length > 50) {
            lastCapturedConversations = lastCapturedConversations.slice(-50);
          }
          
          // 发送消息到后台脚本保存对话
          chrome.runtime.sendMessage({
            action: 'saveConversations',
            conversations: newConversations
          }, response => {
            if (chrome.runtime.lastError) {
              console.error('[AutoSave] 保存对话失败:', chrome.runtime.lastError);
              return;
            }
            
            if (response && response.success) {
              console.log(`[AutoSave] 成功保存 ${newConversations.length} 条对话`);
            } else {
              console.error('[AutoSave] 保存对话失败:', response?.error || '未知错误');
            }
          });
        } else {
          console.log('[AutoSave] 没有发现新对话');
        }
      }
    }, 1000); // 1秒防抖
  });
  
  // 开始观察DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log('[AutoSave] 已启动DOM变化监听');
  
  // 初始捕获一次对话
  setTimeout(() => {
    console.log('[AutoSave] 初始捕获对话');
    const conversations = captureConversation();
    if (conversations && conversations.length > 0) {
      console.log(`[AutoSave] 初始捕获到 ${conversations.length} 条对话`);
      lastCapturedConversations = conversations;
    }
  }, 2000);
}

// 页面加载完成后初始化自动保存功能
if (document.readyState === 'complete') {
  initAutoSave();
} else {
  window.addEventListener('load', initAutoSave);
}

console.log('[AutoSave] 内容脚本已加载'); 