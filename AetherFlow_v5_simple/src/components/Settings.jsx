import React from 'react';
import { motion } from 'framer-motion';

const Settings = ({ 
  reducedMotion, 
  autoSaveEnabled, 
  setAutoSaveEnabled, 
  smartSuggestionsEnabled, 
  setSmartSuggestionsEnabled 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-purple-400 mb-4">设置</h2>
      
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-medium text-blue-400 mb-3">常规设置</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">自动保存</span>
              <p className="text-xs text-gray-400 mt-1">
                自动保存您的提示词和对话历史
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={autoSaveEnabled}
                onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">智能推荐</span>
              <p className="text-xs text-gray-400 mt-1">
                基于您的使用习惯提供个性化提示词推荐
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={smartSuggestionsEnabled}
                onChange={() => setSmartSuggestionsEnabled(!smartSuggestionsEnabled)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-medium text-blue-400 mb-3">API设置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              API密钥
            </label>
            <div className="flex">
              <input 
                type="password" 
                placeholder="输入您的API密钥"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 rounded-r-lg">
                保存
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              您的API密钥将安全地存储在本地，不会发送到我们的服务器
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              模型选择
            </label>
            <select className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-2">Claude 2</option>
              <option value="custom">自定义...</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-medium text-blue-400 mb-3">数据管理</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">导出所有数据</span>
              <p className="text-xs text-gray-400 mt-1">
                将您的提示词库和设置导出为JSON文件
              </p>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
              导出
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">清除所有数据</span>
              <p className="text-xs text-gray-400 mt-1">
                删除所有本地存储的数据（此操作不可撤销）
              </p>
            </div>
            <button className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded">
              清除
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 pt-4">
        AetherFlow v0.1.0
      </div>
    </div>
  );
};

export default Settings; 