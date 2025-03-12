import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiMagicLine, 
  RiFileTextLine, 
  RiSendPlaneLine,
  RiInformationLine,
  RiCloseLine,
  RiCheckLine,
  RiArrowRightUpLine,
  RiMagicFill
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
  
  const handleEnhance = (previousPrompt = '') => {
    if (!inputText.trim() && !previousPrompt.trim()) return;
    
    setIsProcessing(true);
    setResultVisible(false);
    setAnimationPhase(1);
    
    // Phase 1: Initial loading spinner (2s)
    setTimeout(() => {
      // Phase 2: Transform to magical orb (2s)
      setAnimationPhase(2);
      
      setTimeout(() => {
        // Phase 3: Show enhancing text (1.5s)
        setAnimationPhase(3);
        
        setTimeout(() => {
          // In a real implementation, this would call an API to enhance the prompt
          const baseText = previousPrompt || inputText;
          const enhancedText = `Enhanced version of: "${baseText}"\n\nWrite a detailed analysis of the current trends in artificial intelligence and machine learning, focusing specifically on how these technologies are being applied in creative industries such as art, music, and literature. Include examples of groundbreaking projects and discuss the ethical implications of AI-generated creative works.`;
          
          setOutputText(enhancedText);
          setIsProcessing(false);
          setResultVisible(true);
          
          // Simulate typing effect completion
          if (!reducedMotion) {
            const typingDuration = enhancedText.length * 50; // 50ms per character
            setTimeout(() => {
              setTypingComplete(true);
            }, Math.min(typingDuration, 3000)); // Cap at 3 seconds max
          } else {
            setTypingComplete(true);
          }
        }, 1500);
      }, 2000);
    }, 2000);
  };
  
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setResultVisible(false);
    setTypingComplete(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopySuccess(true);
    
    // Reset copy success state after animation
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleInsert = () => {
    // In a real implementation, this would insert the text into the active application
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
        Prompt Enhancement
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
              aria-label="Close tip"
            >
              <RiCloseLine />
            </button>
            <div className="flex items-start">
              <RiInformationLine className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                Enter your basic prompt and let our AI enhance it with more details, better structure, and clearer instructions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300 flex justify-between">
            <span>Your prompt</span>
            <span className={characterCount > maxCharacters ? 'text-red-400' : 'text-gray-400'}>
              {characterCount}/{maxCharacters}
            </span>
          </label>
          
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your prompt here..."
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
                <span>Enhancing...</span>
              </>
            ) : (
              <>
                <RiMagicLine />
                <span>Enhance Prompt</span>
              </>
            )}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              className="bg-gray-800/80 border border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              {/* Phase 1: Initial loading spinner */}
              {animationPhase === 1 && (
                <motion.div 
                  className="w-12 h-12 border-3 border-t-transparent border-purple-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              {/* Phase 2: Magical orb with particle effects */}
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
                        {/* Simulated particles */}
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
              
              {/* Phase 3: Enhancing text with animated ellipsis */}
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
                      Enhancing your prompt
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                      >...</motion.span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Adding details and improving clarity</p>
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
                <label className="text-sm text-gray-300">Enhanced prompt</label>
                
                <div className="flex space-x-1">
                  <motion.button
                    className="p-2 rounded-md bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleCopy}
                    aria-label="Copy to clipboard"
                  >
                    {copySuccess ? <RiCheckLine className="text-green-400" /> : <RiFileTextLine />}
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Copy prompt
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
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-md bg-blue-700/70 hover:bg-blue-600/70 text-blue-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleInsert}
                    aria-label="Insert prompt"
                  >
                    {insertSuccess ? <RiCheckLine className="text-green-400" /> : <RiArrowRightUpLine />}
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Insert prompt
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
                          Inserted!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-md bg-purple-700/70 hover:bg-purple-600/70 text-purple-300 hover:text-white relative group"
                    whileHover={reducedMotion ? {} : { scale: 1.1, boxShadow: "0 0 10px rgba(147, 51, 234, 0.3)" }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    onClick={handleContinueEnhance}
                    aria-label="Continue enhancing"
                  >
                    <RiMagicFill />
                    
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Continue enhancing
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
                {/* Animated gradient border */}
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
                
                {/* Custom typing animation effect */}
                {!reducedMotion && !typingComplete ? (
                  <div className="relative">
                    <motion.div 
                      className="animate-typing overflow-hidden whitespace-pre-wrap"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
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
    </div>
  );
};

export default PromptEnhancement;