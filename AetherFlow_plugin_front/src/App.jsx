import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from './components/NavigationBar';
import PromptLibrary from './components/PromptLibrary';
import PromptEnhancement from './components/PromptEnhancement';
import SmartSuggestions from './components/SmartSuggestions';
import AutoSave from './components/AutoSave';
import Settings from './components/Settings';
import PromptModal from './components/PromptModal';
import { AuthProvider } from './contexts/AuthContext';
import { PromptProvider } from './contexts/PromptContext';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorMonitor from './components/ErrorMonitor';

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
    <ErrorBoundary>
      <ErrorMonitor />
      <AuthProvider>
        <PromptProvider>
          <motion.div 
            className="fixed right-0 top-0 h-screen bg-gray-900 text-white overflow-hidden z-50"
            initial={{ width: isExpanded ? 400 : 320, x: 0 }}
            animate={{ width: isExpanded ? 400 : 320, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            style={{ boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.3)' }}
          >
            <div className="flex flex-col h-full relative">
              <NavigationBar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isExpanded={isExpanded}
                reducedMotion={reducedMotion}
              />
              
              <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                aria-label={reducedMotion ? "Enable animations" : "Reduce motion"}
              >
                <span className={`w-3 h-3 rounded-full ${reducedMotion ? 'bg-purple-500' : 'bg-gray-600'}`}></span>
                Reduced motion
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
        </PromptProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;