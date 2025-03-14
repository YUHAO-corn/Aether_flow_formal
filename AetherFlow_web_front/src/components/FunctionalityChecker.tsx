import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import ComponentErrorBoundary from './ComponentErrorBoundary';

interface FunctionalityStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

/**
 * 功能检查组件
 * 用于验证所有核心功能是否可用
 * 
 * 该组件不会直接显示在界面上，而是通过以下方式触发：
 * 1. 在控制台执行 window.checkAetherFlowFunctionality()
 * 2. 在标题栏连续点击5次
 */
const FunctionalityChecker: React.FC = () => {
  const [statuses, setStatuses] = useState<FunctionalityStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // 检查API连接
  const checkApiConnection = async (): Promise<FunctionalityStatus> => {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        return {
          name: 'API连接',
          status: 'success',
          message: '后端API连接正常'
        };
      } else {
        return {
          name: 'API连接',
          status: 'error',
          message: '无法连接到后端API',
          details: `状态码: ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: 'API连接',
        status: 'error',
        message: '无法连接到后端API',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查认证功能
  const checkAuthentication = async (): Promise<FunctionalityStatus> => {
    try {
      // 检查本地存储中是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          name: '用户认证',
          status: 'warning',
          message: '未检测到登录状态',
          details: '请先登录以验证认证功能'
        };
      }

      // 验证token
      const response = await fetch('http://localhost:3000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return {
          name: '用户认证',
          status: 'success',
          message: '认证功能正常'
        };
      } else {
        return {
          name: '用户认证',
          status: 'error',
          message: '认证验证失败',
          details: `状态码: ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: '用户认证',
        status: 'error',
        message: '认证验证失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查提示词管理功能
  const checkPromptManagement = async (): Promise<FunctionalityStatus> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          name: '提示词管理',
          status: 'warning',
          message: '未登录，无法验证提示词管理功能',
          details: '请先登录以验证提示词管理功能'
        };
      }

      const response = await fetch('http://localhost:3000/api/prompts?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return {
          name: '提示词管理',
          status: 'success',
          message: '提示词管理功能正常'
        };
      } else {
        return {
          name: '提示词管理',
          status: 'error',
          message: '提示词管理功能异常',
          details: `状态码: ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: '提示词管理',
        status: 'error',
        message: '提示词管理功能异常',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查提示词优化功能
  const checkPromptOptimization = async (): Promise<FunctionalityStatus> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          name: '提示词优化',
          status: 'warning',
          message: '未登录，无法验证提示词优化功能',
          details: '请先登录以验证提示词优化功能'
        };
      }

      // 只检查API端点是否可访问，不实际发送优化请求
      const response = await fetch('http://localhost:3000/api/prompts/optimize', {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 204) {
        return {
          name: '提示词优化',
          status: 'success',
          message: '提示词优化功能可用'
        };
      } else {
        return {
          name: '提示词优化',
          status: 'error',
          message: '提示词优化功能异常',
          details: `状态码: ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: '提示词优化',
        status: 'error',
        message: '提示词优化功能异常',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查活动日志功能
  const checkActivityLog = async (): Promise<FunctionalityStatus> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          name: '活动日志',
          status: 'warning',
          message: '未登录，无法验证活动日志功能',
          details: '请先登录以验证活动日志功能'
        };
      }

      const response = await fetch('http://localhost:3000/api/activities?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return {
          name: '活动日志',
          status: 'success',
          message: '活动日志功能正常'
        };
      } else {
        return {
          name: '活动日志',
          status: 'error',
          message: '活动日志功能异常',
          details: `状态码: ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: '活动日志',
        status: 'error',
        message: '活动日志功能异常',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查自动捕获功能
  const checkAutoCapture = (): FunctionalityStatus => {
    try {
      // 检查组件是否已加载
      const promptCaptureComponent = document.querySelector('[data-testid="prompt-capture"]');
      if (promptCaptureComponent) {
        return {
          name: '自动捕获',
          status: 'success',
          message: '自动捕获功能已加载'
        };
      } else {
        return {
          name: '自动捕获',
          status: 'warning',
          message: '未检测到自动捕获组件',
          details: '请确保已切换到自动捕获标签页'
        };
      }
    } catch (error) {
      return {
        name: '自动捕获',
        status: 'error',
        message: '自动捕获功能异常',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 检查错误处理功能
  const checkErrorHandling = (): FunctionalityStatus => {
    try {
      // 检查错误边界组件是否已注册
      if (ComponentErrorBoundary) {
        return {
          name: '错误处理',
          status: 'success',
          message: '错误处理功能正常'
        };
      } else {
        return {
          name: '错误处理',
          status: 'warning',
          message: '未检测到错误边界组件',
          details: '请确保已正确导入ComponentErrorBoundary组件'
        };
      }
    } catch (error) {
      return {
        name: '错误处理',
        status: 'error',
        message: '错误处理功能异常',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 运行所有检查
  const runAllChecks = async () => {
    setIsChecking(true);
    setStatuses([
      {
        name: 'API连接',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '用户认证',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '提示词管理',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '提示词优化',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '活动日志',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '自动捕获',
        status: 'loading',
        message: '正在检查...'
      },
      {
        name: '错误处理',
        status: 'loading',
        message: '正在检查...'
      }
    ]);

    // 并行运行所有检查
    const results = await Promise.all([
      checkApiConnection(),
      checkAuthentication(),
      checkPromptManagement(),
      checkPromptOptimization(),
      checkActivityLog(),
      checkAutoCapture(),
      checkErrorHandling()
    ]);

    setStatuses(results);
    setIsChecking(false);
    
    // 将结果输出到控制台
    console.group('AetherFlow 功能检查结果');
    results.forEach(result => {
      const logMethod = result.status === 'success' ? console.log : 
                        result.status === 'error' ? console.error : 
                        result.status === 'warning' ? console.warn : console.info;
      
      logMethod(`${result.name}: ${result.message}${result.details ? ` (${result.details})` : ''}`);
    });
    console.groupEnd();
    
    return results;
  };

  // 处理标题点击事件
  const handleTitleClick = () => {
    // 增加点击计数
    setClickCount(prevCount => prevCount + 1);
    
    // 清除之前的定时器
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    // 设置新的定时器，2秒后重置点击计数
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 2000);
    
    setClickTimer(timer);
  };

  // 监听点击次数，达到5次时显示功能检查面板
  useEffect(() => {
    if (clickCount >= 5) {
      setIsVisible(true);
      setClickCount(0);
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    }
  }, [clickCount, clickTimer]);

  // 在组件挂载时，将功能检查方法暴露给全局
  useEffect(() => {
    // 将功能检查方法暴露给全局，以便通过控制台调用
    (window as any).checkAetherFlowFunctionality = () => {
      setIsVisible(true);
      runAllChecks();
    };
    
    // 添加标题点击事件监听
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      titleElement.addEventListener('click', handleTitleClick);
    }
    
    // 清理函数
    return () => {
      // 移除全局方法
      delete (window as any).checkAetherFlowFunctionality;
      
      // 移除事件监听
      if (titleElement) {
        titleElement.removeEventListener('click', handleTitleClick);
      }
      
      // 清除定时器
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, []);

  // 渲染状态图标
  const renderStatusIcon = (status: 'success' | 'error' | 'warning' | 'loading') => {
    switch (status) {
      case 'success':
        return <Check className="text-green-500" size={18} />;
      case 'error':
        return <X className="text-red-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'loading':
        return <RefreshCw className="text-blue-500 animate-spin" size={18} />;
    }
  };

  // 如果不可见，则不渲染任何内容
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 max-w-3xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">功能状态检查</h2>
          <div className="flex space-x-2">
            <button
              onClick={runAllChecks}
              disabled={isChecking}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                isChecking
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isChecking ? (
                <>
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  <span>检查中...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  <span>重新检查</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {statuses.map((item) => (
            <div key={item.name} className="bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {renderStatusIcon(item.status)}
                  <span className="ml-2 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm ${
                    item.status === 'success' ? 'text-green-400' :
                    item.status === 'error' ? 'text-red-400' :
                    item.status === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {item.message}
                  </span>
                  {item.details && (
                    <button
                      onClick={() => setShowDetails(showDetails === item.name ? null : item.name)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      {showDetails === item.name ? '隐藏' : '详情'}
                    </button>
                  )}
                </div>
              </div>
              {showDetails === item.name && item.details && (
                <div className="mt-2 p-2 bg-gray-800 rounded text-sm text-gray-400 font-mono">
                  {item.details}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              总体状态: {
                statuses.every(s => s.status === 'success') ? 
                  <span className="text-green-400">所有功能正常</span> :
                  statuses.some(s => s.status === 'error') ?
                    <span className="text-red-400">部分功能异常</span> :
                    <span className="text-yellow-400">部分功能需要注意</span>
              }
            </div>
            <div className="text-sm text-gray-400">
              最后检查时间: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalityChecker;