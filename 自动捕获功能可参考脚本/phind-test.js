/**
 * Phind浏览器控制台测试脚本
 * 使用方法：
 * 1. 打开Phind平台
 * 2. 打开浏览器开发者工具
 * 3. 复制本脚本到控制台执行
 */

// 工具函数：提取富文本内容
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
    console.error('[ContentExtractor] 提取富文本内容时发生错误:', error);
    // 出错时回退到简单的文本提取
    return element.textContent.trim();
  }
}

// 捕获Phind对话
function capturePhindConversation() {
  console.log('[Test] 尝试捕获Phind对话内容');
  
  // Phind的对话容器
  const threadContainer = document.querySelector('main.h-full');
  if (!threadContainer) {
    console.log('[Test] 未找到Phind对话容器');
    return null;
  }
  
  // 获取所有对话项
  const messages = threadContainer.querySelectorAll('.h2\.chat-question, h2.chat-question, .chat-answer');
  if (!messages || messages.length === 0) {
    console.log('[Test] 未找到Phind对话项');
    return null;
  }
  
  const conversations = [];
  
  // 遍历对话项，提取用户提问和AI回答
  messages.forEach(msg => {
    const role = msg.classList.contains('h2.chat-question') || msg.classList.contains('chat-question') ? 'user' : 'assistant';
    const content = extractRichContent(msg);
    
    const conversation = {
      platform: 'Phind',
      role,
      content,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('[Test] 捕获Phind对话:', {
      role,
      contentLength: content.length
    });
    
    conversations.push(conversation);
  });
  
  console.log(`[Test] 共捕获 ${conversations.length} 条对话`);
  return conversations;
}

// 执行测试
function runTest() {
  console.log('开始测试对话捕获功能...');
  const result = capturePhindConversation();
  console.log('测试结果:', result);
}

// 运行测试
runTest();