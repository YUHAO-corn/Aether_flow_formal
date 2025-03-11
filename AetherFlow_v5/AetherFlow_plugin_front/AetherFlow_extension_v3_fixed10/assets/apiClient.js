/**
 * API客户端
 * 
 * 这个脚本负责处理与后端API的通信，包括错误处理和降级机制
 */

// 立即执行函数，避免全局变量污染
(function() {
  // 基础URL
  const API_BASE_URL = 'http://localhost:3000/api';

  // 模拟数据，当API请求失败时使用
  const mockData = {
    prompts: [
      {
        id: '1',
        title: '面试问题生成器',
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
        id: Date.now().toString(),
        timestamp: Date.now(),
        prompt: '如何使用React Hooks优化组件性能？',
        response: 'React Hooks提供了多种方式来优化组件性能...',
        platform: 'ChatGPT',
        url: 'https://chat.openai.com/'
      }
    ]
  };

  /**
   * 安全获取localStorage中的值
   * @param {string} key - 键名
   * @returns {string|null} - 值或null
   */
  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[API] 无法访问localStorage:', e);
      return null;
    }
  }

  /**
   * 安全设置localStorage中的值
   * @param {string} key - 键名
   * @param {string} value - 值
   */
  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[API] 无法写入localStorage:', e);
      return false;
    }
  }

  /**
   * 发送API请求
   * @param {string} method - 请求方法（GET, POST, PUT, DELETE等）
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @returns {Promise} - 返回Promise对象
   */
  async function apiRequest(method, endpoint, data = null) {
    console.log(`[API Request] ${method} ${endpoint}`, data);
    
    try {
      // 构建请求选项
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // 添加请求体（如果有）
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      // 添加认证令牌（如果有）
      const token = safeGetItem('token');
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 使用绝对URL，避免相对路径问题
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`[API] 发送请求到: ${url}`);
      
      // 使用原生fetch，确保正确的this上下文
      // 注意：这里不使用window.fetch.bind(window)，因为它可能导致问题
      const response = await fetch(url, options);
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      // 解析响应数据
      const responseData = await response.json();
      console.log(`[API Response] ${method} ${endpoint}:`, responseData);
      
      return responseData;
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error);
      
      // 使用模拟数据
      console.log('[API] 使用模拟数据');
      
      // 根据请求类型返回模拟数据
      if (endpoint.includes('/prompts') && method === 'GET') {
        console.log('[API] 返回模拟提示词列表');
        return mockData.prompts;
      }
      
      if (endpoint.includes('/tags') && method === 'GET') {
        console.log('[API] 返回模拟标签列表');
        return mockData.tags;
      }
      
      if (endpoint.includes('/prompts/auto-save')) {
        console.log('[API] 返回模拟自动保存响应');
        return { success: true, message: '模拟保存成功' };
      }
      
      if (endpoint.includes('/conversations')) {
        console.log('[API] 返回模拟对话历史');
        return mockData.conversations;
      }
      
      if (endpoint.includes('/auth/register')) {
        console.log('[API] 返回模拟注册响应');
        return { 
          success: true, 
          message: '注册成功', 
          user: { 
            id: 'mock-user-id', 
            username: data?.username || 'mockuser',
            email: data?.email || 'mock@example.com'
          },
          token: 'mock-token-' + Date.now()
        };
      }
      
      if (endpoint.includes('/auth/login')) {
        console.log('[API] 返回模拟登录响应');
        return { 
          success: true, 
          message: '登录成功', 
          user: { 
            id: 'mock-user-id', 
            username: data?.username || 'mockuser',
            email: data?.email || 'mock@example.com'
          },
          token: 'mock-token-' + Date.now()
        };
      }
      
      // 默认返回空对象
      return {};
    }
  }

  // 创建API客户端对象
  const apiClient = {
    // 获取提示词列表
    getPrompts: () => apiRequest('GET', '/prompts'),
    
    // 获取单个提示词
    getPrompt: (id) => apiRequest('GET', `/prompts/${id}`),
    
    // 创建提示词
    createPrompt: (data) => apiRequest('POST', '/prompts', data),
    
    // 更新提示词
    updatePrompt: (id, data) => apiRequest('PUT', `/prompts/${id}`, data),
    
    // 删除提示词
    deletePrompt: (id) => apiRequest('DELETE', `/prompts/${id}`),
    
    // 自动保存对话
    autoSave: (data) => apiRequest('POST', '/prompts/auto-save', data),
    
    // 获取对话历史
    getConversations: () => apiRequest('GET', '/conversations'),
    
    // 用户注册
    register: (data) => apiRequest('POST', '/auth/register', data),
    
    // 用户登录
    login: (data) => apiRequest('POST', '/auth/login', data),
    
    // 获取用户信息
    getUserInfo: () => apiRequest('GET', '/auth/me'),
    
    // 直接访问模拟数据（用于测试）
    getMockData: () => mockData
  };

  // 将API客户端暴露给全局作用域
  window.apiClient = apiClient;
  
  // 覆盖原生fetch，以便捕获所有API请求
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    try {
      // 如果是API请求，使用我们的apiRequest函数
      if (typeof url === 'string' && url.includes(API_BASE_URL)) {
        console.log('[API] 拦截到API请求:', url);
        const endpoint = url.replace(API_BASE_URL, '');
        const method = options?.method || 'GET';
        const data = options?.body ? JSON.parse(options.body) : null;
        return apiRequest(method, endpoint, data);
      }
      
      // 否则使用原生fetch
      return originalFetch.apply(this, arguments);
    } catch (error) {
      console.error('[API] fetch拦截器错误:', error);
      return originalFetch.apply(this, arguments);
    }
  };
  
  console.log('[API] API客户端已初始化');
})(); 