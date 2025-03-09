import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSaveLine, RiHistoryLine, RiCloseLine } from 'react-icons/ri';
import { usePrompt } from '../contexts/PromptContext';

const AutoSave = ({ reducedMotion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveHistory, setSaveHistory] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  
  // 使用PromptContext
  const { setCurrentPrompt, restoreFromHistory } = usePrompt();
  
  // 从后台脚本获取保存状态和历史记录
  useEffect(() => {
    console.log('[AutoSave] 组件加载，开始获取保存状态和历史记录');
    
    // 获取初始状态
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'getSaveStatus' }, response => {
        if (chrome.runtime.lastError) {
          console.warn('[AutoSave] 获取保存状态失败:', chrome.runtime.lastError);
          return;
        }
        
        if (response) {
          console.log('[AutoSave] 获取到保存状态:', response.status);
          setSaveStatus(response.status);
          if (response.timestamp) {
            setLastSaved(new Date(response.timestamp));
            console.log('[AutoSave] 最后保存时间:', new Date(response.timestamp).toLocaleString());
          }
        }
      });
      
      // 获取历史记录
      chrome.runtime.sendMessage({ action: 'getConversationHistory' }, response => {
        if (chrome.runtime.lastError) {
          console.warn('[AutoSave] 获取历史记录失败:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.history) {
          console.log('[AutoSave] 获取到历史记录数量:', response.history.length);
          const formattedHistory = response.history.map(conv => ({
            id: conv.timestamp,
            timestamp: formatTimeAgo(new Date(conv.timestamp)),
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
          console.log('[AutoSave] 收到状态更新:', message.status);
          setSaveStatus(message.status);
          if (message.timestamp) {
            setLastSaved(new Date(message.timestamp));
            console.log('[AutoSave] 最后保存时间更新为:', new Date(message.timestamp).toLocaleString());
          }
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      
      // 清理函数
      return () => {
        console.log('[AutoSave] 组件卸载，移除消息监听器');
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    } else {
      console.warn('[AutoSave] chrome.runtime不可用，可能不在浏览器扩展环境中');
    }
  }, []);
  
  // 格式化最后保存时间
  const formattedLastSaved = lastSaved ? formatTimeAgo(lastSaved) : '刚刚';
  
  // 格式化时间为"几分钟前"的形式
  function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin} 分钟前`;
    if (diffHour < 24) return `${diffHour} 小时前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    
    return date.toLocaleDateString();
  }
  
  const toggleExpand = () => {
    console.log('[AutoSave] 切换历史记录面板:', !isExpanded ? '展开' : '折叠');
    setIsExpanded(!isExpanded);
    
    // 如果展开，重新获取历史记录
    if (!isExpanded && typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('[AutoSave] 展开面板，重新获取历史记录');
      chrome.runtime.sendMessage({ action: 'getConversationHistory' }, response => {
        if (chrome.runtime.lastError) {
          console.warn('[AutoSave] 获取历史记录失败:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.history) {
          console.log('[AutoSave] 获取到历史记录数量:', response.history.length);
          const formattedHistory = response.history.map(conv => ({
            id: conv.timestamp,
            timestamp: formatTimeAgo(new Date(conv.timestamp)),
            content: conv.prompt.substring(0, 100) + (conv.prompt.length > 100 ? '...' : ''),
            platform: conv.platform,
            fullData: conv
          }));
          setSaveHistory(formattedHistory);
        }
      });
    }
  };
  
  const handleRestore = (historyItem) => {
    console.log('[AutoSave] 恢复历史记录:', historyItem.id);
    
    // 设置当前提示词为历史记录中的内容
    const promptData = {
      id: historyItem.fullData.timestamp,
      title: `${historyItem.fullData.platform} 对话 - ${new Date(historyItem.fullData.timestamp).toLocaleString()}`,
      content: historyItem.fullData.prompt,
      response: historyItem.fullData.response,
      type: 'restored'
    };
    
    console.log('[AutoSave] 设置当前提示词:', {
      id: promptData.id,
      title: promptData.title,
      contentLength: promptData.content.length,
      responseLength: promptData.response.length
    });
    
    setCurrentPrompt(promptData);
    
    // 调用PromptContext的恢复函数
    restoreFromHistory(historyItem.id);
    
    // 关闭历史记录面板
    setIsExpanded(false);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-20">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-12 right-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-white">保存历史</h3>
              <button 
                onClick={toggleExpand}
                className="text-gray-400 hover:text-white"
                aria-label="关闭历史记录"
              >
                <RiCloseLine />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {saveHistory.length > 0 ? (
                saveHistory.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">{item.timestamp}</span>
                        <span className="text-xs text-blue-400">{item.platform}</span>
                      </div>
                      <button 
                        className="text-xs text-purple-400 hover:text-purple-300"
                        onClick={() => handleRestore(item)}
                      >
                        恢复
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-400 text-sm">
                  暂无保存历史
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          saveStatus === 'saving' 
            ? 'bg-blue-900/70 text-blue-300' 
            : saveStatus === 'error'
              ? 'bg-red-900/70 text-red-300'
              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
        }`}
        whileHover={reducedMotion ? {} : { y: -2 }}
        onClick={toggleExpand}
        aria-label="查看保存历史"
      >
        {saveStatus === 'saving' ? (
          <motion.div 
            className="w-4 h-4 border-2 border-t-transparent border-blue-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          saveStatus === 'error' ? (
            <motion.div 
              className="w-4 h-4 text-red-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              !
            </motion.div>
          ) : (
            <RiSaveLine />
          )
        )}
        
        <div className="flex items-center space-x-1">
          <span>{saveStatus === 'saving' ? '保存中...' : saveStatus === 'error' ? '保存失败' : `已保存 ${formattedLastSaved}`}</span>
          <RiHistoryLine 
            className={`text-gray-400 ${isExpanded ? 'rotate-180' : ''} transition-transform`} 
            size={14} 
          />
        </div>
      </motion.button>
    </div>
  );
};

export default AutoSave;