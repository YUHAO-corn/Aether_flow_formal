import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Tag, Plus, Trash, Copy, Edit } from 'lucide-react';
import apiClient from '../api';

const PromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFavorites, setShowFavorites] = useState(false);
  
  useEffect(() => {
    fetchPrompts();
    fetchTags();
  }, [searchTerm, selectedTags, sortBy, showFavorites]);
  
  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 20
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedTags.length > 0) {
        params.tags = selectedTags;
      }
      
      if (showFavorites) {
        params.favorite = true;
      }
      
      const response = await apiClient.prompts.getAll(params);
      if (response.data && response.data.prompts) {
        setPrompts(response.data.prompts);
      }
    } catch (err) {
      console.error('获取提示词失败:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTags = async () => {
    try {
      const response = await apiClient.tags.getAll();
      if (response.data && response.data.tags) {
        setAvailableTags(response.data.tags);
      }
    } catch (err) {
      console.error('获取标签失败:', err);
    }
  };
  
  const handleTagSelect = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };
  
  const handleFavoriteToggle = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p._id === promptId);
      if (!prompt) return;
      
      if (prompt.favorite) {
        await apiClient.prompts.update(promptId, { favorite: false });
      } else {
        await apiClient.prompts.update(promptId, { favorite: true });
      }
      
      // 更新本地状态
      setPrompts(prompts.map(p => 
        p._id === promptId ? { ...p, favorite: !p.favorite } : p
      ));
    } catch (err) {
      console.error('更新收藏状态失败:', err);
    }
  };
  
  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    // 可以添加一个复制成功的提示
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">提示词管理</h1>
        <p className="text-gray-400">管理和组织您的提示词库</p>
      </div>
      
      {/* 搜索和筛选栏 */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索提示词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button className="flex items-center space-x-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Filter size={18} />
                <span>筛选</span>
              </button>
            </div>
            
            <div className="relative">
              <button 
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  showFavorites 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Star size={18} className={showFavorites ? 'text-white' : 'text-gray-400'} />
                <span>收藏</span>
              </button>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none pr-8"
              >
                <option value="createdAt">最新创建</option>
                <option value="updatedAt">最近更新</option>
                <option value="usageCount">使用频率</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* 标签筛选 */}
        {availableTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag._id}
                onClick={() => handleTagSelect(tag.name)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Tag size={14} />
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 提示词列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <div key={prompt._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-400">{prompt.platform || '未知平台'}</span>
                  </div>
                  <button
                    onClick={() => handleFavoriteToggle(prompt._id)}
                    className={`p-1 rounded-full hover:bg-gray-700 transition-colors ${
                      prompt.favorite ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                  >
                    <Star size={18} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{prompt.title || '未命名提示词'}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3">{prompt.content}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags && prompt.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                  {(!prompt.tags || prompt.tags.length === 0) && (
                    <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-500">
                      无标签
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatDate(prompt.createdAt)}</span>
                  <span>{prompt.usageCount || 0} 次使用</span>
                </div>
              </div>
              
              <div className="flex border-t border-gray-700">
                <button
                  onClick={() => handleCopyPrompt(prompt.content)}
                  className="flex-1 py-3 flex items-center justify-center space-x-1 hover:bg-gray-700 transition-colors"
                >
                  <Copy size={16} className="text-gray-400" />
                  <span className="text-sm">复制</span>
                </button>
                
                <div className="w-px bg-gray-700"></div>
                
                <button
                  className="flex-1 py-3 flex items-center justify-center space-x-1 hover:bg-gray-700 transition-colors"
                >
                  <Edit size={16} className="text-gray-400" />
                  <span className="text-sm">编辑</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">未找到提示词</h3>
          <p className="text-gray-400 mb-6">尝试使用不同的搜索词或筛选条件</p>
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            <Plus size={18} />
            <span>创建新提示词</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptManager; 