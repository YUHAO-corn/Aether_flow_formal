import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PromptEnhancement = ({ reducedMotion }) => {
  const [promptText, setPromptText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState(null);

  const handleEnhance = () => {
    if (!promptText.trim()) return;
    
    setIsEnhancing(true);
    
    // 模拟API调用
    setTimeout(() => {
      setEnhancedPrompt({
        original: promptText,
        enhanced: `${promptText}\n\n请提供详细的上下文信息，包括：\n1. 目标受众\n2. 所需输出的格式和长度\n3. 风格偏好（正式/非正式，技术性/通俗易懂）\n4. 任何特定领域的术语或概念解释\n5. 期望的输出示例`,
        suggestions: [
          '添加了明确的输出格式要求',
          '增加了受众定位说明',
          '提供了风格指导',
          '要求提供示例以明确期望'
        ]
      });
      setIsEnhancing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-purple-400 mb-4">提示词优化</h2>
        <p className="text-gray-300 mb-4">
          输入您的提示词，我们将帮助您优化以获得更好的AI回复。
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            您的提示词
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="输入您想要优化的提示词..."
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>
        
        <div className="flex justify-between">
          <button
            className="text-sm text-gray-400 hover:text-white"
            onClick={() => setPromptText('')}
          >
            清空
          </button>
          <motion.button
            className={`px-4 py-2 rounded-lg text-white ${
              promptText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'
            }`}
            whileHover={promptText.trim() ? { scale: 1.03 } : {}}
            whileTap={promptText.trim() ? { scale: 0.98 } : {}}
            onClick={handleEnhance}
            disabled={!promptText.trim() || isEnhancing}
          >
            {isEnhancing ? '优化中...' : '优化提示词'}
          </motion.button>
        </div>
      </div>
      
      {enhancedPrompt && (
        <motion.div
          className="mt-8 border border-purple-500 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <div className="bg-purple-900/30 p-3 border-b border-purple-500">
            <h3 className="font-medium text-purple-300">优化结果</h3>
          </div>
          <div className="p-4 bg-gray-800">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">优化后的提示词</h4>
              <div className="bg-gray-700 p-3 rounded text-white whitespace-pre-wrap">
                {enhancedPrompt.enhanced}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">优化建议</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {enhancedPrompt.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button className="text-sm text-gray-400 hover:text-white">
                复制
              </button>
              <button className="text-sm text-blue-400 hover:text-blue-300">
                保存到提示词库
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PromptEnhancement; 