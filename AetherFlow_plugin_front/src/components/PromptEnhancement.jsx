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
  RiFileCopyLine
} from 'react-icons/ri';
import { usePrompt } from '../contexts/PromptContext';

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
  
  const { setCurrentPrompt, autoSavePrompt } = usePrompt();
  
  useEffect(() => {
    if (inputText.trim()) {
      const promptData = {
        id: 'enhance-' + Date.now(),
        title: '增强提示词',
        content: inputText,
        type: 'enhancement'
      };
      
      setCurrentPrompt(promptData);
      
      if (inputText.length > 50) {
        console.log('[PromptEnhancement] 输入文本长度超过50，触发自动保存');
        autoSavePrompt(promptData);
      }
    }
  }, [inputText, setCurrentPrompt, autoSavePrompt]);
  
  useEffect(() => {
    if (outputText.trim()) {
      const promptData = {
        id: 'enhanced-' + Date.now(),
        title: '已增强提示词',
        content: outputText,
        type: 'enhanced'
      };
      
      setCurrentPrompt(promptData);
      
      if (outputText.length > 50) {
        console.log('[PromptEnhancement] 输出文本长度超过50，触发自动保存');
        autoSavePrompt(promptData);
      }
    }
  }, [outputText, setCurrentPrompt, autoSavePrompt]);
  
  const handleEnhance = (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setAnimationPhase(0);
    setResultVisible(false);
    setTypingComplete(false);
    
    setTimeout(() => {
      setAnimationPhase(1);
      
      setTimeout(() => {
        setAnimationPhase(2);
        setResultVisible(true);
        
        const enhancedText = `${text}\n\n以下是增强的部分：\n\n1. 更清晰的指示\n2. 更详细的上下文\n3. 更具体的要求\n\n请确保输出格式符合要求，并提供详细的解释。`;
        
        let i = 0;
        const typingInterval = setInterval(() => {
          setOutputText(enhancedText.substring(0, i));
          i++;
          
          if (i > enhancedText.length) {
            clearInterval(typingInterval);
            setTypingComplete(true);
            setIsProcessing(false);
          }
        }, 10);
      }, 1000);
    }, 1500);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopySuccess(true);
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };
  
  const handleInsert = () => {
    console.log('Inserting prompt:', outputText);
    setInsertSuccess(true);
    
    setTimeout(() => {
      setInsertSuccess(false);
    }, 2000);
  };

  const handleContinueEnhance = () => {
    handleEnhance(outputText);
  };
  
  const characterCount = inputText.length;
  const maxCharacters = 1000;
  const characterPercentage = Math.min((characterCount / maxCharacters) * 100, 100);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center">
        <RiMagicLine className="mr-2 text-purple-400" />
        提示词增强
      </h2>
      
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
                输入您的基本提示词，让我们的AI为其添加更多细节、更好的结构和更清晰的指示。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="mb-2 flex justify-between items-center">
          <label htmlFor="prompt-input" className="text-sm text-gray-300 font-medium">您的提示词</label>
          <span className="text-xs text-gray-400">{characterCount}/{maxCharacters}</span>
        </div>
        
        <div className="relative">
          <textarea 
            id="prompt-input"
            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="输入您想要增强的提示词..."
            value={inputText}
            onChange={(e) => {
              const newText = e.target.value;
              if (newText.length <= maxCharacters) {
                setInputText(newText);
              }
            }}
            disabled={isProcessing}
          />
          
          <div 
            className="absolute bottom-0 left-0 h-1 bg-purple-500 rounded-bl-lg" 
            style={{ width: `${characterPercentage}%` }}
          />
        </div>
        
        <div className="mt-3 flex justify-end">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              !inputText.trim() || isProcessing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-500'
            }`}
            onClick={() => handleEnhance(inputText)}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>处理中...</span>
              </>
            ) : (
              <>
                <RiMagicLine />
                <span>增强提示词</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {resultVisible && (
          <motion.div
            className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium flex items-center">
                  <RiMagicFill className="text-purple-400 mr-2" />
                  增强后的提示词
                </h3>
                
                <div className="flex space-x-2">
                  <button 
                    className={`text-xs px-2 py-1 rounded ${
                      copySuccess 
                        ? 'bg-green-600/20 text-green-300' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={handleCopy}
                    disabled={!typingComplete}
                  >
                    {copySuccess ? (
                      <span className="flex items-center">
                        <RiCheckLine className="mr-1" />
                        已复制
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <RiFileCopyLine className="mr-1" />
                        复制
                      </span>
                    )}
                  </button>
                  
                  <button 
                    className={`text-xs px-2 py-1 rounded ${
                      insertSuccess 
                        ? 'bg-green-600/20 text-green-300' 
                        : 'bg-purple-600/20 text-purple-300 hover:bg-purple-500/30'
                    }`}
                    onClick={handleInsert}
                    disabled={!typingComplete}
                  >
                    {insertSuccess ? (
                      <span className="flex items-center">
                        <RiCheckLine className="mr-1" />
                        已插入
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <RiSendPlaneLine className="mr-1" />
                        插入
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white whitespace-pre-wrap text-sm">
                {outputText || (
                  <motion.div 
                    className="h-4 w-4 bg-purple-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              
              {typingComplete && (
                <div className="mt-3 flex justify-end">
                  <button
                    className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300"
                    onClick={handleContinueEnhance}
                  >
                    <span>继续增强</span>
                    <RiArrowRightUpLine />
                  </button>
                </div>
              )}
            </div>
            
            <motion.div 
              className="h-1 bg-purple-500"
              initial={{ width: "0%" }}
              animate={{ 
                width: animationPhase === 0 ? "33%" : 
                       animationPhase === 1 ? "66%" : 
                       "100%" 
              }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptEnhancement;