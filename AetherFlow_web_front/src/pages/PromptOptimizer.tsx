import React from 'react';
import PromptLaboratory from '../components/PromptLaboratory';

const PromptOptimizer: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">提示词优化器</h1>
        <p className="text-gray-400">使用AI技术优化您的提示词，获得更好的结果</p>
      </div>
      
      <PromptLaboratory />
    </div>
  );
};

export default PromptOptimizer; 