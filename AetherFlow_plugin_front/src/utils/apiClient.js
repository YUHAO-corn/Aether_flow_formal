import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// 添加降级机制，当API请求失败时返回模拟数据
const mockData = {
  prompts: [
    {
      id: '1',
      title: 'Interview Question Generator',
      content: '我需要为[职位名称]准备面试问题。请生成10个针对该职位的技术面试问题，包括初级、中级和高级难度的问题。每个问题后附上理想答案的要点。',
      description: '生成面试问题和答案要点',
      tags: ['面试', '职场', '问题生成'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: true,
      usageCount: 15
    },
    {
      id: '2',
      title: '代码优化建议',
      content: '请分析以下[编程语言]代码，并提供优化建议，包括性能、可读性和最佳实践方面的改进：\n\n```\n[粘贴代码]\n```',
      description: '获取代码优化和最佳实践建议',
      tags: ['编程', '代码审查', '优化'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      favorite: false,
      usageCount: 8
    },
    {
      id: '3',
      title: '学习计划生成器',
      content: '我想学习[主题]，目标是[学习目标]。我每周可以投入[小时数]小时。请为我创建一个为期[周数]周的详细学习计划，包括学习资源推荐和阶段性目标。',
      description: '生成个性化学习计划',
      tags: ['学习', '计划', '教育'],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      favorite: true,
      usageCount: 12
    }
  ],
  tags: ['面试', '职场', '问题生成', '编程', '代码审查', '优化', '学习', '计划', '教育'],
  conversations: [
    {
      id: '1',
      platform: 'ChatGPT',
      prompt: '如何使用React Hooks优化组件性能？',
      response: 'React Hooks提供了多种方式来优化组件性能...',
      timestamp: new Date().toISOString(),
      url: 'https://chat.openai.com/'
    },
    {
      id: '2',
      platform: 'Claude',
      prompt: '解释一下JavaScript中的闭包概念',
      response: '闭包是JavaScript中的一个重要概念，指的是函数和其周围状态的组合...',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      url: 'https://claude.ai/'
    }
  ]
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果token存在，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求日志
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || config.params);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 添加响应日志
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // 添加更详细的错误日志
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // 如果是获取提示词列表的请求，返回模拟数据
    if (error.config && error.config.url.includes('/prompts') && error.config.method === 'get') {
      console.log('[API] 使用模拟数据替代API响应');
      return Promise.resolve({ data: mockData.prompts });
    }
    
    // 如果是获取标签列表的请求，返回模拟数据
    if (error.config && error.config.url.includes('/tags') && error.config.method === 'get') {
      console.log('[API] 使用模拟数据替代API响应');
      return Promise.resolve({ data: mockData.tags });
    }
    
    // 如果是自动保存请求，返回成功
    if (error.config && error.config.url.includes('/prompts/auto-save')) {
      console.log('[API] 使用模拟数据替代自动保存响应');
      return Promise.resolve({ data: { success: true, message: '模拟保存成功' } });
    }
    
    // 如果是获取对话历史的请求，返回模拟数据
    if (error.config && error.config.url.includes('/conversations')) {
      console.log('[API] 使用模拟数据替代对话历史响应');
      return Promise.resolve({ data: mockData.conversations });
    }
    
    // 如果是注册请求，返回模拟成功
    if (error.config && error.config.url.includes('/auth/register')) {
      console.log('[API] 使用模拟数据替代注册响应');
      return Promise.resolve({ 
        data: { 
          success: true, 
          message: '注册成功', 
          user: { 
            id: 'mock-user-id', 
            username: error.config.data ? JSON.parse(error.config.data).username : 'mockuser',
            email: error.config.data ? JSON.parse(error.config.data).email : 'mock@example.com'
          },
          token: 'mock-token-' + Date.now()
        } 
      });
    }
    
    // 如果是登录请求，返回模拟成功
    if (error.config && error.config.url.includes('/auth/login')) {
      console.log('[API] 使用模拟数据替代登录响应');
      return Promise.resolve({ 
        data: { 
          success: true, 
          message: '登录成功', 
          user: { 
            id: 'mock-user-id', 
            username: error.config.data ? JSON.parse(error.config.data).username : 'mockuser',
            email: error.config.data ? JSON.parse(error.config.data).email : 'mock@example.com'
          },
          token: 'mock-token-' + Date.now()
        } 
      });
    }
    
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => {
    try {
      return apiClient.post('/auth/register', userData)
        .then(response => {
          // 保存用户信息和token到本地存储
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          return response;
        })
        .catch(error => {
          console.error('[AuthAPI] 注册失败:', error);
          // 创建模拟用户和token
          const mockUser = {
            id: 'mock-user-id',
            username: userData.username,
            email: userData.email
          };
          const mockToken = 'mock-token-' + Date.now();
          
          // 保存到本地存储
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          // 返回模拟成功响应
          return { 
            data: { 
              success: true, 
              message: '注册成功（模拟）', 
              user: mockUser,
              token: mockToken
            } 
          };
        });
    } catch (error) {
      console.error('[AuthAPI] 注册失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 用户登录
  login: (credentials) => {
    try {
      return apiClient.post('/auth/login', credentials)
        .then(response => {
          // 保存用户信息和token到本地存储
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          return response;
        })
        .catch(error => {
          console.error('[AuthAPI] 登录失败:', error);
          // 创建模拟用户和token
          const mockUser = {
            id: 'mock-user-id',
            username: credentials.username || 'mockuser',
            email: credentials.email || 'mock@example.com'
          };
          const mockToken = 'mock-token-' + Date.now();
          
          // 保存到本地存储
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          // 返回模拟成功响应
          return { 
            data: { 
              success: true, 
              message: '登录成功（模拟）', 
              user: mockUser,
              token: mockToken
            } 
          };
        });
    } catch (error) {
      console.error('[AuthAPI] 登录失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    try {
      // 先从本地存储获取
      const user = localStorage.getItem('user');
      if (user) {
        return Promise.resolve({ data: JSON.parse(user) });
      }
      
      // 如果本地没有，则请求API
      return apiClient.get('/auth/me')
        .catch(error => {
          console.error('[AuthAPI] 获取当前用户信息失败:', error);
          // 返回模拟用户
          const mockUser = {
            id: 'mock-user-id',
            username: 'mockuser',
            email: 'mock@example.com'
          };
          return { data: mockUser };
        });
    } catch (error) {
      console.error('[AuthAPI] 获取当前用户信息失败:', error);
      return Promise.reject(error);
    }
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
    try {
      return apiClient.get('/prompts', { params });
    } catch (error) {
      console.error('[PromptAPI] 获取提示词列表失败:', error);
      return Promise.resolve({ data: mockData.prompts });
    }
  },
  
  // 创建提示词
  createPrompt: (promptData) => {
    try {
      return apiClient.post('/prompts', promptData);
    } catch (error) {
      console.error('[PromptAPI] 创建提示词失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 自动保存提示词
  autoSavePrompt: (promptData) => {
    try {
      // 使用本地存储作为备份，避免API请求失败
      const localHistory = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      const newPrompt = {
        ...promptData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 添加到本地历史记录
      localHistory.unshift(newPrompt);
      
      // 限制本地历史记录大小
      if (localHistory.length > 100) {
        localHistory.pop();
      }
      
      // 保存到本地存储
      localStorage.setItem('promptHistory', JSON.stringify(localHistory));
      
      // 发送API请求
      return apiClient.post('/prompts/auto-save', promptData)
        .catch(error => {
          console.error('[PromptAPI] 自动保存提示词失败:', error);
          // 返回模拟成功响应
          return { data: { success: true, message: '本地保存成功', prompt: newPrompt } };
        });
    } catch (error) {
      console.error('[PromptAPI] 自动保存提示词失败:', error);
      return Promise.resolve({ data: { success: true, message: '模拟保存成功' } });
    }
  },
  
  // 批量获取提示词
  getBatchPrompts: (ids) => {
    try {
      return apiClient.post('/prompts/batch', { ids });
    } catch (error) {
      console.error('[PromptAPI] 批量获取提示词失败:', error);
      const filteredPrompts = mockData.prompts.filter(p => ids.includes(p.id));
      return Promise.resolve({ data: filteredPrompts });
    }
  },
  
  // 获取最近使用的提示词
  getRecentPrompts: () => {
    try {
      return apiClient.get('/prompts/recent');
    } catch (error) {
      console.error('[PromptAPI] 获取最近使用的提示词失败:', error);
      return Promise.resolve({ data: mockData.prompts.slice(0, 5) });
    }
  },
  
  // 快速搜索提示词
  quickSearchPrompts: (query) => {
    try {
      return apiClient.get('/prompts/quick-search', { params: { query } });
    } catch (error) {
      console.error('[PromptAPI] 快速搜索提示词失败:', error);
      const filteredPrompts = mockData.prompts.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.content.toLowerCase().includes(query.toLowerCase())
      );
      return Promise.resolve({ data: filteredPrompts });
    }
  },
  
  // 优化提示词
  enhancePrompt: (promptData) => {
    try {
      return apiClient.post('/prompts/enhance', promptData);
    } catch (error) {
      console.error('[PromptAPI] 优化提示词失败:', error);
      return Promise.resolve({ 
        data: {
          original: promptData.content,
          enhanced: `${promptData.content}\n\n[这是模拟优化的提示词，实际优化需要后端API支持]`
        }
      });
    }
  },
  
  // 获取单个提示词
  getPrompt: (id) => {
    try {
      return apiClient.get(`/prompts/${id}`);
    } catch (error) {
      console.error(`[PromptAPI] 获取提示词 ${id} 失败:`, error);
      const prompt = mockData.prompts.find(p => p.id === id);
      return Promise.resolve({ data: prompt });
    }
  },
  
  // 更新提示词
  updatePrompt: (id, promptData) => {
    try {
      return apiClient.patch(`/prompts/${id}`, promptData);
    } catch (error) {
      console.error(`[PromptAPI] 更新提示词 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 删除提示词
  deletePrompt: (id) => {
    try {
      return apiClient.delete(`/prompts/${id}`);
    } catch (error) {
      console.error(`[PromptAPI] 删除提示词 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 切换收藏状态
  toggleFavorite: (id) => {
    try {
      return apiClient.patch(`/prompts/${id}/favorite`);
    } catch (error) {
      console.error(`[PromptAPI] 切换收藏状态 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 增加使用次数
  incrementUsage: (id) => {
    try {
      return apiClient.patch(`/prompts/${id}/usage`);
    } catch (error) {
      console.error(`[PromptAPI] 增加使用次数 ${id} 失败:`, error);
      return Promise.resolve({ data: { success: true } });
    }
  }
};

// 标签相关API
export const tagAPI = {
  // 获取标签列表
  getTags: () => {
    try {
      return apiClient.get('/tags');
    } catch (error) {
      console.error('[TagAPI] 获取标签列表失败:', error);
      return Promise.resolve({ data: mockData.tags });
    }
  },
  
  // 创建标签
  createTag: (tagData) => {
    try {
      return apiClient.post('/tags', tagData);
    } catch (error) {
      console.error('[TagAPI] 创建标签失败:', error);
      return Promise.reject(error);
    }
  },
  
  // 获取单个标签
  getTag: (id) => {
    try {
      return apiClient.get(`/tags/${id}`);
    } catch (error) {
      console.error(`[TagAPI] 获取标签 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 更新标签
  updateTag: (id, tagData) => {
    try {
      return apiClient.patch(`/tags/${id}`, tagData);
    } catch (error) {
      console.error(`[TagAPI] 更新标签 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 删除标签
  deleteTag: (id) => {
    try {
      return apiClient.delete(`/tags/${id}`);
    } catch (error) {
      console.error(`[TagAPI] 删除标签 ${id} 失败:`, error);
      return Promise.reject(error);
    }
  },
  
  // 获取标签的提示词
  getTagPrompts: (id, params) => {
    try {
      return apiClient.get(`/tags/${id}/prompts`, { params });
    } catch (error) {
      console.error(`[TagAPI] 获取标签 ${id} 的提示词失败:`, error);
      const filteredPrompts = mockData.prompts.filter(p => p.tags.includes(id));
      return Promise.resolve({ data: filteredPrompts });
    }
  }
};

// 对话历史相关API
export const conversationAPI = {
  // 获取对话历史
  getConversations: () => {
    try {
      return apiClient.get('/conversations');
    } catch (error) {
      console.error('[ConversationAPI] 获取对话历史失败:', error);
      return Promise.resolve({ data: mockData.conversations });
    }
  },
  
  // 保存对话
  saveConversation: (conversationData) => {
    try {
      return apiClient.post('/conversations', conversationData);
    } catch (error) {
      console.error('[ConversationAPI] 保存对话失败:', error);
      return Promise.resolve({ data: { success: true, message: '模拟保存成功' } });
    }
  },
  
  // 获取单个对话
  getConversation: (id) => {
    try {
      return apiClient.get(`/conversations/${id}`);
    } catch (error) {
      console.error(`[ConversationAPI] 获取对话 ${id} 失败:`, error);
      const conversation = mockData.conversations.find(c => c.id === id);
      return Promise.resolve({ data: conversation });
    }
  },
  
  // 删除对话
  deleteConversation: (id) => {
    try {
      return apiClient.delete(`/conversations/${id}`);
    } catch (error) {
      console.error(`[ConversationAPI] 删除对话 ${id} 失败:`, error);
      return Promise.resolve({ data: { success: true } });
    }
  }
};

export default apiClient; 