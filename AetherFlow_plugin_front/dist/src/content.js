// 内容脚本 - 在页面中注入和运行

// 检测是否是AI平台
const isAIPlatform = () => {
  const aiPlatforms = [
    'chat.openai.com',
    'claude.ai',
    'bard.google.com',
    'poe.com',
    'perplexity.ai',
    'bing.com/chat',
  ];
  
  return aiPlatforms.some(platform => window.location.hostname.includes(platform));
};

// 初始化
const init = async () => {
  // 检查是否启用自动保存
  const { autoSave = true } = await chrome.storage.sync.get('autoSave');
  
  if (isAIPlatform() && autoSave) {
    // 设置自动保存功能
    setupAutoSave();
  }
  
  // 设置提示词搜索功能
  setupPromptSearch();
  
  // 添加侧边栏切换按钮
  addSidePanelToggle();
};

// 设置自动保存功能
const setupAutoSave = () => {
  // 监听页面变化以检测新的对话
  const observer = new MutationObserver(debounce(checkForNewMessages, 1000));
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  console.log('AetherFlow: 自动保存功能已启用');
};

// 检查新消息
const checkForNewMessages = () => {
  // 这里的选择器需要根据不同的AI平台进行调整
  // 这只是一个示例实现
  const messages = document.querySelectorAll('.message, .chat-message, .conversation-message');
  
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    
    // 检查是否已经处理过这条消息
    if (!lastMessage.dataset.aetherflowProcessed) {
      lastMessage.dataset.aetherflowProcessed = 'true';
      
      // 提取消息内容
      const userMessage = findUserMessage(messages);
      const aiResponse = findAIResponse(messages);
      
      if (userMessage && aiResponse) {
        // 保存对话
        saveConversation(userMessage, aiResponse);
      }
    }
  }
};

// 查找用户消息
const findUserMessage = (messages) => {
  // 从后向前查找用户消息
  for (let i = messages.length - 2; i >= 0; i--) {
    const message = messages[i];
    if (isUserMessage(message)) {
      return message.textContent.trim();
    }
  }
  return null;
};

// 查找AI响应
const findAIResponse = (messages) => {
  const lastMessage = messages[messages.length - 1];
  if (isAIMessage(lastMessage)) {
    return lastMessage.textContent.trim();
  }
  return null;
};

// 判断是否是用户消息
const isUserMessage = (element) => {
  // 这里的判断逻辑需要根据不同的AI平台进行调整
  return element.classList.contains('user-message') || 
         element.querySelector('.user-message') !== null ||
         element.getAttribute('data-message-author-role') === 'user';
};

// 判断是否是AI消息
const isAIMessage = (element) => {
  // 这里的判断逻辑需要根据不同的AI平台进行调整
  return element.classList.contains('ai-message') || 
         element.querySelector('.ai-message') !== null ||
         element.getAttribute('data-message-author-role') === 'assistant';
};

// 保存对话
const saveConversation = (prompt, response) => {
  const data = {
    prompt,
    response,
    platform: window.location.hostname,
    url: window.location.href,
    favorite: false,
  };
  
  chrome.runtime.sendMessage(
    { type: 'SAVE_PROMPT', data },
    (response) => {
      if (response && response.success) {
        showSaveNotification();
      }
    }
  );
};

// 显示保存通知
const showSaveNotification = () => {
  const notification = document.createElement('div');
  notification.className = 'aetherflow-notification';
  notification.textContent = '✓ 提示词已保存';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #1F2937;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #374151;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // 显示通知
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // 3秒后隐藏通知
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
};

// 设置提示词搜索功能
const setupPromptSearch = () => {
  // 监听输入框的键盘事件
  document.addEventListener('keydown', handleKeyDown);
};

// 处理键盘事件
const handleKeyDown = (event) => {
  // 检查是否是输入框
  if (!isInputElement(event.target)) {
    return;
  }
  
  // 检查是否输入了 "/"
  if (event.key === '/' && event.target.value === '') {
    event.preventDefault();
    showPromptSearch(event.target);
  }
};

// 判断是否是输入元素
const isInputElement = (element) => {
  return element.tagName === 'INPUT' || 
         element.tagName === 'TEXTAREA' || 
         element.getAttribute('contenteditable') === 'true';
};

// 显示提示词搜索
const showPromptSearch = (inputElement) => {
  // 创建搜索容器
  const searchContainer = document.createElement('div');
  searchContainer.className = 'aetherflow-search-container';
  searchContainer.style.cssText = `
    position: absolute;
    z-index: 10000;
    background-color: #1F2937;
    border: 1px solid #374151;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    width: 300px;
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;
  `;
  
  // 计算位置
  const rect = inputElement.getBoundingClientRect();
  searchContainer.style.top = `${rect.bottom + window.scrollY + 8}px`;
  searchContainer.style.left = `${rect.left + window.scrollX}px`;
  
  // 创建搜索输入框
  const searchInput = document.createElement('input');
  searchInput.className = 'aetherflow-search-input';
  searchInput.placeholder = '搜索提示词...';
  searchInput.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #4B5563;
    border-radius: 4px;
    background-color: #374151;
    color: white;
    font-size: 14px;
    margin-bottom: 8px;
  `;
  
  // 创建结果容器
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'aetherflow-search-results';
  
  // 添加到DOM
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(resultsContainer);
  document.body.appendChild(searchContainer);
  
  // 聚焦搜索框
  searchInput.focus();
  
  // 加载提示词
  loadPrompts(resultsContainer, inputElement);
  
  // 监听搜索输入
  searchInput.addEventListener('input', () => {
    loadPrompts(resultsContainer, inputElement, searchInput.value);
  });
  
  // 监听点击事件，关闭搜索
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && e.target !== inputElement) {
      searchContainer.remove();
    }
  });
  
  // 监听ESC键，关闭搜索
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchContainer.remove();
    }
  });
};

// 加载提示词
const loadPrompts = (container, inputElement, searchTerm = '') => {
  chrome.runtime.sendMessage(
    { type: 'GET_PROMPTS' },
    (response) => {
      if (response && response.success) {
        renderPrompts(container, inputElement, response.prompts, searchTerm);
      }
    }
  );
};

// 渲染提示词
const renderPrompts = (container, inputElement, prompts, searchTerm) => {
  // 清空容器
  container.innerHTML = '';
  
  // 过滤提示词
  const filteredPrompts = searchTerm
    ? prompts.filter(p => 
        p.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : prompts;
  
  // 排序：收藏 > 高频使用 > 低频使用
  filteredPrompts.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return (b.usageCount || 0) - (a.usageCount || 0);
  });
  
  // 限制数量
  const limitedPrompts = filteredPrompts.slice(0, 10);
  
  if (limitedPrompts.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'aetherflow-no-results';
    noResults.textContent = '没有找到匹配的提示词';
    noResults.style.cssText = `
      padding: 12px;
      text-align: center;
      color: #9CA3AF;
      font-size: 14px;
    `;
    container.appendChild(noResults);
    return;
  }
  
  // 创建提示词项
  limitedPrompts.forEach(prompt => {
    const promptItem = document.createElement('div');
    promptItem.className = 'aetherflow-prompt-item';
    promptItem.style.cssText = `
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 4px;
      background-color: ${prompt.favorite ? '#374151' : '#1F2937'};
      border: 1px solid ${prompt.favorite ? '#4B5563' : '#374151'};
      transition: background-color 0.2s;
    `;
    
    // 提示词内容
    const promptContent = document.createElement('div');
    promptContent.className = 'aetherflow-prompt-content';
    promptContent.textContent = truncateText(prompt.prompt, 100);
    promptContent.style.cssText = `
      font-size: 14px;
      color: #E5E7EB;
      margin-bottom: 4px;
    `;
    
    // 提示词元数据
    const promptMeta = document.createElement('div');
    promptMeta.className = 'aetherflow-prompt-meta';
    promptMeta.style.cssText = `
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #9CA3AF;
    `;
    
    // 平台信息
    const promptPlatform = document.createElement('span');
    promptPlatform.textContent = prompt.platform || '未知平台';
    
    // 收藏标记
    const favoriteIcon = document.createElement('span');
    favoriteIcon.textContent = prompt.favorite ? '★' : '☆';
    favoriteIcon.style.color = prompt.favorite ? '#FBBF24' : '#9CA3AF';
    
    promptMeta.appendChild(promptPlatform);
    promptMeta.appendChild(favoriteIcon);
    
    promptItem.appendChild(promptContent);
    promptItem.appendChild(promptMeta);
    
    // 点击事件 - 插入提示词
    promptItem.addEventListener('click', () => {
      insertPrompt(inputElement, prompt.prompt);
      
      // 更新使用次数
      updatePromptUsage(prompt.id);
      
      // 关闭搜索
      container.parentElement.remove();
    });
    
    // 悬停效果
    promptItem.addEventListener('mouseenter', () => {
      promptItem.style.backgroundColor = prompt.favorite ? '#4B5563' : '#374151';
    });
    
    promptItem.addEventListener('mouseleave', () => {
      promptItem.style.backgroundColor = prompt.favorite ? '#374151' : '#1F2937';
    });
    
    container.appendChild(promptItem);
  });
};

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
};

// 插入提示词
const insertPrompt = (inputElement, promptText) => {
  if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
    inputElement.value = promptText;
    // 触发input事件，确保其他脚本能够检测到变化
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (inputElement.getAttribute('contenteditable') === 'true') {
    inputElement.textContent = promptText;
    // 触发input事件
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

// 更新提示词使用次数
const updatePromptUsage = (promptId) => {
  chrome.runtime.sendMessage({
    type: 'UPDATE_PROMPT_USAGE',
    data: { promptId }
  });
};

// 添加侧边栏切换按钮
const addSidePanelToggle = () => {
  const toggleButton = document.createElement('button');
  toggleButton.className = 'aetherflow-toggle-button';
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 3H3C1.89 3 1 3.89 1 5V19C1 20.11 1.89 21 3 21H21C22.11 21 23 20.11 23 19V5C23 3.89 22.11 3 21 3Z"></path>
      <path d="M9 3V21"></path>
    </svg>
  `;
  toggleButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #8B5CF6;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
  `;
  
  // 悬停效果
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.backgroundColor = '#7C3AED';
    toggleButton.style.transform = 'scale(1.05)';
  });
  
  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.backgroundColor = '#8B5CF6';
    toggleButton.style.transform = 'scale(1)';
  });
  
  // 点击事件 - 打开侧边栏
  toggleButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_SIDE_PANEL' });
  });
  
  document.body.appendChild(toggleButton);
};

// 工具函数：防抖
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 初始化
init(); 