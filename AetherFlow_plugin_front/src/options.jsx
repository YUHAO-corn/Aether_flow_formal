import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { motion } from 'framer-motion';
import './options.css';

const Options = () => {
  const [settings, setSettings] = useState({
    autoSave: true,
    smartSuggestions: true,
    maxPromptHistory: 100,
    theme: 'dark',
    reducedMotion: false,
    apiKey: '',
  });

  useEffect(() => {
    // 从Chrome存储中加载设置
    chrome.storage.sync.get(
      ['autoSave', 'smartSuggestions', 'maxPromptHistory', 'theme', 'reducedMotion', 'apiKey'],
      (result) => {
        setSettings({
          autoSave: result.autoSave !== undefined ? result.autoSave : settings.autoSave,
          smartSuggestions: result.smartSuggestions !== undefined ? result.smartSuggestions : settings.smartSuggestions,
          maxPromptHistory: result.maxPromptHistory || settings.maxPromptHistory,
          theme: result.theme || settings.theme,
          reducedMotion: result.reducedMotion !== undefined ? result.reducedMotion : settings.reducedMotion,
          apiKey: result.apiKey || settings.apiKey,
        });
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      [name]: newValue,
    });
    
    // 保存到Chrome存储
    chrome.storage.sync.set({ [name]: newValue });
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>AetherFlow 设置</h1>
        <p>自定义您的AI提示词管理体验</p>
      </header>
      
      <main className="options-content">
        <section className="options-section">
          <h2>基本设置</h2>
          
          <div className="option-item">
            <label htmlFor="autoSave">
              <input
                type="checkbox"
                id="autoSave"
                name="autoSave"
                checked={settings.autoSave}
                onChange={handleChange}
              />
              <span>自动保存对话</span>
            </label>
            <p className="option-description">自动保存与AI平台的对话内容</p>
          </div>
          
          <div className="option-item">
            <label htmlFor="smartSuggestions">
              <input
                type="checkbox"
                id="smartSuggestions"
                name="smartSuggestions"
                checked={settings.smartSuggestions}
                onChange={handleChange}
              />
              <span>智能提示</span>
            </label>
            <p className="option-description">启用智能提示词推荐功能</p>
          </div>
          
          <div className="option-item">
            <label htmlFor="maxPromptHistory">
              <span>最大历史记录数</span>
              <input
                type="number"
                id="maxPromptHistory"
                name="maxPromptHistory"
                min="10"
                max="500"
                value={settings.maxPromptHistory}
                onChange={handleChange}
              />
            </label>
            <p className="option-description">保存的最大提示词历史记录数量</p>
          </div>
        </section>
        
        <section className="options-section">
          <h2>界面设置</h2>
          
          <div className="option-item">
            <label htmlFor="theme">
              <span>主题</span>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="dark">暗黑魔法</option>
                <option value="light">光明魔法</option>
                <option value="system">跟随系统</option>
              </select>
            </label>
            <p className="option-description">选择界面主题</p>
          </div>
          
          <div className="option-item">
            <label htmlFor="reducedMotion">
              <input
                type="checkbox"
                id="reducedMotion"
                name="reducedMotion"
                checked={settings.reducedMotion}
                onChange={handleChange}
              />
              <span>减少动画</span>
            </label>
            <p className="option-description">减少界面动画效果，提高性能</p>
          </div>
        </section>
        
        <section className="options-section">
          <h2>API设置</h2>
          
          <div className="option-item">
            <label htmlFor="apiKey">
              <span>API密钥</span>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                placeholder="输入您的API密钥"
              />
            </label>
            <p className="option-description">用于提示词优化和生成的API密钥</p>
          </div>
        </section>
      </main>
      
      <footer className="options-footer">
        <p>AetherFlow v0.1.0 | 让AI潜能随需释放</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('options-root'));
root.render(<Options />); 