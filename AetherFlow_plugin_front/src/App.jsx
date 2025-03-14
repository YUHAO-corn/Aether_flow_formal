import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from './components/NavigationBar';
import PromptLibrary from './components/PromptLibrary';
import PromptEnhancement from './components/PromptEnhancement';
import SmartSuggestions from './components/SmartSuggestions';
import AutoSave from './components/AutoSave';
import Settings from './components/Settings';
import PromptModal from './components/PromptModal';
import UserAvatar from './components/UserAvatar';

const App = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(
      ['reducedMotion', 'autoSaveEnabled', 'smartSuggestionsEnabled', 'userData'],
      (result) => {
        if (result.reducedMotion !== undefined) {
          setReducedMotion(result.reducedMotion);
        }
        if (result.autoSaveEnabled !== undefined) {
          setAutoSaveEnabled(result.autoSaveEnabled);
        }
        if (result.smartSuggestionsEnabled !== undefined) {
          setSmartSuggestionsEnabled(result.smartSuggestionsEnabled);
        }
        if (result.userData) {
          setUser(result.userData);
          setIsAuthenticated(true);
        }
      }
    );
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({
      reducedMotion,
      autoSaveEnabled,
      smartSuggestionsEnabled
    });
  }, [reducedMotion, autoSaveEnabled, smartSuggestionsEnabled]);

  useEffect(() => {
    if (user) {
      chrome.storage.sync.set({ userData: user });
    }
  }, [user]);

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    chrome.storage.sync.remove('userData');
  };

  const handleAvatarClick = () => {
    setActiveTab('settings');
  };

  return (
    <motion.div 
      className="extension-container h-[600px] w-full bg-gray-900 text-white overflow-hidden"
    >
      <div className="flex flex-col h-full w-full relative">
        <NavigationBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          reducedMotion={reducedMotion}
          user={user}
          onAvatarClick={handleAvatarClick}
          className="navigation-bar"
        />
        
        <main className="content-area flex-1 overflow-y-auto">
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
              user={user}
              isAuthenticated={isAuthenticated}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
              className="settings-panel"
            />
          )}
        </main>
        
        <AutoSave enabled={autoSaveEnabled} />

        <AnimatePresence>
          {isModalOpen && selectedPrompt && (
            <PromptModal 
              prompt={selectedPrompt} 
              onClose={closeModal} 
              reducedMotion={reducedMotion}
              className="modal-overlay"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default App;