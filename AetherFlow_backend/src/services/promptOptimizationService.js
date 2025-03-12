const axios = require('axios');
const logger = require('../utils/logger');

/**
 * 提示词优化服务
 * 支持多种模型和客户端/服务端调用模式
 */
class PromptOptimizationService {
  constructor() {
    // 系统提示词模板，参考optimize项目
    this.systemPrompts = {
      general: `你是一位专业的提示词优化专家。你的任务是分析用户提供的原始提示词，并创建一个更有效、更结构化的版本。

请遵循以下优化原则：
1. 添加清晰的结构（背景、任务、格式要求等）
2. 提高明确性，消除模糊表述
3. 添加必要的上下文信息
4. 改进格式和组织
5. 根据领域添加适当的专业术语
6. 明确指出期望的输出格式、长度和风格

对于每个优化的提示词，请提供：
1. 优化后的完整提示词
2. 简要说明你做了哪些改进及其原因
3. 预期这些改进将如何提高AI的回复质量`,

      programming: `你是一位专业的编程提示词优化专家。你的任务是分析用户提供的原始编程相关提示词，并创建一个更有效、更结构化的版本。

请遵循以下优化原则：
1. 添加清晰的结构（背景、任务、格式要求等）
2. 明确指定编程语言和版本
3. 添加代码示例或期望输出格式
4. 说明性能或效率要求
5. 指定代码风格和注释要求
6. 明确错误处理和边界情况考虑

对于每个优化的提示词，请提供：
1. 优化后的完整提示词
2. 简要说明你做了哪些改进及其原因
3. 预期这些改进将如何提高AI的代码质量和准确性`,

      writing: `你是一位专业的写作提示词优化专家。你的任务是分析用户提供的原始写作相关提示词，并创建一个更有效、更结构化的版本。

请遵循以下优化原则：
1. 明确目标受众和写作风格
2. 指定字数和格式要求
3. 提供结构建议和内容框架
4. 明确语气和情感基调
5. 添加具体的例子或参考
6. 说明写作目的和预期效果

对于每个优化的提示词，请提供：
1. 优化后的完整提示词
2. 简要说明你做了哪些改进及其原因
3. 预期这些改进将如何提高AI的写作质量`
    };
    
    // 模型配置
    this.modelConfigs = {
      openai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }),
        prepareRequest: (messages, model) => ({
          model: model || 'gpt-4',
          messages,
          temperature: 0.4,
          max_tokens: 1500
        }),
        parseResponse: (response) => response.data.choices[0].message.content
      },
      deepseek: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        defaultModel: 'deepseek-chat',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }),
        prepareRequest: (messages, model) => ({
          model: model || 'deepseek-chat',
          messages,
          temperature: 0.4,
          max_tokens: 1500
        }),
        parseResponse: (response) => response.data.choices[0].message.content
      },
      moonshot: {
        apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
        defaultModel: 'moonshot-v1-8k',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }),
        prepareRequest: (messages, model) => ({
          model: model || 'moonshot-v1-8k',
          messages,
          temperature: 0.4,
          max_tokens: 1500
        }),
        parseResponse: (response) => response.data.choices[0].message.content
      }
    };
  }

  /**
   * 获取系统提示词
   * @param {string} category - 提示词类别
   * @returns {string} - 系统提示词
   */
  getSystemPrompt(category) {
    return this.systemPrompts[category] || this.systemPrompts.general;
  }

  /**
   * 优化提示词
   * @param {Object} options - 优化选项
   * @param {string} options.content - 原始提示词内容
   * @param {string} options.category - 提示词类别（可选）
   * @param {string} options.provider - 模型提供商（openai, deepseek, moonshot等）
   * @param {string} options.model - 具体模型名称（可选）
   * @param {string} options.apiKey - API密钥（可选，如果不提供则使用系统密钥）
   * @param {string} options.previousOptimized - 上一轮优化结果（用于多轮优化）
   * @returns {Promise<Object>} - 优化结果
   */
  async optimizePrompt(options) {
    const {
      content,
      category = 'general',
      provider = 'openai',
      model,
      apiKey,
      previousOptimized
    } = options;

    try {
      // 获取模型配置
      const modelConfig = this.modelConfigs[provider];
      if (!modelConfig) {
        throw new Error(`不支持的模型提供商: ${provider}`);
      }

      // 确定API密钥
      const finalApiKey = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
      if (!finalApiKey) {
        throw new Error(`未提供${provider}的API密钥`);
      }

      // 准备消息
      let messages = [
        {
          role: 'system',
          content: this.getSystemPrompt(category)
        }
      ];

      // 处理多轮优化
      if (previousOptimized) {
        messages.push(
          {
            role: 'user',
            content: `原始提示词: ${content}`
          },
          {
            role: 'assistant',
            content: previousOptimized
          },
          {
            role: 'user',
            content: '请进一步优化上面的提示词，使其更加清晰、具体和有效。'
          }
        );
      } else {
        messages.push({
          role: 'user',
          content: `原始提示词: ${content}${category !== 'general' ? `\n类别: ${category}` : ''}`
        });
      }

      // 调用API
      const response = await axios.post(
        modelConfig.apiUrl,
        modelConfig.prepareRequest(messages, model || modelConfig.defaultModel),
        {
          headers: modelConfig.headers(finalApiKey)
        }
      );

      // 解析响应
      const optimizedContent = modelConfig.parseResponse(response);
      
      // 提取优化后的提示词和说明
      const result = this.parseOptimizationResult(optimizedContent);
      
      return {
        original: content,
        optimized: result.optimizedPrompt,
        improvements: result.improvements,
        expectedBenefits: result.expectedBenefits,
        provider,
        model: model || modelConfig.defaultModel
      };
    } catch (error) {
      logger.error(`提示词优化失败: ${error.message}`);
      throw new Error(`提示词优化失败: ${error.message}`);
    }
  }

  /**
   * 解析优化结果
   * @param {string} content - API返回的内容
   * @returns {Object} - 解析后的结果
   */
  parseOptimizationResult(content) {
    // 简单实现，实际应用中可能需要更复杂的解析逻辑
    const sections = content.split(/\n\n|\r\n\r\n/);
    
    let optimizedPrompt = '';
    let improvements = '';
    let expectedBenefits = '';
    
    // 尝试提取各部分内容
    for (const section of sections) {
      if (section.includes('优化后的完整提示词') || section.includes('优化后的提示词')) {
        optimizedPrompt = section.replace(/^.*?优化后的.*?提示词[:：]\s*/i, '').trim();
      } else if (section.includes('改进') || section.includes('优化')) {
        improvements = section.trim();
      } else if (section.includes('预期') || section.includes('效果')) {
        expectedBenefits = section.trim();
      }
    }
    
    // 如果无法提取，则返回整个内容作为优化后的提示词
    if (!optimizedPrompt) {
      optimizedPrompt = content.trim();
    }
    
    return {
      optimizedPrompt,
      improvements,
      expectedBenefits
    };
  }

  /**
   * 获取客户端配置
   * 用于前端直接调用API
   * @returns {Object} - 客户端配置
   */
  getClientConfig() {
    return {
      systemPrompts: this.systemPrompts,
      modelConfigs: Object.keys(this.modelConfigs).reduce((acc, key) => {
        const config = this.modelConfigs[key];
        acc[key] = {
          apiUrl: config.apiUrl,
          defaultModel: config.defaultModel,
          prepareRequest: config.prepareRequest.toString(),
          parseResponse: config.parseResponse.toString()
        };
        return acc;
      }, {})
    };
  }
}

module.exports = new PromptOptimizationService(); 