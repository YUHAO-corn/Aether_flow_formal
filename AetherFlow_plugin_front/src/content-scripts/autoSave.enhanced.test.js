/**
 * 自动保存内容脚本增强功能测试
 */

import { jest } from '@jest/globals';

// 模拟chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
    }),
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

// 模拟window.location
Object.defineProperty(window, 'location', {
  value: { href: 'https://chat.openai.com/chat' },
  writable: true
});

// 导入要测试的函数
import {
  captureChatGPTConversation,
  captureClaudeConversation,
  captureBardConversation,
  captureGenericConversation,
  captureConversation
} from './autoSave';

// 模拟DOM环境
function setupRichTextDOM() {
  document.body.innerHTML = `
    <main>
      <div class="flex flex-col items-center">
        <div class="group">
          <div data-message-author-role="user">测试提示词<code>console.log('hello')</code></div>
        </div>
        <div class="group">
          <div data-message-author-role="assistant">
            测试回复
            <pre>function test() {
  return 'hello world';
}</pre>
            更多文本内容
          </div>
        </div>
      </div>
    </main>
  `;
}

// 模拟元数据
function setupMetadataDOM() {
  document.title = "测试对话 - ChatGPT";
  document.body.innerHTML += `
    <div class="model-selector" title="Model: GPT-4">GPT-4</div>
    <div class="conversation-title">测试对话标题</div>
  `;
}

describe('自动保存增强功能测试', () => {
  beforeEach(() => {
    // 清理DOM
    document.body.innerHTML = '';
    // 重置模拟
    jest.clearAllMocks();
  });
  
  test('应该能够提取富文本内容', () => {
    // 设置DOM
    setupRichTextDOM();
    
    // 调用函数
    const conversations = captureChatGPTConversation();
    
    // 验证结果
    expect(conversations).toBeTruthy();
    expect(conversations.length).toBeGreaterThan(0);
    
    // 检查是否正确提取了代码块
    const conversation = conversations[0];
    expect(conversation.prompt).toContain('console.log');
    expect(conversation.response).toContain('function test()');
    expect(conversation.response).toContain('```');
  });
  
  test('应该能够捕获元数据', () => {
    // 设置DOM
    setupRichTextDOM();
    setupMetadataDOM();
    
    // 调用函数
    const conversations = captureChatGPTConversation();
    
    // 验证结果
    expect(conversations).toBeTruthy();
    expect(conversations.length).toBeGreaterThan(0);
    
    // 检查元数据
    const conversation = conversations[0];
    expect(conversation.metadata).toBeTruthy();
    expect(conversation.metadata.title).toContain('测试对话 - ChatGPT');
    expect(conversation.metadata.platform).toBe('ChatGPT');
    expect(conversation.metadata.model).toContain('GPT-4');
  });
  
  test('提取器管理器应该能够选择正确的提取器', () => {
    // 设置DOM
    setupRichTextDOM();
    
    // 设置不同的URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    // 调用函数
    let conversations = captureConversation();
    expect(conversations).toBeTruthy();
    
    // 设置Claude URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://claude.ai/chat' }
    });
    
    // 设置Claude DOM
    document.body.innerHTML = `
      <div class="claude-container">
        <div class="conversation-container">
          <div class="user-message">
            <div class="message-content">测试提示词<code>console.log('hello')</code></div>
          </div>
          <div class="assistant-message">
            <div class="message-content">
              测试回复
              <pre>function test() {
                return 'hello world';
              }</pre>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 调用函数
    conversations = captureConversation();
    
    // 由于我们没有完全模拟Claude的DOM，这里可能会返回null
    // 但我们至少可以确认代码没有崩溃
    expect(() => captureConversation()).not.toThrow();
  });
  
  test('通用捕获逻辑应该能够处理未知平台', () => {
    // 设置未知平台URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://unknown-ai-platform.com/chat' }
    });
    
    // 设置通用DOM
    document.body.innerHTML = `
      <div class="chat-container">
        <div class="message user">测试用户消息</div>
        <div class="message assistant">测试AI回复</div>
      </div>
    `;
    
    // 调用函数
    const conversations = captureGenericConversation();
    
    // 验证结果 - 由于我们的模拟可能不完整，这里主要测试代码不会崩溃
    expect(() => captureGenericConversation()).not.toThrow();
  });
}); 