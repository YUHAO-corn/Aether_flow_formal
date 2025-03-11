import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Star, 
  ArrowUpRight,
  Zap,
  BookOpen,
  Settings
} from 'lucide-react';
import apiClient from '../api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    promptCount: 0,
    conversationCount: 0,
    optimizationCount: 0,
    favoriteCount: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 获取统计数据
        const statsResponse = await apiClient.activities.getStats(30);
        if (statsResponse.success) {
          setStats({
            promptCount: statsResponse.data.promptCount || 0,
            conversationCount: statsResponse.data.conversationCount || 0,
            optimizationCount: statsResponse.data.optimizationCount || 0,
            favoriteCount: statsResponse.data.favoriteCount || 0
          });
        }
        
        // 获取最近活动
        const activitiesResponse = await apiClient.activities.getAll({ limit: 10 });
        if (activitiesResponse.success) {
          setRecentActivities(activitiesResponse.data.activities || []);
        }
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 获取活动图标
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create_prompt':
        return <BookOpen className="h-4 w-4 text-green-400" />;
      case 'optimize_prompt':
        return <Sparkles className="h-4 w-4 text-yellow-400" />;
      case 'create_conversation':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'add_message':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'login':
        return <Zap className="h-4 w-4 text-purple-400" />;
      case 'favorite':
        return <Star className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // 获取活动描述
  const getActivityDescription = (activity: any) => {
    switch (activity.action) {
      case 'create_prompt':
        return `创建了新提示词 "${activity.details?.title || '未命名'}"`;
      case 'optimize_prompt':
        return `优化了提示词 "${activity.details?.title || '未命名'}"`;
      case 'create_conversation':
        return `创建了新对话 "${activity.details?.title || '未命名'}"`;
      case 'add_message':
        return `在对话 "${activity.details?.conversationTitle || '未命名'}" 中添加了消息`;
      case 'login':
        return `登录了系统`;
      case 'favorite':
        return `将 "${activity.details?.title || '未命名'}" 标记为收藏`;
      default:
        return `执行了 ${activity.action} 操作`;
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
        <p className="text-gray-400">查看您的提示词管理和优化概览</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">提示词</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stats.promptCount}</h3>
                  <p className="text-sm text-gray-400">总提示词数量</p>
                </div>
                <Link to="/prompts" className="text-blue-400 hover:text-blue-300">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">对话</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stats.conversationCount}</h3>
                  <p className="text-sm text-gray-400">总对话数量</p>
                </div>
                <Link to="/conversations" className="text-purple-400 hover:text-purple-300">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">优化</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stats.optimizationCount}</h3>
                  <p className="text-sm text-gray-400">优化次数</p>
                </div>
                <Link to="/optimizer" className="text-yellow-400 hover:text-yellow-300">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">收藏</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stats.favoriteCount}</h3>
                  <p className="text-sm text-gray-400">收藏数量</p>
                </div>
                <Link to="/prompts?favorite=true" className="text-green-400 hover:text-green-300">
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* 快速访问 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">快速访问</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/optimizer" 
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg mr-4">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">提示词优化</h3>
                </div>
                <p className="text-gray-400 text-sm">使用AI优化您的提示词，获得更好的结果</p>
              </Link>
              
              <Link 
                to="/prompts" 
                className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">提示词管理</h3>
                </div>
                <p className="text-gray-400 text-sm">管理和组织您的提示词库</p>
              </Link>
              
              <Link 
                to="/settings" 
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gray-700 p-3 rounded-lg mr-4">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">设置</h3>
                </div>
                <p className="text-gray-400 text-sm">配置API密钥和个人偏好</p>
              </Link>
            </div>
          </div>
          
          {/* 最近活动 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">最近活动</h2>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {recentActivities.map((activity) => (
                    <div key={activity._id} className="p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{getActivityDescription(activity)}</p>
                          <p className="text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">暂无活动记录</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 