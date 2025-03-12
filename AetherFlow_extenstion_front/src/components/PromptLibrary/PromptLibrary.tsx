import React, { useState, useEffect } from 'react';
import './PromptLibrary.css';
import PromptCard from './PromptCard';

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

const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'favorite' | 'usage'>('time');
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          content: '请帮我优化这段代码，使其更加高效',
          response: '这是优化后的代码...',
          tags: ['编程', '优化'],
          favorite: true,
          createdAt: '2023-05-15T10:30:00Z',
          platform: 'ChatGPT'
        },
        {
          id: '2',
          content: '写一篇关于人工智能的短文',
          response: '人工智能是现代科技的重要分支...',
          tags: ['写作', 'AI'],
          favorite: false,
          createdAt: '2023-05-14T15:45:00Z',
          platform: 'Claude'
        },
        {
          id: '3',
          content: '分析这段文本的情感倾向',
          response: '这段文本的情感倾向是积极的...',
          tags: ['分析', 'NLP'],
          favorite: true,
          createdAt: '2023-05-13T09:20:00Z',
          platform: 'Bard'
        }
      ];
      
      setPrompts(mockPrompts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 过滤提示词
  const filteredPrompts = prompts.filter(prompt => {
    // 搜索词过滤
    const matchesSearch = searchTerm === '' || 
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 标签过滤
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => prompt.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // 排序提示词
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (sortBy === 'favorite') {
      // 收藏优先
      return a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1;
    } else if (sortBy === 'time') {
      // 时间排序（新到旧）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // 默认时间排序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // 收藏/取消收藏提示词
  const toggleFavorite = (id: string) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, favorite: !prompt.favorite } : prompt
    ));
  };

  // 获取所有标签
  const allTags = Array.from(new Set(prompts.flatMap(prompt => prompt.tags)));

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="prompt-library">
      <div className="prompt-library-header">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="搜索提示词或标签..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sort-options">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'time' | 'favorite' | 'usage')}
          >
            <option value="time">按时间排序</option>
            <option value="favorite">按收藏排序</option>
            <option value="usage">按使用频率排序</option>
          </select>
        </div>
      </div>
      
      <div className="tags-container">
        {allTags.map(tag => (
          <div 
            key={tag} 
            className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </div>
        ))}
      </div>
      
      <div className="prompts-container">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : sortedPrompts.length > 0 ? (
          sortedPrompts.map(prompt => (
            <PromptCard 
              key={prompt.id}
              prompt={prompt}
              onToggleFavorite={() => toggleFavorite(prompt.id)}
            />
          ))
        ) : (
          <div className="no-results">没有找到匹配的提示词</div>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary; 