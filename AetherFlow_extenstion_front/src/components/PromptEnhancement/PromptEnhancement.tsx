import React, { useState } from 'react';
import './PromptEnhancement.css';

const PromptEnhancement: React.FC = () => {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  // 优化提示词
  const enhancePrompt = () => {
    if (!originalPrompt.trim()) {
      alert('请输入需要优化的提示词');
      return;
    }

    setIsEnhancing(true);
    setAnimationStage(1);

    // 模拟优化过程的动画
    setTimeout(() => setAnimationStage(2), 2000);
    setTimeout(() => setAnimationStage(3), 4000);
    setTimeout(() => setAnimationStage(4), 5500);

    // 模拟API调用
    setTimeout(() => {
      // 这里应该是实际的API调用
      const enhanced = `${originalPrompt}\n\n改进版：\n请提供详细的${originalPrompt}，包括以下方面：\n1. 背景信息\n2. 具体要求\n3. 期望的输出格式\n4. 参考示例`;
      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);
      setAnimationStage(0);
    }, 6000);
  };

  // 继续优化
  const continueEnhancement = () => {
    setIsEnhancing(true);
    setAnimationStage(1);

    // 模拟优化过程的动画
    setTimeout(() => setAnimationStage(2), 2000);
    setTimeout(() => setAnimationStage(3), 4000);
    setTimeout(() => setAnimationStage(4), 5500);

    // 模拟API调用
    setTimeout(() => {
      // 这里应该是实际的API调用
      const furtherEnhanced = `${enhancedPrompt}\n\n进一步改进：\n为了获得更精确的回答，请考虑以下因素：\n1. 目标受众\n2. 专业程度\n3. 所需的详细程度\n4. 特定的行业术语或标准`;
      setEnhancedPrompt(furtherEnhanced);
      setIsEnhancing(false);
      setAnimationStage(0);
    }, 6000);
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhancedPrompt)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  // 插入到当前页面
  const insertToPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text: enhancedPrompt });
      }
    });
  };

  // 渲染加载动画
  const renderLoadingAnimation = () => {
    if (animationStage === 1) {
      return <div className="loading-spinner"></div>;
    } else if (animationStage === 2) {
      return <div className="magic-orb"></div>;
    } else if (animationStage === 3) {
      return <div className="enhancing-text">正在优化您的提示...</div>;
    } else if (animationStage === 4) {
      return <div className="result-container-animation"></div>;
    }
    return null;
  };

  return (
    <div className="prompt-enhancement">
      <div className="enhancement-header">
        <h2>提示词优化</h2>
        <p>输入您的提示词，我们将帮助您优化它</p>
      </div>
      
      <div className="enhancement-input">
        <textarea
          placeholder="在此输入您的提示词..."
          value={originalPrompt}
          onChange={(e) => setOriginalPrompt(e.target.value)}
          disabled={isEnhancing}
        />
        <button 
          className="enhance-button"
          onClick={enhancePrompt}
          disabled={isEnhancing || !originalPrompt.trim()}
        >
          优化提示词
        </button>
      </div>
      
      {isEnhancing ? (
        <div className="enhancement-loading">
          {renderLoadingAnimation()}
        </div>
      ) : enhancedPrompt && (
        <div className="enhancement-result">
          <div className="result-header">
            <h3>优化结果</h3>
            <button className="copy-button" onClick={copyToClipboard}>复制</button>
          </div>
          <div className="result-content">
            {enhancedPrompt.split('\n').map((line, index) => (
              <p key={index}>{line || ' '}</p>
            ))}
          </div>
          <div className="result-actions">
            <button 
              className="action-button"
              onClick={continueEnhancement}
              disabled={isEnhancing}
            >
              继续优化
            </button>
            <button 
              className="action-button primary"
              onClick={insertToPage}
              disabled={isEnhancing}
            >
              插入
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEnhancement; 