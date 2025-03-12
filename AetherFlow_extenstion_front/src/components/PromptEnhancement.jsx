import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiMagicLine, RiFileCopyLine, RiSendPlaneLine } from 'react-icons/ri';

const PromptEnhancement = ({ reducedMotion }) => {
  const [inputText, setInputText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const handleEnhance = () => {
    if (!inputText.trim()) return;
    
    setIsEnhancing(true);
    
    // 模拟增强过程
    setTimeout(() => {
      const enhanced = `${inputText}\n\n增强版：\n\n${inputText} 但是更加详细、清晰，并且包含了更多的上下文和具体例子。这个增强版本的提示词会引导AI生成更高质量的回答，避免模糊不清的指令，并且明确指出你期望的输出格式和风格。`;
      setEnhancedText(enhanced);
      setIsEnhancing(false);
    }, 2000);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedText);
    // 在实际实现中，这里会显示一个通知
  };
  
  const handleInsert = () => {
    // 在实际实现中，这会将提示词插入到活动应用程序中
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'insertPrompt', 
          text: enhancedText 
        });
      }
    });
  };
  
  return (
    <div>
      <div className="mb-2">
        <h2 className="text-sm font-semibold mb-1">Prompt Enhancement</h2>
        <p className="text-[0.6rem] text-gray-400">Improve your prompts with AI assistance</p>
      </div>
      
      <div className="mb-2">
        <textarea
          className="w-full h-16 bg-gray-800 text-white rounded-lg p-1.5 text-[0.6rem] resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="Enter your prompt here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-2">
        <motion.button
          className="w-full py-1 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[0.6rem] flex items-center justify-center space-x-1 shadow-glow-sm hover:shadow-glow-md disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={reducedMotion || isEnhancing ? {} : { y: -1 }}
          whileTap={reducedMotion || isEnhancing ? {} : { y: 0 }}
          disabled={!inputText.trim() || isEnhancing}
          onClick={handleEnhance}
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
              <span>Enhancing...</span>
            </>
          ) : (
            <>
              <RiMagicLine size={12} />
              <span>Enhance Prompt</span>
            </>
          )}
        </motion.button>
      </div>
      
      {enhancedText && !isEnhancing && (
        <motion.div
          className="bg-gray-800 rounded-lg p-2 border border-purple-500/30"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-medium text-white">Enhanced Prompt</h3>
            <div className="flex space-x-1">
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={handleCopy}
                aria-label="Copy enhanced prompt"
              >
                <RiFileCopyLine size={12} />
              </button>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={handleInsert}
                aria-label="Insert enhanced prompt"
              >
                <RiSendPlaneLine size={12} />
              </button>
            </div>
          </div>
          
          <div className="text-[0.6rem] text-gray-300 whitespace-pre-wrap">
            {enhancedText}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PromptEnhancement; 