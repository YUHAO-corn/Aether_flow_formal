import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Filter, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { ApiResponse } from '../utils/apiClient';

interface ActivityLogProps {
  className?: string;
}

interface Activity {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface ActivityStats {
  actionStats: { _id: string; count: number }[];
  entityStats: { _id: string; count: number }[];
  dateStats: { _id: string; count: number }[];
  period: { start: string; end: string };
}

const ActivityLog: React.FC<ActivityLogProps> = ({ className = '' }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 获取活动日志
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      
      if (filter.action) queryParams.append('action', filter.action);
      if (filter.entityType) queryParams.append('entityType', filter.entityType);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      
      const response = await apiClient.get<ApiResponse<Activity[]>>(`/activities?${queryParams.toString()}`);
      
      if (response && response.data) {
        setActivities(response.data);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      console.error('获取活动日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取活动统计
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      
      const response = await apiClient.get<ApiResponse<ActivityStats>>(`/activities/stats?${queryParams.toString()}`);
      
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('获取活动统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 清除活动日志
  const clearActivities = async () => {
    if (!window.confirm('确定要清除活动日志吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filter.action) queryParams.append('action', filter.action);
      if (filter.entityType) queryParams.append('entityType', filter.entityType);
      if (filter.startDate) queryParams.append('olderThan', filter.startDate);
      
      await apiClient.delete(`/activities?${queryParams.toString()}`);
      
      // 重新获取活动日志和统计
      fetchActivities();
      if (showStats) fetchStats();
    } catch (error) {
      console.error('清除活动日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // 格式化操作类型
  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      login: '登录',
      logout: '登出',
      register: '注册',
      create_prompt: '创建提示词',
      update_prompt: '更新提示词',
      delete_prompt: '删除提示词',
      favorite_prompt: '收藏提示词',
      use_prompt: '使用提示词',
      auto_save_prompt: '自动保存提示词',
      create_tag: '创建标签',
      update_tag: '更新标签',
      delete_tag: '删除标签',
      create_conversation: '创建会话',
      update_conversation: '更新会话',
      delete_conversation: '删除会话',
      add_message: '添加消息',
      clear_messages: '清除消息',
      enhance_prompt: '增强提示词',
      optimize: '优化提示词',
      rate_optimization: '评价优化',
      create_api_key: '创建API密钥',
      update_api_key: '更新API密钥',
      delete_api_key: '删除API密钥',
      clear_activities: '清除活动'
    };
    
    return actionMap[action] || action;
  };

  // 格式化实体类型
  const formatEntityType = (entityType: string) => {
    const entityMap: Record<string, string> = {
      User: '用户',
      Prompt: '提示词',
      Tag: '标签',
      Conversation: '会话',
      OptimizationHistory: '优化历史',
      ApiKey: 'API密钥',
      prompt: '提示词',
      tag: '标签',
      conversation: '会话',
      api_key: 'API密钥',
      activity_log: '活动日志'
    };
    
    return entityMap[entityType] || entityType;
  };

  // 初始加载和筛选变化时获取数据
  useEffect(() => {
    fetchActivities();
  }, [page, filter]);

  // 显示统计时获取统计数据
  useEffect(() => {
    if (showStats) {
      fetchStats();
    }
  }, [showStats, filter.startDate, filter.endDate]);

  return (
    <div className={`bg-gray-800 rounded-xl p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Clock className="mr-2 text-blue-400" size={20} />
          活动日志
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="筛选"
          >
            <Filter size={18} />
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="统计"
          >
            <BarChart2 size={18} />
          </button>
          
          <button
            onClick={clearActivities}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="清除"
          >
            <Trash2 size={18} />
          </button>
          
          <button
            onClick={fetchActivities}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="刷新"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {/* 筛选面板 */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">操作类型</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                value={filter.action}
                onChange={(e) => setFilter({...filter, action: e.target.value})}
              >
                <option value="">全部</option>
                <option value="login">登录</option>
                <option value="create_prompt">创建提示词</option>
                <option value="update_prompt">更新提示词</option>
                <option value="auto_save_prompt">自动保存提示词</option>
                <option value="optimize">优化提示词</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">实体类型</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                value={filter.entityType}
                onChange={(e) => setFilter({...filter, entityType: e.target.value})}
              >
                <option value="">全部</option>
                <option value="prompt">提示词</option>
                <option value="tag">标签</option>
                <option value="conversation">会话</option>
                <option value="OptimizationHistory">优化历史</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">开始日期</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                value={filter.startDate}
                onChange={(e) => setFilter({...filter, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">结束日期</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                value={filter.endDate}
                onChange={(e) => setFilter({...filter, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg mr-2"
              onClick={() => setFilter({action: '', entityType: '', startDate: '', endDate: ''})}
            >
              重置
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
              onClick={() => {
                setPage(1);
                fetchActivities();
              }}
            >
              应用筛选
            </button>
          </div>
        </div>
      )}
      
      {/* 统计面板 */}
      {showStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">操作类型统计</h3>
                <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {stats.actionStats.map((item) => (
                    <div key={item._id} className="flex justify-between py-1 border-b border-gray-700">
                      <span>{formatAction(item._id)}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">实体类型统计</h3>
                <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {stats.entityStats.map((item) => (
                    <div key={item._id} className="flex justify-between py-1 border-b border-gray-700">
                      <span>{formatEntityType(item._id || 'unknown')}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium mb-2">日期统计</h3>
                <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {stats.dateStats.map((item) => (
                      <div key={item._id} className="flex justify-between py-1 px-2 border border-gray-700 rounded">
                        <span className="text-xs">{item._id}</span>
                        <span className="font-medium text-xs">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">无统计数据</div>
          )}
        </div>
      )}
      
      {/* 活动列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-2">操作</th>
                <th className="pb-2">实体类型</th>
                <th className="pb-2">时间</th>
                <th className="pb-2">详情</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="border-t border-gray-700">
                  <td className="py-3 pr-4">
                    <span className="inline-block px-2 py-1 bg-gray-700 rounded text-sm">
                      {formatAction(activity.action)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm">
                    {formatEntityType(activity.entityType || 'unknown')}
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-400">
                    {formatDate(activity.createdAt)}
                  </td>
                  <td className="py-3 text-sm max-w-xs truncate">
                    {activity.details ? JSON.stringify(activity.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          暂无活动记录
        </div>
      )}
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg ${page === 1 ? 'text-gray-500' : 'hover:bg-gray-700'}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="text-sm">
              第 {page} 页，共 {totalPages} 页
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-500' : 'hover:bg-gray-700'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog; 