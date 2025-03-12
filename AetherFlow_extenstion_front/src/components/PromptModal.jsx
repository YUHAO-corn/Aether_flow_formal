import React from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiFileCopyLine, RiSendPlaneLine } from 'react-icons/ri';

const PromptModal = ({ prompt, onClose, reducedMotion }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    // 在实际实现中，这里会显示一个通知
  };
  
  const handleInsert = () => {
    // 在实际实现中，这会将提示词插入到活动应用程序中
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'insertPrompt', 
          text: prompt.content 
        });
      }
    });
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-[80px] max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 10 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-white text-xs">{prompt.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <RiCloseLine size={12} />
          </button>
        </div>
        
        <div className="p-2 overflow-y-auto flex-1">
          <div className="mb-2">
            <p className="text-[0.6rem] text-gray-300 mb-1">{prompt.description}</p>
            
            <div className="flex flex-wrap gap-0.5 mb-1">
              {prompt.tags && prompt.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-[0.5rem] px-1 py-0.5 rounded-full bg-gray-700 text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-1.5 text-white whitespace-pre-wrap text-[0.6rem]">
            {prompt.content}
          </div>
        </div>
        
        <div className="p-2 border-t border-gray-700 flex justify-end space-x-1.5">
          <motion.button
            className="px-1.5 py-0.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white flex items-center space-x-0.5 text-[0.6rem]"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleCopy}
          >
            <RiFileCopyLine size={10} />
            <span>Copy</span>
          </motion.button>
          
          <motion.button
            className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md flex items-center space-x-0.5 text-[0.6rem]"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleInsert}
          >
            <RiSendPlaneLine size={10} />
            <span>Insert</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromptModal; 