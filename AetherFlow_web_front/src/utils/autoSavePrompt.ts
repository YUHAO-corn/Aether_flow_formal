import { apiClient } from './apiClient';
import { ApiResponse } from './apiClient';

interface AutoSavePromptParams {
  content: string;
  response?: string;
  platform: string;
  url?: string;
}

/**
 * 自动保存提示词
 * @param params 提示词参数
 * @returns 保存结果
 */
export const autoSavePrompt = async (params: AutoSavePromptParams) => {
  try {
    // 验证必要参数
    if (!params.content || !params.platform) {
      console.error('自动保存提示词失败: 内容和平台不能为空');
      return null;
    }

    // 调用API保存提示词
    const response = await apiClient.post<ApiResponse<any>>('/prompts/auto-save', {
      content: params.content,
      response: params.response || '',
      platform: params.platform,
      url: params.url || window.location.href
    });

    return response.data;
  } catch (error) {
    console.error('自动保存提示词失败:', error);
    return null;
  }
};

/**
 * 创建浏览器插件内容脚本监听器
 * 用于监听页面上的提示词输入和响应
 */
export const setupAutoSaveListener = () => {
  // 仅在浏览器环境中执行
  if (typeof window === 'undefined') return;

  // 创建防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // 防抖处理的自动保存函数
  const debouncedAutoSave = debounce(async (params: AutoSavePromptParams) => {
    await autoSavePrompt(params);
  }, 2000); // 2秒防抖

  // 检测常见AI平台
  const detectPlatform = () => {
    const url = window.location.href;
    if (url.includes('chat.openai.com')) return 'ChatGPT';
    if (url.includes('claude.ai')) return 'Claude';
    if (url.includes('bard.google.com')) return 'Bard';
    if (url.includes('bing.com/chat')) return 'Bing';
    return 'Unknown';
  };

  // 根据平台选择不同的选择器
  const getSelectors = (platform: string) => {
    switch (platform) {
      case 'ChatGPT':
        return {
          promptSelector: 'textarea[data-id="root"]',
          responseSelector: '.markdown'
        };
      case 'Claude':
        return {
          promptSelector: 'textarea.ProseMirror',
          responseSelector: '.claude-response'
        };
      case 'Bard':
        return {
          promptSelector: 'input[aria-label="Ask something"]',
          responseSelector: '.response-content'
        };
      case 'Bing':
        return {
          promptSelector: 'textarea#searchbox',
          responseSelector: '.response-message-content'
        };
      default:
        return {
          promptSelector: 'textarea, input[type="text"]',
          responseSelector: '.response, .answer, .result'
        };
    }
  };

  // 监听用户输入
  const platform = detectPlatform();
  const selectors = getSelectors(platform);

  // 监听DOM变化
  const observer = new MutationObserver((mutations) => {
    // 查找提示词输入框
    const promptElement = document.querySelector(selectors.promptSelector) as HTMLTextAreaElement | HTMLInputElement;
    if (!promptElement) return;

    // 查找响应内容
    const responseElements = document.querySelectorAll(selectors.responseSelector);
    let responseText = '';
    if (responseElements.length > 0) {
      // 获取最后一个响应元素的文本内容
      const lastResponse = responseElements[responseElements.length - 1];
      responseText = lastResponse.textContent || '';
    }

    // 如果有提示词内容，尝试自动保存
    if (promptElement.value && promptElement.value.trim().length > 10) {
      debouncedAutoSave({
        content: promptElement.value,
        response: responseText,
        platform,
        url: window.location.href
      });
    }
  });

  // 开始监听DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // 返回清理函数
  return () => {
    observer.disconnect();
  };
};

export default {
  autoSavePrompt,
  setupAutoSaveListener
}; 