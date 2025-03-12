import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const validatePassword = () => {
    if (password !== passwordConfirm) {
      setPasswordError('两次输入的密码不一致');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('密码长度至少为8个字符');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !passwordConfirm) {
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register({
        username,
        email,
        password,
        passwordConfirm
      });
      
      // 注册成功后重定向到登录页面
      navigate('/login', { 
        replace: true,
        state: { message: '注册成功，请登录' }
      });
    } catch (err) {
      // 错误处理在AuthContext中
      console.error('注册失败:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">注册AetherFlow</h2>
          <p className="mt-2 text-sm text-gray-400">
            创建您的账户，开始使用提示词管理与优化平台
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearError();
                }}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="您的用户名"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                  if (passwordError) validatePassword();
                }}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="至少8个字符"
              />
            </div>
            
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-300">
                确认密码
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  clearError();
                  if (passwordError) validatePassword();
                }}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="再次输入密码"
              />
              
              {passwordError && (
                <p className="mt-1 text-sm text-red-400">{passwordError}</p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white ${
                isSubmitting
                  ? 'bg-purple-700 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className={`h-5 w-5 ${isSubmitting ? 'text-purple-400' : 'text-purple-500 group-hover:text-purple-400'}`} />
              </span>
              {isSubmitting ? '注册中...' : '注册'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-400">已有账号? </span>
            <Link to="/login" className="text-purple-400 hover:text-purple-300">
              立即登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 