import React, { useState, useEffect } from 'react';
import { Key, User, Save, Plus, Trash, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newApiKey, setNewApiKey] = useState({
    provider: 'openai',
    key: '',
    name: ''
  });
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 个人信息设置
  const [profile, setProfile] = useState({
    username: '',
    email: ''
  });
  
  // 密码修改
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    fetchApiKeys();
    
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.optimization.getApiKeys();
      if (response.data && response.data.apiKeys) {
        setApiKeys(response.data.apiKeys);
      }
    } catch (err) {
      console.error('获取API密钥失败:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddApiKey = async () => {
    if (!newApiKey.provider || !newApiKey.key) {
      setError('请填写API提供商和密钥');
      return;
    }
    
    try {
      const response = await apiClient.optimization.addApiKey({
        provider: newApiKey.provider as 'openai' | 'deepseek' | 'moonshot',
        key: newApiKey.key,
        name: newApiKey.name || undefined
      });
      
      if (response.data && response.data.apiKey) {
        setApiKeys([...apiKeys, response.data.apiKey]);
        setNewApiKey({
          provider: 'openai',
          key: '',
          name: ''
        });
        setSuccess('API密钥添加成功');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || '添加API密钥失败');
    }
  };
  
  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await apiClient.optimization.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(key => key._id !== keyId));
      setSuccess('API密钥删除成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || '删除API密钥失败');
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      const response = await apiClient.auth.updateProfile({
        username: profile.username,
        email: profile.email
      });
      
      if (response.success) {
        setSuccess('个人信息更新成功');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || '更新个人信息失败');
    }
  };
  
  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    
    if (passwords.newPassword.length < 8) {
      setError('新密码长度至少为8个字符');
      return;
    }
    
    try {
      const response = await apiClient.auth.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      if (response.success) {
        setSuccess('密码修改成功');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || '修改密码失败');
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">设置</h1>
        <p className="text-gray-400">管理您的账户和API密钥</p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-900/30 border border-green-500 text-green-400 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 个人信息设置 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 mr-2 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">个人信息</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleUpdateProfile}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>保存更改</span>
            </button>
          </div>
        </div>
        
        {/* 密码修改 */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <Key className="h-5 w-5 mr-2 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">修改密码</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                当前密码
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                新密码
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>修改密码</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* API密钥管理 */}
      <div className="mt-6 bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <Key className="h-5 w-5 mr-2 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">API密钥管理</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-400 mb-4">
            添加您的API密钥以使用提示词优化功能。我们支持OpenAI、DeepSeek和Moonshot等多种大模型。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-1">
                API提供商
              </label>
              <select
                id="provider"
                value={newApiKey.provider}
                onChange={(e) => setNewApiKey({ ...newApiKey, provider: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="moonshot">Moonshot</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                名称（可选）
              </label>
              <input
                id="name"
                type="text"
                value={newApiKey.name}
                onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                placeholder="例如：个人账号"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-1">
                API密钥
              </label>
              <div className="relative">
                <input
                  id="key"
                  type={showKey ? 'text' : 'password'}
                  value={newApiKey.key}
                  onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAddApiKey}
            className="mt-4 flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加API密钥</span>
          </button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-4">已保存的API密钥</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : apiKeys.length > 0 ? (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      提供商
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      名称
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      密钥
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      添加时间
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {apiKeys.map((key) => (
                    <tr key={key._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-700 rounded-full">
                            {key.provider === 'openai' && <span className="text-green-400">O</span>}
                            {key.provider === 'deepseek' && <span className="text-blue-400">D</span>}
                            {key.provider === 'moonshot' && <span className="text-yellow-400">M</span>}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {key.provider === 'openai' && 'OpenAI'}
                              {key.provider === 'deepseek' && 'DeepSeek'}
                              {key.provider === 'moonshot' && 'Moonshot'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{key.name || '默认'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">••••••••{key.key.slice(-4)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(key.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteApiKey(key._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-400">暂无保存的API密钥</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 