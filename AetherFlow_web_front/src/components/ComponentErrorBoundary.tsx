import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
    componentName?: string;
  }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 组件级错误边界
 * 用于捕获组件内部的错误，防止整个应用崩溃
 */
class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error(`Error in component ${this.props.componentName || 'unknown'}:`, error, errorInfo);
    
    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 可以在这里添加错误上报逻辑
    // reportError(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { children, componentName, fallbackComponent: FallbackComponent } = this.props;
    
    if (this.state.hasError && this.state.error) {
      // 使用自定义回退组件或默认的ErrorFallback
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
            componentName={componentName}
          />
        );
      }
      
      // 使用默认的错误回退UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          componentName={componentName}
        />
      );
    }

    return children;
  }
}

export default ComponentErrorBoundary; 