/**
 * 后台脚本测试
 */

// 模拟环境变量
import.meta = {
  env: {
    VITE_API_URL: 'http://localhost:3000/api'
  }
};

// 模拟chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn((key, callback) => {
        if (key === 'token') {
          callback({ token: 'test-token' });
        } else {
          callback({});
        }
      }),
      set: jest.fn()
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

// 导入要测试的函数
import { saveConversationToAPI, saveConversationToStorage, handleMessage } from './background';

// 在每个测试后清理
afterEach(() => {
  jest.clearAllMocks();
});

describe('后台脚本测试', () => {
  // 测试保存对话到API
  test('应该能够成功保存对话到API', async () => {
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT' }
    ];
    
    // 调用函数
    const result = await saveConversationToAPI(conversations);
    
    // 验证结果
    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/prompts/save`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }),
        body: expect.any(String)
      })
    );
    
    expect(result).toEqual({ success: true });
  });
  
  // 测试API保存失败的情况
  test('当API请求失败时应该返回错误信息', async () => {
    // 模拟fetch失败
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );
    
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT' }
    ];
    
    // 调用函数
    const result = await saveConversationToAPI(conversations);
    
    // 验证结果
    expect(result).toEqual({
      success: false,
      error: '保存到API失败: 500 Internal Server Error'
    });
  });
  
  // 测试保存对话到本地存储
  test('应该能够成功保存对话到本地存储', async () => {
    // 准备测试数据
    const conversations = [
      { prompt: '测试提示词1', response: '测试回复1', platform: 'ChatGPT' }
    ];
    
    // 模拟chrome.storage.local.get返回现有对话
    chrome.storage.local.get.mockImplementationOnce((key, callback) => {
      callback({ savedConversations: [] });
    });
    
    // 调用函数
    await saveConversationToStorage(conversations);
    
    // 验证结果
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      'savedConversations',
      expect.any(Function)
    );
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        savedConversations: expect.arrayContaining([
          expect.objectContaining({
            prompt: '测试提示词1',
            response: '测试回复1',
            platform: 'ChatGPT',
            timestamp: expect.any(Number)
          })
        ])
      }),
      expect.any(Function)
    );
  });
  
  // 测试处理消息
  test('应该正确处理saveConversation消息', () => {
    // 模拟saveConversationToAPI和saveConversationToStorage
    const originalSaveToAPI = saveConversationToAPI;
    const originalSaveToStorage = saveConversationToStorage;
    
    global.saveConversationToAPI = jest.fn().mockResolvedValue({ success: true });
    global.saveConversationToStorage = jest.fn().mockResolvedValue();
    
    // 准备测试数据
    const message = {
      action: 'saveConversation',
      data: [{ prompt: '测试提示词', response: '测试回复', platform: 'ChatGPT' }]
    };
    const sender = {};
    const sendResponse = jest.fn();
    
    // 调用函数
    handleMessage(message, sender, sendResponse);
    
    // 验证结果
    expect(global.saveConversationToStorage).toHaveBeenCalledWith(message.data);
    expect(global.saveConversationToAPI).toHaveBeenCalledWith(message.data);
    
    // 恢复原始函数
    global.saveConversationToAPI = originalSaveToAPI;
    global.saveConversationToStorage = originalSaveToStorage;
  });
  
  // 测试处理未知消息
  test('应该忽略未知消息', () => {
    // 模拟saveConversationToAPI和saveConversationToStorage
    const originalSaveToAPI = saveConversationToAPI;
    const originalSaveToStorage = saveConversationToStorage;
    
    global.saveConversationToAPI = jest.fn();
    global.saveConversationToStorage = jest.fn();
    
    // 准备测试数据
    const message = {
      action: 'unknownAction',
      data: {}
    };
    const sender = {};
    const sendResponse = jest.fn();
    
    // 调用函数
    handleMessage(message, sender, sendResponse);
    
    // 验证结果
    expect(global.saveConversationToStorage).not.toHaveBeenCalled();
    expect(global.saveConversationToAPI).not.toHaveBeenCalled();
    
    // 恢复原始函数
    global.saveConversationToAPI = originalSaveToAPI;
    global.saveConversationToStorage = originalSaveToStorage;
  });
}); 