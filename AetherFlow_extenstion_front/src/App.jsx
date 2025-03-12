import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from './components/NavigationBar';
import PromptLibrary from './components/PromptLibrary';
import PromptEnhancement from './components/PromptEnhancement';
import SmartSuggestions from './components/SmartSuggestions';
import AutoSave from './components/AutoSave';
import Settings from './components/Settings';
import PromptModal from './components/PromptModal';
import PromptImage from './components/PromptImage/PromptImage';
import ErrorBoundary from './components/ErrorBoundary';
import { info, error } from './utils/logger';

const App = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [isExpanded, setIsExpanded] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(300); // 插件宽度，单位像素
  const [isDragging, setIsDragging] = useState(false);

  // 从存储中加载设置
  useEffect(() => {
    try {
      info('应用初始化');
      chrome.storage.local.get(['panelWidth', 'isExpanded', 'reducedMotion', 'autoSaveEnabled', 'smartSuggestionsEnabled'], (result) => {
        if (result.panelWidth) {
          setPanelWidth(result.panelWidth);
          info('从存储加载面板宽度', { width: result.panelWidth });
        }
        if (result.isExpanded !== undefined) {
          setIsExpanded(result.isExpanded);
          info('从存储加载展开状态', { isExpanded: result.isExpanded });
        }
        if (result.reducedMotion !== undefined) {
          setReducedMotion(result.reducedMotion);
          info('从存储加载减少动画状态', { reducedMotion: result.reducedMotion });
        }
        if (result.autoSaveEnabled !== undefined) {
          setAutoSaveEnabled(result.autoSaveEnabled);
          info('从存储加载自动保存状态', { autoSaveEnabled: result.autoSaveEnabled });
        }
        if (result.smartSuggestionsEnabled !== undefined) {
          setSmartSuggestionsEnabled(result.smartSuggestionsEnabled);
          info('从存储加载智能建议状态', { smartSuggestionsEnabled: result.smartSuggestionsEnabled });
        }
      });

      // 从background.js获取插件状态
      chrome.runtime.sendMessage({ action: 'getPluginState' }, (response) => {
        if (response && response.success) {
          setIsExpanded(response.isExpanded);
          info('从background.js获取插件状态', { isExpanded: response.isExpanded });
        }
      });
    } catch (err) {
      error('加载设置失败', err);
    }
  }, []);

  // 保存设置到存储
  useEffect(() => {
    try {
      chrome.storage.local.set({ 
        panelWidth, 
        isExpanded,
        reducedMotion,
        autoSaveEnabled,
        smartSuggestionsEnabled
      });
      info('保存设置到存储', { 
        panelWidth, 
        isExpanded,
        reducedMotion,
        autoSaveEnabled,
        smartSuggestionsEnabled
      });
    } catch (err) {
      error('保存设置失败', err);
    }
  }, [panelWidth, isExpanded, reducedMotion, autoSaveEnabled, smartSuggestionsEnabled]);

  const toggleExpand = () => {
    try {
      // 通知background.js切换插件状态
      chrome.runtime.sendMessage({ action: 'toggleExpand' }, (response) => {
        if (response && response.success) {
          setIsExpanded(response.isExpanded);
          info('切换展开状态', { newState: response.isExpanded });
        }
      });
    } catch (err) {
      error('切换展开状态失败', err);
      // 如果通信失败，仍然切换本地状态
      setIsExpanded(!isExpanded);
    }
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    info('切换减少动画', { newState: !reducedMotion });
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
    info('选择提示词', { promptId: prompt.id });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
    info('关闭提示词模态框');
  };

  // 处理拖拽调整宽度
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    info('开始拖拽调整宽度');
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      // 计算新宽度，但限制在40px到屏幕宽度的1/3之间
      const screenWidth = window.innerWidth;
      const newWidth = Math.max(40, Math.min(screenWidth / 3, screenWidth - e.clientX));
      setPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    info('结束拖拽调整宽度', { newWidth: panelWidth });
  };

  // 计算动画持续时间
  const animationDuration = reducedMotion ? 0 : 0.3;

  return (
    <ErrorBoundary>
      <motion.div 
        className="fixed top-0 right-0 h-screen bg-gray-900 text-white overflow-hidden w-full plugin-container"
        style={{ 
          width: isExpanded ? panelWidth : 20,
          maxWidth: '100%',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1000
        }}
        transition={{ duration: animationDuration, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* 拖拽调整宽度的把手 */}
        <div 
          className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-purple-500"
          onMouseDown={handleMouseDown}
        ></div>

        <div className="flex flex-col h-full relative">
          <NavigationBar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            toggleExpand={toggleExpand}
            isExpanded={isExpanded}
            reducedMotion={reducedMotion}
          />
          
          <main className="flex-1 overflow-y-auto p-4">
            <ErrorBoundary>
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
              {activeTab === 'image' && <PromptImage reducedMotion={reducedMotion} />}
              {activeTab === 'settings' && (
                <Settings 
                  reducedMotion={reducedMotion}
                  autoSaveEnabled={autoSaveEnabled}
                  setAutoSaveEnabled={setAutoSaveEnabled}
                  smartSuggestionsEnabled={smartSuggestionsEnabled}
                  setSmartSuggestionsEnabled={setSmartSuggestionsEnabled}
                />
              )}
            </ErrorBoundary>
          </main>
          
          <ErrorBoundary>
            {autoSaveEnabled && <AutoSave reducedMotion={reducedMotion} />}
          </ErrorBoundary>

          <AnimatePresence>
            {isModalOpen && selectedPrompt && (
              <ErrorBoundary>
                <PromptModal 
                  prompt={selectedPrompt} 
                  onClose={closeModal} 
                  reducedMotion={reducedMotion}
                />
              </ErrorBoundary>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default App; 