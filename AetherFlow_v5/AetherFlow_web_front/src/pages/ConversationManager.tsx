import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Plus, Trash, Archive, Star, MoreVertical, Download } from 'lucide-react';
import apiClient from '../api';

const ConversationManager: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  useEffect(() => {
    fetchConversations();
  }, [searchTerm, sortBy, showFavorites, showArchived]);
  
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 20
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (showFavorites) {
        params.favorite = true;
      }
      
      if (showArchived) {
        params.archived = true;
      }
      
      const response = await apiClient.conversations.getAll(params);
      if (response.data && response.data.conversations) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      console.error('获取会话失败:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFavoriteToggle = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c._id === conversationId);
      if (!conversation) return;
      
      if (conversation.favorite) {
        await apiClient.conversations.unfavorite(conversationId);
      } else {
        await apiClient.conversations.favorite(conversationId);
      }
      
      // 更新本地状态
      setConversations(conversations.map(c => 
        c._id === conversationId ? { ...c, favorite: !c.favorite } : c
      ));
    } catch (err) {
      console.error('更新收藏状态失败:', err);
    }
  };
  
  const handleArchiveToggle = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c._id === conversationId);
      if (!conversation) return;
      
      if (conversation.archived) {
        await apiClient.conversations.unarchive(conversationId);
      } else {
        await apiClient.conversations.archive(conversationId);
      }
      
      // 更新本地状态
      setConversations(conversations.map(c => 
        c._id === conversationId ? { ...c, archived: !c.archived } : c
      ));
    } catch (err) {
      console.error('更新归档状态失败:', err);
    }
  };
  
  const handleExportConversation = async (conversationId: string, format: 'json' | 'markdown') => {
    try {
      const response = await apiClient.conversations.export(conversationId, format);
      
      if (response.data && response.data.content) {
        // 创建下载链接
        const blob = new Blob([response.data.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.${format === 'json' ? 'json' : 'md'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('导出会话失败:', err);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getModelIcon = (model: string) => {
    // 根据模型名称返回不同的样式
    const modelColors: Record<string, string> = {
      'gpt-4': 'bg-green-500',
      'gpt-3.5-turbo': 'bg-green-400',
      'claude-3': 'bg-purple-500',
      'deepseek': 'bg-blue-500',
      'moonshot': 'bg-yellow-500'
    };
    
    // 默认颜色
    const defaultColor = 'bg-gray-500';
    
    // 查找匹配的模型颜色
    const color = Object.keys(modelColors).find(key => model.includes(key))
      ? modelColors[Object.keys(modelColors).find(key => model.includes(key)) as string]
      : defaultColor;
    
    return <div className={`w-3 h-3 rounded-full ${color}`}></div>;
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">会话管理</h1>
        <p className="text-gray-400">管理您的对话历史记录</p>
      </div>
      
      {/* 搜索和筛选栏 */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索会话..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
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
              <button 
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  showArchived 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setShowArchived(!showArchived)}
              >
                <Archive size={18} className={showArchived ? 'text-white' : 'text-gray-400'} />
                <span>归档</span>
              </button>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none pr-8"
              >
                <option value="updatedAt">最近更新</option>
                <option value="createdAt">创建时间</option>
                <option value="messageCount">消息数量</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 会话列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map(conversation => (
            <div 
              key={conversation._id} 
              className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 ${
                conversation.archived ? 'opacity-70' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    {getModelIcon(conversation.model || '')}
                    <span className="text-xs text-gray-400">{conversation.model || '未知模型'}</span>
                    {conversation.archived && (
                      <span className="px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded-full text-xs">已归档</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleFavoriteToggle(conversation._id)}
                      className={`p-1 rounded-full hover:bg-gray-700 transition-colors ${
                        conversation.favorite ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      <Star size={18} />
                    </button>
                    <div className="relative group">
                      <button className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400">
                        <MoreVertical size={18} />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                        <div className="py-1">
                          <button 
                            onClick={() => handleArchiveToggle(conversation._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                          >
                            <Archive size={16} className="mr-2" />
                            {conversation.archived ? '取消归档' : '归档会话'}
                          </button>
                          <button 
                            onClick={() => handleExportConversation(conversation._id, 'markdown')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                          >
                            <Download size={16} className="mr-2" />
                            导出为 Markdown
                          </button>
                          <button 
                            onClick={() => handleExportConversation(conversation._id, 'json')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                          >
                            <Download size={16} className="mr-2" />
                            导出为 JSON
                          </button>
                          <button className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-600">
                            <Trash size={16} className="mr-2" />
                            删除会话
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{conversation.title || '未命名会话'}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {conversation.summary || (conversation.messages && conversation.messages.length > 0 
                      ? conversation.messages[conversation.messages.length - 1].content 
                      : '无消息内容')}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatDate(conversation.updatedAt || conversation.createdAt)}</span>
                  <span>{conversation.messageCount || 0} 条消息</span>
                </div>
              </div>
              
              <div className="bg-gray-700 px-5 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">继续对话</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(conversation.createdAt).split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <MessageSquare size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">未找到会话</h3>
          <p className="text-gray-400 mb-6">尝试使用不同的搜索词或筛选条件</p>
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            <Plus size={18} />
            <span>创建新会话</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationManager; 