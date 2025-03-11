import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 声明环境变量类型
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果存在token，则添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error: AxiosError) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      
      // 处理401未授权错误（token过期或无效）
      if (status === 401) {
        // 清除本地存储的token
        localStorage.removeItem('token');
        
        // 重定向到登录页面
        window.location.href = '/login';
      }
      
      // 返回错误信息
      return Promise.reject(data);
    }
    
    // 网络错误或请求被取消
    return Promise.reject({
      message: error.message || '网络错误，请稍后重试'
    });
  }
);

// 定义API接口类型
interface UserData {
  username?: string;
  email: string;
  password: string;
  passwordConfirm?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface PromptData {
  content: string;
  response?: string;
  platform?: string;
  url?: string;
  tags?: string[];
}

interface TagData {
  name: string;
  color?: string;
}

interface ConversationData {
  title: string;
  model?: string;
  messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

interface MessageData {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ApiKeyData {
  provider: 'openai' | 'deepseek' | 'moonshot';
  key: string;
  name?: string;
}

interface OptimizationData {
  prompt: string;
  provider?: 'openai' | 'deepseek' | 'moonshot';
  model?: string;
  previousOptimizationId?: string;
}

interface RatingData {
  score: number;
  feedback?: string;
}

// API客户端
const apiClient = {
  // 认证相关API
  auth: {
    // 用户注册
    register: (userData: UserData) => {
      return api.post('/auth/register', userData);
    },
    
    // 用户登录
    login: (credentials: LoginCredentials) => {
      return api.post('/auth/login', credentials);
    },
    
    // 用户登出
    logout: () => {
      return api.post('/auth/logout');
    },
    
    // 获取当前用户信息
    getMe: () => {
      return api.get('/auth/me');
    },
    
    // 更新用户信息
    updateProfile: (userData: Partial<UserData>) => {
      return api.put('/auth/me', userData);
    },
    
    // 修改密码
    changePassword: (passwords: { currentPassword: string; newPassword: string }) => {
      return api.put('/auth/password', passwords);
    }
  },
  
  // 提示词相关API
  prompts: {
    // 获取提示词列表
    getAll: (params?: { page?: number; limit?: number; search?: string; tags?: string[]; platform?: string }) => {
      return api.get('/prompts', { params });
    },
    
    // 获取单个提示词
    getById: (id: string) => {
      return api.get(`/prompts/${id}`);
    },
    
    // 创建提示词
    create: (promptData: PromptData) => {
      return api.post('/prompts', promptData);
    },
    
    // 更新提示词
    update: (id: string, promptData: Partial<PromptData>) => {
      return api.put(`/prompts/${id}`, promptData);
    },
    
    // 删除提示词
    delete: (id: string) => {
      return api.delete(`/prompts/${id}`);
    },
    
    // 自动保存提示词
    autoSave: (promptData: PromptData) => {
      return api.post('/prompts/auto-save', promptData);
    },
    
    // 快速搜索提示词
    quickSearch: (query: string, limit?: number) => {
      return api.get('/prompts/quick-search', { params: { query, limit } });
    },
    
    // 批量获取提示词
    batchGet: (ids: string[]) => {
      return api.post('/prompts/batch', { ids });
    },
    
    // 获取最近提示词
    getRecent: (limit?: number) => {
      return api.get('/prompts/recent', { params: { limit } });
    }
  },
  
  // 标签相关API
  tags: {
    // 获取标签列表
    getAll: () => {
      return api.get('/tags');
    },
    
    // 创建标签
    create: (tagData: TagData) => {
      return api.post('/tags', tagData);
    },
    
    // 更新标签
    update: (id: string, tagData: Partial<TagData>) => {
      return api.put(`/tags/${id}`, tagData);
    },
    
    // 删除标签
    delete: (id: string) => {
      return api.delete(`/tags/${id}`);
    },
    
    // 获取标签关联的提示词
    getPrompts: (id: string, params?: { page?: number; limit?: number }) => {
      return api.get(`/tags/${id}/prompts`, { params });
    }
  },
  
  // 会话相关API
  conversations: {
    // 获取会话列表
    getAll: (params?: { page?: number; limit?: number; search?: string; tags?: string[]; model?: string }) => {
      return api.get('/conversations', { params });
    },
    
    // 获取单个会话
    getById: (id: string) => {
      return api.get(`/conversations/${id}`);
    },
    
    // 创建会话
    create: (conversationData: ConversationData) => {
      return api.post('/conversations', conversationData);
    },
    
    // 更新会话
    update: (id: string, conversationData: Partial<ConversationData>) => {
      return api.put(`/conversations/${id}`, conversationData);
    },
    
    // 删除会话
    delete: (id: string) => {
      return api.delete(`/conversations/${id}`);
    },
    
    // 添加消息到会话
    addMessage: (id: string, messageData: MessageData) => {
      return api.post(`/conversations/${id}/messages`, messageData);
    },
    
    // 获取会话消息历史
    getMessages: (id: string, params?: { page?: number; limit?: number }) => {
      return api.get(`/conversations/${id}/messages`, { params });
    },
    
    // 清空会话消息
    clearMessages: (id: string) => {
      return api.delete(`/conversations/${id}/messages`);
    },
    
    // 导出会话
    export: (id: string, format: 'json' | 'markdown') => {
      return api.get(`/conversations/${id}/export`, { params: { format } });
    },
    
    // 分享会话
    share: (id: string) => {
      return api.post(`/conversations/${id}/share`);
    },
    
    // 取消分享会话
    unshare: (id: string) => {
      return api.delete(`/conversations/${id}/share`);
    },
    
    // 标记会话为收藏
    favorite: (id: string) => {
      return api.post(`/conversations/${id}/favorite`);
    },
    
    // 取消会话收藏标记
    unfavorite: (id: string) => {
      return api.delete(`/conversations/${id}/favorite`);
    },
    
    // 标记会话为存档
    archive: (id: string) => {
      return api.post(`/conversations/${id}/archive`);
    },
    
    // 取消会话存档标记
    unarchive: (id: string) => {
      return api.delete(`/conversations/${id}/archive`);
    }
  },
  
  // 活动日志相关API
  activities: {
    // 获取活动日志列表
    getAll: (params?: { page?: number; limit?: number; action?: string; entityType?: string; days?: number }) => {
      return api.get('/activities', { params });
    },
    
    // 获取单个活动日志
    getById: (id: string) => {
      return api.get(`/activities/${id}`);
    },
    
    // 获取活动统计
    getStats: (days?: number) => {
      return api.get('/activities/stats', { params: { days } });
    },
    
    // 清除活动日志
    clear: (params?: { action?: string; entityType?: string; days?: number }) => {
      return api.delete('/activities', { params });
    }
  },
  
  // 提示词优化相关API
  optimization: {
    // 优化提示词
    optimize: (data: OptimizationData) => {
      return api.post('/prompt-optimization/optimize', data);
    },
    
    // 获取优化历史列表
    getHistory: (params?: { page?: number; limit?: number }) => {
      return api.get('/prompt-optimization/history', { params });
    },
    
    // 获取单个优化历史
    getHistoryById: (id: string) => {
      return api.get(`/prompt-optimization/history/${id}`);
    },
    
    // 评价优化结果
    rateOptimization: (id: string, ratingData: RatingData) => {
      return api.post(`/prompt-optimization/history/${id}/rate`, ratingData);
    },
    
    // 添加API密钥
    addApiKey: (apiKeyData: ApiKeyData) => {
      return api.post('/prompt-optimization/api-keys', apiKeyData);
    },
    
    // 获取API密钥列表
    getApiKeys: () => {
      return api.get('/prompt-optimization/api-keys');
    },
    
    // 删除API密钥
    deleteApiKey: (id: string) => {
      return api.delete(`/prompt-optimization/api-keys/${id}`);
    },
    
    // 获取客户端配置
    getClientConfig: () => {
      return api.get('/prompt-optimization/client-config');
    }
  }
};

export default apiClient; 