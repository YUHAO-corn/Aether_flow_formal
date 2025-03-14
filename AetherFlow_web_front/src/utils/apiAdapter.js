/**
 * API响应格式适配器
 * 用于解决前后端API响应格式不匹配问题
 */

/**
 * 转换后端API响应格式为前端期望的格式
 * 后端格式: { success: true, status: "success", data: [...] }
 * 前端期望: { data: { prompts: [...] } }
 * 
 * @param {Object} response - 后端API响应
 * @returns {Object} 转换后的响应格式
 */
export function adaptApiResponse(response) {
  // 检查响应是否有效
  if (!response) return { data: { prompts: [] } };

  // 处理提示词列表响应
  if (response.success && Array.isArray(response.data)) {
    // 转换_id为id并添加其他必要字段
    const transformedData = response.data.map(item => ({
      ...item,
      id: item._id || item.id, // 确保id字段存在
      responseSummary: item.response 
        ? item.response.substring(0, 100) + (item.response.length > 100 ? '...' : '') 
        : ''
    }));
    
    return { data: { prompts: transformedData } };
  }
  
  // 处理单个提示词响应
  if (response.success && response.data && response.data.prompt) {
    const prompt = response.data.prompt;
    return {
      data: {
        prompt: {
          ...prompt,
          id: prompt._id || prompt.id,
          responseSummary: prompt.response 
            ? prompt.response.substring(0, 100) + (prompt.response.length > 100 ? '...' : '') 
            : ''
        }
      }
    };
  }
  
  // 处理标签列表响应
  if (response.success && Array.isArray(response.data) && 
      response.data.length > 0 && response.data[0].name && response.data[0].color) {
    const transformedTags = response.data.map(tag => ({
      ...tag,
      id: tag._id || tag.id
    }));
    
    return { data: { tags: transformedTags } };
  }
  
  // 如果无法识别响应格式，则返回原始响应
  return response;
}

/**
 * 修补API客户端的get方法
 * @param {Object} apiClient - API客户端对象
 */
export function patchApiClient(apiClient) {
  if (!apiClient || !apiClient.get) {
    console.error('API客户端无效，无法修补');
    return;
  }
  
  // 保存原始get方法
  const originalGet = apiClient.get.bind(apiClient);
  
  // 重写get方法
  apiClient.get = async function(url, config, useCache) {
    try {
      const response = await originalGet(url, config, useCache);
      console.log('API响应:', response);
      
      // 使用适配器转换响应格式
      const adaptedResponse = adaptApiResponse(response);
      return adaptedResponse;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  };
  
  console.log('API客户端已修补，前后端数据格式已适配');
}

/**
 * 初始化API适配器
 * 在应用启动时调用此函数
 * @param {Object} apiClient - API客户端对象
 */
export function initApiAdapter(apiClient) {
  if (typeof window !== 'undefined') {
    // 仅在浏览器环境中执行
    patchApiClient(apiClient);
    
    // 添加到window对象，方便调试
    window.adaptApiResponse = adaptApiResponse;
    window.patchApiClient = patchApiClient;
  }
}

export default {
  adaptApiResponse,
  patchApiClient,
  initApiAdapter
}; 