import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from './NavigationBar';
import PromptLibrary from './PromptLibrary';
import PromptEnhancement from './PromptEnhancement';
import SmartSuggestions from './SmartSuggestions';
import AutoSave from './AutoSave';
import Settings from './Settings';
import PromptModal from './PromptModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [isExpanded, setIsExpanded] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  return (
    <motion.div 
      className="h-screen bg-gray-900 text-white overflow-hidden"
      initial={{ width: isExpanded ? 400 : 320 }}
      animate={{ width: isExpanded ? 400 : 320 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      <div className="flex flex-col h-full relative">
        <NavigationBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          toggleExpand={toggleExpand}
          isExpanded={isExpanded}
          reducedMotion={reducedMotion}
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'library' && (
            <PromptLibrary 
              reducedMotion={reducedMotion} 
              onSelectPrompt={handlePromptSelect}
            />
          )}
          {activeTab === 'enhance' && <PromptEnhancement reducedMotion={reducedMotion} />}
          {activeTab === 'suggest' && (
            <SmartSuggestions 
              reducedMotion={reducedMotion} 
              onSelectSuggestion={handlePromptSelect}
              enabled={smartSuggestionsEnabled}
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              reducedMotion={reducedMotion}
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              smartSuggestionsEnabled={smartSuggestionsEnabled}
              setSmartSuggestionsEnabled={setSmartSuggestionsEnabled}
            />
          )}
        </main>
        
        {autoSaveEnabled && <AutoSave reducedMotion={reducedMotion} />}
        
        <button 
          onClick={toggleReducedMotion}
          className="absolute bottom-4 left-4 text-xs flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label={reducedMotion ? "启用动画" : "减少动画"}
        >
          <span className={`w-3 h-3 rounded-full ${reducedMotion ? 'bg-purple-500' : 'bg-gray-600'}`}></span>
          减少动画
        </button>

        <AnimatePresence>
          {isModalOpen && selectedPrompt && (
            <PromptModal 
              prompt={selectedPrompt} 
              onClose={closeModal} 
              reducedMotion={reducedMotion}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default App; 