import React, { Component } from 'react';
import { error } from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下一次渲染将显示回退UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({ errorInfo });
    // 使用日志工具记录错误
    error('组件渲染错误', { error: error.toString(), componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      // 自定义回退UI
      return (
        <div className="p-4 bg-red-900/20 rounded-lg border border-red-700 text-white">
          <h2 className="text-lg font-semibold mb-2">组件加载失败</h2>
          <p className="mb-2">很抱歉，插件组件加载过程中发生错误。</p>
          <details className="text-xs bg-gray-900/50 p-2 rounded">
            <summary className="cursor-pointer">查看错误详情</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            onClick={() => this.setState({ hasError: false })}
          >
            尝试恢复
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 