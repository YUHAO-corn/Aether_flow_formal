/**
 * 自动保存内容脚本
 * 
 * 这个脚本负责捕获用户与AI平台的对话内容，并将其发送到插件进行保存
 * 支持的平台：ChatGPT, Claude, Bard, KIMI, 豆包, Deepseek等
 */

// 全局变量，用于存储上次捕获的对话，避免重复保存
let lastCapturedConversations = [];

// 调试模式
const DEBUG = true;

// 调试日志
function debugLog(...args) {
  if (DEBUG) {
    console.log('[AutoSave Debug]', ...args);
  }
}

/**
 * 捕获ChatGPT的对话内容
 */
function captureChatGPTConversation() {
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
    
    conversations.push(conversation);
  }
  
  return conversations;
}

/**
 * 捕获KIMI的对话内容
 */
function captureKIMIConversation() {
  console.log('[AutoSave] 尝试捕获KIMI对话内容');
  
  // KIMI的对话容器 - 更新选择器以匹配实际DOM结构
  // 尝试多个可能的选择器
  let conversationContainer = document.querySelector('.chat-list');
  if (!conversationContainer) {
    conversationContainer = document.querySelector('.chat-container');
  }
  if (!conversationContainer) {
    conversationContainer = document.querySelector('main');
  }
  
  if (!conversationContainer) {
    console.log('[AutoSave] 未找到KIMI对话容器，尝试记录整个页面结构');
    // 记录页面结构，帮助调试
    const bodyClasses = Array.from(document.body.classList);
    const mainElements = document.querySelectorAll('main, .chat, [class*="chat"]');
    console.log('[AutoSave] 页面主要元素:', mainElements.length, '个元素');
    mainElements.forEach((el, i) => {
      console.log(`[AutoSave] 主要元素 ${i}:`, el.tagName, Array.from(el.classList));
    });
    return null;
  }
  
  console.log('[AutoSave] 找到KIMI对话容器:', conversationContainer.tagName, Array.from(conversationContainer.classList));
  
  // 获取所有对话项 - 更新选择器以匹配实际DOM结构
  // 尝试多个可能的选择器
  let conversationItems = conversationContainer.querySelectorAll('.chat-item, .message, .chat-message');
  if (!conversationItems || conversationItems.length === 0) {
    conversationItems = conversationContainer.querySelectorAll('[class*="message"], [class*="chat-item"]');
  }
  
  if (!conversationItems || conversationItems.length === 0) {
    console.log('[AutoSave] 未找到KIMI对话项，尝试记录容器子元素');
    // 记录容器子元素，帮助调试
    const children = conversationContainer.children;
    console.log('[AutoSave] 容器子元素:', children.length, '个元素');
    Array.from(children).forEach((el, i) => {
      console.log(`[AutoSave] 子元素 ${i}:`, el.tagName, Array.from(el.classList));
    });
    return null;
  }
  
  console.log('[AutoSave] 找到KIMI对话项:', conversationItems.length, '个项目');
  
  const conversations = [];
  let userPrompt = '';
  let aiResponse = '';
  
  // 遍历对话项，提取用户提问和AI回答
  for (let i = 0; i < conversationItems.length; i++) {
    const item = conversationItems[i];
    const isUser = item.classList.contains('user') || 
                  item.querySelector('.user') || 
                  item.getAttribute('data-role') === 'user' ||
                  item.querySelector('[data-role="user"]');
    
    // 提取内容 - 尝试多个可能的选择器
    let contentElement = item.querySelector('.chat-content, .content, .text');
    if (!contentElement) {
      contentElement = item.querySelector('[class*="content"], [class*="text"]');
    }
    if (!contentElement) {
      contentElement = item;
    }
    
    const content = contentElement ? contentElement.textContent.trim() : '';
    
    if (isUser) {
      userPrompt = content;
    } else {
      aiResponse = content;
      
      // 如果有用户提问和AI回答，则添加到对话列表
      if (userPrompt && aiResponse) {
        const conversation = {
          platform: 'KIMI',
          prompt: userPrompt,
          response: aiResponse,
          timestamp: new Date().toISOString(),
          url: window.location.href
        };
        
        conversations.push(conversation);
        
        // 重置用户提问和AI回答
        userPrompt = '';
        aiResponse = '';
      }
    }
  }
  
  return conversations;
}

/**
 * 捕获豆包的对话内容
 */
function captureDouBaoConversation() {
  console.log('[AutoSave] 尝试捕获豆包对话内容');
  
  // 豆包的对话容器 - 更新选择器以匹配实际DOM结构
  // 尝试多个可能的选择器
  let conversationContainer = document.querySelector('.chat-message-list');
  if (!conversationContainer) {
    conversationContainer = document.querySelector('.chat-container');
  }
  if (!conversationContainer) {
    conversationContainer = document.querySelector('main');
  }
  
  if (!conversationContainer) {
    console.log('[AutoSave] 未找到豆包对话容器，尝试记录整个页面结构');
    // 记录页面结构，帮助调试
    const bodyClasses = Array.from(document.body.classList);
    const mainElements = document.querySelectorAll('main, .chat, [class*="chat"]');
    console.log('[AutoSave] 页面主要元素:', mainElements.length, '个元素');
    mainElements.forEach((el, i) => {
      console.log(`[AutoSave] 主要元素 ${i}:`, el.tagName, Array.from(el.classList));
    });
    return null;
  }
  
  console.log('[AutoSave] 找到豆包对话容器:', conversationContainer.tagName, Array.from(conversationContainer.classList));
  
  // 获取所有对话项 - 更新选择器以匹配实际DOM结构
  // 尝试多个可能的选择器
  let conversationItems = conversationContainer.querySelectorAll('.chat-message-item, .message, .chat-message');
  if (!conversationItems || conversationItems.length === 0) {
    conversationItems = conversationContainer.querySelectorAll('[class*="message"], [class*="chat-item"]');
  }
  
  if (!conversationItems || conversationItems.length === 0) {
    console.log('[AutoSave] 未找到豆包对话项，尝试记录容器子元素');
    // 记录容器子元素，帮助调试
    const children = conversationContainer.children;
    console.log('[AutoSave] 容器子元素:', children.length, '个元素');
    Array.from(children).forEach((el, i) => {
      console.log(`[AutoSave] 子元素 ${i}:`, el.tagName, Array.from(el.classList));
    });
    return null;
  }
  
  console.log('[AutoSave] 找到豆包对话项:', conversationItems.length, '个项目');
  
  const conversations = [];
  let userPrompt = '';
  let aiResponse = '';
  
  // 遍历对话项，提取用户提问和AI回答
  for (let i = 0; i < conversationItems.length; i++) {
    const item = conversationItems[i];
    const isUser = item.classList.contains('user') || 
                  item.querySelector('.user') || 
                  item.getAttribute('data-role') === 'user' ||
                  item.querySelector('[data-role="user"]');
    
    // 提取内容 - 尝试多个可能的选择器
    let contentElement = item.querySelector('.message-content, .content, .text');
    if (!contentElement) {
      contentElement = item.querySelector('[class*="content"], [class*="text"]');
    }
    if (!contentElement) {
      contentElement = item;
    }
    
    const content = contentElement ? contentElement.textContent.trim() : '';
    
    if (isUser) {
      userPrompt = content;
    } else {
      aiResponse = content;
      
      // 如果有用户提问和AI回答，则添加到对话列表
      if (userPrompt && aiResponse) {
        const conversation = {
          platform: '豆包',
          prompt: userPrompt,
          response: aiResponse,
          timestamp: new Date().toISOString(),
          url: window.location.href
        };
        
        conversations.push(conversation);
        
        // 重置用户提问和AI回答
        userPrompt = '';
        aiResponse = '';
      }
    }
  }
  
  return conversations;
}

/**
 * 捕获Deepseek的对话内容
 */
function captureDeepseekConversation() {
  console.log('[AutoSave] 尝试捕获Deepseek对话内容');
  
  // 记录页面结构，帮助调试
  debugLog('当前URL:', window.location.href);
  debugLog('页面标题:', document.title);
  
  // 记录整个页面结构
  debugLog('开始记录页面结构');
  const allElements = document.querySelectorAll('*');
  let potentialContainers = [];
  
  // 查找所有可能包含对话的容器
  allElements.forEach(el => {
    // 跳过一些明显不是对话容器的元素
    if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE', 'BR', 'HR'].includes(el.tagName)) {
      return;
    }
    
    // 检查元素是否有多个子元素，可能是对话容器
    if (el.children && el.children.length > 3) {
      const className = el.className || '';
      const id = el.id || '';
      const text = el.textContent || '';
      
      // 如果元素包含"chat"、"message"、"conversation"等关键词，或者包含多个子元素，可能是对话容器
      if (
        (typeof className === 'string' && (
          className.includes('chat') || 
          className.includes('message') || 
          className.includes('conversation') ||
          className.includes('dialog') ||
          className.includes('thread')
        )) ||
        (typeof id === 'string' && (
          id.includes('chat') || 
          id.includes('message') || 
          id.includes('conversation') ||
          id.includes('dialog') ||
          id.includes('thread')
        )) ||
        (el.children.length > 5 && el.querySelectorAll('div, p, span').length > 5)
      ) {
        potentialContainers.push({
          element: el,
          childCount: el.children.length,
          depth: getElementDepth(el),
          score: scoreElement(el)
        });
      }
    }
  });
  
  // 按分数排序潜在容器
  potentialContainers.sort((a, b) => b.score - a.score);
  
  // 记录潜在容器
  debugLog('找到潜在对话容器:', potentialContainers.length);
  potentialContainers.slice(0, 5).forEach((container, i) => {
    const el = container.element;
    debugLog(`潜在容器 ${i}:`, el.tagName, Array.from(el.classList), 
             `子元素: ${container.childCount}`, 
             `深度: ${container.depth}`, 
             `分数: ${container.score}`);
  });
  
  // 如果没有找到潜在容器，尝试使用一些常见的选择器
  if (potentialContainers.length === 0) {
    debugLog('未找到潜在容器，尝试使用常见选择器');
    return null;
  }
  
  // 使用得分最高的容器
  const bestContainer = potentialContainers[0].element;
  console.log('[AutoSave] 选择最佳对话容器:', bestContainer.tagName, Array.from(bestContainer.classList));
  
  // 查找对话项
  let conversationItems = [];
  
  // 尝试找到对话项
  const childElements = Array.from(bestContainer.children);
  
  // 过滤掉不可能是对话项的元素
  const possibleItems = childElements.filter(el => {
    // 跳过一些明显不是对话项的元素
    if (['SCRIPT', 'STYLE', 'META', 'LINK', 'BR', 'HR'].includes(el.tagName)) {
      return false;
    }
    
    // 如果元素没有文本内容，可能不是对话项
    const text = el.textContent.trim();
    if (!text) {
      return false;
    }
    
    return true;
  });
  
  // 如果找到了可能的对话项，使用它们
  if (possibleItems.length > 0) {
    conversationItems = possibleItems;
    console.log('[AutoSave] 找到可能的对话项:', conversationItems.length);
  } else {
    // 如果没有找到可能的对话项，尝试使用所有后代元素
    const allDescendants = bestContainer.querySelectorAll('*');
    const textElements = Array.from(allDescendants).filter(el => {
      // 跳过一些明显不是文本元素的元素
      if (['SCRIPT', 'STYLE', 'META', 'LINK', 'BR', 'HR'].includes(el.tagName)) {
        return false;
      }
      
      // 如果元素有文本内容，可能是对话项
      const text = el.textContent.trim();
      if (text && text.length > 20 && !el.querySelector('*')) {
        return true;
      }
      
      return false;
    });
    
    conversationItems = textElements;
    console.log('[AutoSave] 使用文本元素作为对话项:', conversationItems.length);
  }
  
  if (conversationItems.length === 0) {
    console.log('[AutoSave] 未找到Deepseek对话项');
    return null;
  }
  
  console.log('[AutoSave] 找到Deepseek对话项:', conversationItems.length, '个项目');
  
  // 尝试将对话项分组为用户和AI
  const conversations = [];
  let currentUserPrompt = '';
  let currentAiResponse = '';
  
  // 检查是否有明显的用户/AI标识
  const hasRoleIdentifiers = conversationItems.some(item => {
    return (
      item.classList.contains('user') || 
      item.classList.contains('human') || 
      item.classList.contains('ai') || 
      item.classList.contains('assistant') ||
      item.getAttribute('data-role') === 'user' ||
      item.getAttribute('data-role') === 'assistant'
    );
  });
  
  if (hasRoleIdentifiers) {
    // 如果有明显的角色标识，使用它们来分组
    debugLog('使用角色标识分组对话项');
    
    for (let i = 0; i < conversationItems.length; i++) {
      const item = conversationItems[i];
      const isUser = 
        item.classList.contains('user') || 
        item.classList.contains('human') || 
        item.getAttribute('data-role') === 'user';
      
      const content = item.textContent.trim();
      
      if (isUser) {
        // 如果已经有用户提问和AI回答，添加到对话列表
        if (currentUserPrompt && currentAiResponse) {
          conversations.push({
            platform: 'Deepseek',
            prompt: currentUserPrompt,
            response: currentAiResponse,
            timestamp: new Date().toISOString(),
            url: window.location.href
          });
          
          currentUserPrompt = '';
          currentAiResponse = '';
        }
        
        currentUserPrompt = content;
      } else {
        currentAiResponse = content;
      }
    }
  } else {
    // 如果没有明显的角色标识，假设奇数项是用户，偶数项是AI
    debugLog('使用奇偶分组对话项');
    
    for (let i = 0; i < conversationItems.length; i += 2) {
      const userItem = conversationItems[i];
      const aiItem = i + 1 < conversationItems.length ? conversationItems[i + 1] : null;
      
      if (!userItem) continue;
      
      const userContent = userItem.textContent.trim();
      let aiContent = '';
      
      if (aiItem) {
        aiContent = aiItem.textContent.trim();
      }
      
      if (userContent && aiContent) {
        conversations.push({
          platform: 'Deepseek',
          prompt: userContent,
          response: aiContent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    }
  }
  
  // 如果还是没有找到对话，尝试使用文本分析
  if (conversations.length === 0) {
    debugLog('使用文本分析分组对话项');
    
    // 获取所有文本内容
    const allText = conversationItems.map(item => item.textContent.trim()).join('\n\n');
    
    // 尝试使用一些启发式方法分割对话
    const paragraphs = allText.split('\n\n').filter(p => p.trim().length > 0);
    
    for (let i = 0; i < paragraphs.length; i += 2) {
      const userParagraph = paragraphs[i];
      const aiParagraph = i + 1 < paragraphs.length ? paragraphs[i + 1] : '';
      
      if (userParagraph && aiParagraph) {
        conversations.push({
          platform: 'Deepseek',
          prompt: userParagraph,
          response: aiParagraph,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    }
  }
  
  return conversations;
}

/**
 * 计算元素的深度
 * @param {Element} element - 元素
 * @returns {number} - 深度
 */
function getElementDepth(element) {
  let depth = 0;
  let current = element;
  
  while (current.parentElement) {
    depth++;
    current = current.parentElement;
  }
  
  return depth;
}

/**
 * 计算元素的得分，用于确定它是否可能是对话容器
 * @param {Element} element - 元素
 * @returns {number} - 得分
 */
function scoreElement(element) {
  let score = 0;
  
  // 基于类名和ID的得分
  const className = element.className || '';
  const id = element.id || '';
  
  if (typeof className === 'string') {
    if (className.includes('chat')) score += 10;
    if (className.includes('message')) score += 10;
    if (className.includes('conversation')) score += 15;
    if (className.includes('dialog')) score += 8;
    if (className.includes('thread')) score += 8;
    if (className.includes('history')) score += 5;
  }
  
  if (typeof id === 'string') {
    if (id.includes('chat')) score += 10;
    if (id.includes('message')) score += 10;
    if (id.includes('conversation')) score += 15;
    if (id.includes('dialog')) score += 8;
    if (id.includes('thread')) score += 8;
    if (id.includes('history')) score += 5;
  }
  
  // 基于子元素数量的得分
  const childCount = element.children.length;
  if (childCount > 10) score += 15;
  else if (childCount > 5) score += 10;
  else if (childCount > 3) score += 5;
  
  // 基于深度的得分（深度适中的元素更可能是对话容器）
  const depth = getElementDepth(element);
  if (depth >= 3 && depth <= 6) score += 10;
  else if (depth > 6) score += 5;
  
  // 基于元素大小的得分
  const rect = element.getBoundingClientRect();
  const area = rect.width * rect.height;
  const viewportArea = window.innerWidth * window.innerHeight;
  const areaRatio = area / viewportArea;
  
  if (areaRatio > 0.3 && areaRatio < 0.8) score += 15;
  else if (areaRatio > 0.1 && areaRatio < 0.9) score += 10;
  
  // 检查是否有滚动条
  const style = window.getComputedStyle(element);
  if (style.overflowY === 'scroll' || style.overflowY === 'auto') score += 10;
  
  return score;
}

/**
 * 捕获对话内容
 */
function captureConversation() {
  const url = window.location.href;
  
  if (url.includes('chat.openai.com')) {
    return captureChatGPTConversation();
  } else if (url.includes('kimi.moonshot.cn')) {
    return captureKIMIConversation();
  } else if (url.includes('yiyan.baidu.com')) {
    return captureDouBaoConversation();
  } else if (url.includes('chat.deepseek.com')) {
    return captureDeepseekConversation();
  }
  
  return null;
}

/**
 * 初始化自动保存功能
 */
function initAutoSave() {
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
  } else if (currentURL.includes('kimi.moonshot.cn')) {
    platform = 'KIMI';
  } else if (currentURL.includes('yiyan.baidu.com')) {
    platform = '豆包';
  } else if (currentURL.includes('chat.deepseek.com')) {
    platform = 'Deepseek';
  } else {
    console.log('[AutoSave] 不支持的平台:', currentURL);
    return;
  }
  
  console.log(`[AutoSave] 检测到平台: ${platform}`);
  
  // 立即尝试捕获一次对话
  setTimeout(() => {
    console.log('[AutoSave] 初始捕获对话');
    const conversations = captureConversation();
    if (conversations && conversations.length > 0) {
      console.log(`[AutoSave] 初始捕获到 ${conversations.length} 条对话`);
      lastCapturedConversations = conversations;
      
      // 保存到后台
      chrome.runtime.sendMessage({
        action: 'saveConversations',
        conversations: conversations
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('[AutoSave] 保存对话失败:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log(`[AutoSave] 成功保存 ${conversations.length} 条对话`);
        } else {
          console.error('[AutoSave] 保存对话失败:', response?.error || '未知错误');
        }
      });
    } else {
      console.log('[AutoSave] 初始捕获未找到对话');
    }
  }, 2000);
  
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
}

// 页面加载完成后初始化
if (document.readyState === 'complete') {
  initAutoSave();
} else {
  window.addEventListener('load', initAutoSave);
} 