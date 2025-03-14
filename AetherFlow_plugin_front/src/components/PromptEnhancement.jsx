import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiMagicLine, 
  RiFileTextLine, 
  RiSendPlaneLine,
  RiInformationLine,
  RiCloseLine,
  RiCheckLine,
  RiArrowRightUpLine,
  RiMagicFill,
  RiSettings3Line,
  RiKey2Line
} from 'react-icons/ri';

const PromptEnhancement = ({ reducedMotion }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [insertSuccess, setInsertSuccess] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  
  // 加载保存的API密钥
  useEffect(() => {
    chrome.storage.sync.get(['apiKey', 'provider'], (result) => {
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.provider) setProvider(result.provider);
    });
  }, []);
  
  const handleEnhance = async (previousPrompt = '') => {
    if (!inputText.trim() && !previousPrompt.trim()) return;
    
    setIsProcessing(true);
    setResultVisible(false);
    setAnimationPhase(1);
    setError(null);
    
    // 模拟动画阶段
    setTimeout(() => {
      setAnimationPhase(2);
      
      setTimeout(() => {
        setAnimationPhase(3);
        
        // 调用API优化提示词
        const baseText = previousPrompt || inputText;
        
        chrome.runtime.sendMessage({
          action: 'optimizePrompt',
          data: {
            content: baseText,
            apiKey: apiKey,
            provider: provider
          }
        }, (response) => {
          if (response && response.success) {
            setOutputText(response.optimizedPrompt || response.data?.optimizedPrompt || '优化失败，请重试');
            setIsProcessing(false);
            setResultVisible(true);
            
            // 模拟打字效果完成
            if (!reducedMotion) {
              const typingDuration = (response.optimizedPrompt?.length || 0) * 20;
              setTimeout(() => {
                setTypingComplete(true);
              }, Math.min(typingDuration, 2000));
            } else {
              setTypingComplete(true);
            }
          } else {
            setIsProcessing(false);
            setError(response?.error || '优化失败，请检查API密钥或网络连接');
            
            // 如果是API密钥错误，提示设置API密钥
            if (response?.status === 401 || response?.error?.includes('API') || response?.error?.includes('key')) {
              setApiKeyModalOpen(true);
            }
          }
        });
      }, 1000);
    }, 1000);
  };
  
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setResultVisible(false);
    setTypingComplete(false);
    setError(null);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopySuccess(true);
    
    // 重置复制成功状态
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleInsert = () => {
    // 向内容脚本发送消息，插入优化后的提示词
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'insertText',
          text: outputText
        });
        
        setInsertSuccess(true);
        
        setTimeout(() => {
          setInsertSuccess(false);
        }, 2000);
      }
    });
  };

  const handleContinueEnhance = () => {
    handleEnhance(outputText);
  };
  
  const handleSaveApiKey = () => {
    // 保存API密钥到存储
    chrome.storage.sync.set({
      apiKey: apiKey,
      provider: provider
    }, () => {
      setApiKeyModalOpen(false);
      
      // 如果有输入文本，重试优化
      if (inputText.trim()) {
        handleEnhance();
      }
    });
  };
  
  const characterCount = inputText.length;
  const maxCharacters = 1000;
  const characterPercentage = Math.min((characterCount / maxCharacters) * 100, 100);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <RiMagicLine className="mr-2 text-purple-400" />
          提示词优化
        </h2>
        
        <button 
          className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
          onClick={() => setApiKeyModalOpen(true)}
          title="API密钥设置"
        >
          <RiKey2Line size={18} />
        </button>
      </div>
      
      <AnimatePresence>
        {showTip && (
          <motion.div 
            className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowTip(false)}
              aria-label="关闭提示"
            >
              <RiCloseLine />
            </button>
            <div className="flex items-start">
              <RiInformationLine className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                输入您的基本提示词，让AI为您增强它，添加更多细节、更好的结构和更清晰的指令。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300 flex justify-between">
            <span>您的提示词</span>
            <span className={characterCount > maxCharacters ? 'text-red-400' : 'text-gray-400'}>
              {characterCount}/{maxCharacters}
            </span>
          </label>
          
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此输入您的提示词..."
              className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
              maxLength={maxCharacters}
            />
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 rounded-b-lg overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: `${characterPercentage}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <motion.button
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isProcessing || !inputText.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md'
            }`}
            whileHover={!isProcessing && inputText.trim() && !reducedMotion ? { y: -2, scale: 1.05 } : {}}
            whileTap={!isProcessing && inputText.trim() && !reducedMotion ? { y: 0, scale: 0.95 } : {}}
            onClick={() => handleEnhance()}
            disabled={isProcessing || !inputText.trim()}
          >
            {isProcessing ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>优化中...</span>
              </>
            ) : (
              <>
                <RiMagicLine />
                <span>优化提示词</span>
              </>
            )}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {error && !isProcessing && (
            <motion.div
              className="bg-red-900/30 border border-red-800/50 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <div className="flex items-start">
                <RiCloseLine className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              className="bg-gray-800/80 border border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              {/* 阶段1: 初始加载动画 */}
              {animationPhase === 1 && (
                <motion.div 
                  className="w-12 h-12 border-3 border-t-transparent border-purple-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              {/* 阶段2: 魔法球效果 */}
              {animationPhase === 2 && (
                <div className="relative w-24 h-24">
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 opacity-70"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 10px rgba(139, 92, 246, 0.5)",
                        "0 0 25px rgba(139, 92, 246, 0.8)",
                        "0 0 10px rgba(139, 92, 246, 0.5)"
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {!reducedMotion && (
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="w-full h-full relative">
                        {/* 模拟粒子效果 */}
                        {Array.from({ length: 15 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-purple-400"
                            initial={{ 
                              x: Math.random() * 100 - 50, 
                              y: Math.random() * 100 - 50,
                              opacity: Math.random() * 0.5 + 0.3
                            }}
                            animate={{ 
                              x: Math.random() * 100 - 50, 
                              y: Math.random() * 100 - 50,
                              opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.8 + 0.2, Math.random() * 0.5 + 0.3],
                              scale: [Math.random() * 0.5 + 0.5, Math.random() * 1 + 0.5, Math.random() * 0.5 + 0.5]
                            }}
                            transition={{ 
                              duration: Math.random() * 2 + 1,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 阶段3: 优化中文本 */}
              {animationPhase === 3 && (
                <>
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 10px rgba(139, 92, 246, 0.5)",
                        "0 0 25px rgba(139, 92, 246, 0.8)",
                        "0 0 10px rgba(139, 92, 246, 0.5)"
                      ]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <RiMagicLine className="text-white text-xl" />
                  </motion.div>
                  
                  <div className="text-center">
                    <p className="text-purple-300 font-medium">
                      正在优化您的提示词
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                      >...</motion.span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">添加细节和提高清晰度</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {outputText && resultVisible && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: reducedMotion ? 0 : 0.4,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">优化后的提示词</label>
                
                <div className="flex space-x-1">
                  <motion.button
                    className="p-2 rounded-md bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleCopy}
                    aria-label="复制到剪贴板"
                  >
                    {copySuccess ? <RiCheckLine className="text-green-400" /> : <RiFileTextLine />}
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      复制提示词
                    </span>
                    
                    <AnimatePresence>
                      {copySuccess && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-green-200 text-xs py-1 px-2 rounded whitespace-nowrap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          已复制!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-md bg-blue-700/70 hover:bg-blue-600/70 text-blue-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleInsert}
                    aria-label="插入提示词"
                  >
                    {insertSuccess ? <RiCheckLine className="text-green-400" /> : <RiArrowRightUpLine />}
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      插入提示词
                    </span>
                    
                    <AnimatePresence>
                      {insertSuccess && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-900/90 text-green-200 text-xs py-1 px-2 rounded whitespace-nowrap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          已插入!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-md bg-purple-700/70 hover:bg-purple-600/70 text-purple-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(147, 51, 234, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleContinueEnhance}
                    aria-label="继续优化"
                  >
                    <RiMagicFill />
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      继续优化
                    </span>
                  </motion.button>
                </div>
              </div>
              
              <motion.div 
                className="relative w-full bg-gray-800/70 border border-gray-700 rounded-lg p-4 text-white overflow-hidden"
                initial={{ boxShadow: "0 0 0 rgba(139, 92, 246, 0)" }}
                animate={{ 
                  boxShadow: ["0 0 0px rgba(139, 92, 246, 0)", "0 0 15px rgba(139, 92, 246, 0.3)", "0 0 5px rgba(139, 92, 246, 0.15)"]
                }}
                transition={{ 
                  duration: reducedMotion ? 0 : 1.5,
                  times: [0, 0.5, 1]
                }}
              >
                {/* 动画渐变边框 */}
                <motion.div 
                  className="absolute inset-0 rounded-lg p-[1px] pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, rgba(67, 134, 255, 0.3), rgba(147, 51, 234, 0.3))",
                    backgroundSize: "200% 100%",
                    zIndex: -1
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* 自定义打字动画效果 */}
                {!reducedMotion && !typingComplete ? (
                  <div className="relative">
                    <motion.div 
                      className="animate-typing overflow-hidden whitespace-pre-wrap"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "linear" }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap' }}>{outputText}</div>
                    </motion.div>
                    <motion.span 
                      className="absolute inline-block w-0.5 h-4 bg-white"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      style={{ top: 0, right: "-2px" }}
                    />
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{outputText}</div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* API密钥设置模态框 */}
      <AnimatePresence>
        {apiKeyModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setApiKeyModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-5 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <RiKey2Line className="mr-2 text-yellow-400" />
                API密钥设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">
                    选择AI提供商
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="moonshot">Moonshot</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 block mb-1">
                    API密钥
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入您的API密钥"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    您的API密钥将安全地存储在本地，不会发送到我们的服务器
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    className="px-3 py-1.5 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                    onClick={() => setApiKeyModalOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-500"
                    onClick={handleSaveApiKey}
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptEnhancement;