/**
 * 模拟API服务器
 * 用于测试提示词优化功能，模拟OpenAI、DeepSeek和Moonshot等API服务
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 创建Express应用
const app = express();
const PORT = process.env.MOCK_API_PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 模拟OpenAI API
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model } = req.body;
  
  // 检查API密钥
  const apiKey = req.headers.authorization;
  if (!apiKey || !apiKey.startsWith('Bearer sk-')) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    });
  }
  
  // 获取最后一条消息内容
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;
  
  // 根据内容生成优化后的提示词
  const optimizedPrompt = generateOptimizedPrompt(content, 'openai');
  
  // 返回响应
  setTimeout(() => {
    res.json({
      id: `chatcmpl-${Math.random().toString(36).substring(2, 12)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              optimized: optimizedPrompt.optimized,
              improvements: optimizedPrompt.improvements,
              expectedBenefits: optimizedPrompt.expectedBenefits
            })
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 150,
        total_tokens: 250
      }
    });
  }, 500); // 添加500ms延迟模拟网络延迟
});

// 模拟DeepSeek API
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model } = req.body;
  
  // 检查API密钥
  const apiKey = req.headers.authorization;
  if (!apiKey || !apiKey.startsWith('Bearer sk-')) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    });
  }
  
  // 获取最后一条消息内容
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;
  
  // 根据内容生成优化后的提示词
  const optimizedPrompt = generateOptimizedPrompt(content, 'deepseek');
  
  // 返回响应
  setTimeout(() => {
    res.json({
      id: `deepseek-${Math.random().toString(36).substring(2, 12)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'deepseek-chat',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              optimized: optimizedPrompt.optimized,
              improvements: optimizedPrompt.improvements,
              expectedBenefits: optimizedPrompt.expectedBenefits
            })
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 150,
        total_tokens: 250
      }
    });
  }, 500);
});

// 模拟Moonshot API
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model } = req.body;
  
  // 检查API密钥
  const apiKey = req.headers.authorization;
  if (!apiKey || !apiKey.startsWith('Bearer sk-')) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    });
  }
  
  // 获取最后一条消息内容
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;
  
  // 根据内容生成优化后的提示词
  const optimizedPrompt = generateOptimizedPrompt(content, 'moonshot');
  
  // 返回响应
  setTimeout(() => {
    res.json({
      id: `moonshot-${Math.random().toString(36).substring(2, 12)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'moonshot-v1-8k',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              optimized: optimizedPrompt.optimized,
              improvements: optimizedPrompt.improvements,
              expectedBenefits: optimizedPrompt.expectedBenefits
            })
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 150,
        total_tokens: 250
      }
    });
  }, 500);
});

// 生成优化后的提示词
function generateOptimizedPrompt(content, provider) {
  // 根据不同的提示词内容生成不同的优化结果
  if (content.includes('写一篇文章')) {
    return {
      optimized: `请撰写一篇关于${content.includes('AI') ? '人工智能(AI)' : '指定主题'}的全面文章，包括以下几个方面：\n1. 历史背景和发展脉络\n2. 当前主要应用领域和技术现状\n3. 面临的挑战和问题\n4. 未来发展趋势和可能的突破\n\n请确保文章结构清晰，论点有力，使用具体例子和数据支持您的观点。文章长度应在1500-2000字之间，采用学术风格但保持易读性。`,
      improvements: '添加了明确的结构要求、内容指导和格式规范',
      expectedBenefits: '提高了提示词的明确性和具体性，有助于生成更有组织、更全面的文章'
    };
  } else if (content.includes('代码') || content.includes('编程')) {
    return {
      optimized: `请编写一个${content.includes('Python') ? 'Python' : '指定语言'}函数，实现以下功能：\n\n1. 功能描述：[详细描述函数的目的和预期行为]\n2. 输入参数：\n   - 参数1：[类型] [描述]\n   - 参数2：[类型] [描述]\n3. 返回值：[类型] [描述]\n4. 异常处理：请处理可能的错误情况\n5. 性能考虑：请考虑时间和空间复杂度\n\n请提供详细的代码注释，并附上2-3个使用示例。如果有多种实现方法，请说明各自的优缺点。`,
      improvements: '添加了详细的功能规范、参数定义和性能要求',
      expectedBenefits: '明确了代码需求，有助于生成更规范、更健壮的代码实现'
    };
  } else if (content.includes('解释') || content.includes('概念')) {
    return {
      optimized: `请详细解释${content.includes('量子计算') ? '量子计算' : '指定概念'}的以下方面：\n\n1. 基本定义和核心原理\n2. 历史发展和重要里程碑\n3. 与相关概念的区别和联系\n4. 实际应用场景和案例\n5. 当前研究热点和未来发展方向\n\n请使用通俗易懂的语言，并适当使用比喻和类比帮助理解。对于专业术语，请提供简明的解释。如有可能，请引用权威来源支持您的解释。`,
      improvements: '添加了多维度的解释框架和表达要求',
      expectedBenefits: '使解释更加全面、系统和易于理解'
    };
  } else {
    // 默认优化
    return {
      optimized: `${content}\n\n请提供以下详细信息：\n1. 具体目标和预期结果\n2. 背景信息和上下文\n3. 任何限制条件或特殊要求\n4. 偏好的风格或格式\n\n这将帮助我提供更准确、更有针对性的回答。`,
      improvements: '添加了结构化的信息请求',
      expectedBenefits: '引导用户提供更多上下文信息，有助于获得更精确的回答'
    };
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`模拟API服务器运行在 http://localhost:${PORT}`);
  console.log('支持以下端点:');
  console.log('- OpenAI: POST /v1/chat/completions');
  console.log('- DeepSeek: POST /v1/chat/completions');
  console.log('- Moonshot: POST /v1/chat/completions');
});

// 处理进程终止信号
process.on('SIGINT', () => {
  console.log('正在关闭模拟API服务器...');
  process.exit(0);
});

module.exports = app; 