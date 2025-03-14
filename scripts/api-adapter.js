/**
 * AetherFlow API适配器
 * 用于在浏览器控制台中解决前后端API响应格式不匹配问题
 * 
 * 使用方法：
 * 1. 打开浏览器控制台(F12)
 * 2. 复制并粘贴此脚本
 * 3. 按回车执行
 */

// 修改apiClient.get方法来适配后端响应格式
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = async function(url, config, useCache) {
  try {
    const response = await originalGet(url, config, useCache);
    console.log('API响应:', response);
    
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
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 修改apiClient.post方法来适配后端响应格式
const originalPost = apiClient.post.bind(apiClient);
apiClient.post = async function(url, data, config) {
  try {
    const response = await originalPost(url, data, config);
    console.log('API POST响应:', response);
    
    // 处理登录响应
    if (url.includes('/auth/login') && response.success && response.data && response.data.token) {
      return {
        data: {
          user: {
            id: response.data.userId,
            username: response.data.username,
            email: response.data.email || ''
          },
          token: response.data.token
        }
      };
    }
    
    // 处理创建提示词响应
    if (url.includes('/prompts') && response.success && response.data && response.data.prompt) {
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
    
    // 如果无法识别响应格式，则返回原始响应
    return response;
  } catch (error) {
    console.error('API POST请求错误:', error);
    throw error;
  }
};

// 修改apiClient.put方法来适配后端响应格式
const originalPut = apiClient.put.bind(apiClient);
apiClient.put = async function(url, data, config) {
  try {
    const response = await originalPut(url, data, config);
    console.log('API PUT响应:', response);
    
    // 处理更新提示词响应
    if (url.includes('/prompts/') && response.success && response.data && response.data.prompt) {
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
    
    // 如果无法识别响应格式，则返回原始响应
    return response;
  } catch (error) {
    console.error('API PUT请求错误:', error);
    throw error;
  }
};

console.log('API客户端已修补，前后端数据格式已适配');
console.log('请刷新页面以查看效果');

// 添加刷新按钮
setTimeout(() => {
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '刷新页面';
  refreshButton.style.position = 'fixed';
  refreshButton.style.top = '10px';
  refreshButton.style.right = '10px';
  refreshButton.style.zIndex = '9999';
  refreshButton.style.padding = '8px 16px';
  refreshButton.style.backgroundColor = '#4CAF50';
  refreshButton.style.color = 'white';
  refreshButton.style.border = 'none';
  refreshButton.style.borderRadius = '4px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.onclick = () => window.location.reload();
  document.body.appendChild(refreshButton);
}, 1000); 