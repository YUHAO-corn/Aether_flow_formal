import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果token存在，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  // 用户登录
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },
  
  // 更新用户信息
  updateUser: (userData) => {
    return apiClient.patch('/auth/updateMe', userData);
  },
  
  // 用户登出
  logout: () => {
    return apiClient.post('/auth/logout');
  }
};

// 提示词相关API
export const promptAPI = {
  // 获取提示词列表
  getPrompts: (params) => {
    return apiClient.get('/prompts', { params });
  },
  
  // 创建提示词
  createPrompt: (promptData) => {
    return apiClient.post('/prompts', promptData);
  },
  
  // 自动保存提示词
  autoSavePrompt: (promptData) => {
    return apiClient.post('/prompts/auto-save', promptData);
  },
  
  // 批量获取提示词
  getBatchPrompts: (ids) => {
    return apiClient.post('/prompts/batch', { ids });
  },
  
  // 获取最近使用的提示词
  getRecentPrompts: () => {
    return apiClient.get('/prompts/recent');
  },
  
  // 快速搜索提示词
  quickSearchPrompts: (query) => {
    return apiClient.get('/prompts/quick-search', { params: { query } });
  },
  
  // 优化提示词
  enhancePrompt: (promptData) => {
    return apiClient.post('/prompts/enhance', promptData);
  },
  
  // 获取单个提示词
  getPrompt: (id) => {
    return apiClient.get(`/prompts/${id}`);
  },
  
  // 更新提示词
  updatePrompt: (id, promptData) => {
    return apiClient.patch(`/prompts/${id}`, promptData);
  },
  
  // 删除提示词
  deletePrompt: (id) => {
    return apiClient.delete(`/prompts/${id}`);
  },
  
  // 切换收藏状态
  toggleFavorite: (id) => {
    return apiClient.patch(`/prompts/${id}/favorite`);
  },
  
  // 增加使用次数
  incrementUsage: (id) => {
    return apiClient.patch(`/prompts/${id}/usage`);
  }
};

// 标签相关API
export const tagAPI = {
  // 获取标签列表
  getTags: () => {
    return apiClient.get('/tags');
  },
  
  // 创建标签
  createTag: (tagData) => {
    return apiClient.post('/tags', tagData);
  },
  
  // 获取单个标签
  getTag: (id) => {
    return apiClient.get(`/tags/${id}`);
  },
  
  // 更新标签
  updateTag: (id, tagData) => {
    return apiClient.patch(`/tags/${id}`, tagData);
  },
  
  // 删除标签
  deleteTag: (id) => {
    return apiClient.delete(`/tags/${id}`);
  },
  
  // 获取标签的提示词
  getTagPrompts: (id, params) => {
    return apiClient.get(`/tags/${id}/prompts`, { params });
  }
};

// 提示词优化相关API
export const optimizationAPI = {
  // 获取客户端配置
  getConfig: () => {
    return apiClient.get('/prompt-optimization/config');
  },
  
  // 优化提示词
  optimizePrompt: (promptData) => {
    return apiClient.post('/prompt-optimization', promptData);
  },
  
  // 获取优化历史
  getHistory: () => {
    return apiClient.get('/prompt-optimization/history');
  },
  
  // 获取单个优化历史
  getHistoryById: (id) => {
    return apiClient.get(`/prompt-optimization/history/${id}`);
  },
  
  // 评价优化结果
  rateOptimization: (id, ratingData) => {
    return apiClient.post(`/prompt-optimization/history/${id}/rate`, ratingData);
  },
  
  // 管理API密钥
  manageApiKey: (keyData) => {
    return apiClient.post('/prompt-optimization/api-keys', keyData);
  },
  
  // 获取API密钥
  getApiKeys: () => {
    return apiClient.get('/prompt-optimization/api-keys');
  },
  
  // 删除API密钥
  deleteApiKey: (id) => {
    return apiClient.delete(`/prompt-optimization/api-keys/${id}`);
  }
};

export default apiClient; 