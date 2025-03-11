import React, { useState, useEffect } from 'react';
import { RiSettings4Line, RiSideBarLine, RiArrowRightSLine, RiArrowLeftSLine } from 'react-icons/ri';
import logo from '@assets/img/logo.svg';
import '@pages/popup/Popup.css';

const Popup = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const openSidebar = async () => {
    try {
      // 发送消息给后台脚本
      chrome.runtime.sendMessage({ action: 'openSidebar' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送消息时出错:', chrome.runtime.lastError);
        } else {
          console.log('收到响应:', response);
          // 关闭弹出窗口
          window.close();
        }
      });
    } catch (error) {
      console.error('打开侧边栏时出错:', error);
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 text-white ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src={logo} className="w-8 h-8 mr-2" alt="AetherFlow Logo" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              AetherFlow
            </h1>
          </div>
        )}
        {isCollapsed && <img src={logo} className="w-8 h-8 mx-auto" alt="AetherFlow Logo" />}
        
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? <RiArrowRightSLine size={20} /> : <RiArrowLeftSLine size={20} />}
        </button>
      </header>
      
      <div className="flex-grow p-4">
        {!isCollapsed && (
          <>
            <h2 className="text-lg font-semibold mb-4">快速操作</h2>
            
            <div className="space-y-3">
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={openSidebar}
              >
                <RiSideBarLine className="mr-2" />
                打开侧边栏
              </button>
              
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={openOptions}
              >
                <RiSettings4Line className="mr-2" />
                设置
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">提示</h3>
              <p className="text-xs text-gray-500">
                使用侧边栏可以访问完整的提示词库、优化工具和智能推荐功能。
              </p>
            </div>
          </>
        )}
        
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-4">
            <button
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center justify-center transition-all hover:scale-[1.05] active:scale-[0.95]"
              onClick={openSidebar}
              title="打开侧边栏"
            >
              <RiSideBarLine />
            </button>
            
            <button
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-all hover:scale-[1.05] active:scale-[0.95]"
              onClick={openOptions}
              title="设置"
            >
              <RiSettings4Line />
            </button>
          </div>
        )}
      </div>
      
      <footer className={`p-2 border-t border-gray-800 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed ? (
          <p className="text-xs text-gray-500">AetherFlow v1.0.0</p>
        ) : (
          <p className="text-xs text-gray-500">v1.0</p>
        )}
      </footer>
    </div>
  );
};

export default Popup; 