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
      general: `你是一位专业的提示词优化专家。你的任务是优化用户提供的提示词。

输入格式:
<prompt>
用户的原始提示词
</prompt>

请按照以下 JSON 格式返回优化结果：
{
  "optimizedPrompt": "优化后的提示词",
  "improvements": [
    "改进点1",
    "改进点2",
    ...
  ],
  "expectedBenefits": [
    "预期效果1",
    "预期效果2",
    ...
  ]
}

优化原则：
1. 添加清晰的结构（背景、任务、格式要求等）
2. 提高明确性，消除模糊表述
3. 添加必要的上下文信息
4. 改进格式和组织
5. 根据领域添加适当的专业术语
6. 明确指出期望的输出格式、长度和风格

示例输入：
<prompt>
写一篇关于AI的文章
</prompt>

示例输出：
{
  "optimizedPrompt": "请撰写一篇2000字的人工智能发展现状与未来趋势文章。要求：\n1. 介绍AI的基本概念和发展历程\n2. 分析当前AI主要应用领域（如机器学习、自然语言处理、计算机视觉等）\n3. 探讨AI技术面临的挑战和伦理问题\n4. 预测未来5-10年AI可能的发展方向\n\n文章风格应该是科技类普及文章，适合大众阅读。请使用客观、专业的语言，并适当加入具体的案例和数据支持论点。",
  "improvements": [
    "添加了具体字数要求",
    "明确了文章结构和主要内容点",
    "指定了写作风格和目标受众",
    "要求加入案例和数据支持"
  ],
  "expectedBenefits": [
    "提供清晰的写作框架",
    "确保内容的完整性和专业性",
    "使文章更有说服力和可读性"
  ]
}`,

      programming: `你是一位专业的编程提示词优化专家。你的任务是优化用户提供的编程相关提示词。

输入格式:
<prompt>
用户的原始提示词
</prompt>

请按照以下 JSON 格式返回优化结果：
{
  "optimizedPrompt": "优化后的提示词",
  "improvements": [
    "改进点1",
    "改进点2",
    ...
  ],
  "expectedBenefits": [
    "预期效果1",
    "预期效果2",
    ...
  ]
}

优化原则：
1. 明确指定编程语言和版本
2. 添加代码示例或期望输出格式
3. 说明性能或效率要求
4. 指定代码风格和注释要求
5. 明确错误处理和边界情况考虑
6. 添加测试用例或验证条件

示例输入：
<prompt>
写一个排序函数
</prompt>

示例输出：
{
  "optimizedPrompt": "请使用 Python 3.8+ 实现一个高效的排序函数，要求如下：\n1. 函数名为 custom_sort\n2. 接受一个数字列表作为输入\n3. 支持升序和降序排序（通过参数控制）\n4. 时间复杂度要求：O(nlogn)\n5. 空间复杂度要求：O(1)\n6. 需要处理以下边界情况：\n   - 空列表\n   - 包含重复元素的列表\n   - 包含负数的列表\n7. 请添加详细的注释和文档字符串\n8. 提供至少3个测试用例\n\n示例用法：\nresult = custom_sort([4, 2, 1, 3], ascending=True)\n# 预期输出：[1, 2, 3, 4]",
  "improvements": [
    "指定了具体的编程语言和版本",
    "添加了函数规范和命名",
    "明确了性能要求",
    "列出了需要处理的边界情况",
    "要求添加注释和测试用例"
  ],
  "expectedBenefits": [
    "确保代码的正确性和健壮性",
    "提高代码的可维护性",
    "便于测试和验证"
  ]
}`,

      writing: `你是一位专业的写作提示词优化专家。你的任务是优化用户提供的写作相关提示词。

输入格式:
<prompt>
用户的原始提示词
</prompt>

请按照以下 JSON 格式返回优化结果：
{
  "optimizedPrompt": "优化后的提示词",
  "improvements": [
    "改进点1",
    "改进点2",
    ...
  ],
  "expectedBenefits": [
    "预期效果1",
    "预期效果2",
    ...
  ]
}

优化原则：
1. 明确目标受众和写作风格
2. 指定字数和格式要求
3. 提供结构建议和内容框架
4. 明确语气和情感基调
5. 添加具体的例子或参考
6. 说明写作目的和预期效果

示例输入：
<prompt>
写一篇产品介绍
</prompt>

示例输出：
{
  "optimizedPrompt": "请为一款智能手机编写一篇800字的产品介绍文案，目标受众是25-35岁的年轻专业人士。要求：\n1. 开头需要一个吸引人的标题\n2. 分别从以下角度介绍产品特点：\n   - 设计美学\n   - 性能配置\n   - 创新功能\n   - 使用体验\n3. 语气要专业但不生硬，适当使用科技术语\n4. 突出产品如何提升工作效率和生活品质\n5. 结尾加入购买链接和促销信息\n\n文案风格：现代、简洁、专业。可以适当使用比喻和类比，使技术特性更容易理解。",
  "improvements": [
    "明确了目标受众",
    "指定了具体字数",
    "提供了详细的内容框架",
    "规定了语气和风格",
    "添加了实用性要求"
  ],
  "expectedBenefits": [
    "提高文案的针对性",
    "确保内容的完整性",
    "增强说服力和转化率"
  ]
}`
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
      
      // 准备消息
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt(category)
        },
        {
          role: 'user',
          content: `<prompt>\n${content}\n</prompt>`
        }
      ];
      
      // 如果有上一轮优化结果，添加到上下文
      if (previousOptimized) {
        messages.push({
          role: 'assistant',
          content: previousOptimized
        });
        messages.push({
          role: 'user',
          content: '请进一步优化上述提示词，使其更加完善和有效。'
        });
      }
      
      // 调用API
      const response = await axios.post(
        modelConfig.apiUrl,
        modelConfig.prepareRequest(messages, model),
        { headers: modelConfig.headers(apiKey) }
      );
      
      // 在调用API后添加原始响应日志
      logger.debug(`原始优化响应: ${JSON.stringify(response.data)}`);
      
      // 解析响应
      const result = modelConfig.parseResponse(response);
      
      // 记录原始结果以便调试
      logger.debug(`API返回的原始结果: ${result}`);
      
      try {
        // 尝试解析JSON结果
        let parsed;
        try {
          parsed = JSON.parse(result);
          
          // 处理嵌套JSON情况（DeepSeek API可能返回嵌套的JSON字符串）
          if (typeof parsed.optimizedPrompt === 'string' && parsed.optimizedPrompt.trim().startsWith('{')) {
            try {
              const nestedJson = JSON.parse(parsed.optimizedPrompt);
              if (nestedJson.optimizedPrompt) {
                // 提取嵌套JSON中的所有字段
                const improvements = nestedJson.improvements 
                  ? (Array.isArray(nestedJson.improvements) 
                      ? nestedJson.improvements.join('\n- ') 
                      : String(nestedJson.improvements))
                  : '';
                
                const expectedBenefits = nestedJson.expectedBenefits 
                  ? (Array.isArray(nestedJson.expectedBenefits) 
                      ? nestedJson.expectedBenefits.join('\n- ') 
                      : String(nestedJson.expectedBenefits))
                  : '';
                
                parsed = {
                  optimizedPrompt: nestedJson.optimizedPrompt,
                  improvements: improvements,
                  expectedBenefits: expectedBenefits
                };
                logger.info('检测到嵌套JSON格式，已成功解析');
              }
            } catch (nestedErr) {
              logger.warn(`嵌套JSON解析失败: ${nestedErr.message}`);
            }
          }
        } catch (parseErr) {
          logger.warn(`JSON解析失败，尝试使用文本解析: ${parseErr.message}`);
          // 如果JSON解析失败，尝试使用文本解析
          parsed = this.parseOptimizationResult(result);
        }
        
        // 确保必要字段存在
        if (!parsed.optimizedPrompt) {
          logger.warn(`解析结果缺少optimizedPrompt字段，使用原始内容作为优化结果`);
          parsed.optimizedPrompt = content; // 使用原始内容作为回退
        }

        // 规范化改进点和预期效果
        const improvements = parsed.improvements 
          ? (Array.isArray(parsed.improvements) 
              ? parsed.improvements.join('\n- ') 
              : String(parsed.improvements))
          : '暂无具体改进建议';

        const expectedBenefits = parsed.expectedBenefits 
          ? (Array.isArray(parsed.expectedBenefits)
              ? parsed.expectedBenefits.join('\n- ')
              : String(parsed.expectedBenefits))
          : '预期效果待评估';

        logger.info(`提示词优化成功，类别: ${category}, 提供商: ${provider}`);
        
        return {
          optimizedPrompt: parsed.optimizedPrompt,
          improvements,
          expectedBenefits,
          provider,
          model: model || modelConfig.defaultModel
        };
      } catch (err) {
        logger.error(`解析优化结果失败: ${err.message}`);
        logger.error(`原始响应内容: ${result}`);
        
        // 返回一个基本的结果，避免整个流程失败
        return {
          optimizedPrompt: content,
          improvements: '解析结果时出错，无法提取改进点',
          expectedBenefits: '解析结果时出错，无法提取预期效果',
          provider,
          model: model || modelConfig.defaultModel
        };
      }
    } catch (err) {
      logger.error(`优化提示词失败: ${err.message}`);
      throw err;
    }
  }

  /**
   * 解析优化结果
   * @param {string} content - API返回的内容
   * @returns {Object} - 解析后的结果
   */
  parseOptimizationResult(content) {
    try {
      // 首先尝试解析为 JSON
      try {
        const jsonResult = JSON.parse(content);
        if (jsonResult.optimizedPrompt) {
          return {
            optimizedPrompt: jsonResult.optimizedPrompt,
            improvements: Array.isArray(jsonResult.improvements) 
              ? jsonResult.improvements.join('\n- ') 
              : jsonResult.improvements || '',
            expectedBenefits: Array.isArray(jsonResult.expectedBenefits) 
              ? jsonResult.expectedBenefits.join('\n- ') 
              : jsonResult.expectedBenefits || ''
          };
        }
      } catch (e) {
        // 如果不是 JSON 格式，继续使用文本解析
        logger.info('响应不是 JSON 格式，尝试使用文本解析');
      }

      // 尝试提取JSON部分（有时API会返回带有前缀或后缀的JSON）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          if (extractedJson.optimizedPrompt) {
            return {
              optimizedPrompt: extractedJson.optimizedPrompt,
              improvements: Array.isArray(extractedJson.improvements) 
                ? extractedJson.improvements.join('\n- ') 
                : extractedJson.improvements || '',
              expectedBenefits: Array.isArray(extractedJson.expectedBenefits) 
                ? extractedJson.expectedBenefits.join('\n- ') 
                : extractedJson.expectedBenefits || ''
            };
          }
        } catch (e) {
          logger.info('提取的JSON部分解析失败，继续使用文本解析');
        }
      }

      // 文本解析逻辑
      const sections = content.split(/\n\n|\r\n\r\n/);
      
      let optimizedPrompt = '';
      let improvements = '';
      let expectedBenefits = '';
      
      // 尝试提取各部分内容
      for (const section of sections) {
        if (section.includes('优化后的完整提示词') || 
            section.includes('优化后的提示词') || 
            section.includes('Optimized Prompt') ||
            section.includes('optimizedPrompt')) {
          optimizedPrompt = section.replace(/^.*?(优化后的.*?提示词|Optimized Prompt|optimizedPrompt)[:：]\s*/i, '').trim();
        } else if (section.includes('改进') || 
                  section.includes('优化') || 
                  section.includes('Improvements') ||
                  section.includes('improvements')) {
          improvements = section.trim();
        } else if (section.includes('预期') || 
                  section.includes('效果') || 
                  section.includes('Expected Benefits') ||
                  section.includes('expectedBenefits')) {
          expectedBenefits = section.trim();
        }
      }
      
      // 如果无法提取，则返回整个内容作为优化后的提示词
      if (!optimizedPrompt) {
        // 如果内容很长，可能整个内容就是优化后的提示词
        optimizedPrompt = content.trim();
      }
      
      logger.debug(`文本解析结果: optimizedPrompt=${optimizedPrompt.substring(0, 50)}..., improvements=${improvements ? '有' : '无'}, expectedBenefits=${expectedBenefits ? '有' : '无'}`);
      
      return {
        optimizedPrompt,
        improvements: improvements || '',
        expectedBenefits: expectedBenefits || ''
      };
    } catch (error) {
      logger.error(`解析优化结果失败: ${error.message}`);
      // 返回一个基本结果，避免整个流程失败
      return {
        optimizedPrompt: content,
        improvements: '',
        expectedBenefits: ''
      };
    }
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