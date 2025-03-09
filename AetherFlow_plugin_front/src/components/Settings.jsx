import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RiSettings4Line, 
  RiSaveLine, 
  RiLightbulbLine,
  RiMailSendLine,
  RiInformationLine,
  RiUserLine,
  RiLockPasswordLine,
  RiLoginBoxLine,
  RiLogoutBoxLine,
  RiUserAddLine,
  RiArrowLeftLine
} from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';
import { usePrompt } from '../contexts/PromptContext';

const Settings = ({ 
  reducedMotion, 
  autoSaveEnabled, 
  setAutoSaveEnabled,
  smartSuggestionsEnabled,
  setSmartSuggestionsEnabled
}) => {
  const { currentUser, login, register, logout, error } = useAuth();
  const { toggleAutoSave } = usePrompt();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [authMode, setAuthMode] = useState('none'); // 'none', 'login', 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 添加本地状态来跟踪用户登录状态
  const [localUser, setLocalUser] = useState(null);
  
  // 组件加载时从localStorage读取用户信息
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('组件加载时从localStorage读取的user:', userString);
    console.log('组件加载时从localStorage读取的token:', token);
    
    if (userString && token) {
      try {
        const userInfo = JSON.parse(userString);
        setLocalUser(userInfo);
        console.log('设置本地用户状态:', userInfo);
      } catch (error) {
        console.error('解析localStorage中的用户信息失败:', error);
        // 清除可能损坏的数据
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);
  
  // 处理自动保存开关变化
  const handleAutoSaveToggle = () => {
    const newValue = !autoSaveEnabled;
    setAutoSaveEnabled(newValue);
    
    // 通知后台脚本更新自动保存状态
    toggleAutoSave(newValue);
    
    // 保存到本地存储
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'autoSaveEnabled': newValue });
    }
  };
  
  // 在组件加载时从本地存储获取自动保存状态
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('autoSaveEnabled', data => {
        if (data.autoSaveEnabled !== undefined) {
          setAutoSaveEnabled(data.autoSaveEnabled);
        }
      });
    }
  }, [setAutoSaveEnabled]);
  
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    
    // In a real implementation, this would send the feedback to a server
    console.log('Feedback submitted:', feedbackText);
    setFeedbackSubmitted(true);
    setFeedbackText('');
    
    // Reset the submitted state after a delay
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    
    console.log('登录表单数据:', formData);
    
    if (!formData.email || !formData.password) {
      setFormError('请填写所有必填字段');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('开始登录...');
      // 直接调用API而不是通过context
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const result = await response.json();
      console.log('登录响应:', result);
      
      if (!response.ok) {
        throw { response: { data: result } };
      }
      
      // 确保result.data包含所需信息
      if (!result.data || !result.data.token || !result.data.userId || !result.data.username) {
        console.error('登录响应缺少必要信息:', result);
        throw new Error('登录响应缺少必要信息');
      }
      
      // 手动设置token和用户信息
      const userInfo = {
        userId: result.data.userId,
        username: result.data.username,
        email: formData.email // 使用表单中的邮箱，因为响应中可能没有
      };
      
      console.log('保存到localStorage的用户信息:', userInfo);
      console.log('保存到localStorage的token:', result.data.token);
      
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // 更新本地状态，而不是刷新页面
      setLocalUser(userInfo);
      
      setAuthMode('none');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('登录失败:', error);
      
      // 显示详细的错误信息
      if (error.response) {
        const errorData = error.response.data;
        console.error('错误响应:', errorData);
        
        if (errorData.error && errorData.error.message) {
          setFormError(errorData.error.message);
        } else {
          setFormError('登录失败，请检查邮箱和密码');
        }
      } else if (error.request) {
        setFormError('网络错误，请检查您的网络连接');
      } else {
        setFormError('登录失败，请稍后再试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    
    console.log('注册表单数据:', formData);
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('请填写所有必填字段');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('开始注册...');
      // 直接传递整个表单数据，包括confirmPassword字段
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword // 确保使用confirmPassword字段
      };
      console.log('发送到后端的数据:', userData);
      
      // 直接调用API而不是通过context
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      console.log('注册响应:', result);
      
      if (!response.ok) {
        throw { response: { data: result } };
      }
      
      // 确保result.data包含所需信息
      if (!result.data || !result.data.token || !result.data.userId || !result.data.username) {
        console.error('注册响应缺少必要信息:', result);
        throw new Error('注册响应缺少必要信息');
      }
      
      // 手动设置token和用户信息
      const userInfo = {
        userId: result.data.userId,
        username: result.data.username,
        email: formData.email // 使用表单中的邮箱，因为响应中可能没有
      };
      
      console.log('保存到localStorage的用户信息:', userInfo);
      console.log('保存到localStorage的token:', result.data.token);
      
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // 更新本地状态，而不是刷新页面
      setLocalUser(userInfo);
      
      setAuthMode('none');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('注册失败:', error);
      
      // 显示详细的错误信息
      if (error.response) {
        const errorData = error.response.data;
        console.error('错误响应:', errorData);
        
        if (errorData.error && errorData.error.errors) {
          // 处理验证错误
          const validationErrors = Object.values(errorData.error.errors).join(', ');
          setFormError(validationErrors || '注册失败，请检查您的输入');
        } else {
          setFormError(errorData.error?.message || '注册失败，请稍后再试');
        }
      } else if (error.request) {
        setFormError('网络错误，请检查您的网络连接');
      } else {
        setFormError('注册失败，请稍后再试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 直接清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 更新本地状态，而不是刷新页面
      setLocalUser(null);
    } catch (error) {
      console.error('登出时发生错误:', error);
    }
  };
  
  // 登录表单
  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setAuthMode('none')}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <RiArrowLeftLine /> 返回
        </button>
        <h3 className="font-medium text-white">用户登录</h3>
      </div>
      
      {formError && (
        <div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">邮箱</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">密码</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="********"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? '登录中...' : '登录'}
        </button>
        
        <p className="text-center text-sm text-gray-400">
          还没有账号？
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="text-purple-400 hover:text-purple-300 ml-1"
          >
            立即注册
          </button>
        </p>
      </form>
    </motion.div>
  );
  
  // 注册表单
  const renderRegisterForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setAuthMode('none')}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
        >
          <RiArrowLeftLine /> 返回
        </button>
        <h3 className="font-medium text-white">用户注册</h3>
      </div>
      
      {formError && (
        <div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">用户名</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="用户名"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">邮箱</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">密码</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="********"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">确认密码</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="********"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? '注册中...' : '注册'}
        </button>
        
        <p className="text-center text-sm text-gray-400">
          已有账号？
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="text-purple-400 hover:text-purple-300 ml-1"
          >
            立即登录
          </button>
        </p>
      </form>
    </motion.div>
  );
  
  // 用户信息
  const renderUserInfo = () => {
    // 使用本地状态而不是直接从localStorage读取
    console.log('渲染用户信息时的本地用户状态:', localUser);
    
    return (
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <h3 className="font-medium text-white mb-4">用户信息</h3>
        
        <div className="space-y-4">
          {localUser ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <RiUserLine className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-gray-200">{localUser.username}</p>
                  <p className="text-xs text-gray-400">{localUser.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <RiLogoutBoxLine />
                <span>退出登录</span>
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                登录或注册账号以同步您的提示词和设置。
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setAuthMode('login')}
                  className="flex-1 py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center space-x-2 transition-colors"
                >
                  <RiLoginBoxLine />
                  <span>登录</span>
                </button>
                
                <button
                  onClick={() => setAuthMode('register')}
                  className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center space-x-2 transition-colors"
                >
                  <RiUserAddLine />
                  <span>注册</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 根据认证模式渲染不同内容
  if (authMode === 'login') {
    return renderLoginForm();
  }
  
  if (authMode === 'register') {
    return renderRegisterForm();
  }
  
  // 默认设置页面
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <RiSettings4Line className="text-purple-400" size={20} />
        <h2 className="text-xl font-semibold text-white">设置</h2>
      </div>
      
      <div className="space-y-4">
        {renderUserInfo()}
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-4">功能</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiSaveLine className="text-blue-400" />
                <div>
                  <p className="text-gray-200">自动保存</p>
                  <p className="text-xs text-gray-400">自动保存您的提示词</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoSaveEnabled}
                  onChange={handleAutoSaveToggle}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiLightbulbLine className="text-yellow-400" />
                <div>
                  <p className="text-gray-200">智能提示</p>
                  <p className="text-xs text-gray-400">输入时获取AI提示</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={smartSuggestionsEnabled}
                  onChange={() => setSmartSuggestionsEnabled(!smartSuggestionsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-4">反馈</h3>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              帮助我们改进AetherFlow，分享您的建议或报告问题。
            </p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="您的反馈..."
              className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none resize-none"
            />
            
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedbackText.trim() || feedbackSubmitted}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                feedbackSubmitted 
                  ? 'bg-green-600 text-white cursor-default' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {feedbackSubmitted ? (
                <>
                  <RiCheckLine />
                  <span>已提交</span>
                </>
              ) : (
                <>
                  <RiMailSendLine />
                  <span>提交反馈</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-4">关于</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RiInformationLine className="text-blue-400" />
              <p className="text-sm text-gray-300">AetherFlow v1.0.0</p>
            </div>
            
            <p className="text-xs text-gray-400">
              © 2023 AetherFlow Team. 保留所有权利。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;