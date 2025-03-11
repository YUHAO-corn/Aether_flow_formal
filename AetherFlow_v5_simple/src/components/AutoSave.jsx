import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AutoSave = ({ reducedMotion }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  
  // 模拟自动保存功能
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机模拟不同的保存状态
      const randomStatus = Math.random();
      
      if (randomStatus > 0.7) {
        setMessage('已保存所有更改');
        setIsVisible(true);
        
        // 显示一段时间后隐藏
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    }, 30000); // 每30秒检查一次
    
    return () => clearInterval(interval);
  }, []);
  
  // 手动触发一次保存提示，用于演示
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('已保存所有更改');
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 z-50 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-green-400 mr-2" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="text-sm">{message}</span>
    </motion.div>
  );
};

export default AutoSave; 