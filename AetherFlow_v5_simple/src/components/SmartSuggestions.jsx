import React from 'react';
import { motion } from 'framer-motion';

const SmartSuggestions = ({ reducedMotion, onSelectSuggestion, enabled }) => {
  // 示例推荐提示词
  const suggestions = [
    {
      id: 101,
      title: '详细分析报告',
      content: '请对[主题]进行详细分析，包括背景信息、当前状况、主要挑战、可能的解决方案和未来趋势。请使用数据支持您的分析，并提供具体的例子。',
      category: '商业分析',
      tags: ['分析', '报告', '数据'],
      confidence: 0.92
    },
    {
      id: 102,
      title: '创意故事构思',
      content: '请以[主题/场景]为基础，创作一个原创故事的开头。故事应包含引人入胜的角色、有趣的冲突和独特的设定。请确保开头能够吸引读者继续阅读。',
      category: '创意写作',
      tags: ['故事', '创意', '写作'],
      confidence: 0.85
    },
    {
      id: 103,
      title: '技术概念解释',
      content: '请解释[技术概念]，首先用简单的类比让初学者理解，然后逐步深入技术细节。最后，提供几个实际应用的例子来说明其重要性。',
      category: '技术教育',
      tags: ['解释', '技术', '教育'],
      confidence: 0.78
    }
  ];

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="bg-gray-800/50 p-6 rounded-xl max-w-md">
          <h2 className="text-xl font-semibold text-purple-400 mb-3">智能推荐已关闭</h2>
          <p className="text-gray-300 mb-4">
            启用智能推荐功能，获取基于您使用习惯的个性化提示词建议。
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            启用智能推荐
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-purple-400 mb-2">智能推荐</h2>
        <p className="text-gray-300">
          基于您的使用习惯，我们为您推荐以下提示词模板：
        </p>
      </div>
      
      <div className="space-y-4">
        {suggestions.map(suggestion => (
          <motion.div
            key={suggestion.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500"
            whileHover={{ y: -2 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-purple-400">{suggestion.title}</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">匹配度</span>
                <div className="bg-gray-700 h-2 w-16 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
              {suggestion.content}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{suggestion.category}</span>
              <div className="flex space-x-1">
                {suggestion.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-700">
        <button className="text-sm text-gray-400 hover:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新推荐
        </button>
      </div>
    </div>
  );
};

export default SmartSuggestions; 