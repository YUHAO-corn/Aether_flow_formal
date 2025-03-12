import React, { useState } from 'react';
import './PromptCard.css';

// 提示词类型定义
interface Prompt {
  id: string;
  content: string;
  response?: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  platform?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onToggleFavorite }) => {
  const [showModal, setShowModal] = useState(false);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // 复制提示词到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  // 插入提示词到当前活动页面
  const insertPrompt = (text: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text });
      }
    });
    setShowModal(false);
  };
  
  return (
    <>
      <div className="prompt-card" onClick={() => setShowModal(true)}>
        <div className="prompt-card-header">
          <div className="prompt-platform">{prompt.platform || '未知平台'}</div>
          <div 
            className={`prompt-favorite ${prompt.favorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            {prompt.favorite ? '★' : '☆'}
          </div>
        </div>
        
        <div className="prompt-content">
          {prompt.content.length > 100 
            ? prompt.content.substring(0, 100) + '...' 
            : prompt.content
          }
        </div>
        
        <div className="prompt-tags">
          {prompt.tags.map(tag => (
            <span key={tag} className="prompt-tag">{tag}</span>
          ))}
        </div>
        
        <div className="prompt-date">
          {formatDate(prompt.createdAt)}
        </div>
      </div>
      
      {showModal && (
        <div className="prompt-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-modal-header">
              <h3>提示词详情</h3>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="prompt-modal-content">
              <div className="prompt-detail">
                <h4>提示词</h4>
                <div className="prompt-text">{prompt.content}</div>
              </div>
              
              {prompt.response && (
                <div className="prompt-detail">
                  <h4>回复</h4>
                  <div className="prompt-text">{prompt.response}</div>
                </div>
              )}
              
              <div className="prompt-info">
                <div>
                  <strong>平台:</strong> {prompt.platform || '未知平台'}
                </div>
                <div>
                  <strong>创建时间:</strong> {formatDate(prompt.createdAt)}
                </div>
                <div>
                  <strong>标签:</strong> {prompt.tags.join(', ')}
                </div>
              </div>
            </div>
            
            <div className="prompt-modal-actions">
              <button 
                className="action-button"
                onClick={() => copyToClipboard(prompt.content)}
              >
                复制
              </button>
              <button 
                className="action-button primary"
                onClick={() => insertPrompt(prompt.content)}
              >
                插入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptCard; 