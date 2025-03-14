import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, CheckCircle, XCircle, Settings, RefreshCw } from 'react-feather';

const AutoSave = ({ enabled }) => {
  const [status, setStatus] = useState('idle'); // idle, listening, saving, success, error
  const [savedCount, setSavedCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化自动保存功能
  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    // 获取当前标签页信息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // 检查当前平台
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'checkPlatform'
        }, (response) => {
          if (response && response.success) {
            const platform = response.platform;
            setCurrentPlatform(platform);
            
            if (response.isSupported) {
              setStatus('listening');
              setIsInitialized(true);
              
              // 启动监听
              chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'startAutoSave',
                platform: platform
              });
            } else {
              setStatus('unsupported');
              setIsInitialized(true);
            }
          } else {
            // 内容脚本可能未加载
            setStatus('error');
            setIsInitialized(true);
          }
        });
      }
    });
    
    // 监听来自内容脚本的消息
    const messageListener = (message, sender, sendResponse) => {
      if (message.action === 'promptSaved') {
        setStatus('success');
        setSavedCount(prev => prev + 1);
        setLastSaved(new Date());
        
        // 3秒后恢复监听状态
        setTimeout(() => {
          setStatus('listening');
        }, 3000);
      } else if (message.action === 'promptSaveError') {
        setStatus('error');
        
        // 5秒后恢复监听状态
        setTimeout(() => {
          setStatus('listening');
        }, 5000);
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    
    // 清理函数
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      
      // 停止自动保存
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'stopAutoSave' });
        }
      });
    };
  }, [enabled]);

  // 格式化时间
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <Settings size={18} />;
      case 'listening':
        return <Clock size={18} />;
      case 'saving':
        return <RefreshCw size={18} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <XCircle size={18} />;
      case 'unsupported':
        return <XCircle size={18} />;
      default:
        return <Save size={18} />;
    }
  };

  // 状态文本
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return '自动保存已禁用';
      case 'listening':
        return `正在监听 ${currentPlatform} 提示词`;
      case 'saving':
        return '正在保存...';
      case 'success':
        return `已保存 (${formatTime(lastSaved)})`;
      case 'error':
        return '保存失败，请重试';
      case 'unsupported':
        return '不支持当前平台';
      default:
        return '自动保存';
    }
  };

  // 状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'text-gray-400';
      case 'listening':
        return 'text-blue-400';
      case 'saving':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'unsupported':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Save className="mr-2" size={20} />
          自动保存
        </h2>
        
        <div className={`flex items-center ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2 text-sm">{getStatusText()}</span>
        </div>
      </div>
      
      {enabled ? (
        <div className="bg-gray-800 rounded-lg p-4">
          {!isInitialized ? (
            <div className="text-center py-8">
              <RefreshCw size={24} className="animate-spin mx-auto mb-4" />
              <p>正在初始化自动保存功能...</p>
            </div>
          ) : status === 'unsupported' ? (
            <div className="text-center py-4">
              <p className="mb-2">未检测到支持的AI平台</p>
              <p className="text-sm text-gray-400">
                请访问 ChatGPT, Claude, Gemini, Phind, Perplexity 或其他支持的AI平台以启用自动保存
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">平台:</span>
                <span>{currentPlatform}</span>
              </div>
              
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">状态:</span>
                <span className={getStatusColor()}>
                  {status === 'listening' ? '监听中' : 
                   status === 'success' ? '已保存' : 
                   status === 'error' ? '错误' : 
                   status === 'saving' ? '保存中' : '空闲'}
                </span>
              </div>
              
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">已保存提示词:</span>
                <span>{savedCount}</span>
              </div>
              
              {lastSaved && (
                <div className="flex justify-between">
                  <span className="text-gray-400">最近保存时间:</span>
                  <span>{formatTime(lastSaved)}</span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="mb-2">自动保存功能已禁用</p>
          <p className="text-sm text-gray-400">
            在设置中启用此功能以自动保存您的提示词
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoSave; 