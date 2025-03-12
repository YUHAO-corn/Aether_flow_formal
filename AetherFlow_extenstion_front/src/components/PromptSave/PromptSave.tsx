import React, { useState, useEffect } from 'react';
import './PromptSave.css';

// 保存的提示词类型
interface SavedPrompt {
  id: string;
  content: string;
  platform: string;
  timestamp: string;
  url?: string;
}

const PromptSave: React.FC = () => {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // 加载保存的提示词
  useEffect(() => {
    setIsLoading(true);
    
    // 从存储中获取保存的提示词
    chrome.storage.local.get(['savedPrompts'], (result) => {
      if (result.savedPrompts) {
        setSavedPrompts(result.savedPrompts);
      } else {
        // 模拟数据
        const mockPrompts: SavedPrompt[] = [
          {
            id: '1',
            content: '请帮我分析这段代码的性能问题',
            platform: 'ChatGPT',
            timestamp: new Date().toISOString(),
            url: 'https://chat.openai.com/'
          },
          {
            id: '2',
            content: '如何使用React Hooks实现状态管理？',
            platform: 'Claude',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            url: 'https://claude.ai/'
          }
        ];
        setSavedPrompts(mockPrompts);
      }
      setIsLoading(false);
    });
  }, []);

  // 显示通知
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 打开原始对话链接
  const openOriginalConversation = (url?: string) => {
    if (url) {
      chrome.tabs.create({ url });
    }
  };

  // 复制提示词
  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        showNotification('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败');
      });
  };

  // 删除提示词
  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(prompt => prompt.id !== id);
    setSavedPrompts(updatedPrompts);
    
    // 更新存储
    chrome.storage.local.set({ savedPrompts: updatedPrompts });
    showNotification('已删除提示词');
  };

  return (
    <div className="prompt-save">
      <div className="prompt-save-header">
        <h2>自动保存的提示词</h2>
        <p>最近的对话会自动保存在这里</p>
      </div>
      
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <div className="saved-prompts-list">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : savedPrompts.length > 0 ? (
          savedPrompts.map(prompt => (
            <div key={prompt.id} className="saved-prompt-item">
              <div className="prompt-item-header">
                <span className="prompt-platform">{prompt.platform}</span>
                <span className="prompt-time">{formatTime(prompt.timestamp)}</span>
              </div>
              
              <div className="prompt-item-content">
                {prompt.content}
              </div>
              
              <div className="prompt-item-actions">
                {prompt.url && (
                  <button 
                    className="action-button"
                    onClick={() => openOriginalConversation(prompt.url)}
                  >
                    原始对话
                  </button>
                )}
                <button 
                  className="action-button"
                  onClick={() => copyPrompt(prompt.content)}
                >
                  复制
                </button>
                <button 
                  className="action-button delete"
                  onClick={() => deletePrompt(prompt.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-prompts">
            <p>暂无保存的提示词</p>
            <p>当您在AI平台上进行对话时，提示词会自动保存在这里</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptSave; 