import React from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiFileCopyLine, RiSendPlaneLine } from 'react-icons/ri';

const PromptModal = ({ prompt, onClose, reducedMotion }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    // Would show a toast notification in a real implementation
  };
  
  const handleInsert = () => {
    // In a real implementation, this would insert the prompt into the active application
    console.log('Inserting prompt:', prompt);
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-white">{prompt.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">{prompt.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {prompt.tags && prompt.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white whitespace-pre-wrap text-sm">
            {prompt.content}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
          <motion.button
            className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white flex items-center space-x-1"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleCopy}
          >
            <RiFileCopyLine />
            <span>Copy</span>
          </motion.button>
          
          <motion.button
            className="px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md flex items-center space-x-1"
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleInsert}
          >
            <RiSendPlaneLine />
            <span>Insert</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromptModal;