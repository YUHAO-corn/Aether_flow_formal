import { extractRichContent } from './contentUtils';

export function capturePhind() {
  try {
    const messages = [];
    const threadContainer = document.querySelector('main.h-full');
    
    if (!threadContainer) return [];

    const messageElements = threadContainer.querySelectorAll('.h2\.chat-question, h2.chat-question, .chat-answer');
    
    messageElements.forEach(element => {
      const role = element.classList.contains('h2.chat-question') || element.classList.contains('chat-question') ? 'user' : 'assistant';
      const contentElement = element;
      
      if (contentElement) {
        const content = extractRichContent(contentElement);
        if (content) {
          messages.push({
            role,
            content,
            timestamp: new Date().toISOString(),
            platform: 'Phind'
          });
        }
      }
    });

    return messages;
  } catch (error) {
    console.error('[Phind Adapter] 捕获对话时发生错误:', error);
    return [];
  }
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      const newMessages = capturePhind();
      if (newMessages.length > 0) {
        chrome.runtime.sendMessage({
          type: 'NEW_MESSAGES',
          payload: newMessages
        });
      }
    }
  });
});

// 启动监听
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false
});