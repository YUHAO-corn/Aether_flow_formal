import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiUser3Line, 
  RiLockLine, 
  RiLogoutBoxLine, 
  RiLoginBoxLine,
  RiToggleLine,
  RiToggleFill,
  RiInformationLine,
  RiGithubLine
} from 'react-icons/ri';

const Settings = ({ 
  reducedMotion, 
  autoSaveEnabled, 
  setAutoSaveEnabled,
  smartSuggestionsEnabled,
  setSmartSuggestionsEnabled
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  
  const handleLogin = (e) => {
    e.preventDefault();
    // 模拟登录
    if (username && password) {
      setIsLoggedIn(true);
      setShowLoginForm(false);
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };
  
  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
  };
  
  const toggleSmartSuggestions = () => {
    setSmartSuggestionsEnabled(!smartSuggestionsEnabled);
  };
  
  return (
    <div className="p-2 h-full">
      <h2 className="text-[0.7rem] font-semibold text-white mb-2">设置</h2>
      
      <div className="space-y-2">
        {/* 用户账户部分 */}
        <div className="bg-gray-800 rounded p-2">
          <h3 className="text-[0.6rem] font-medium text-white mb-1 flex items-center">
            <RiUser3Line size={10} className="mr-1" />
            账户
          </h3>
          
          {isLoggedIn ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[0.5rem]">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-1 text-[0.6rem] text-white">{username}</span>
                </div>
                <button 
                  className="text-[0.5rem] text-red-400 hover:text-red-300 flex items-center"
                  onClick={handleLogout}
                >
                  <RiLogoutBoxLine size={8} className="mr-0.5" />
                  登出
                </button>
              </div>
              <p className="text-[0.5rem] text-gray-400">
                您的提示词和设置将同步到云端
              </p>
            </div>
          ) : (
            <div>
              {showLoginForm ? (
                <form onSubmit={handleLogin} className="space-y-1">
                  <div>
                    <label className="text-[0.5rem] text-gray-400 block mb-0.5">用户名</label>
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-gray-700 text-white text-[0.6rem] rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[0.5rem] text-gray-400 block mb-0.5">密码</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-700 text-white text-[0.6rem] rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button 
                      type="button"
                      className="text-[0.5rem] text-gray-400 hover:text-gray-300"
                      onClick={() => setShowLoginForm(false)}
                    >
                      取消
                    </button>
                    <button 
                      type="submit"
                      className="text-[0.5rem] bg-purple-600 hover:bg-purple-500 text-white px-1 py-0.5 rounded"
                    >
                      登录
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-[0.5rem] text-gray-400">
                    登录以同步您的提示词和设置
                  </p>
                  <button 
                    className="text-[0.5rem] bg-purple-600 hover:bg-purple-500 text-white px-1 py-0.5 rounded flex items-center"
                    onClick={() => setShowLoginForm(true)}
                  >
                    <RiLoginBoxLine size={8} className="mr-0.5" />
                    登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 功能开关部分 */}
        <div className="bg-gray-800 rounded p-2">
          <h3 className="text-[0.6rem] font-medium text-white mb-1 flex items-center">
            <RiToggleLine size={10} className="mr-1" />
            功能
          </h3>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] text-white">自动保存提示词</p>
                <p className="text-[0.5rem] text-gray-400">自动保存您在AI聊天中使用的提示词</p>
              </div>
              <button 
                className="text-purple-500"
                onClick={toggleAutoSave}
                aria-label={autoSaveEnabled ? "Disable auto save" : "Enable auto save"}
              >
                {autoSaveEnabled ? <RiToggleFill size={12} /> : <RiToggleLine size={12} />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] text-white">智能建议</p>
                <p className="text-[0.5rem] text-gray-400">根据您的使用习惯提供智能提示词建议</p>
              </div>
              <button 
                className="text-purple-500"
                onClick={toggleSmartSuggestions}
                aria-label={smartSuggestionsEnabled ? "Disable smart suggestions" : "Enable smart suggestions"}
              >
                {smartSuggestionsEnabled ? <RiToggleFill size={12} /> : <RiToggleLine size={12} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* 关于部分 */}
        <div className="bg-gray-800 rounded p-2">
          <h3 className="text-[0.6rem] font-medium text-white mb-1 flex items-center">
            <RiInformationLine size={10} className="mr-1" />
            关于
          </h3>
          
          <div className="text-[0.5rem] text-gray-400">
            <p>AetherFlow v1.0.0</p>
            <p className="mt-0.5">增强您的AI提示词体验</p>
            <div className="flex items-center mt-1">
              <a 
                href="https://github.com/aetherflow/extension" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center"
              >
                <RiGithubLine size={8} className="mr-0.5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 