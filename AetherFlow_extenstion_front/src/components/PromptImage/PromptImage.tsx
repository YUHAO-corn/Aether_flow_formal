import React, { useState, useEffect, useRef } from 'react';
import './PromptImage.css';

// 提示词类型
interface Prompt {
  id: string;
  content: string;
  tags: string[];
  favorite: boolean;
}

const PromptImage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 加载提示词数据
  useEffect(() => {
    // 模拟数据
    const mockPrompts: Prompt[] = [
      {
        id: '1',
        content: '请帮我分析这段代码的性能问题',
        tags: ['编程', '优化'],
        favorite: true
      },
      {
        id: '2',
        content: '如何使用React Hooks实现状态管理？',
        tags: ['React', '前端'],
        favorite: false
      },
      {
        id: '3',
        content: '写一篇关于人工智能的短文',
        tags: ['写作', 'AI'],
        favorite: true
      },
      {
        id: '4',
        content: '分析这段文本的情感倾向',
        tags: ['分析', 'NLP'],
        favorite: false
      }
    ];
    
    setPrompts(mockPrompts);
  }, []);

  // 监听输入框变化
  useEffect(() => {
    if (searchTerm.startsWith('/')) {
      const query = searchTerm.slice(1).toLowerCase();
      
      if (query) {
        setIsLoading(true);
        setIsVisible(true);
        
        // 模拟搜索延迟
        const timer = setTimeout(() => {
          const filtered = prompts.filter(prompt => 
            prompt.content.toLowerCase().includes(query) || 
            prompt.tags.some(tag => tag.toLowerCase().includes(query))
          );
          
          // 排序：收藏 > 高频使用 > 低频使用（这里简化为收藏优先）
          const sorted = [...filtered].sort((a, b) => {
            if (a.favorite !== b.favorite) {
              return a.favorite ? -1 : 1;
            }
            return 0;
          });
          
          setFilteredPrompts(sorted);
          setIsLoading(false);
        }, 300);
        
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [searchTerm, prompts]);

  // 插入提示词
  const insertPrompt = (content: string) => {
    if (searchInputRef.current) {
      // 在实际应用中，这里应该将提示词插入到当前活动的输入框中
      // 这里只是模拟
      searchInputRef.current.value = content;
      setSearchTerm(content);
      setIsVisible(false);
      
      // 通知内容脚本插入提示词
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text: content });
        }
      });
    }
  };

  // 监听键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
    }
  };

  return (
    <div className="prompt-image">
      <div className="prompt-image-header">
        <h2>提示词图像</h2>
        <p>输入"/"后跟关键词快速搜索提示词</p>
      </div>
      
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="输入 / 开始搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        {isVisible && (
          <div className="search-results">
            {isLoading ? (
              <div className="loading">搜索中...</div>
            ) : filteredPrompts.length > 0 ? (
              filteredPrompts.map(prompt => (
                <div 
                  key={prompt.id} 
                  className="prompt-result-item"
                  onClick={() => insertPrompt(prompt.content)}
                >
                  <div className="prompt-result-content">
                    {prompt.content.length > 50 
                      ? prompt.content.substring(0, 50) + '...' 
                      : prompt.content
                    }
                  </div>
                  <div className="prompt-result-tags">
                    {prompt.tags.map(tag => (
                      <span key={tag} className="prompt-result-tag">{tag}</span>
                    ))}
                    {prompt.favorite && <span className="favorite-icon">★</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">没有找到匹配的提示词</div>
            )}
          </div>
        )}
      </div>
      
      <div className="usage-guide">
        <h3>使用指南</h3>
        <ul>
          <li>在AI平台的输入框中输入"/"后跟关键词</li>
          <li>从下拉菜单中选择合适的提示词</li>
          <li>点击提示词将其插入到输入框</li>
        </ul>
        <div className="example">
          <p>示例: /写作、/编程、/分析</p>
        </div>
      </div>
    </div>
  );
};

export default PromptImage; 