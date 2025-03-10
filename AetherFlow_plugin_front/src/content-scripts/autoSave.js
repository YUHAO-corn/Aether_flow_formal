/**
 * 自动保存内容脚本
 * 
 * 这个脚本负责捕获用户与AI平台的对话内容，并将其发送到插件进行保存
 * 支持的平台：ChatGPT, Claude, Bard等
 */

// 全局变量，用于存储上次捕获的对话，避免重复保存
let lastCapturedConversations = [];

/**
 * 增强的内容提取函数，可以处理富文本和代码块
 * @param {Element} element - 要提取内容的DOM元素
 * @returns {string} 提取的内容文本
 */
function extractRichContent(element) {
  if (!element) return '';
  
  try {
    // 检查是否有代码块
    const codeBlocks = element.querySelectorAll('pre, code, .code-block, [data-code-block]');
    
    // 如果没有代码块，直接返回文本内容
    if (!codeBlocks || codeBlocks.length === 0) {
      return element.textContent.trim();
    }
    
    // 如果有代码块，需要特殊处理以保留格式
    let content = '';
    const childNodes = Array.from(element.childNodes);
    
    for (const node of childNodes) {
      // 如果是代码块
      if (node.nodeName === 'PRE' || node.nodeName === 'CODE' || 
          node.classList?.contains('code-block') || 
          node.dataset?.codeBlock) {
        // 添加代码块标记
        content += '\n```\n' + node.textContent.trim() + '\n```\n';
      } 
      // 如果是普通文本节点
      else if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent.trim() + ' ';
      } 
      // 如果是其他元素
      else if (node.nodeType === Node.ELEMENT_NODE) {
        // 递归处理子元素
        content += extractRichContent(node) + ' ';
      }
    }
    
    return content.trim();
  } catch (error) {
    console.error('[AutoSave] 提取富文本内容时发生错误:', error);
    // 出错时回退到简单的文本提取
    return element.textContent.trim();
  }
}

/**
 * 捕获页面元数据，如标题、模型信息等
 * @returns {Object} 元数据对象
 */
function captureMetadata() {
  const metadata = {
    title: document.title || '未命名对话',
    url: window.location.href,
    timestamp: new Date().toISOString(),
    platform: detectPlatform()
  };
  
  try {
    // 尝试捕获更多平台特定的元数据
    const platform = detectPlatform();
    
    if (platform === 'ChatGPT') {
      // 尝试获取ChatGPT的模型信息
      const modelElement = document.querySelector('[aria-label*="Model:"], [title*="Model:"], .model-selector');
      if (modelElement) {
        metadata.model = modelElement.textContent.trim() || modelElement.getAttribute('title') || modelElement.getAttribute('aria-label');
      }
      
      // 尝试获取对话标题
      const titleElement = document.querySelector('title, .conversation-title, h1');
      if (titleElement) {
        metadata.title = titleElement.textContent.trim() || metadata.title;
      }
    } else if (platform === 'Claude') {
      // 尝试获取Claude的模型信息
      const modelElement = document.querySelector('.model-name, [data-model]');
      if (modelElement) {
        metadata.model = modelElement.textContent.trim() || modelElement.getAttribute('data-model');
      }
      
      // 尝试获取对话标题
      const titleElement = document.querySelector('.conversation-header h1, .chat-title');
      if (titleElement) {
        metadata.title = titleElement.textContent.trim() || metadata.title;
      }
    }
    
    // 尝试从URL中提取有用信息
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
      metadata.conversationId = urlParams.get('id');
    }
    
    console.log('[AutoSave] 捕获元数据:', metadata);
    return metadata;
  } catch (error) {
    console.error('[AutoSave] 捕获元数据时发生错误:', error);
    return metadata; // 返回基本元数据
  }
}

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
  const metadata = captureMetadata();
  
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
        // 使用增强的内容提取函数
        aiResponse = extractRichContent(aiResponseElem);
      }
    }
    
    const conversation = {
      platform: 'ChatGPT',
      prompt: extractRichContent(userPrompt),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metadata: metadata
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
  const metadata = captureMetadata();
  
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
        // 使用增强的内容提取函数
        aiResponse = extractRichContent(aiResponseElem);
      }
    }
    
    const conversation = {
      platform: 'Claude',
      prompt: extractRichContent(userPrompt),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metadata: metadata
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
  const metadata = captureMetadata();
  
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
      // 使用增强的内容提取函数
      aiResponse = extractRichContent(aiResponseElem);
    }
    
    const conversation = {
      platform: 'Bard',
      prompt: extractRichContent(userPrompt),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metadata: metadata
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
 * 通用对话捕获逻辑，尝试捕获未专门实现的AI平台的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureGenericConversation() {
  console.log('[AutoSave] 尝试使用通用逻辑捕获对话内容');
  
  // 检测当前平台
  const platform = detectPlatform();
  console.log(`[AutoSave] 检测到平台: ${platform}`);
  
  // 1. 尝试识别对话容器
  const possibleContainers = [
    // 常见的对话容器选择器
    document.querySelector('main .conversation'),
    document.querySelector('.chat-container'),
    document.querySelector('[role="main"]'),
    document.querySelector('.chat-panel'),
    document.querySelector('.message-list'),
    document.querySelector('.conversation-list'),
    // 更多通用选择器...
  ].filter(Boolean);
  
  if (possibleContainers.length === 0) {
    console.log('[AutoSave] 未找到可能的对话容器');
    return null;
  }
  
  const container = possibleContainers[0];
  console.log('[AutoSave] 找到可能的对话容器:', container);
  
  // 2. 尝试识别对话项
  const conversations = [];
  const metadata = captureMetadata();
  
  // 方法1: 基于角色属性识别
  const userMessages = container.querySelectorAll('[data-role="user"], [data-author="user"], .user-message, .user, [data-message-author-role="user"]');
  const aiMessages = container.querySelectorAll('[data-role="assistant"], [data-author="assistant"], .ai-message, .assistant, [data-message-author-role="assistant"]');
  
  if (userMessages.length > 0 && aiMessages.length > 0) {
    console.log('[AutoSave] 使用基于角色的对话识别方法');
    
    // 尝试匹配用户消息和AI回复
    const maxLength = Math.min(userMessages.length, aiMessages.length);
    for (let i = 0; i < maxLength; i++) {
      const userMessage = userMessages[i];
      const aiMessage = aiMessages[i];
      
      const conversation = {
        platform: platform,
        prompt: extractRichContent(userMessage),
        response: extractRichContent(aiMessage),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        metadata: metadata
      };
      
      conversations.push(conversation);
    }
  }
  
  // 方法2: 基于交替模式识别
  if (conversations.length === 0) {
    console.log('[AutoSave] 尝试使用基于交替模式的对话识别方法');
    
    const messageItems = container.querySelectorAll('.message, .chat-item, .conversation-item, .thread-item');
    if (messageItems.length > 0) {
      // 假设奇数项是用户消息，偶数项是AI回复
      for (let i = 0; i < messageItems.length; i += 2) {
        if (i + 1 < messageItems.length) {
          const userItem = messageItems[i];
          const aiItem = messageItems[i + 1];
          
          const conversation = {
            platform: platform,
            prompt: extractRichContent(userItem),
            response: extractRichContent(aiItem),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metadata: metadata
          };
          
          conversations.push(conversation);
        }
      }
    }
  }
  
  // 方法3: 基于文本模式识别
  if (conversations.length === 0) {
    console.log('[AutoSave] 尝试使用基于文本模式的对话识别方法');
    
    // 获取页面中所有文本节点
    const textNodes = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
    }
    
    // 尝试识别问答模式
    for (let i = 0; i < textNodes.length - 1; i++) {
      const text1 = textNodes[i].textContent.trim();
      const text2 = textNodes[i + 1].textContent.trim();
      
      // 如果两个文本节点长度都超过一定阈值，可能是一对问答
      if (text1.length > 10 && text2.length > 20) {
        const conversation = {
          platform: platform,
          prompt: text1,
          response: text2,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          metadata: metadata
        };
        
        conversations.push(conversation);
        i++; // 跳过已处理的回答
      }
    }
  }
  
  console.log(`[AutoSave] 通用逻辑共捕获 ${conversations.length} 条对话`);
  return conversations.length > 0 ? conversations : null;
}

/**
 * 辅助函数：检测当前平台
 * @returns {string} 平台名称
 */
function detectPlatform() {
  const url = window.location.href;
  
  if (url.includes('chat.openai.com')) return 'ChatGPT';
  if (url.includes('claude.ai')) return 'Claude';
  if (url.includes('bard.google.com')) return 'Bard';
  if (url.includes('bing.com/chat')) return 'Bing Chat';
  if (url.includes('poe.com')) return 'Poe';
  if (url.includes('perplexity.ai')) return 'Perplexity';
  if (url.includes('anthropic.com')) return 'Claude';
  if (url.includes('chatglm.cn')) return 'ChatGLM';
  
  // 尝试从页面标题或元数据中识别
  const title = document.title.toLowerCase();
  if (title.includes('chatgpt')) return 'ChatGPT';
  if (title.includes('claude')) return 'Claude';
  if (title.includes('bard')) return 'Bard';
  if (title.includes('bing chat')) return 'Bing Chat';
  
  return '未知平台';
}

/**
 * 提取器管理器 - 管理不同平台的提取器
 * 这个类使代码更模块化，但保持原有功能不变
 */
class ExtractorManager {
  constructor() {
    // 注册平台特定的提取器
    this.extractors = {
      'ChatGPT': captureChatGPTConversation,
      'Claude': captureClaudeConversation,
      'Bard': captureBardConversation,
      'generic': captureGenericConversation
    };
  }
  
  /**
   * 根据当前URL选择合适的提取器
   * @returns {Function} 提取器函数
   */
  getExtractor() {
    const url = window.location.href;
    const platform = detectPlatform();
    
    // 根据URL或平台选择提取器
    if (url.includes('chat.openai.com') && this.extractors['ChatGPT']) {
      return this.extractors['ChatGPT'];
    } else if ((url.includes('claude.ai') || url.includes('anthropic.com')) && this.extractors['Claude']) {
      return this.extractors['Claude'];
    } else if (url.includes('bard.google.com') && this.extractors['Bard']) {
      return this.extractors['Bard'];
    }
    
    // 如果没有找到特定平台的提取器，使用通用提取器
    return this.extractors['generic'];
  }
  
  /**
   * 尝试捕获对话内容
   * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
   */
  extractConversation() {
    const extractor = this.getExtractor();
    try {
      return extractor();
    } catch (error) {
      console.error('[AutoSave] 提取对话内容时发生错误:', error);
      // 如果特定提取器失败，尝试使用通用提取器
      if (extractor !== this.extractors['generic']) {
        console.log('[AutoSave] 特定提取器失败，尝试使用通用提取器');
        try {
          return this.extractors['generic']();
        } catch (genericError) {
          console.error('[AutoSave] 通用提取器也失败:', genericError);
          return null;
        }
      }
      return null;
    }
  }
}

// 创建提取器管理器实例
const extractorManager = new ExtractorManager();

/**
 * 捕获当前页面的对话内容
 * @returns {Array|null} 捕获的对话内容数组，如果未捕获到则返回null
 */
export function captureConversation() {
  console.log('[AutoSave] 开始捕获对话内容');
  
  let conversations = null;
  
  try {
    // 使用提取器管理器捕获对话
    conversations = extractorManager.extractConversation();
    
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
  let platform = detectPlatform();
  
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