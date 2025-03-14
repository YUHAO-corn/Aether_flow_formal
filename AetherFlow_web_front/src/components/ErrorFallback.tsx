import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName?: string;
}

/**
 * 错误回退组件
 * 用于在组件级别显示错误信息，提供重试选项
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentName 
}) => {
  return (
    <div className="w-full bg-gray-800 border border-red-900/30 rounded-xl p-6 my-4">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">
            {componentName ? `${componentName}加载失败` : '组件加载失败'}
          </h3>
          
          <p className="text-gray-400 text-sm mb-3">
            发生了一个错误，无法正常显示此内容。您可以尝试重新加载或联系支持团队。
          </p>
          
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4 overflow-auto max-h-32">
            <p className="text-red-400 font-mono text-xs">
              {error.message || error.toString()}
            </p>
          </div>
          
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center space-x-2 transition-colors duration-300 text-sm"
          >
            <RefreshCw size={14} />
            <span>重新加载</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback; 