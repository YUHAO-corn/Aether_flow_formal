/**
 * 自动保存内容脚本测试
 */

// 模拟chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn((key, callback) => {
        callback({ autoSaveEnabled: true });
      }),
      set: jest.fn()
    }
  }
};

// 导入要测试的函数
// 注意：由于我们在导入前模拟了chrome对象，所以不会出现"chrome is not defined"错误
import {
  captureChatGPTConversation,
  captureClaudeConversation,
  captureBardConversation,
  captureConversation,
  initAutoSave
} from './autoSave';

// 模拟DOM环境
function setupChatGPTDOM() {
  document.body.innerHTML = `
    <main>
      <div class="flex flex-col items-center">
        <div class="group">
          <div data-message-author-role="user">测试提示词1</div>
        </div>
        <div class="group">
          <div data-message-author-role="assistant">测试回复1</div>
        </div>
        <div class="group">
          <div data-message-author-role="user">测试提示词2</div>
        </div>
        <div class="group">
          <div data-message-author-role="assistant">测试回复2</div>
        </div>
      </div>
    </main>
  `;
}

function setupClaudeDOM() {
  document.body.innerHTML = `
    <div class="claude-container">
      <div class="conversation-container">
        <div class="user-message">
          <div class="message-content">测试提示词1</div>
        </div>
        <div class="assistant-message">
          <div class="message-content">测试回复1</div>
        </div>
        <div class="user-message">
          <div class="message-content">测试提示词2</div>
        </div>
        <div class="assistant-message">
          <div class="message-content">测试回复2</div>
        </div>
      </div>
    </div>
  `;
}

function setupBardDOM() {
  document.body.innerHTML = `
    <div class="conversation-container">
      <div class="message-group">
        <div class="user-query">测试提示词1</div>
        <div class="model-response">测试回复1</div>
      </div>
      <div class="message-group">
        <div class="user-query">测试提示词2</div>
        <div class="model-response">测试回复2</div>
      </div>
    </div>
  `;
}

// 在每个测试后清理
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

describe('内容脚本测试', () => {
  // 测试ChatGPT对话捕获
  test('应该能够捕获ChatGPT对话内容', () => {
    // 设置URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    // 设置DOM
    setupChatGPTDOM();
    
    // 调用函数
    const conversations = captureChatGPTConversation();
    
    // 验证结果
    expect(conversations).toHaveLength(2);
    expect(conversations[0].prompt).toBe('测试提示词1');
    expect(conversations[0].response).toBe('测试回复1');
    expect(conversations[0].platform).toBe('ChatGPT');
    expect(conversations[1].prompt).toBe('测试提示词2');
    expect(conversations[1].response).toBe('测试回复2');
  });
  
  // 测试Claude对话捕获
  test('应该能够捕获Claude对话内容', () => {
    // 设置URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://claude.ai/chat' }
    });
    
    // 设置DOM
    setupClaudeDOM();
    
    // 调用函数
    const conversations = captureClaudeConversation();
    
    // 验证结果
    expect(conversations).toHaveLength(2);
    expect(conversations[0].prompt).toBe('测试提示词1');
    expect(conversations[0].response).toBe('测试回复1');
    expect(conversations[0].platform).toBe('Claude');
    expect(conversations[1].prompt).toBe('测试提示词2');
    expect(conversations[1].response).toBe('测试回复2');
  });
  
  // 测试Bard对话捕获
  test('应该能够捕获Bard对话内容', () => {
    // 设置URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://bard.google.com/chat' }
    });
    
    // 设置DOM
    setupBardDOM();
    
    // 调用函数
    const conversations = captureBardConversation();
    
    // 验证结果
    expect(conversations).toHaveLength(2);
    expect(conversations[0].prompt).toBe('测试提示词1');
    expect(conversations[0].response).toBe('测试回复1');
    expect(conversations[0].platform).toBe('Bard');
    expect(conversations[1].prompt).toBe('测试提示词2');
    expect(conversations[1].response).toBe('测试回复2');
  });
  
  // 测试根据URL选择正确的捕获函数
  test('应该根据URL选择正确的捕获函数', () => {
    // 模拟捕获函数
    const originalCaptureChatGPT = captureChatGPTConversation;
    const originalCaptureClaude = captureClaudeConversation;
    const originalCaptureBard = captureBardConversation;
    
    global.captureChatGPTConversation = jest.fn().mockReturnValue([{ prompt: 'test' }]);
    global.captureClaudeConversation = jest.fn().mockReturnValue([{ prompt: 'test' }]);
    global.captureBardConversation = jest.fn().mockReturnValue([{ prompt: 'test' }]);
    
    // 测试ChatGPT
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    captureConversation();
    expect(global.captureChatGPTConversation).toHaveBeenCalled();
    
    // 测试Claude
    Object.defineProperty(window, 'location', {
      value: { href: 'https://claude.ai/chat' }
    });
    captureConversation();
    expect(global.captureClaudeConversation).toHaveBeenCalled();
    
    // 测试Bard
    Object.defineProperty(window, 'location', {
      value: { href: 'https://bard.google.com/chat' }
    });
    captureConversation();
    expect(global.captureBardConversation).toHaveBeenCalled();
    
    // 恢复原始函数
    global.captureChatGPTConversation = originalCaptureChatGPT;
    global.captureClaudeConversation = originalCaptureClaude;
    global.captureBardConversation = originalCaptureBard;
  });
  
  // 测试发送消息到后台脚本
  test('应该发送捕获的对话内容到后台脚本', () => {
    // 设置URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    // 设置DOM
    setupChatGPTDOM();
    
    // 调用函数
    captureConversation();
    
    // 验证结果
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'saveConversation',
        data: expect.any(Array)
      }),
      expect.any(Function)
    );
  });
  
  // 测试初始化函数
  test('应该正确初始化自动保存功能', () => {
    // 模拟setInterval和MutationObserver
    jest.useFakeTimers();
    global.MutationObserver = jest.fn(function(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = (mutations) => callback(mutations);
    });
    
    // 调用函数
    initAutoSave();
    
    // 验证结果
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      'autoSaveEnabled',
      expect.any(Function)
    );
    
    // 验证定时器
    expect(setInterval).toHaveBeenCalled();
    
    // 验证MutationObserver
    const observer = new MutationObserver(() => {});
    expect(observer.observe).toHaveBeenCalled();
    
    // 恢复真实定时器
    jest.useRealTimers();
  });
}); 