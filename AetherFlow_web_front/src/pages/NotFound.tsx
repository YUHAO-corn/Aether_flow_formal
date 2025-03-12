import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 text-center">
      <AlertTriangle className="h-24 w-24 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold text-white mb-4">404 - 页面未找到</h1>
      <p className="text-xl text-gray-400 mb-8">您访问的页面不存在或已被移除</p>
      
      <Link 
        to="/" 
        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        <Home className="h-5 w-5" />
        <span>返回首页</span>
      </Link>
    </div>
  );
};

export default NotFound; 