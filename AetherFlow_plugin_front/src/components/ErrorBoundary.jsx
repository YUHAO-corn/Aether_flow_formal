import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      apiErrors: []
    };
    
    // 不再在这里设置全局拦截器，避免与ErrorMonitor冲突
    this.isErrorMonitorActive = window.errorMonitorActive;
    
    // 只有在ErrorMonitor不活跃时才设置拦截器
    if (!this.isErrorMonitorActive) {
      // 创建一个全局错误监听器
      this.originalFetch = window.fetch;
      this.originalXHR = window.XMLHttpRequest.prototype.open;
      
      // 拦截所有网络请求错误
      this.setupNetworkErrorInterceptors();
    }
  }

  setupNetworkErrorInterceptors() {
    // 拦截Fetch API
    window.fetch = async (...args) => {
      try {
        const response = await this.originalFetch.apply(window, args);
        if (!response.ok) {
          const url = typeof args[0] === 'string' ? args[0] : args[0].url;
          this.addApiError(`Fetch error: ${response.status} ${response.statusText} - ${url}`);
        }
        return response;
      } catch (error) {
        this.addApiError(`Network error: ${error.message}`);
        throw error;
      }
    };
    
    // 拦截XMLHttpRequest
    window.XMLHttpRequest.prototype.open = function(...args) {
      const xhr = this;
      const method = args[0];
      const url = args[1];
      
      // 使用onload和onerror代替addEventListener
      const originalOnError = xhr.onerror;
      xhr.onerror = function(event) {
        this.addApiError(`XHR error: Failed to load ${method} ${url}`);
        if (originalOnError) originalOnError.call(xhr, event);
      }.bind(this);
      
      const originalOnLoad = xhr.onload;
      xhr.onload = function(event) {
        if (xhr.status >= 400) {
          this.addApiError(`XHR error: ${xhr.status} ${xhr.statusText} - ${method} ${url}`);
        }
        if (originalOnLoad) originalOnLoad.call(xhr, event);
      }.bind(this);
      
      return this.originalXHR.apply(xhr, args);
    }.bind(this);
    
    // 监听全局未捕获的错误
    window.addEventListener('error', (event) => {
      this.addApiError(`JavaScript error: ${event.message}`);
    });
    
    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.addApiError(`Promise error: ${event.reason}`);
    });
  }
  
  addApiError(errorMessage) {
    this.setState(prevState => ({
      apiErrors: [...prevState.apiErrors, {
        id: Date.now(),
        message: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      }].slice(-5) // 只保留最近的5个错误
    }));
    
    // 10秒后自动清除错误
    setTimeout(() => {
      this.setState(prevState => ({
        apiErrors: prevState.apiErrors.filter(error => error.id !== Date.now())
      }));
    }, 10000);
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  clearError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }
  
  clearApiErrors = () => {
    this.setState({ apiErrors: [] });
  }

  render() {
    if (this.state.hasError) {
      // 渲染组件错误UI
      return (
        <div className="error-boundary p-4 bg-red-900 text-white rounded-md m-2">
          <h2 className="text-xl font-bold mb-2">组件错误</h2>
          <p className="mb-2">{this.state.error && this.state.error.toString()}</p>
          <details className="mb-4">
            <summary className="cursor-pointer">查看详情</summary>
            <pre className="mt-2 p-2 bg-red-800 rounded overflow-auto text-xs">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            onClick={this.clearError}
          >
            重试
          </button>
        </div>
      );
    }
    
    // 渲染API错误通知
    return (
      <>
        {this.props.children}
        
        {this.state.apiErrors.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 max-w-md">
            {this.state.apiErrors.map((error, index) => (
              <div 
                key={error.id || index}
                className="bg-red-900 text-white p-3 rounded-md mb-2 shadow-lg flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{error.message}</p>
                  <p className="text-xs text-red-300">{error.timestamp}</p>
                </div>
                <button 
                  className="ml-2 text-red-300 hover:text-white"
                  onClick={() => this.setState(prevState => ({
                    apiErrors: prevState.apiErrors.filter((_, i) => i !== index)
                  }))}
                >
                  ×
                </button>
              </div>
            ))}
            
            {this.state.apiErrors.length > 1 && (
              <button 
                className="bg-red-800 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 w-full"
                onClick={this.clearApiErrors}
              >
                清除所有错误
              </button>
            )}
          </div>
        )}
      </>
    );
  }
}

export default ErrorBoundary; 