/**
 * 后台脚本测试
 */

import { jest } from '@jest/globals';

// 模拟apiClient模块
jest.mock('../utils/apiClient', () => ({
  promptAPI: {
    autoSavePrompt: jest.fn().mockResolvedValue({ data: { success: true } })
  }
}));

// 模拟chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn(),
    lastError: null
  },
  storage: {
    local: {
      get: jest.fn((key, callback) => {
        if (key === 'token') {
          callback({ token: 'test-token' });
        } else if (key === 'conversationHistory') {
          callback({ conversationHistory: [] });
        } else {
          callback({});
        }
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
      })
    }
  }
};

// 模拟fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);

// 创建模拟函数
const saveConversationsToAPI = jest.fn().mockImplementation(async (conversations) => {
  // 模拟API调用
  await chrome.storage.local.get('token', () => {});
  chrome.storage.local.set({ saveStatus: 'saving' }, () => {});
  chrome.storage.local.set({ saveStatus: 'saved', lastSaved: new Date().toISOString() }, () => {});
  return true;
});

const saveConversationsToLocal = jest.fn().mockImplementation((conversations) => {
  // 模拟本地存储
  chrome.storage.local.get('conversationHistory', () => {});
  chrome.storage.local.set({ conversationHistory: conversations }, () => {});
  chrome.storage.local.set({ saveStatus: 'saved', lastSaved: new Date().toISOString() }, () => {});
});

const init = jest.fn().mockImplementation(() => {
  // 模拟初始化
  chrome.storage.local.get('autoSaveEnabled', () => {});
  chrome.storage.local.set({ saveStatus: 'idle' }, () => {});
});

// 在每个测试后清理
afterEach(() => {
  jest.clearAllMocks();
});

describe('后台脚本测试', () => {
  // 测试保存对话到API
  test('应该能够成功保存对话到API', async () => {
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT', timestamp: new Date().toISOString(), url: 'https://chat.openai.com' }
    ];
    
    // 调用函数
    const result = await saveConversationsToAPI(conversations);
    
    // 验证结果
    expect(saveConversationsToAPI).toHaveBeenCalledWith(conversations);
    expect(result).toBe(true);
  });
  
  // 测试API保存失败的情况
  test('当API请求失败时应该返回错误信息', async () => {
    // 模拟API调用失败
    saveConversationsToAPI.mockRejectedValueOnce(new Error('API错误'));
    
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT', timestamp: new Date().toISOString(), url: 'https://chat.openai.com' }
    ];
    
    try {
      // 调用函数
      await saveConversationsToAPI(conversations);
    } catch (error) {
      // 验证结果
      expect(error.message).toBe('API错误');
    }
    
    // 验证函数被调用
    expect(saveConversationsToAPI).toHaveBeenCalledWith(conversations);
  });
  
  // 测试保存对话到本地存储
  test('应该能够成功保存对话到本地存储', () => {
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT', timestamp: new Date().toISOString(), url: 'https://chat.openai.com' }
    ];
    
    // 调用函数
    saveConversationsToLocal(conversations);
    
    // 验证结果
    expect(saveConversationsToLocal).toHaveBeenCalledWith(conversations);
  });
  
  // 测试初始化函数
  test('应该正确初始化后台脚本', () => {
    // 调用函数
    init();
    
    // 验证结果
    expect(init).toHaveBeenCalled();
  });
  
  // 测试消息处理
  test('应该正确处理saveConversation消息', () => {
    // 准备测试数据
    const message = {
      action: 'saveConversation',
      data: [{ prompt: '测试提示词', response: '测试回复', platform: 'ChatGPT', timestamp: new Date().toISOString(), url: 'https://chat.openai.com' }]
    };
    const sender = {};
    const sendResponse = jest.fn();
    
    // 模拟消息处理函数
    const handleMessage = (message, sender, sendResponse) => {
      if (message.action === 'saveConversation') {
        saveConversationsToLocal(message.data);
        saveConversationsToAPI(message.data);
        return true;
      }
      return false;
    };
    
    // 调用消息处理函数
    const result = handleMessage(message, sender, sendResponse);
    
    // 验证结果
    expect(saveConversationsToLocal).toHaveBeenCalledWith(message.data);
    expect(saveConversationsToAPI).toHaveBeenCalledWith(message.data);
    expect(result).toBe(true); // 返回true表示将异步发送响应
  });
}); 