/**
 * 自动保存后台脚本
 * 
 * 这个脚本负责接收内容脚本发送的对话内容，并将其保存到本地存储或发送到后端API
 */

import { promptAPI } from '../utils/apiClient';

// 保存最近的对话历史（最多100条）
const MAX_HISTORY_SIZE = 100;

/**
 * 保存对话内容到本地存储
 * @param {Array} conversations - 对话内容数组
 */
export function saveConversationsToLocal(conversations) {
  console.log('[Background] 保存对话内容到本地存储:', conversations.length);
  
  // 获取现有的对话历史
  chrome.storage.local.get('conversationHistory', data => {
    let history = data.conversationHistory || [];
    
    // 添加新的对话内容
    history = [...conversations, ...history];
    
    // 限制历史记录大小
    if (history.length > MAX_HISTORY_SIZE) {
      console.log(`[Background] 历史记录超过${MAX_HISTORY_SIZE}条，截断至${MAX_HISTORY_SIZE}条`);
      history = history.slice(0, MAX_HISTORY_SIZE);
    }
    
    // 保存到本地存储
    chrome.storage.local.set({ 'conversationHistory': history }, () => {
      console.log('[Background] 对话内容已保存到本地存储，总条数:', history.length);
      
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
      }, response => {
        if (chrome.runtime.lastError) {
          console.warn('[Background] 通知UI更新时出错:', chrome.runtime.lastError);
        } else {
          console.log('[Background] 已通知UI更新保存状态');
        }
      });
    });
  });
}

/**
 * 保存对话内容到后端API
 * @param {Array} conversations - 对话内容数组
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveConversationsToAPI(conversations) {
  console.log('[Background] 保存对话内容到后端API:', conversations.length);
  
  try {
    // 更新保存状态
    chrome.storage.local.set({ 'saveStatus': 'saving' }, () => {
      console.log('[Background] 保存状态已更新为"saving"');
    });
    
    // 通知UI更新
    chrome.runtime.sendMessage({
      action: 'updateSaveStatus',
      status: 'saving'
    }, response => {
      if (chrome.runtime.lastError) {
        console.warn('[Background] 通知UI更新时出错:', chrome.runtime.lastError);
      }
    });
    
    // 获取认证令牌
    const token = await new Promise(resolve => {
      chrome.storage.local.get('token', data => {
        console.log('[Background] 获取认证令牌:', data.token ? '成功' : '失败');
        resolve(data.token);
      });
    });
    
    if (!token) {
      console.log('[Background] 未找到认证令牌，跳过API保存');
      return false;
    }
    
    // 将对话内容转换为API需要的格式
    const promptsToSave = conversations.map(conv => ({
      title: `${conv.platform} 对话 - ${new Date(conv.timestamp).toLocaleString()}`,
      content: conv.prompt,
      response: conv.response,
      platform: conv.platform,
      url: conv.url,
      timestamp: conv.timestamp,
      type: 'conversation'
    }));
    
    console.log('[Background] 准备调用API保存对话内容，数量:', promptsToSave.length);
    
    // 调用API保存对话内容
    const results = await Promise.all(
      promptsToSave.map(prompt => {
        console.log('[Background] 调用API保存对话:', {
          platform: prompt.platform,
          contentLength: prompt.content.length,
          responseLength: prompt.response.length
        });
        return promptAPI.autoSavePrompt(prompt);
      })
    );
    
    console.log('[Background] API保存结果:', results.length);
    
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
    }, response => {
      if (chrome.runtime.lastError) {
        console.warn('[Background] 通知UI更新时出错:', chrome.runtime.lastError);
      } else {
        console.log('[Background] 已通知UI更新保存状态');
      }
    });
    
    return true;
  } catch (error) {
    console.error('[Background] API保存失败:', error);
    
    // 更新保存状态
    chrome.storage.local.set({ 'saveStatus': 'error' }, () => {
      console.log('[Background] 保存状态已更新为"error"');
    });
    
    // 通知UI更新
    chrome.runtime.sendMessage({
      action: 'updateSaveStatus',
      status: 'error',
      error: error.message
    }, response => {
      if (chrome.runtime.lastError) {
        console.warn('[Background] 通知UI更新时出错:', chrome.runtime.lastError);
      } else {
        console.log('[Background] 已通知UI更新保存状态');
      }
    });
    
    return false;
  }
}

/**
 * 处理来自内容脚本的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message.action);
  
  if (message.action === 'saveConversation') {
    console.log('[Background] 收到保存对话内容请求，对话数量:', message.data.length);
    
    // 保存对话内容到本地存储
    saveConversationsToLocal(message.data);
    
    // 尝试保存到后端API
    saveConversationsToAPI(message.data)
      .then(success => {
        console.log('[Background] API保存结果:', success ? '成功' : '失败');
        sendResponse({ success });
      })
      .catch(error => {
        console.error('[Background] 保存对话内容失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回true表示将异步发送响应
    return true;
  }
  
  // 处理来自内容脚本的saveConversations消息
  if (message.action === 'saveConversations') {
    console.log('[Background] 收到保存多条对话内容请求，对话数量:', message.conversations.length);
    
    // 验证对话内容
    const validConversations = message.conversations.filter(conv => {
      // 确保对话内容有效
      if (!conv.prompt || !conv.response) {
        console.warn('[Background] 忽略无效对话:', conv);
        return false;
      }
      
      // 确保平台信息有效
      if (!conv.platform) {
        console.warn('[Background] 对话缺少平台信息，设置为"未知平台"');
        conv.platform = '未知平台';
      }
      
      return true;
    });
    
    if (validConversations.length === 0) {
      console.warn('[Background] 没有有效的对话内容需要保存');
      sendResponse({ success: false, error: '没有有效的对话内容' });
      return true;
    }
    
    // 保存对话内容到本地存储
    saveConversationsToLocal(validConversations);
    
    // 尝试保存到后端API
    saveConversationsToAPI(validConversations)
      .then(success => {
        console.log('[Background] API保存结果:', success ? '成功' : '失败');
        sendResponse({ success });
      })
      .catch(error => {
        console.error('[Background] 保存对话内容失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // 返回true表示将异步发送响应
    return true;
  }
  
  if (message.action === 'getSaveStatus') {
    console.log('[Background] 收到获取保存状态请求');
    
    chrome.storage.local.get(['saveStatus', 'lastSaved'], data => {
      console.log('[Background] 返回保存状态:', data.saveStatus);
      sendResponse({
        status: data.saveStatus || 'idle',
        timestamp: data.lastSaved
      });
    });
    
    // 返回true表示将异步发送响应
    return true;
  }
  
  if (message.action === 'getConversationHistory') {
    console.log('[Background] 收到获取对话历史请求');
    
    chrome.storage.local.get('conversationHistory', data => {
      const history = data.conversationHistory || [];
      console.log('[Background] 返回对话历史，数量:', history.length);
      sendResponse({
        history: history
      });
    });
    
    // 返回true表示将异步发送响应
    return true;
  }
});

/**
 * 初始化后台脚本
 */
export function init() {
  console.log('[Background] 初始化后台脚本');
  
  // 设置默认的自动保存状态
  chrome.storage.local.get('autoSaveEnabled', data => {
    if (data.autoSaveEnabled === undefined) {
      console.log('[Background] 设置默认自动保存状态为启用');
      chrome.storage.local.set({ 'autoSaveEnabled': true });
    } else {
      console.log('[Background] 当前自动保存状态:', data.autoSaveEnabled ? '启用' : '禁用');
    }
  });
  
  // 设置默认的保存状态
  chrome.storage.local.set({ 'saveStatus': 'idle' }, () => {
    console.log('[Background] 保存状态已初始化为"idle"');
  });
  
  // 清理过期的对话历史
  cleanupExpiredConversations();
}

/**
 * 清理过期的对话历史
 * 保留最近的MAX_HISTORY_SIZE条对话和所有收藏的对话
 */
function cleanupExpiredConversations() {
  console.log('[Background] 清理过期的对话历史');
  
  chrome.storage.local.get('conversationHistory', data => {
    const history = data.conversationHistory || [];
    
    if (history.length <= MAX_HISTORY_SIZE) {
      console.log('[Background] 对话历史数量未超过限制，无需清理');
      return;
    }
    
    // 分离收藏和未收藏的对话
    const favoriteConversations = history.filter(conv => conv.favorite);
    const nonFavoriteConversations = history.filter(conv => !conv.favorite);
    
    // 如果未收藏的对话超过限制，只保留最近的MAX_HISTORY_SIZE条
    if (nonFavoriteConversations.length > MAX_HISTORY_SIZE) {
      console.log(`[Background] 未收藏对话超过${MAX_HISTORY_SIZE}条，进行清理`);
      
      // 按时间排序，保留最新的
      nonFavoriteConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // 只保留最新的MAX_HISTORY_SIZE条
      const cleanedNonFavorites = nonFavoriteConversations.slice(0, MAX_HISTORY_SIZE);
      
      // 合并收藏和清理后的未收藏对话
      const cleanedHistory = [...favoriteConversations, ...cleanedNonFavorites];
      
      console.log(`[Background] 清理前: ${history.length}条, 清理后: ${cleanedHistory.length}条`);
      
      // 保存清理后的历史记录
      chrome.storage.local.set({ 'conversationHistory': cleanedHistory }, () => {
        console.log('[Background] 对话历史清理完成');
      });
    }
  });
}

// 初始化
init(); 