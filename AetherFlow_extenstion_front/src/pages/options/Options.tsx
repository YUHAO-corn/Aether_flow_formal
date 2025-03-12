import React, { useState, useEffect } from 'react';
import './Options.css';

interface UserSettings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  enhancementModel: string;
}

const Options: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    autoSave: true,
    enhancementModel: 'gpt-4'
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // 加载设置
  useEffect(() => {
    chrome.storage.local.get(['userSettings'], (result) => {
      if (result.userSettings) {
        setSettings(result.userSettings);
      }
    });
    
    // 检查登录状态
    chrome.storage.local.get(['userInfo'], (result) => {
      if (result.userInfo && result.userInfo.token) {
        setIsLoggedIn(true);
      }
    });
  }, []);
  
  // 保存设置
  const saveSettings = () => {
    chrome.storage.local.set({ userSettings: settings }, () => {
      setMessage('设置已保存');
      setTimeout(() => setMessage(''), 3000);
    });
  };
  
  // 处理登录
  const handleLogin = () => {
    // 模拟登录请求
    setTimeout(() => {
      const userInfo = {
        username,
        token: 'mock-token-' + Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天后过期
      };
      
      chrome.storage.local.set({ userInfo }, () => {
        setIsLoggedIn(true);
        setMessage('登录成功');
        setTimeout(() => setMessage(''), 3000);
      });
    }, 1000);
  };
  
  // 处理登出
  const handleLogout = () => {
    chrome.storage.local.remove(['userInfo'], () => {
      setIsLoggedIn(false);
      setMessage('已登出');
      setTimeout(() => setMessage(''), 3000);
    });
  };
  
  return (
    <div className="options-container">
      <header className="options-header">
        <h1>AetherFlow 设置</h1>
        <p>配置您的AetherFlow扩展</p>
      </header>
      
      <main className="options-content">
        {message && <div className="message">{message}</div>}
        
        <section className="options-section">
          <h2>账户</h2>
          {isLoggedIn ? (
            <div className="logged-in">
              <p>您已登录</p>
              <button className="logout-button" onClick={handleLogout}>登出</button>
            </div>
          ) : (
            <div className="login-form">
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input 
                  type="text" 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <button className="login-button" onClick={handleLogin}>登录</button>
            </div>
          )}
        </section>
        
        <section className="options-section">
          <h2>外观</h2>
          <div className="form-group">
            <label htmlFor="theme">主题</label>
            <select 
              id="theme" 
              value={settings.theme} 
              onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark'})}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </section>
        
        <section className="options-section">
          <h2>功能</h2>
          <div className="form-group">
            <label htmlFor="autoSave">
              <input 
                type="checkbox" 
                id="autoSave" 
                checked={settings.autoSave} 
                onChange={(e) => setSettings({...settings, autoSave: e.target.checked})} 
              />
              自动保存提示词
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="enhancementModel">增强模型</label>
            <select 
              id="enhancementModel" 
              value={settings.enhancementModel} 
              onChange={(e) => setSettings({...settings, enhancementModel: e.target.value})}
            >
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>
        </section>
        
        <div className="options-actions">
          <button className="save-button" onClick={saveSettings}>保存设置</button>
        </div>
      </main>
      
      <footer className="options-footer">
        <p>AetherFlow v1.0.0 | 让AI潜能随需释放</p>
      </footer>
    </div>
  );
};

export default Options; 