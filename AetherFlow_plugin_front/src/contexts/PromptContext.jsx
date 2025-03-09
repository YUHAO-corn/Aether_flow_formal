import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { promptAPI } from '../utils/apiClient';

// 创建提示词上下文
const PromptContext = createContext();

// 提示词上下文提供者组件
export const PromptProvider = ({ children }) => {
  // 提示词状态
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [saveHistory, setSaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

  // 获取所有提示词
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptAPI.getPrompts();
      setPrompts(response.data);
      return response.data;
    } catch (error) {
      console.error('[PromptContext] 获取提示词失败:', error);
      setError('获取提示词失败，请稍后再试');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取单个提示词
  const fetchPrompt = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptAPI.getPrompt(id);
      return response.data;
    } catch (error) {
      console.error(`[PromptContext] 获取提示词 ${id} 失败:`, error);
      setError(`获取提示词失败，请稍后再试`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建提示词
  const createPrompt = useCallback(async (promptData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptAPI.createPrompt(promptData);
      setPrompts(prevPrompts => [...prevPrompts, response.data]);
      return response.data;
    } catch (error) {
      console.error('[PromptContext] 创建提示词失败:', error);
      setError('创建提示词失败，请稍后再试');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新提示词
  const updatePrompt = useCallback(async (id, promptData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptAPI.updatePrompt(id, promptData);
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt.id === id ? response.data : prompt
        )
      );
      return response.data;
    } catch (error) {
      console.error(`[PromptContext] 更新提示词 ${id} 失败:`, error);
      setError('更新提示词失败，请稍后再试');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除提示词
  const deletePrompt = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await promptAPI.deletePrompt(id);
      setPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== id));
      return true;
    } catch (error) {
      console.error(`[PromptContext] 删除提示词 ${id} 失败:`, error);
      setError('删除提示词失败，请稍后再试');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 自动保存提示词
  const autoSavePrompt = useCallback(async (promptData) => {
    // 如果没有当前提示词或内容为空，则不保存
    if (!promptData || !promptData.content || promptData.content.trim() === '') {
      return null;
    }

    console.log('[PromptContext] 开始自动保存提示词:', promptData);
    setSaveStatus('saving');
    
    try {
      const timestamp = new Date().toISOString();
      const response = await promptAPI.autoSavePrompt({
        ...promptData,
        timestamp
      });
      
      // 更新保存历史
      const historyItem = {
        id: timestamp,
        timestamp: formatTimestamp(timestamp),
        content: promptData.content.substring(0, 100) + (promptData.content.length > 100 ? '...' : '')
      };
      
      setSaveHistory(prev => [historyItem, ...prev].slice(0, 20)); // 只保留最近20条记录
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      console.log('[PromptContext] 自动保存成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PromptContext] 自动保存失败:', error);
      setSaveStatus('error');
      return null;
    }
  }, []);

  // 恢复历史版本
  const restoreFromHistory = useCallback((historyId) => {
    const historyItem = saveHistory.find(item => item.id === historyId);
    if (historyItem) {
      // 在实际应用中，这里应该从后端获取完整的历史版本内容
      console.log(`[PromptContext] 恢复历史版本: ${historyId}`);
      // 模拟恢复操作
      return true;
    }
    return false;
  }, [saveHistory]);

  // 格式化时间戳为友好显示
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 从浏览器存储获取保存状态和历史记录
  useEffect(() => {
    // 检查是否在浏览器环境中
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // 获取保存状态
      chrome.runtime.sendMessage({ action: 'getSaveStatus' }, response => {
        if (response) {
          setSaveStatus(response.status || 'idle');
          if (response.timestamp) {
            setLastSaved(new Date(response.timestamp));
          }
        }
      });
      
      // 获取对话历史
      chrome.runtime.sendMessage({ action: 'getConversationHistory' }, response => {
        if (response && response.history) {
          const formattedHistory = response.history.map(conv => ({
            id: conv.timestamp,
            timestamp: formatTimestamp(conv.timestamp),
            content: conv.prompt.substring(0, 100) + (conv.prompt.length > 100 ? '...' : ''),
            platform: conv.platform,
            fullData: conv
          }));
          setSaveHistory(formattedHistory);
        }
      });
      
      // 监听状态更新
      const messageListener = (message) => {
        if (message.action === 'updateSaveStatus') {
          setSaveStatus(message.status);
          if (message.timestamp) {
            setLastSaved(new Date(message.timestamp));
          }
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      
      // 清理函数
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);

  // 切换自动保存功能
  const toggleAutoSave = useCallback((enabled) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ 
        action: 'toggleAutoSave',
        enabled
      });
    }
  }, []);

  // 初始化时加载提示词
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // 上下文值
  const value = {
    prompts,
    currentPrompt,
    saveHistory,
    loading,
    error,
    lastSaved,
    saveStatus,
    setCurrentPrompt,
    fetchPrompts,
    fetchPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    autoSavePrompt,
    restoreFromHistory,
    toggleAutoSave
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
};

// 自定义钩子，方便使用提示词上下文
export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt必须在PromptProvider内部使用');
  }
  return context;
};

export default PromptContext; 