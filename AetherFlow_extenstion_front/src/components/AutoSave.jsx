import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiSaveLine, RiTimeLine, RiExternalLinkLine } from 'react-icons/ri';

// 模拟自动保存的提示词
const mockSavedPrompts = [
  {
    id: 'auto-1',
    content: '请解释量子计算的基本原理，并举例说明它与传统计算的区别。',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分钟前
    url: 'https://chat.openai.com/',
    platform: 'ChatGPT'
  },
  {
    id: 'auto-2',
    content: 'Write a function in Python that implements the merge sort algorithm.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分钟前
    url: 'https://claude.ai/',
    platform: 'Claude'
  }
];

const AutoSave = ({ reducedMotion }) => {
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [notification, setNotification] = useState(null);
  
  // 模拟加载保存的提示词
  useEffect(() => {
    setSavedPrompts(mockSavedPrompts);
    
    // 模拟每30秒自动保存一个新提示词
    const interval = setInterval(() => {
      const newPrompt = {
        id: `auto-${Date.now()}`,
        content: `这是一个自动保存的提示词 ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        url: 'https://chat.openai.com/',
        platform: 'ChatGPT'
      };
      
      setSavedPrompts(prev => [newPrompt, ...prev]);
      showNotification('新提示词已自动保存');
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };
  
  const openOriginalConversation = (url) => {
    if (url) {
      chrome.tabs.create({ url });
    }
  };
  
  return (
    <div className="fixed bottom-0 right-0 p-2 w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
      {notification && (
        <motion.div
          className="absolute top-0 left-0 right-0 transform -translate-y-full bg-green-500/80 text-white text-[0.6rem] py-1 px-2 text-center"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          {notification}
        </motion.div>
      )}
      
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-[0.6rem] text-gray-300">
          <RiSaveLine size={10} className="mr-1" />
          <span>自动保存的提示词</span>
        </div>
        <span className="text-[0.5rem] text-gray-400">{savedPrompts.length} 个已保存</span>
      </div>
      
      <div className="max-h-16 overflow-y-auto">
        {savedPrompts.map(prompt => (
          <div 
            key={prompt.id}
            className="bg-gray-800 rounded p-1 mb-1 text-[0.6rem] hover:bg-gray-750 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="line-clamp-1 flex-1 text-white">{prompt.content}</div>
              <button
                className="ml-1 text-gray-400 hover:text-white flex-shrink-0"
                onClick={() => openOriginalConversation(prompt.url)}
                aria-label="Open original conversation"
              >
                <RiExternalLinkLine size={10} />
              </button>
            </div>
            
            <div className="flex items-center text-[0.5rem] text-gray-400 mt-0.5">
              <span className="bg-gray-700 rounded px-1 mr-1">{prompt.platform}</span>
              <RiTimeLine size={8} className="mr-0.5" />
              <span>{formatTime(prompt.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoSave; 