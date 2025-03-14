/**
 * 错误类型定义
 */
export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
}

/**
 * 统一的错误响应格式
 */
export interface ErrorResponse {
  error: ApiError;
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string = 'APP_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;

    // 确保正确的原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 从API响应中提取错误信息
 * @param response 响应对象或错误对象
 * @returns 格式化的错误对象
 */
export function extractErrorFromResponse(response: any): ApiError {
  // 如果是AppError实例，直接返回格式化的错误
  if (response instanceof AppError) {
    return {
      message: response.message,
      code: response.code,
      status: response.status,
      details: response.details
    };
  }

  // 处理API错误响应
  if (response && response.error) {
    return {
      message: response.error.message || '未知错误',
      code: response.error.code || 'UNKNOWN_ERROR',
      status: response.status || 500,
      details: response.error.details
    };
  }

  // 处理HTTP错误
  if (response && response.status) {
    return {
      message: response.statusText || getDefaultErrorMessage(response.status),
      code: `HTTP_${response.status}`,
      status: response.status
    };
  }

  // 处理普通Error对象
  if (response instanceof Error) {
    return {
      message: response.message || '应用程序错误',
      code: 'APP_ERROR',
      status: 500
    };
  }

  // 处理未知错误
  return {
    message: typeof response === 'string' ? response : '发生未知错误',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
}

/**
 * 根据HTTP状态码获取默认错误消息
 * @param status HTTP状态码
 * @returns 对应的错误消息
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请登录';
    case 403:
      return '无权访问';
    case 404:
      return '请求的资源不存在';
    case 408:
      return '请求超时';
    case 500:
      return '服务器内部错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务不可用';
    case 504:
      return '网关超时';
    default:
      return '未知错误';
  }
}

/**
 * 格式化错误消息用于显示
 * @param error 错误对象
 * @returns 格式化的错误消息
 */
export function formatErrorMessage(error: any): string {
  const apiError = extractErrorFromResponse(error);
  return `${apiError.message} (${apiError.code})`;
}

/**
 * 记录错误到控制台
 * @param error 错误对象
 * @param context 错误上下文
 */
export function logError(error: any, context: string = ''): void {
  const apiError = extractErrorFromResponse(error);
  console.error(
    `[${context}] Error ${apiError.code} (${apiError.status}): ${apiError.message}`,
    apiError.details || ''
  );
}

/**
 * 处理API请求错误
 * @param error 错误对象
 * @param fallbackMessage 备用错误消息
 * @returns 格式化的错误对象
 */
export function handleApiError(error: any, fallbackMessage: string = '请求失败'): ApiError {
  logError(error, 'API');
  
  try {
    // 尝试从响应中提取错误信息
    if (error.response && error.response.data) {
      return extractErrorFromResponse(error.response.data);
    }
    
    // 处理网络错误
    if (error.message === 'Network Error') {
      return {
        message: '网络连接错误，请检查您的网络连接',
        code: 'NETWORK_ERROR',
        status: 0
      };
    }
    
    // 处理超时错误
    if (error.code === 'ECONNABORTED') {
      return {
        message: '请求超时，请稍后重试',
        code: 'TIMEOUT_ERROR',
        status: 408
      };
    }
    
    // 处理其他错误
    return extractErrorFromResponse(error);
  } catch (e) {
    // 如果错误处理过程中出现异常，返回备用错误消息
    return {
      message: fallbackMessage,
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }
} 