/**
 * 提取器管理器测试
 */

import { jest } from '@jest/globals';

// 模拟window.location
Object.defineProperty(window, 'location', {
  value: { href: 'https://chat.openai.com/chat' },
  writable: true
});

// 创建模拟提取器函数
const mockChatGPTExtractor = jest.fn().mockReturnValue([{ platform: 'ChatGPT', prompt: 'test', response: 'response' }]);
const mockClaudeExtractor = jest.fn().mockReturnValue([{ platform: 'Claude', prompt: 'test', response: 'response' }]);
const mockBardExtractor = jest.fn().mockReturnValue([{ platform: 'Bard', prompt: 'test', response: 'response' }]);
const mockGenericExtractor = jest.fn().mockReturnValue([{ platform: 'Generic', prompt: 'test', response: 'response' }]);

// 模拟提取器管理器类
class ExtractorManager {
  constructor() {
    // 注册平台特定的提取器
    this.extractors = {
      'ChatGPT': mockChatGPTExtractor,
      'Claude': mockClaudeExtractor,
      'Bard': mockBardExtractor,
      'generic': mockGenericExtractor
    };
  }
  
  /**
   * 根据当前URL选择合适的提取器
   * @returns {Function} 提取器函数
   */
  getExtractor() {
    const url = window.location.href;
    
    // 根据URL选择提取器
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

describe('提取器管理器测试', () => {
  let extractorManager;
  
  beforeEach(() => {
    // 创建提取器管理器实例
    extractorManager = new ExtractorManager();
    
    // 重置所有模拟函数
    mockChatGPTExtractor.mockClear();
    mockClaudeExtractor.mockClear();
    mockBardExtractor.mockClear();
    mockGenericExtractor.mockClear();
  });
  
  test('应该根据URL选择正确的提取器', () => {
    // 测试ChatGPT URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    let extractor = extractorManager.getExtractor();
    expect(extractor).toBe(mockChatGPTExtractor);
    
    // 测试Claude URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://claude.ai/chat' }
    });
    
    extractor = extractorManager.getExtractor();
    expect(extractor).toBe(mockClaudeExtractor);
    
    // 测试Bard URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://bard.google.com/chat' }
    });
    
    extractor = extractorManager.getExtractor();
    expect(extractor).toBe(mockBardExtractor);
    
    // 测试未知平台URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://unknown-ai-platform.com/chat' }
    });
    
    extractor = extractorManager.getExtractor();
    expect(extractor).toBe(mockGenericExtractor);
  });
  
  test('应该调用选择的提取器', () => {
    // 测试ChatGPT URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    extractorManager.extractConversation();
    expect(mockChatGPTExtractor).toHaveBeenCalled();
    expect(mockClaudeExtractor).not.toHaveBeenCalled();
    expect(mockBardExtractor).not.toHaveBeenCalled();
    expect(mockGenericExtractor).not.toHaveBeenCalled();
  });
  
  test('如果特定提取器失败，应该尝试使用通用提取器', () => {
    // 测试ChatGPT URL，但提取器会抛出错误
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    // 模拟ChatGPT提取器抛出错误
    mockChatGPTExtractor.mockImplementationOnce(() => {
      throw new Error('测试错误');
    });
    
    extractorManager.extractConversation();
    expect(mockChatGPTExtractor).toHaveBeenCalled();
    expect(mockGenericExtractor).toHaveBeenCalled();
  });
  
  test('应该返回提取器的结果', () => {
    // 测试ChatGPT URL
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com/chat' }
    });
    
    const result = extractorManager.extractConversation();
    expect(result).toEqual([{ platform: 'ChatGPT', prompt: 'test', response: 'response' }]);
  });
}); 