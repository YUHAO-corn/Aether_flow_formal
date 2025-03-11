import React, { useState, useEffect } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine } from 'react-icons/ri';
import PromptLibrary from '@components/PromptLibrary';
import Settings from '@components/Settings';
import logo from '@assets/img/logo.svg';
import '@pages/sidepanel/Sidepanel.css';

// 定义提示词类型接口
interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  favorite?: boolean;
}

const Sidepanel = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState(true);

  // 确保侧边栏在页面点击时不会关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 阻止事件冒泡，防止点击侧边栏外部时关闭
      event.stopPropagation();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelectPrompt = (prompt: Prompt) => {
    console.log('选择提示词:', prompt);
    // 这里可以实现将提示词复制到剪贴板或发送到当前页面的逻辑
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50">
        <button
          className="bg-purple-600 text-white p-2 rounded-l-md shadow-lg"
          onClick={toggleVisibility}
          title="显示侧边栏"
        >
          <RiArrowLeftSLine size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      <div className={`flex h-screen bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full max-w-md'}`}>
        {/* 侧边导航栏 */}
        <div className="w-16 border-r border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800 flex justify-center">
            <img src={logo} className="w-8 h-8" alt="AetherFlow Logo" />
          </div>
          
          <nav className="flex-1 py-4">
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full p-3 flex justify-center ${activeTab === 'library' ? 'bg-purple-900/30 text-purple-400 border-l-2 border-purple-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
                  onClick={() => setActiveTab('library')}
                  title="提示词库"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  className={`w-full p-3 flex justify-center ${activeTab === 'optimizer' ? 'bg-purple-900/30 text-purple-400 border-l-2 border-purple-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
                  onClick={() => setActiveTab('optimizer')}
                  title="提示词优化"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  className={`w-full p-3 flex justify-center ${activeTab === 'recommendations' ? 'bg-purple-900/30 text-purple-400 border-l-2 border-purple-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
                  onClick={() => setActiveTab('recommendations')}
                  title="智能推荐"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  className={`w-full p-3 flex justify-center ${activeTab === 'settings' ? 'bg-purple-900/30 text-purple-400 border-l-2 border-purple-500' : 'text-gray-400 hover:bg-gray-800/50'}`}
                  onClick={() => setActiveTab('settings')}
                  title="设置"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-3 border-t border-gray-800 flex flex-col gap-2">
            <button
              className="w-full p-2 rounded-md bg-gray-800 hover:bg-gray-700 flex justify-center"
              onClick={toggleCollapse}
              title={isCollapsed ? "展开" : "折叠"}
            >
              {isCollapsed ? <RiArrowRightSLine size={20} /> : <RiArrowLeftSLine size={20} />}
            </button>
            
            <button
              className="w-full p-2 rounded-md bg-gray-800 hover:bg-gray-700 flex justify-center"
              onClick={toggleVisibility}
              title="隐藏侧边栏"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        {!isCollapsed && (
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'library' && (
              <PromptLibrary reducedMotion={reducedMotion} onSelectPrompt={handleSelectPrompt} />
            )}
            
            {activeTab === 'optimizer' && (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">提示词优化</h2>
                <p className="text-gray-400">此功能正在开发中...</p>
              </div>
            )}
            
            {activeTab === 'recommendations' && (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">智能推荐</h2>
                <p className="text-gray-400">此功能正在开发中...</p>
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidepanel; 